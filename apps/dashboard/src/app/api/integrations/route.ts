import { NextRequest, NextResponse } from 'next/server';
import { prisma, IntegrationProvider } from '@oneatlas/db';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { organizationId, provider, credentials, active } = await req.json();

    if (!organizationId || !provider) {
      return NextResponse.json({ error: 'Missing organizationId or provider' }, { status: 400 });
    }

    // Validate provider against enum
    if (!Object.values(IntegrationProvider).includes(provider)) {
      return NextResponse.json({ error: `Invalid provider: ${provider}` }, { status: 400 });
    }

    // Upsert integration
    const existing = await prisma.integration.findFirst({
      where: {
        organizationId,
        provider: provider as IntegrationProvider,
      },
    });

    let integration;
    if (existing) {
      integration = await prisma.integration.update({
        where: { id: existing.id },
        data: {
          credentials: credentials !== undefined ? credentials : existing.credentials,
          active: active !== undefined ? active : existing.active,
        },
      });
    } else {
      integration = await prisma.integration.create({
        data: {
          organizationId,
          provider: provider as IntegrationProvider,
          credentials: credentials || {},
          active: active !== undefined ? active : true,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        organizationId,
        action: 'UPDATE_INTEGRATION',
        resource: `Integration:${provider}`,
        details: { integrationId: integration.id, active: integration.active },
      },
    });

    return NextResponse.json({ success: true, integration });
  } catch (error: any) {
    console.error('API Integrations Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update integration' }, { status: 500 });
  }
}
