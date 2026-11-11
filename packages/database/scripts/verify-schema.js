// packages/database/scripts/verify-schema.js
// Resolves V9-08: Automated Schema Parity Verification comparing schema.sql against migrated database tables, columns, and constraints.
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/lookara';

const isCloudDb =
  process.env.DATABASE_SSL === 'true' ||
  (!connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')) ||
  connectionString.includes('sslmode=require') ||
  connectionString.includes('neon.tech') ||
  connectionString.includes('supabase');

function buildSslConfig() {
  if (!isCloudDb) return undefined;
  const rejectUnauthorized =
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'false'
      ? false
      : process.env.NODE_ENV === 'production' || Boolean(process.env.DATABASE_SSL_CA);
  return {
    rejectUnauthorized,
    ...(process.env.DATABASE_SSL_CA ? { ca: process.env.DATABASE_SSL_CA } : {}),
  };
}

/**
 * Parse CREATE TABLE and ALTER TABLE statements from schema.sql to extract expected tables, columns, and constraints.
 */
function parseCanonicalSchema(sqlContent) {
  const tables = new Map();
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
  let match;
  while ((match = tableRegex.exec(sqlContent)) !== null) {
    const tableName = match[1].toLowerCase();
    const body = match[2];
    const columns = new Map();
    const constraints = {
      hasPrimaryKey: false,
      foreignKeyCount: 0,
      uniqueCount: 0,
      checkCount: 0,
    };

    const lines = body.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.replace(/--.*$/, '').trim();
      if (!line) continue;

      if (/\bPRIMARY\s+KEY\b/i.test(line)) constraints.hasPrimaryKey = true;
      if (/\bREFERENCES\b|\bFOREIGN\s+KEY\b/i.test(line)) constraints.foreignKeyCount++;
      if (/\bUNIQUE\b/i.test(line)) constraints.uniqueCount++;
      if (/\bCHECK\s*\(/i.test(line)) constraints.checkCount++;

      if (/^(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK|CONSTRAINT)\b/i.test(line)) continue;
      const colMatch = line.match(/^([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_(\s,)]+)/);
      if (colMatch) {
        const colName = colMatch[1].toLowerCase();
        const colType = colMatch[2].trim().toLowerCase();
        if (!['create', 'table', 'constraint', 'unique', 'primary', 'foreign', 'check'].includes(colName)) {
          columns.set(colName, { type: colType });
        }
      }
    }
    tables.set(tableName, { columns, constraints });
  }

  // Also include ALTER TABLE ... ADD COLUMN IF NOT EXISTS from schema.sql
  const alterRegex = /ALTER\s+TABLE\s+([a-zA-Z0-9_]+)\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s+([^;]+);/gi;
  while ((match = alterRegex.exec(sqlContent)) !== null) {
    const tableName = match[1].toLowerCase();
    const colName = match[2].toLowerCase();
    const colDef = match[3].trim().toLowerCase();
    if (tables.has(tableName)) {
      const entry = tables.get(tableName);
      entry.columns.set(colName, { type: colDef });
      if (/\breferences\b/i.test(colDef)) entry.constraints.foreignKeyCount++;
    }
  }

  return tables;
}

async function verifySchemaWithClient(client) {
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.sql');
  const sqlContent = fs.readFileSync(schemaPath, 'utf8');
  const expectedTables = parseCanonicalSchema(sqlContent);

  console.log(`[VerifySchema] Parsed ${expectedTables.size} canonical tables from schema.sql`);

  const colRes = await client.query(`
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `);

  const constraintRes = await client.query(`
    SELECT table_name, constraint_type, count(*)::int AS cnt
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
    GROUP BY table_name, constraint_type
  `);

  const actualTables = new Map();
  for (const row of colRes.rows) {
    const tName = row.table_name.toLowerCase();
    if (!actualTables.has(tName)) {
      actualTables.set(tName, {
        columns: new Map(),
        constraints: { PRIMARY_KEY: 0, FOREIGN_KEY: 0, UNIQUE: 0, CHECK: 0 },
      });
    }
    actualTables.get(tName).columns.set(row.column_name.toLowerCase(), {
      dataType: row.data_type.toLowerCase(),
      isNullable: row.is_nullable === 'YES',
    });
  }

  for (const row of constraintRes.rows) {
    const tName = row.table_name.toLowerCase();
    if (!actualTables.has(tName)) continue;
    const cType = row.constraint_type.replace(/\s+/g, '_').toUpperCase();
    actualTables.get(tName).constraints[cType] = row.cnt;
  }

  let missingTables = 0;
  let missingColumns = 0;
  let missingPrimaryKeys = 0;
  let totalColumnsVerified = 0;
  let totalConstraintsVerified = 0;

  for (const [tableName, expected] of expectedTables.entries()) {
    if (!actualTables.has(tableName)) {
      console.error(`[VerifySchema] MISSING TABLE: ${tableName}`);
      missingTables++;
      continue;
    }
    const actual = actualTables.get(tableName);
    for (const [colName] of expected.columns.entries()) {
      if (!actual.columns.has(colName)) {
        console.error(`[VerifySchema] MISSING COLUMN: ${tableName}.${colName}`);
        missingColumns++;
      } else {
        totalColumnsVerified++;
      }
    }

    if (expected.constraints.hasPrimaryKey && (actual.constraints.PRIMARY_KEY || 0) === 0) {
      console.error(`[VerifySchema] MISSING PRIMARY KEY CONSTRAINT: ${tableName}`);
      missingPrimaryKeys++;
    } else {
      totalConstraintsVerified +=
        (actual.constraints.PRIMARY_KEY || 0) +
        (actual.constraints.FOREIGN_KEY || 0) +
        (actual.constraints.UNIQUE || 0) +
        (actual.constraints.CHECK || 0);
    }
  }

  if (missingTables > 0 || missingColumns > 0 || missingPrimaryKeys > 0) {
    throw new Error(
      `[VerifySchema] FAILED: ${missingTables} missing tables, ${missingColumns} missing columns, ${missingPrimaryKeys} missing PKs.`
    );
  }

  console.log(
    `[VerifySchema] PASSED: All ${expectedTables.size} canonical tables, ${totalColumnsVerified} columns, and ${totalConstraintsVerified} database constraints verified in PostgreSQL!`
  );

  return {
    tablesVerified: expectedTables.size,
    columnsVerified: totalColumnsVerified,
    constraintsVerified: totalConstraintsVerified,
  };
}

async function verifySchema() {
  const client = new Client({
    connectionString,
    ssl: buildSslConfig(),
  });
  await client.connect();
  try {
    return await verifySchemaWithClient(client);
  } finally {
    await client.end();
  }
}

module.exports = {
  parseCanonicalSchema,
  verifySchemaWithClient,
  verifySchema,
};

if (require.main === module) {
  verifySchema().catch((err) => {
    console.error('[VerifySchema] Error:', err.message || err);
    process.exit(1);
  });
}
