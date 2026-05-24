import { NextRequest, NextResponse } from 'next/server';
import { prisma, executeInSchema } from '@oneatlas/db';
import { DeploymentManager } from '@oneatlas/deployment';
import { WorkflowEngine } from '@oneatlas/workflows';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { slug, table, data } = await req.json();

    if (!slug || !table || !data) {
      return NextResponse.json({ error: 'Missing slug, table, or data' }, { status: 400 });
    }

    // 1. Resolve active deployment schema
    const deployer = new DeploymentManager();
    const activeDeployment = await deployer.getActiveDeployment(slug);

    if (!activeDeployment) {
      return NextResponse.json({ error: 'No active deployment found' }, { status: 404 });
    }

    // 2. Perform INSERT raw query inside transaction
    const insertedRow = await executeInSchema(activeDeployment.schemaName, async (tx) => {
      const keys = Object.keys(data);
      const values = Object.values(data);

      if (keys.length === 0) {
        const query = `INSERT INTO "${activeDeployment.schemaName}"."${table}" DEFAULT VALUES RETURNING *;`;
        const result = await tx.$queryRawUnsafe(query);
        return result[0];
      }

      const columns = keys.map(k => `"${k}"`).join(', ');
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const query = `INSERT INTO "${activeDeployment.schemaName}"."${table}" (${columns}) VALUES (${placeholders}) RETURNING *;`;
      
      const result = await tx.$queryRawUnsafe(query, ...values);
      return result[0];
    });

    // 3. Audit log of creation
    await prisma.auditLog.create({
      data: {
        organizationId: activeDeployment.project.organizationId,
        action: 'CREATE_ROW',
        resource: `Table:${table}`,
        details: { rowId: insertedRow.id }
      }
    });

    // 4. Trigger associated workflow automations asynchronously
    const appMetadata = activeDeployment.appMetadata;
    const matchingWorkflows = appMetadata.workflows.filter(wf => 
      wf.trigger.type === 'on-create' && wf.trigger.table === table
    );

    if (matchingWorkflows.length > 0) {
      const engine = new WorkflowEngine();
      // Run each matching workflow
      for (const workflow of matchingWorkflows) {
        // Run async or fire-and-forget so API is fast
        engine.executeWorkflow(workflow, {
          schema: activeDeployment.schemaName,
          triggerData: insertedRow,
          userId: undefined
        }).catch(err => {
          console.error(`Workflow ${workflow.name} execution failed:`, err);
        });
      }
    }

    return NextResponse.json({ success: true, row: insertedRow });
  } catch (error: any) {
    console.error("API Mutate Error:", error);
    return NextResponse.json({ error: error.message || 'Mutation failed' }, { status: 500 });
  }
}
