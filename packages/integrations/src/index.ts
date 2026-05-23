import { prisma, IntegrationProvider } from '@oneatlas/db';

export interface IntegrationCredential {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookUrl?: string;
  extraData?: Record<string, any>;
}

export class IntegrationsManager {
  /**
   * Upserts credentials for an organization's integration provider.
   */
  async saveIntegration(
    orgId: string,
    provider: IntegrationProvider,
    credentials: IntegrationCredential
  ) {
    const existing = await prisma.integration.findFirst({
      where: { organizationId: orgId, provider }
    });

    if (existing) {
      return await prisma.integration.update({
        where: { id: existing.id },
        data: {
          credentials: credentials as any,
          active: true
        }
      });
    } else {
      return await prisma.integration.create({
        data: {
          organizationId: orgId,
          provider,
          credentials: credentials as any,
          active: true
        }
      });
    }
  }

  /**
   * Retrieves active credentials for a provider.
   */
  async getCredentials(
    orgId: string,
    provider: IntegrationProvider
  ): Promise<IntegrationCredential | null> {
    const record = await prisma.integration.findFirst({
      where: { organizationId: orgId, provider, active: true }
    });
    return record ? (record.credentials as any as IntegrationCredential) : null;
  }

  /**
   * Fetches all active integrations for an organization.
   */
  async getActiveIntegrations(orgId: string) {
    return await prisma.integration.findMany({
      where: { organizationId: orgId, active: true },
      select: {
        id: true,
        provider: true,
        updatedAt: true
      }
    });
  }

  /**
   * Mocks dynamic spreadsheet/Notion read-sync logic.
   */
  async fetchExternalData(
    provider: IntegrationProvider,
    _credentials: IntegrationCredential,
    config: Record<string, any>
  ): Promise<Array<Record<string, any>>> {
    console.log(`[Integrations] Fetching external data from ${provider} with config:`, config);
    
    // Return sample payloads for sheets/notion sync testing
    if (provider === 'GOOGLE_SHEETS') {
      return [
        { name: "John Doe", email: "john@google.com", status: "Qualified" },
        { name: "Jane Smith", email: "jane@notion.so", status: "New" }
      ];
    }

    if (provider === 'NOTION') {
      return [
        { title: "Bug in auth routing", severity: "High", status: "Open" },
        { title: "Dashboard charts are slow", severity: "Medium", status: "In Progress" }
      ];
    }

    return [];
  }
}
