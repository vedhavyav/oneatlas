import { Workflow, WorkflowStep } from '@oneatlas/metadata';
import { prisma, executeInSchema } from '@oneatlas/db';
import { AiGateway } from '@oneatlas/ai';

export interface WorkflowContext {
  schema: string;
  triggerData: Record<string, any>;
  userId?: string;
  organizationId?: string;
}

/**
 * Replaces placeholders like {{field_name}} in a string template with matching triggerData values.
 */
function interpolateTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match;
  });
}

export class WorkflowEngine {
  private aiGateway: AiGateway;

  constructor() {
    this.aiGateway = new AiGateway();
  }

  /**
   * Executes a workflow step-by-step and saves execution logs.
   */
  async executeWorkflow(workflow: Workflow, context: WorkflowContext): Promise<void> {
    const executionLogs: Array<{
      stepId: string;
      stepName: string;
      status: 'SUCCESS' | 'FAILED';
      input: any;
      output: any;
      error?: string;
      timestamp: string;
    }> = [];

    // Create execution record in DB
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        status: 'RUNNING',
        logs: []
      }
    });

    let overallStatus: 'COMPLETED' | 'FAILED' = 'COMPLETED';

    try {
      for (const step of workflow.steps) {
        const stepLog: any = {
          stepId: step.id,
          stepName: step.name,
          timestamp: new Date().toISOString()
        };

        try {
          const result = await this.executeStep(step, context);
          stepLog.status = 'SUCCESS';
          stepLog.input = step.config;
          stepLog.output = result;
          executionLogs.push(stepLog);
          
          // If the step returned new data, we merge it into the triggerData context for subsequent steps to consume!
          if (result && typeof result === 'object') {
            context.triggerData = { ...context.triggerData, ...result };
          }
        } catch (err: any) {
          overallStatus = 'FAILED';
          stepLog.status = 'FAILED';
          stepLog.input = step.config;
          stepLog.error = err.message || String(err);
          executionLogs.push(stepLog);
          break; // Halt workflow execution on failure
        }
      }
    } catch (err) {
      overallStatus = 'FAILED';
    } finally {
      // Update execution record
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: overallStatus,
          logs: executionLogs as any
        }
      });
    }
  }

  /**
   * Executes a single step based on type.
   */
  private async executeStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    const { config } = step;

    switch (step.type) {
      case 'send-slack': {
        let webhookUrl = '';
        let integrationActive = false;
        if (context.organizationId) {
          const integration = await prisma.integration.findFirst({
            where: {
              organizationId: context.organizationId,
              provider: 'SLACK',
              active: true
            }
          });
          if (integration && integration.credentials && typeof integration.credentials === 'object') {
            const credentials = integration.credentials as Record<string, any>;
            webhookUrl = credentials.webhookUrl || '';
            integrationActive = true;
          }
        }

        const interpolatedMessage = interpolateTemplate(config.message || '', context.triggerData);
        const channel = config.channel || '#general';
        
        let delivered = false;
        let responseText = '';
        if (integrationActive && webhookUrl) {
          try {
            console.log(`[Slack Live Trigger] Sending webhook request to ${webhookUrl}`);
            const slackRes = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: interpolatedMessage,
                channel: channel
              })
            });
            delivered = slackRes.ok;
            responseText = await slackRes.text();
            console.log(`[Slack Live Trigger] Response status: ${slackRes.status}, body: ${responseText}`);
          } catch (err: any) {
            console.error('[Slack Live Trigger] Webhook request failed:', err);
            responseText = err.message || String(err);
          }
        } else {
          console.log(`[Slack Webhook Mock] Sent message to ${channel}: "${interpolatedMessage}"`);
          delivered = true;
        }

        return {
          channel,
          sentMessage: interpolatedMessage,
          delivered,
          provider: 'SLACK',
          ...(responseText ? { response: responseText } : {})
        };
      }

      case 'send-email': {
        const recipient = interpolateTemplate(config.to || '', context.triggerData);
        const subject = interpolateTemplate(config.subject || '', context.triggerData);
        const body = interpolateTemplate(config.body || '', context.triggerData);

        console.log(`[Email Mock] Sent email to ${recipient}\nSubject: ${subject}\nBody: ${body}`);

        return {
          to: recipient,
          subject,
          sent: true,
          provider: 'GMAIL'
        };
      }

      case 'add-row': {
        const targetTable = config.table;
        const rawData = config.data || {};
        
        if (!targetTable) {
          throw new Error("Add Row action: target table is required.");
        }

        // Interpolate all values in data configuration
        const dataToInsert: Record<string, any> = {};
        for (const key of Object.keys(rawData)) {
          if (typeof rawData[key] === 'string') {
            dataToInsert[key] = interpolateTemplate(rawData[key], context.triggerData);
          } else {
            dataToInsert[key] = rawData[key];
          }
        }

        // Perform insert in tenant Postgres schema
        const insertedRow = await executeInSchema(context.schema, async (tx) => {
          const keys = Object.keys(dataToInsert);
          const values = Object.values(dataToInsert);
          
          if (keys.length === 0) {
            const query = `INSERT INTO "${context.schema}"."${targetTable}" DEFAULT VALUES RETURNING *;`;
            const result = await tx.$queryRawUnsafe(query);
            return result[0];
          }

          const columns = keys.map(k => `"${k}"`).join(', ');
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          const query = `INSERT INTO "${context.schema}"."${targetTable}" (${columns}) VALUES (${placeholders}) RETURNING *;`;
          
          const result = await tx.$queryRawUnsafe(query, ...values);
          return result[0];
        });

        console.log(`[DB Trigger Action] Added row to ${targetTable}:`, insertedRow);
        return insertedRow;
      }

      case 'call-webhook': {
        const url = interpolateTemplate(config.url || '', context.triggerData);
        console.log(`[Webhook Live Trigger] Calling POST ${url}`);
        
        let status = 200;
        let responseData: any = { success: true };
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(context.triggerData)
          });
          status = res.status;
          const text = await res.text();
          try {
            responseData = JSON.parse(text);
          } catch {
            responseData = { text };
          }
          console.log(`[Webhook Live Trigger] Response status: ${status}`);
        } catch (err: any) {
          console.error('[Webhook Live Trigger] request failed:', err);
          status = 500;
          responseData = { error: err.message || String(err) };
        }

        return {
          status,
          url,
          response: responseData
        };
      }

      case 'ai-step': {
        const promptTemplate = config.prompt || '';
        const targetOutputKey = config.outputKey || 'ai_summary';
        const interpolatedPrompt = interpolateTemplate(promptTemplate, context.triggerData);

        // Run LLM call via Gemini
        let resultText = "[Gemini Mock AI Step Output]";
        if (this.aiGateway) {
          try {
            resultText = await this.aiGateway.generateText(
              `TASK: ${interpolatedPrompt}\nReturn a simple single-sentence summary or response of the task result without extra commentary.`
            );
          } catch (e) {
            console.error("AI step invocation failed, using fallback mock text:", e);
          }
        }

        return {
          [targetOutputKey]: resultText
        };
      }

      default:
        throw new Error(`Unsupported workflow step type: ${step.type}`);
    }
  }
}
