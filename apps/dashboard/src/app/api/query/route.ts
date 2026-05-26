import { NextRequest, NextResponse } from 'next/server';
import {executeInSchema } from '@oneatlas/db';
import { DeploymentManager } from '@oneatlas/deployment';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { slug, table } = await req.json();

    if (!slug || !table) {
      return NextResponse.json({ error: 'Missing slug or table' }, { status: 400 });
    }

    // 1. Resolve active deployment schema
    const deployer = new DeploymentManager();
    const activeDeployment = await deployer.getActiveDeployment(slug);

    if (!activeDeployment) {
      return NextResponse.json({ error: 'No active deployment found' }, { status: 404 });
    }

    // Intercept special metadata query
    if (table === '__metadata__') {
      return NextResponse.json({ appMetadata: activeDeployment.appMetadata });
    }

    // 2. Fetch rows inside transaction using SET LOCAL search_path
    const rows = await executeInSchema(activeDeployment.schemaName, async (tx) => {
      const query = `SELECT * FROM "${activeDeployment.schemaName}"."${table}" ORDER BY created_at DESC;`;
      return await tx.$queryRawUnsafe(query);
    });

    return NextResponse.json({ rows });
  } catch (error: any) {
    console.error("API Query Error:", error);
    // If table doesn't exist yet, return empty list instead of crash
    return NextResponse.json({ rows: [] });
  }
}
