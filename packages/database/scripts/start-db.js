// packages/database/scripts/start-db.js
const EmbeddedPostgres = require('embedded-postgres').default;
const path = require('path');

const dbDir = path.join(__dirname, '..', '.pgdata');

const pg = new EmbeddedPostgres({
  port: 5432,
  databaseDir: dbDir,
  user: 'postgres',
  password: 'password',
  persistent: true,
});

async function main() {
  console.log('[PostgreSQL] Starting database on port 5432...');
  try {
    await pg.start();
    console.log('[PostgreSQL] Database ready on postgres://postgres:password@localhost:5432/postgres');
  } catch (err) {
    if (err.message && err.message.includes('already running')) {
      console.log('[PostgreSQL] Database is already running on port 5432.');
    } else {
      console.error('[PostgreSQL] Error starting database:', err);
      process.exit(1);
    }
  }

  // Handle termination gracefully
  const shutdown = async () => {
    console.log('\n[PostgreSQL] Shutting down database...');
    try {
      await pg.stop();
      console.log('[PostgreSQL] Database stopped.');
    } catch {
      // ignore
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep process alive if started directly
  setInterval(() => {}, 1000 * 60 * 60);
}

main();
