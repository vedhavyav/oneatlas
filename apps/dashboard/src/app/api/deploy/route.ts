import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@oneatlas/db';
import { DeploymentManager } from '@oneatlas/deployment';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { slug, name, appMetadata } = await req.json();

    if (!slug || !name || !appMetadata) {
      return NextResponse.json({ error: 'Missing slug, name, or appMetadata' }, { status: 400 });
    }

    // Clean slug to alphanumeric + hyphens
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');

    // 1. Resolve default organization
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: "Acme Corp",
          slug: "acme"
        }
      });
    }

    // 2. Resolve/Create Project
    let project = await prisma.project.findUnique({
      where: { slug: cleanSlug }
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          name,
          slug: cleanSlug,
          description: appMetadata.description || `AI-Generated ${name} tool.`,
          organizationId: org.id
        }
      });
    } else {
      // Update name & description
      project = await prisma.project.update({
        where: { id: project.id },
        data: {
          name,
          description: appMetadata.description || project.description
        }
      });
    }

    // 3. Trigger Deployment & Dynamic DB Sync
    const builderHost = req.headers.get('host');
    const deployer = new DeploymentManager();
    const result = await deployer.deployProject(project.id, appMetadata, builderHost);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error("API Deploy Error:", error);
    return NextResponse.json({ error: error.message || 'Deployment failed' }, { status: 500 });
  }
}
