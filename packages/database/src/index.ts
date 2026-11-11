// packages/database/src/index.ts
import { Pool, type QueryResult, type QueryResultRow } from 'pg';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/lookara';

const isCloudDb =
  process.env.DATABASE_SSL === 'true' ||
  (!connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')) ||
  connectionString.includes('sslmode=require') ||
  connectionString.includes('neon.tech') ||
  connectionString.includes('supabase');

// In production cloud environments, verify TLS certificates using CA or platform defaults (V9-09)
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

const sslConfig = buildSslConfig();

export const pool = new Pool({
  connectionString,
  ssl: sslConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

export async function query<R extends QueryResultRow = any>(
  text: string,
  params?: any[],
): Promise<QueryResult<R>> {
  const start = Date.now();
  const res = await pool.query<R>(text, params);
  const duration = Date.now() - start;
  if (process.env.DEBUG_SQL === 'true') {
    console.log('[SQL]', { text, duration, rows: res.rowCount });
  }
  return res;
}

export async function getClient() {
  return pool.connect();
}

export * from 'pg';
