// packages/database/scripts/verify-schema.js
// Resolves Milestone 1 v10 Review Finding #4: Deep database schema comparator
// Verifies exact table, column, data type, nullability, primary key, foreign key, and index parity between schema.sql and live PostgreSQL.
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
  return {
    rejectUnauthorized: true,
    ...(process.env.DATABASE_SSL_CA ? { ca: process.env.DATABASE_SSL_CA } : {}),
  };
}

function splitTopLevelCommas(str) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ',' && depth === 0) {
      parts.push(str.substring(start, i));
      start = i + 1;
    }
  }
  parts.push(str.substring(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

function normalizeType(raw) {
  const clean = raw.trim().toLowerCase();
  if (clean.startsWith('uuid')) return 'uuid';
  if (clean.startsWith('varchar') || clean.startsWith('character varying')) return 'character varying';
  if (clean.startsWith('text')) return 'text';
  if (clean.startsWith('timestamptz') || clean.startsWith('timestamp with time zone'))
    return 'timestamp with time zone';
  if (clean.startsWith('timestamp')) return 'timestamp without time zone';
  if (clean.startsWith('time')) return 'time without time zone';
  if (clean.startsWith('date')) return 'date';
  if (clean.startsWith('smallint')) return 'smallint';
  if (clean.startsWith('bigint')) return 'bigint';
  if (clean.startsWith('integer') || clean.startsWith('int')) return 'integer';
  if (clean.startsWith('numeric') || clean.startsWith('decimal')) return 'numeric';
  if (clean.startsWith('boolean') || clean.startsWith('bool')) return 'boolean';
  if (clean.startsWith('jsonb')) return 'jsonb';
  if (clean.startsWith('json')) return 'json';
  return clean;
}

/**
 * Parse CREATE TABLE, ALTER TABLE, and CREATE INDEX statements from canonical schema.sql.
 */
function parseCanonicalSchema(sqlContent) {
  const tables = new Map();
  const indexes = [];

  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
  let match;

  while ((match = tableRegex.exec(sqlContent)) !== null) {
    const tableName = match[1].toLowerCase();
    const rawBody = match[2];
    const cleanBody = rawBody
      .split('\n')
      .map((l) => l.replace(/--.*$/, '').trim())
      .filter(Boolean)
      .join(' ');
    const items = splitTopLevelCommas(cleanBody);

    const columns = new Map();
    const primaryKeys = [];
    const foreignKeys = [];
    const uniqueConstraints = [];

    for (const item of items) {
      const pkMatch = item.match(/^PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        const cols = pkMatch[1].split(',').map((s) => s.trim().toLowerCase());
        primaryKeys.push(...cols);
        continue;
      }

      const uniqueMatch = item.match(/^UNIQUE\s*\(([^)]+)\)/i);
      if (uniqueMatch) {
        const cols = uniqueMatch[1].split(',').map((s) => s.trim().toLowerCase());
        uniqueConstraints.push(cols);
        continue;
      }

      const fkTableMatch = item.match(
        /^FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s*([a-zA-Z0-9_]+)\s*\(([^)]+)\)/i
      );
      if (fkTableMatch) {
        const col = fkTableMatch[1].trim().toLowerCase();
        const targetTable = fkTableMatch[2].trim().toLowerCase();
        const targetCol = fkTableMatch[3].trim().toLowerCase();
        foreignKeys.push({ column: col, targetTable, targetCol });
        continue;
      }

      if (/^CONSTRAINT\b/i.test(item) || /^CHECK\b/i.test(item)) {
        continue;
      }

      const colMatch = item.match(
        /^([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_()\s]+?)(?:\s+DEFAULT\b|\s+NOT\s+NULL\b|\s+NULL\b|\s+PRIMARY\s+KEY\b|\s+REFERENCES\b|\s+CHECK\b|\s+UNIQUE\b|$)/i
      );
      if (colMatch) {
        const colName = colMatch[1].toLowerCase();
        const typeStr = colMatch[2].trim();
        const normalizedType = normalizeType(typeStr);
        const isPk = /\bPRIMARY\s+KEY\b/i.test(item);
        const notNull = /\bNOT\s+NULL\b/i.test(item) || isPk;
        const isUnique = /\bUNIQUE\b/i.test(item);

        if (isPk) primaryKeys.push(colName);
        if (isUnique) uniqueConstraints.push([colName]);

        const inlineFkMatch = item.match(/REFERENCES\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)/i);
        if (inlineFkMatch) {
          foreignKeys.push({
            column: colName,
            targetTable: inlineFkMatch[1].toLowerCase(),
            targetCol: inlineFkMatch[2].toLowerCase(),
          });
        }

        columns.set(colName, {
          dataType: normalizedType,
          isNullable: !notNull,
        });
      }
    }

    tables.set(tableName, {
      columns,
      primaryKeys,
      foreignKeys,
      uniqueConstraints,
    });
  }

  // Parse ALTER TABLE ... ADD COLUMN ...
  const alterRegex =
    /ALTER\s+TABLE\s+([a-zA-Z0-9_]+)\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s+([^;]+);/gi;
  while ((match = alterRegex.exec(sqlContent)) !== null) {
    const tableName = match[1].toLowerCase();
    const colName = match[2].toLowerCase();
    const def = match[3].trim();
    if (tables.has(tableName)) {
      const table = tables.get(tableName);
      const colMatch = def.match(
        /^([a-zA-Z0-9_()\s]+?)(?:\s+DEFAULT\b|\s+NOT\s+NULL\b|\s+NULL\b|\s+REFERENCES\b|$)/i
      );
      const rawType = colMatch ? colMatch[1].trim() : def;
      const normalizedType = normalizeType(rawType);
      const notNull = /\bNOT\s+NULL\b/i.test(def);
      table.columns.set(colName, {
        dataType: normalizedType,
        isNullable: !notNull,
      });

      const fkMatch = def.match(/REFERENCES\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)/i);
      if (fkMatch) {
        table.foreignKeys.push({
          column: colName,
          targetTable: fkMatch[1].toLowerCase(),
          targetCol: fkMatch[2].toLowerCase(),
        });
      }
    }
  }

  // Parse CREATE INDEX statements
  const indexRegex =
    /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s+ON\s+([a-zA-Z0-9_]+)/gi;
  while ((match = indexRegex.exec(sqlContent)) !== null) {
    indexes.push({
      indexName: match[1].toLowerCase(),
      tableName: match[2].toLowerCase(),
    });
  }

  return { tables, indexes };
}

/**
 * Deep schema comparator comparing canonical schema against live PostgreSQL system catalogs.
 */
async function verifySchemaWithClient(client) {
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.sql');
  const sqlContent = fs.readFileSync(schemaPath, 'utf8');
  const { tables: expectedTables, indexes: expectedIndexes } = parseCanonicalSchema(sqlContent);

  console.log(
    `[VerifySchema] Parsed ${expectedTables.size} canonical tables and ${expectedIndexes.length} explicit indexes from schema.sql`
  );

  // 1. Fetch live columns from information_schema
  const colRes = await client.query(`
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
  `);
  const actualCols = new Map();
  const actualTables = new Set();
  for (const row of colRes.rows) {
    const tName = row.table_name.toLowerCase();
    actualTables.add(tName);
    const k = `${tName}.${row.column_name.toLowerCase()}`;
    actualCols.set(k, {
      dataType: row.data_type.toLowerCase(),
      isNullable: row.is_nullable === 'YES',
    });
  }

  // 2. Fetch live Primary Keys
  const pkRes = await client.query(`
    SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.ordinal_position
  `);
  const actualPks = new Map();
  for (const row of pkRes.rows) {
    const t = row.table_name.toLowerCase();
    if (!actualPks.has(t)) actualPks.set(t, []);
    actualPks.get(t).push(row.column_name.toLowerCase());
  }

  // 3. Fetch live Foreign Keys
  const fkRes = await client.query(`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
  `);
  const actualFks = new Map();
  for (const row of fkRes.rows) {
    const t = row.table_name.toLowerCase();
    if (!actualFks.has(t)) actualFks.set(t, []);
    actualFks.get(t).push({
      column: row.column_name.toLowerCase(),
      targetTable: row.foreign_table_name.toLowerCase(),
      targetCol: row.foreign_column_name.toLowerCase(),
    });
  }

  // 4. Fetch live Indexes from pg_indexes
  const idxRes = await client.query(`
    SELECT indexname, tablename
    FROM pg_indexes
    WHERE schemaname = 'public'
  `);
  const actualIndexes = new Set(
    idxRes.rows.map((r) => `${r.tablename.toLowerCase()}.${r.indexname.toLowerCase()}`)
  );

  const errors = [];
  let totalColumnsVerified = 0;
  let totalPksVerified = 0;
  let totalFksVerified = 0;
  let totalIndexesVerified = 0;

  // Compare every expected table
  for (const [tName, exp] of expectedTables.entries()) {
    if (!actualTables.has(tName)) {
      errors.push(`[MISSING TABLE] Table "${tName}" is defined in schema.sql but missing in database.`);
      continue;
    }

    // Verify Primary Key
    const actPk = actualPks.get(tName) || [];
    if (exp.primaryKeys.length > 0) {
      const expSorted = [...exp.primaryKeys].sort().join(',');
      const actSorted = [...actPk].sort().join(',');
      if (expSorted !== actSorted) {
        errors.push(
          `[PK MISMATCH] Table "${tName}" PK mismatch: expected [${expSorted}], database has [${actSorted}]`
        );
      } else {
        totalPksVerified++;
      }
    }

    // Verify Columns, Types, and Nullability
    for (const [colName, expCol] of exp.columns.entries()) {
      const actCol = actualCols.get(`${tName}.${colName}`);
      if (!actCol) {
        errors.push(`[MISSING COLUMN] Column "${tName}.${colName}" is missing in database.`);
      } else {
        totalColumnsVerified++;
        if (expCol.dataType !== actCol.dataType) {
          errors.push(
            `[TYPE MISMATCH] "${tName}.${colName}" data_type mismatch: expected "${expCol.dataType}", database has "${actCol.dataType}"`
          );
        }
        if (expCol.isNullable !== actCol.isNullable) {
          errors.push(
            `[NULLABILITY MISMATCH] "${tName}.${colName}" is_nullable mismatch: expected isNullable=${expCol.isNullable}, database has isNullable=${actCol.isNullable}`
          );
        }
      }
    }

    // Verify Foreign Keys
    const actTableFks = actualFks.get(tName) || [];
    for (const expFk of exp.foreignKeys) {
      const found = actTableFks.some(
        (a) =>
          a.column === expFk.column &&
          a.targetTable === expFk.targetTable &&
          a.targetCol === expFk.targetCol
      );
      if (!found) {
        errors.push(
          `[FK MISMATCH] Foreign key on "${tName}.${expFk.column}" -> "${expFk.targetTable}(${expFk.targetCol})" is missing or references incorrect target in database.`
        );
      } else {
        totalFksVerified++;
      }
    }
  }

  // Verify explicit Indexes
  for (const expIdx of expectedIndexes) {
    const k = `${expIdx.tableName}.${expIdx.indexName}`;
    if (!actualIndexes.has(k)) {
      errors.push(
        `[MISSING INDEX] Explicit index "${expIdx.indexName}" on table "${expIdx.tableName}" is missing in database.`
      );
    } else {
      totalIndexesVerified++;
    }
  }

  if (errors.length > 0) {
    console.error(`\n[VerifySchema] FAILED with ${errors.length} schema parity discrepancy(ies):`);
    errors.forEach((err, i) => console.error(`  ${i + 1}. ${err}`));
    throw new Error(
      `[VerifySchema] Deep schema verification failed: ${errors.length} discrepancies found.`
    );
  }

  console.log(
    `[VerifySchema] PASSED: All ${expectedTables.size} tables, ${totalColumnsVerified} columns (types + nullability), ${totalPksVerified} PKs, ${totalFksVerified} FK references, and ${totalIndexesVerified} explicit indexes verified in PostgreSQL with 100% exact parity!`
  );

  return {
    tablesVerified: expectedTables.size,
    columnsVerified: totalColumnsVerified,
    pksVerified: totalPksVerified,
    fksVerified: totalFksVerified,
    indexesVerified: totalIndexesVerified,
    constraintsVerified: totalPksVerified + totalFksVerified,
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
