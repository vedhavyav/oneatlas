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

    // Generate url (e.g. crm.localhost:3002 or path fallback for pages.dev)
    const runtimeUrl = process.env.NEXT_PUBLIC_RUNTIME_URL || 'http://localhost:3002';
    const parsedUrl = new URL(runtimeUrl);
    const isPagesDev = parsedUrl.host.includes('pages.dev');
    const appUrl = isPagesDev
      ? `${parsedUrl.protocol}//${parsedUrl.host}/app/${project.slug}`
      : `${parsedUrl.protocol}//${project.slug}.${parsedUrl.host}`;

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
    try {
      const project = await prisma.project.findUnique({
        where: { slug }
      });

      if (!project) {
        // Fallback to mock for local testing
        return this.getOfflineMockDeployment(slug);
      }

      const deployment = await prisma.deployment.findFirst({
        where: { projectId: project.id, active: true }
      });

      if (!deployment) {
        return this.getOfflineMockDeployment(slug);
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
    } catch (error) {
      console.warn(`[DeploymentManager] Database offline/unconfigured. Falling back to offline mock deployment for slug: "${slug}"`);
      return this.getOfflineMockDeployment(slug);
    }
  }

  /**
   * Helper to return static mock app definitions for local offline sandbox runs.
   */
  private getOfflineMockDeployment(slug: string) {
    const isTickets = slug.includes('ticket') || slug.includes('bug') || slug.includes('issue') || slug.includes('support');
    
    const appMetadata = (isTickets ? {
      name: "Offline Support Tickets",
      description: "Local mock ticketing sandbox (database offline)",
      themeColor: "#ef4444",
      themeMode: "dark",
      database: {
        tables: [{
          name: "tickets",
          fields: [
            { name: "title", type: "string", required: true },
            { name: "severity", type: "select", options: ["Low", "Medium", "High"], defaultValue: "Medium" },
            { name: "status", type: "select", options: ["Open", "Closed"], defaultValue: "Open" },
            { name: "description", type: "text" }
          ]
        }]
      },
      pages: [
        {
          id: "dashboard",
          title: "Dashboard",
          type: "dashboard",
          layout: "grid",
          components: [
            { id: "stat-open", type: "stat-card", title: "Open Tickets", table: "tickets", statConfig: { table: "tickets", aggregation: "count", label: "Active Tickets" } }
          ]
        },
        {
          id: "tickets-table",
          title: "Tickets List",
          type: "table",
          components: [
            { id: "tickets-list", type: "table-view", table: "tickets", fields: ["title", "severity", "status"] }
          ]
        }
      ],
      workflows: []
    } : {
      name: "Offline Customer Hub",
      description: "Local mock CRM sandbox (database offline)",
      themeColor: "#3b82f6",
      themeMode: "dark",
      database: {
        tables: [{
          name: "leads",
          fields: [
            { name: "title", type: "string", required: true },
            { name: "company", type: "string", required: true },
            { name: "value", type: "number", defaultValue: 0 },
            { name: "status", type: "select", options: ["New", "Won"], defaultValue: "New" }
          ]
        }]
      },
      pages: [
        {
          id: "dashboard",
          title: "Overview",
          type: "dashboard",
          layout: "grid",
          components: [
            { id: "stat-leads", type: "stat-card", title: "Total Leads", table: "leads", statConfig: { table: "leads", aggregation: "count", label: "Active Leads" } }
          ]
        },
        {
          id: "leads-table",
          title: "Leads List",
          type: "table",
          components: [
            { id: "leads-list", type: "table-view", table: "leads", fields: ["title", "company", "value", "status"] }
          ]
        }
      ],
      workflows: []
    } as unknown) as AppMetadata;

    return {
      project: {
        id: "mock-project-id",
        name: appMetadata.name,
        slug,
        description: appMetadata.description || "",
        organizationId: "mock-org-id",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      deploymentId: "mock-deployment-id",
      version: 1,
      appMetadata,
      schemaName: `tenant_mock_app_${slug}`,
      createdAt: new Date()
    };
  }
}
