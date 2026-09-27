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
    const sqlPath = path.join(__dirname, '..', 'prisma', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('[Migrate] Executing schema.sql DDL migrations...');
    await client.query(sql);
    console.log('[Migrate] Database schema applied successfully!');
  } catch (err) {
    console.error('[Migrate] Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
