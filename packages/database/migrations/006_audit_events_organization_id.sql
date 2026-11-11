-- Migration 006: First-Class Organization Identifier on Audit Events & Job Evidence Compatibility
-- Resolves V9-07 (Audit Events Organization Identifier) and ensures job_evidence columns match runtime expectations

-- 1. Add first-class organization_id to audit_events
ALTER TABLE audit_events
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_audit_events_organization_id ON audit_events(organization_id);

-- Backfill organization_id from related jobs, properties, incidents, and approvals
UPDATE audit_events a
SET organization_id = j.organization_id
FROM jobs j
WHERE a.target_id = j.id AND a.organization_id IS NULL;

UPDATE audit_events a
SET organization_id = p.organization_id
FROM properties p
WHERE a.target_id = p.id AND a.organization_id IS NULL;

UPDATE audit_events a
SET organization_id = i.organization_id
FROM incidents i
WHERE a.target_id = i.id AND a.organization_id IS NULL;

UPDATE audit_events a
SET organization_id = ap.organization_id
FROM approvals ap
WHERE a.target_id = ap.id AND a.organization_id IS NULL;

UPDATE audit_events a
SET organization_id = o.id
FROM organizations o
WHERE a.target_id = o.id AND a.organization_id IS NULL;

-- 2. Ensure job_evidence has optional vendor_id and GPS columns for full parity with schema.sql
ALTER TABLE job_evidence
  ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gps_latitude NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS gps_longitude NUMERIC(10,7);

-- 3. Ensure jobs has workflow_class, subtype, source, and rework_parent_job_id for full parity with schema.sql
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS workflow_class TEXT NOT NULL DEFAULT 'maintenance',
  ADD COLUMN IF NOT EXISTS subtype TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'pm_portal',
  ADD COLUMN IF NOT EXISTS rework_parent_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL;

-- 4. Drop legacy NOT NULL constraint on jobs.urgency if urgency column exists from earlier schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'urgency'
  ) THEN
    ALTER TABLE jobs ALTER COLUMN urgency DROP NOT NULL;
    ALTER TABLE jobs ALTER COLUMN urgency SET DEFAULT 'standard';
  END IF;
END $$;




