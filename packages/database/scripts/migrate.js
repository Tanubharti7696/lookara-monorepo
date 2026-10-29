// packages/database/scripts/migrate.js
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

async function migrate() {
  console.log('[Migrate] Connecting to PostgreSQL at', connectionString.replace(/:[^:@]+@/, ':****@'));
  const client = new Client({
    connectionString,
    ssl: isCloudDb ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  try {
    // 1. Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 2. Apply base schema.sql if tables do not exist
    const tableCheck = await client.query(`
      SELECT count(*) as count FROM information_schema.tables WHERE table_schema = 'public'
    `);
    const tableCount = parseInt(tableCheck.rows[0]?.count || '0', 10);
    if (tableCount === 0 || tableCount === 1) { // 1 if schema_migrations just created
      const sqlPath = path.join(__dirname, '..', 'prisma', 'schema.sql');
      console.log('[Migrate] Fresh install detected: Applying schema.sql canonical foundation...');
      const baseSql = fs.readFileSync(sqlPath, 'utf8');
      await client.query(baseSql);
    }

    // 3. Execute all versioned migrations in order
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
      for (const file of files) {
        const alreadyApplied = await client.query(
          `SELECT 1 FROM schema_migrations WHERE version = $1`,
          [file]
        );
        if (alreadyApplied.rows.length === 0) {
          console.log(`[Migrate] Executing migration: ${file}...`);
          const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
          await client.query(sql);
          await client.query(
            `INSERT INTO schema_migrations (version, applied_at) VALUES ($1, now())`,
            [file]
          );
          console.log(`[Migrate] Successfully applied and tracked: ${file}`);
        } else {
          console.log(`[Migrate] Skipping already applied migration: ${file}`);
        }
      }
    }

    console.log('[Migrate] All canonical database migrations applied and verified successfully!');
  } catch (err) {
    console.error('[Migrate] Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
