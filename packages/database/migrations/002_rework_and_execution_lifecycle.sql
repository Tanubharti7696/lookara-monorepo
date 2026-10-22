-- packages/database/migrations/002_rework_and_execution_lifecycle.sql
-- Migration to upgrade existing databases to support rework count, execution timestamps, and market SLA tiering

DO $$
BEGIN
  -- Add rework_count to jobs if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'rework_count') THEN
    ALTER TABLE jobs ADD COLUMN rework_count INT NOT NULL DEFAULT 0;
  END IF;

  -- Add rework_reason to jobs if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'rework_reason') THEN
    ALTER TABLE jobs ADD COLUMN rework_reason TEXT;
  END IF;

  -- Add en_route_at to jobs if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'en_route_at') THEN
    ALTER TABLE jobs ADD COLUMN en_route_at TIMESTAMPTZ;
  END IF;

  -- Add on_site_at to jobs if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'on_site_at') THEN
    ALTER TABLE jobs ADD COLUMN on_site_at TIMESTAMPTZ;
  END IF;

  -- Add verified_at to jobs if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'verified_at') THEN
    ALTER TABLE jobs ADD COLUMN verified_at TIMESTAMPTZ;
  END IF;

  -- Add verified_by_user_id to jobs if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'verified_by_user_id') THEN
    ALTER TABLE jobs ADD COLUMN verified_by_user_id UUID REFERENCES users(id);
  END IF;

  -- Update jobs status check constraint to include en_route and on_site
  ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
  ALTER TABLE jobs ADD CONSTRAINT jobs_status_check CHECK (status IN (
    'unassigned', 'dispatching', 'assigned', 'accepted', 'en_route', 'on_site',
    'in_progress', 'verification_pending', 'completed', 'closed', 'cancelled', 'escalated'
  ));

  -- Add en_route_at to job_assignments if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_assignments' AND column_name = 'en_route_at') THEN
    ALTER TABLE job_assignments ADD COLUMN en_route_at TIMESTAMPTZ;
  END IF;

  -- Add on_site_at to job_assignments if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_assignments' AND column_name = 'on_site_at') THEN
    ALTER TABLE job_assignments ADD COLUMN on_site_at TIMESTAMPTZ;
  END IF;

  -- Add updated_at to vendor_property_coverage if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_property_coverage' AND column_name = 'updated_at') THEN
    ALTER TABLE vendor_property_coverage ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;

  -- Add market to sla_templates if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sla_templates' AND column_name = 'market') THEN
    ALTER TABLE sla_templates ADD COLUMN market VARCHAR(100);
  END IF;
END $$;
