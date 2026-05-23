import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Export the Prisma namespaces for type safety
export * from '@prisma/client';

/**
 * Executes queries in a transaction context after setting the local PostgreSQL search path to the tenant's schema.
 */
export async function executeInSchema<T>(
  schema: string,
  callback: (tx: any) => Promise<T>
): Promise<T> {
  // We use standard connection, setting search_path inside transaction ensures it applies to subsequent statements
  return await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schema}", public;`);
    return await callback(tx);
  });
}

/**
 * Creates the tenant schema if it does not exist.
 */
export async function ensureTenantSchema(schema: string): Promise<void> {
  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
}

/**
 * Maps OneAtlas field types to PostgreSQL column data types
 */
function mapFieldTypeToPg(type: string, _options?: string[]): string {
  switch (type) {
    case 'number':
      return 'DOUBLE PRECISION';
    case 'boolean':
      return 'BOOLEAN';
    case 'date':
      return 'TIMESTAMP WITH TIME ZONE';
    case 'text':
      return 'TEXT';
    case 'select':
      return 'VARCHAR(255)';
    case 'relation':
      return 'UUID'; // target table rows will have UUID primary keys
    case 'string':
    default:
      return 'TEXT';
  }
}

/**
 * Syncs the tenant database tables to match the target schema metadata.
 * It will create tables and columns dynamically.
 */
export async function syncTenantSchema(
  schema: string,
  tables: Array<{
    name: string;
    fields: Array<{
      name: string;
      type: string;
      required?: boolean;
      options?: string[];
    }>;
  }>
): Promise<void> {
  await ensureTenantSchema(schema);

  for (const table of tables) {
    const tableName = table.name;
    
    // Check if table exists
    const tableExistsResult = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = ${schema} 
        AND table_name = ${tableName}
      );
    `;
    const tableExists = tableExistsResult[0]?.exists;

    if (!tableExists) {
      // Build DDL to create table
      const columnDefs = [
        'id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
        'created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
        'updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP'
      ];

      for (const field of table.fields) {
        // Skip id/created_at/updated_at if they are explicitly mentioned to avoid duplicates
        if (['id', 'createdAt', 'updatedAt', 'created_at', 'updated_at'].includes(field.name)) {
          continue;
        }
        
        const pgType = mapFieldTypeToPg(field.type, field.options);
        const nullability = field.required ? 'NOT NULL' : 'NULL';
        columnDefs.push(`"${field.name}" ${pgType} ${nullability}`);
      }

      const createQuery = `
        CREATE TABLE "${schema}"."${tableName}" (
          ${columnDefs.join(',\n          ')}
        );
      `;
      await prisma.$executeRawUnsafe(createQuery);
    } else {
      // Table exists, sync columns (add missing columns)
      for (const field of table.fields) {
        if (['id', 'createdAt', 'updatedAt', 'created_at', 'updated_at'].includes(field.name)) {
          continue;
        }

        const columnExistsResult = await prisma.$queryRaw<Array<{ exists: boolean }>>`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = ${schema} 
            AND table_name = ${tableName} 
            AND column_name = ${field.name}
          );
        `;
        const columnExists = columnExistsResult[0]?.exists;

        if (!columnExists) {
          const pgType = mapFieldTypeToPg(field.type, field.options);
          const nullability = field.required ? 'NOT NULL' : 'NULL';
          const alterQuery = `
            ALTER TABLE "${schema}"."${tableName}" 
            ADD COLUMN "${field.name}" ${pgType} ${nullability};
          `;
          await prisma.$executeRawUnsafe(alterQuery);
        }
      }
    }
  }
}
