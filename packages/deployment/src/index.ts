import { prisma, syncTenantSchema } from '@oneatlas/db';
import { AppMetadata } from '@oneatlas/metadata';

export interface DeploymentResult {
  deploymentId: string;
  projectId: string;
  version: number;
  slug: string;
  appUrl: string;
  createdAt: string;
}

export class DeploymentManager {
  /**
   * Deploys an application version by saving its metadata and syncing its Postgres tables.
   */
  async deployProject(projectId: string, metadata: AppMetadata): Promise<DeploymentResult> {
    // 1. Fetch project details
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }

    // 2. Fetch the latest version number
    const latestDeployment = await prisma.deployment.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' }
    });
    const nextVersion = latestDeployment ? latestDeployment.version + 1 : 1;

    // 3. Deactivate all prior deployments
    await prisma.deployment.updateMany({
      where: { projectId, active: true },
      data: { active: false }
    });

    // 4. Sync the database tables dynamically (multi-tenant PostgreSQL schema name format: `tenant_<org_id>_app_<project_id>`)
    const schemaName = `tenant_${project.organizationId.replace(/-/g, '')}_app_${project.id.replace(/-/g, '')}`;
    await syncTenantSchema(schemaName, metadata.database.tables);

    // 5. Create new deployment record
    const deployment = await prisma.deployment.create({
      data: {
        projectId,
        version: nextVersion,
        appMetadata: metadata as any,
        active: true
      }
    });

    // Generate url (e.g. crm.localhost:3000 or custom subdomains)
    const runtimeUrl = process.env.NEXT_PUBLIC_RUNTIME_URL || 'http://localhost:3002';
    const parsedUrl = new URL(runtimeUrl);
    const appUrl = `${parsedUrl.protocol}//${project.slug}.${parsedUrl.host}`;

    // Log the audit log
    await prisma.auditLog.create({
      data: {
        organizationId: project.organizationId,
        action: 'DEPLOY_APP',
        resource: `Project:${project.slug}`,
        details: {
          deploymentId: deployment.id,
          version: nextVersion,
          schemaName
        }
      }
    });

    return {
      deploymentId: deployment.id,
      projectId,
      version: nextVersion,
      slug: project.slug,
      appUrl,
      createdAt: deployment.createdAt.toISOString()
    };
  }

  /**
   * Resolves the active deployment for a given subdomain slug.
   */
  async getActiveDeployment(slug: string) {
    const project = await prisma.project.findUnique({
      where: { slug }
    });

    if (!project) {
      return null;
    }

    const deployment = await prisma.deployment.findFirst({
      where: { projectId: project.id, active: true }
    });

    if (!deployment) {
      return null;
    }

    const schemaName = `tenant_${project.organizationId.replace(/-/g, '')}_app_${project.id.replace(/-/g, '')}`;

    return {
      project,
      deploymentId: deployment.id,
      version: deployment.version,
      appMetadata: deployment.appMetadata as any as AppMetadata,
      schemaName,
      createdAt: deployment.createdAt
    };
  }
}
