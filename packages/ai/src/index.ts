import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppMetadata, AppMetadataSchema } from '@oneatlas/metadata';
import { SYSTEM_INSTRUCTION, INCREMENTAL_UPDATE_INSTRUCTION } from './prompts.js';

// Define the JSON schema representation for Gemini's structured output
const geminiResponseSchema = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING' },
    description: { type: 'STRING' },
    themeColor: { type: 'STRING' },
    themeMode: { type: 'STRING', enum: ['light', 'dark', 'system'] },
    database: {
      type: 'OBJECT',
      properties: {
        tables: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              name: { type: 'STRING' },
              displayName: { type: 'STRING' },
              fields: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    name: { type: 'STRING' },
                    type: { type: 'STRING', enum: ['string', 'number', 'boolean', 'date', 'relation', 'text', 'select'] },
                    required: { type: 'BOOLEAN' },
                    options: { type: 'ARRAY', items: { type: 'STRING' } },
                    relation: {
                      type: 'OBJECT',
                      properties: {
                        targetTable: { type: 'STRING' },
                        targetField: { type: 'STRING' },
                        relationType: { type: 'STRING', enum: ['one-to-many', 'many-to-one', 'one-to-one'] }
                      },
                      required: ['targetTable', 'relationType']
                    }
                  },
                  required: ['name', 'type']
                }
              }
            },
            required: ['name', 'fields']
          }
        }
      },
      required: ['tables']
    },
    pages: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          title: { type: 'STRING' },
          icon: { type: 'STRING' },
          type: { type: 'STRING', enum: ['table', 'detail', 'form', 'dashboard'] },
          layout: { type: 'STRING', enum: ['grid', 'split', 'single', 'tabs'] },
          components: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                id: { type: 'STRING' },
                type: { type: 'STRING', enum: ['table-view', 'detail-view', 'form-view', 'chart', 'stat-card', 'workflow-trigger'] },
                title: { type: 'STRING' },
                table: { type: 'STRING' },
                fields: { type: 'ARRAY', items: { type: 'STRING' } },
                chartConfig: {
                  type: 'OBJECT',
                  properties: {
                    type: { type: 'STRING', enum: ['bar', 'line', 'pie', 'area'] },
                    xAxis: { type: 'STRING' },
                    yAxis: { type: 'STRING' },
                    title: { type: 'STRING' }
                  },
                  required: ['type', 'xAxis', 'yAxis']
                },
                statConfig: {
                  type: 'OBJECT',
                  properties: {
                    table: { type: 'STRING' },
                    valueField: { type: 'STRING' },
                    aggregation: { type: 'STRING', enum: ['count', 'sum', 'avg', 'min', 'max'] },
                    label: { type: 'STRING' }
                  },
                  required: ['table', 'aggregation', 'label']
                },
                actionId: { type: 'STRING' }
              },
              required: ['id', 'type']
            }
          }
        },
        required: ['id', 'title', 'type', 'components']
      }
    },
    workflows: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          name: { type: 'STRING' },
          trigger: {
            type: 'OBJECT',
            properties: {
              type: { type: 'STRING', enum: ['on-create', 'on-update', 'on-delete', 'webhook'] },
              table: { type: 'STRING' }
            },
            required: ['type']
          },
          steps: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                id: { type: 'STRING' },
                name: { type: 'STRING' },
                type: { type: 'STRING', enum: ['send-slack', 'send-email', 'add-row', 'update-row', 'call-webhook', 'ai-step'] },
                config: { type: 'OBJECT' }
              },
              required: ['id', 'name', 'type', 'config']
            }
          }
        },
        required: ['id', 'name', 'trigger', 'steps']
      }
    }
  },
  required: ['name', 'database', 'pages']
};

export class AiGateway {
  private ai: GoogleGenerativeAI | null = null;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (key) {
      this.ai = new GoogleGenerativeAI(key);
    } else {
      console.warn("AiGateway: No GEMINI_API_KEY found. Falling back to local mock generation.");
    }
  }

  async generateApp(prompt: string): Promise<AppMetadata> {
    if (!this.ai) {
      return this.generateMockApp(prompt);
    }

    try {
      const model = this.ai.getGenerativeModel({
        model: 'gemini-1.5-pro',
        systemInstruction: SYSTEM_INSTRUCTION
      });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: geminiResponseSchema as any,
          temperature: 0.2,
        }
      });

      const text = result.response.text();
      if (!text) {
        throw new Error("Empty response received from Gemini.");
      }

      const parsed = JSON.parse(text);
      return AppMetadataSchema.parse(parsed);
    } catch (error) {
      console.error("Gemini App Generation failed, falling back to mock:", error);
      return this.generateMockApp(prompt);
    }
  }

  async updateApp(currentMetadata: AppMetadata, prompt: string): Promise<AppMetadata> {
    if (!this.ai) {
      return this.updateMockApp(currentMetadata, prompt);
    }

    try {
      const model = this.ai.getGenerativeModel({
        model: 'gemini-1.5-pro',
        systemInstruction: INCREMENTAL_UPDATE_INSTRUCTION
      });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `CURRENT METADATA:\n${JSON.stringify(currentMetadata, null, 2)}\n\nREQUESTED CHANGES:\n${prompt}` }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: geminiResponseSchema as any,
          temperature: 0.2,
        }
      });

      const text = result.response.text();
      if (!text) {
        throw new Error("Empty response received from Gemini.");
      }

      const parsed = JSON.parse(text);
      return AppMetadataSchema.parse(parsed);
    } catch (error) {
      console.error("Gemini App Update failed, falling back to mock update:", error);
      return this.updateMockApp(currentMetadata, prompt);
    }
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.ai) {
      return `[Offline Mock Text Response for: "${prompt.slice(0, 30)}..."]`;
    }

    try {
      const model = this.ai.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text || '';
    } catch (error) {
      console.error("Gemini Text Generation failed:", error);
      return `[Error generating text: fallback mock text]`;
    }
  }


  /**
   * Mock generation for offline support or missing API keys.
   */
  private generateMockApp(prompt: string): AppMetadata {
    const cleanPrompt = prompt.toLowerCase();
    
    // Default mock is CRM
    let name = "Customer Hub CRM";
    let desc = "Manage leads, sales, and accounts with automated alerts.";
    let themeColor = "#3b82f6";
    let tables: any[] = [
      {
        name: "leads",
        displayName: "Leads",
        fields: [
          { name: "title", type: "string" as const, required: true },
          { name: "company", type: "string" as const, required: true },
          { name: "value", type: "number" as const, defaultValue: 0 },
          { name: "status", type: "select" as const, options: ["New", "Contacted", "Qualified", "Lost", "Won"], defaultValue: "New" },
          { name: "email", type: "string" as const },
          { name: "notes", type: "text" as const }
        ]
      },
      {
        name: "tasks",
        displayName: "Tasks",
        fields: [
          { name: "subject", type: "string" as const, required: true },
          { name: "due_date", type: "date" as const },
          { name: "completed", type: "boolean" as const, defaultValue: false },
          { name: "lead_id", type: "relation" as const, relation: { targetTable: "leads", relationType: "many-to-one" as const } }
        ]
      }
    ];

    let pages: any[] = [
      {
        id: "dashboard",
        title: "Overview",
        icon: "LayoutDashboard",
        type: "dashboard" as const,
        layout: "grid" as const,
        components: [
          {
            id: "stat-leads",
            type: "stat-card" as const,
            title: "Total Leads",
            table: "leads",
            statConfig: {
              table: "leads",
              aggregation: "count" as const,
              label: "Active Leads"
            }
          },
          {
            id: "stat-value",
            type: "stat-card" as const,
            title: "Pipeline Value",
            table: "leads",
            statConfig: {
              table: "leads",
              valueField: "value",
              aggregation: "sum" as const,
              label: "Estimated Revenue"
            }
          },
          {
            id: "chart-leads-status",
            type: "chart" as const,
            title: "Leads by Status",
            table: "leads",
            chartConfig: {
              type: "bar" as const,
              xAxis: "status",
              yAxis: "value",
              title: "Pipeline Value by Status"
            }
          }
        ]
      },
      {
        id: "leads-table",
        title: "Leads",
        icon: "Users",
        type: "table" as const,
        components: [
          {
            id: "leads-list",
            type: "table-view" as const,
            table: "leads",
            fields: ["title", "company", "value", "status", "email"]
          }
        ]
      },
      {
        id: "tasks-table",
        title: "Tasks",
        icon: "CheckSquare",
        type: "table" as const,
        components: [
          {
            id: "tasks-list",
            type: "table-view" as const,
            table: "tasks",
            fields: ["subject", "due_date", "completed", "lead_id"]
          }
        ]
      }
    ];

    let workflows: any[] = [
      {
        id: "slack-alert",
        name: "Alert on High Value Lead",
        trigger: {
          type: "on-create" as const,
          table: "leads"
        },
        steps: [
          {
            id: "slack-msg",
            name: "Send Slack Notification",
            type: "send-slack" as const,
            config: {
              channel: "#sales-alerts",
              message: "New Lead Created: {{title}} from {{company}} valued at ${{value}}"
            }
          }
        ]
      }
    ];

    // Customize if they asked for tickets / bug tracker
    if (cleanPrompt.includes("ticket") || cleanPrompt.includes("bug") || cleanPrompt.includes("issue")) {
      name = "Support Desk App";
      desc = "Track client requests, bugs, and SLA deadlines.";
      themeColor = "#ef4444";
      tables = [
        {
          name: "tickets",
          displayName: "Tickets",
          fields: [
            { name: "title", type: "string" as const, required: true },
            { name: "severity", type: "select" as const, options: ["Low", "Medium", "High", "Critical"], defaultValue: "Medium" },
            { name: "status", type: "select" as const, options: ["Open", "In Progress", "Resolved", "Closed"], defaultValue: "Open" },
            { name: "description", type: "text" as const },
            { name: "customer_email", type: "string" as const }
          ]
        }
      ];
      pages = [
        {
          id: "dashboard",
          title: "Dashboard",
          icon: "LayoutDashboard",
          type: "dashboard" as const,
          layout: "grid" as const,
          components: [
            {
              id: "stat-open",
              type: "stat-card" as const,
              title: "Open Tickets",
              table: "tickets",
              statConfig: { table: "tickets", aggregation: "count" as const, label: "Active Tickets" }
            },
            {
              id: "chart-severity",
              type: "chart" as const,
              title: "Severity Spread",
              table: "tickets",
              chartConfig: { type: "pie" as const, xAxis: "severity", yAxis: "title", title: "Count by Severity" }
            }
          ]
        },
        {
          id: "tickets-table",
          title: "Tickets List",
          icon: "LifeBuoy",
          type: "table" as const,
          components: [
            { id: "tickets-list", type: "table-view" as const, table: "tickets", fields: ["title", "severity", "status", "customer_email"] }
          ]
        }
      ];
      workflows = [
        {
          id: "high-severity-alert",
          name: "Notify on Critical Bug",
          trigger: { type: "on-create" as const, table: "tickets" },
          steps: [
            {
              id: "email-admin",
              name: "Email IT Admin",
              type: "send-email" as const,
              config: { to: "admin@company.com", subject: "Critical Bug Reported!", body: "Ticket: {{title}}\nDescription: {{description}}" }
            }
          ]
        }
      ];
    }

    return {
      name,
      description: desc,
      themeColor,
      themeMode: "dark" as const,
      database: { tables },
      pages: pages as any,
      workflows: workflows as any
    } as unknown as AppMetadata;
  }

  /**
   * Mock update applying incremental logic
   */
  private updateMockApp(currentMetadata: AppMetadata, prompt: string): AppMetadata {
    const cleanPrompt = prompt.toLowerCase();
    const updated = JSON.parse(JSON.stringify(currentMetadata)) as AppMetadata;

    if (cleanPrompt.includes("add a field") || cleanPrompt.includes("add field") || cleanPrompt.includes("new field")) {
      // Find table name
      const targetTable = updated.database.tables[0];
      if (targetTable) {
        // e.g. "add field phone to leads"
        let fieldName = "phone";
        if (cleanPrompt.includes("phone")) fieldName = "phone";
        else if (cleanPrompt.includes("address")) fieldName = "address";
        else if (cleanPrompt.includes("company_size")) fieldName = "company_size";
        else if (cleanPrompt.includes("image")) fieldName = "image_url";

        const exists = targetTable.fields.some(f => f.name === fieldName);
        if (!exists) {
          targetTable.fields.push({
            name: fieldName,
            type: "string",
            required: false
          });

          // Add to first page component fields list if it is a table-view
          const tableView = updated.pages.find(p => p.type === 'table')?.components.find(c => c.type === 'table-view');
          if (tableView && tableView.fields) {
            tableView.fields.push(fieldName);
          }
        }
      }
    }

    if (cleanPrompt.includes("change color") || cleanPrompt.includes("theme color") || cleanPrompt.includes("color to")) {
      if (cleanPrompt.includes("emerald") || cleanPrompt.includes("green")) updated.themeColor = "#10b981";
      else if (cleanPrompt.includes("violet") || cleanPrompt.includes("purple")) updated.themeColor = "#8b5cf6";
      else if (cleanPrompt.includes("amber") || cleanPrompt.includes("yellow")) updated.themeColor = "#f59e0b";
      else if (cleanPrompt.includes("red")) updated.themeColor = "#ef4444";
    }

    return updated;
  }
}
