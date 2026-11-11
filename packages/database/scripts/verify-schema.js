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
 * Parse CREATE TABLE statements from schema.sql to extract expected tables and column names.
 */
function parseCanonicalSchema(sqlContent) {
  const tables = new Map();
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
  let match;
  while ((match = tableRegex.exec(sqlContent)) !== null) {
    const tableName = match[1].toLowerCase();
    const body = match[2];
    const columns = [];
    const lines = body.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.replace(/--.*$/, '').trim();
      if (!line) continue;
      if (/^(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK|CONSTRAINT)\b/i.test(line)) continue;
      const colMatch = line.match(/^([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_(\s,)]+)/);
      if (colMatch) {
        const colName = colMatch[1].toLowerCase();
        if (!['create', 'table', 'constraint', 'unique', 'primary', 'foreign', 'check'].includes(colName)) {
          columns.push(colName);
        }
      }
    }
    tables.set(tableName, columns);
  }
  return tables;
}

async function verifySchema() {
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.sql');
  const sqlContent = fs.readFileSync(schemaPath, 'utf8');
  const expectedTables = parseCanonicalSchema(sqlContent);

  console.log(`[VerifySchema] Parsed ${expectedTables.size} canonical tables from schema.sql`);

  const client = new Client({
    connectionString,
    ssl: buildSslConfig(),
  });
  await client.connect();

  try {
    const res = await client.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    const actualTables = new Map();
    for (const row of res.rows) {
      const tName = row.table_name.toLowerCase();
      if (!actualTables.has(tName)) {
        actualTables.set(tName, new Set());
      }
      actualTables.get(tName).add(row.column_name.toLowerCase());
    }

    let missingTables = 0;
    let missingColumns = 0;

    for (const [tableName, expectedCols] of expectedTables.entries()) {
      if (!actualTables.has(tableName)) {
        console.error(`[VerifySchema] MISSING TABLE: ${tableName}`);
        missingTables++;
        continue;
      }
      const actualCols = actualTables.get(tableName);
      for (const col of expectedCols) {
        if (!actualCols.has(col)) {
          console.error(`[VerifySchema] MISSING COLUMN: ${tableName}.${col}`);
          missingColumns++;
        }
      }
    }

    if (missingTables > 0 || missingColumns > 0) {
      console.error(`[VerifySchema] FAILED: ${missingTables} missing tables, ${missingColumns} missing columns.`);
      process.exit(1);
    }

    console.log(`[VerifySchema] PASSED: All ${expectedTables.size} canonical tables and their columns exist in PostgreSQL!`);
  } finally {
    await client.end();
  }
}

verifySchema().catch((err) => {
  console.error('[VerifySchema] Error:', err);
  process.exit(1);
});

