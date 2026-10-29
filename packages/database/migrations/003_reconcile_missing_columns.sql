-- packages/database/migrations/003_reconcile_missing_columns.sql
-- Migration to reconcile properties.market, properties.zip, and jobs.completed_at

DO $$
BEGIN
  -- Add zip to properties if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'zip') THEN
    ALTER TABLE properties ADD COLUMN zip TEXT;
    -- Backfill zip from postal_code if available
    UPDATE properties SET zip = postal_code WHERE zip IS NULL AND postal_code IS NOT NULL;
  END IF;

  -- Add market to properties if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'market') THEN
    ALTER TABLE properties ADD COLUMN market TEXT;
    -- Backfill market from city if available
    UPDATE properties SET market = city WHERE market IS NULL AND city IS NOT NULL;
  END IF;

  -- Create indexes on market and zip
  CREATE INDEX IF NOT EXISTS idx_properties_market ON properties(market);
  CREATE INDEX IF NOT EXISTS idx_properties_zip ON properties(zip);

  -- Add completed_at to jobs if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'completed_at') THEN
    ALTER TABLE jobs ADD COLUMN completed_at TIMESTAMPTZ;
    -- Backfill completed_at from updated_at for jobs in terminal/completed states
    UPDATE jobs SET completed_at = updated_at WHERE completed_at IS NULL AND status IN ('completed', 'closed');
  END IF;

  CREATE INDEX IF NOT EXISTS idx_jobs_completed_at ON jobs(completed_at);
END $$;
