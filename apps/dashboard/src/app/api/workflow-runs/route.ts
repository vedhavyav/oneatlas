import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@oneatlas/db';
import { DeploymentManager } from '@oneatlas/deployment';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    // 1. Resolve active deployment
    const deployer = new DeploymentManager();
    const activeDeployment = await deployer.getActiveDeployment(slug);

    if (!activeDeployment) {
      return NextResponse.json({ error: 'No active deployment found' }, { status: 404 });
    }

    const workflows = activeDeployment.appMetadata.workflows || [];
    if (workflows.length === 0) {
      return NextResponse.json({ runs: [] });
    }

    const workflowIds = workflows.map((wf: any) => wf.id);

    // 2. Query execution logs
    const runs = await prisma.workflowExecution.findMany({
      where: {
        workflowId: {
          in: workflowIds
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // Map runs to include workflow names for readability
    const enrichedRuns = runs.map(run => {
      const matchingWf = workflows.find((wf: any) => wf.id === run.workflowId);
      return {
        ...run,
        workflowName: matchingWf ? matchingWf.name : 'Unknown Workflow'
      };
    });

    return NextResponse.json({ runs: enrichedRuns });
  } catch (error: any) {
    console.error("API Workflow-Runs Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to fetch logs' }, { status: 500 });
  }
}
