import { z } from 'zod';

export const FieldTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
  'date',
  'relation',
  'text',
  'select'
]);

export type FieldType = z.infer<typeof FieldTypeSchema>;

export const RelationSchema = z.object({
  targetTable: z.string(),
  targetField: z.string().optional(), // field in target table that refers back
  relationType: z.enum(['one-to-many', 'many-to-one', 'one-to-one'])
});

export type Relation = z.infer<typeof RelationSchema>;

export const FieldSchema = z.object({
  name: z.string(),
  type: FieldTypeSchema,
  required: z.boolean().default(false),
  defaultValue: z.any().optional(),
  options: z.array(z.string()).optional(), // for 'select' type
  relation: RelationSchema.optional()      // for 'relation' type
});

export type Field = z.infer<typeof FieldSchema>;

export const TableSchema = z.object({
  name: z.string(),
  displayName: z.string().optional(),
  fields: z.array(FieldSchema)
});

export type Table = z.infer<typeof TableSchema>;

export const DatabaseSchemaObject = z.object({
  tables: z.array(TableSchema)
});

export type DatabaseSchema = z.infer<typeof DatabaseSchemaObject>;

// Component definitions
export const ComponentTypeSchema = z.enum([
  'table-view',
  'detail-view',
  'form-view',
  'chart',
  'stat-card',
  'workflow-trigger'
]);

export type ComponentType = z.infer<typeof ComponentTypeSchema>;

export const ChartConfigSchema = z.object({
  type: z.enum(['bar', 'line', 'pie', 'area']),
  xAxis: z.string(),
  yAxis: z.string(),
  title: z.string().optional()
});

export const StatConfigSchema = z.object({
  table: z.string(),
  valueField: z.string().optional(), // field to aggregate, optional if 'count'
  aggregation: z.enum(['count', 'sum', 'avg', 'min', 'max']),
  label: z.string()
});

export const ComponentSchema = z.object({
  id: z.string(),
  type: ComponentTypeSchema,
  title: z.string().optional(),
  table: z.string().optional(), // associated table
  fields: z.array(z.string()).optional(), // fields to show or inputs to display
  chartConfig: ChartConfigSchema.optional(),
  statConfig: StatConfigSchema.optional(),
  actionId: z.string().optional() // for buttons/triggers
});

export type Component = z.infer<typeof ComponentSchema>;

// Page definitions
export const PageTypeSchema = z.enum([
  'table',      // Simple table browse view
  'detail',     // Item detail panel
  'form',       // Dedicated form view
  'dashboard'   // Dashboard containing stats and charts
]);

export type PageType = z.infer<typeof PageTypeSchema>;

export const PageSchema = z.object({
  id: z.string(),
  title: z.string(),
  icon: z.string().optional(), // Lucide icon name
  type: PageTypeSchema,
  layout: z.enum(['grid', 'split', 'single', 'tabs']).default('single'),
  components: z.array(ComponentSchema)
});

export type Page = z.infer<typeof PageSchema>;

// Workflow definitions
export const WorkflowTriggerTypeSchema = z.enum([
  'on-create',
  'on-update',
  'on-delete',
  'webhook'
]);

export type WorkflowTriggerType = z.infer<typeof WorkflowTriggerTypeSchema>;

export const WorkflowTriggerSchema = z.object({
  type: WorkflowTriggerTypeSchema,
  table: z.string().optional() // required for database CRUD triggers
});

export const WorkflowActionTypeSchema = z.enum([
  'send-slack',
  'send-email',
  'add-row',
  'update-row',
  'call-webhook',
  'ai-step'
]);

export type WorkflowActionType = z.infer<typeof WorkflowActionTypeSchema>;

export const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: WorkflowActionTypeSchema,
  config: z.record(z.any())
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  trigger: WorkflowTriggerSchema,
  steps: z.array(WorkflowStepSchema)
});

export type Workflow = z.infer<typeof WorkflowSchema>;

// Complete Generated Application Metadata
export const AppMetadataSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  themeColor: z.string().default('#3b82f6'), // Tailwind blue-500 default
  themeMode: z.enum(['light', 'dark', 'system']).default('dark'),
  database: DatabaseSchemaObject,
  pages: z.array(PageSchema),
  workflows: z.array(WorkflowSchema).default([])
});

export type AppMetadata = z.infer<typeof AppMetadataSchema>;
