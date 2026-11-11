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

-- 3. Ensure jobs has workflow_class, subtype, and source for full parity with schema.sql
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS workflow_class TEXT NOT NULL DEFAULT 'maintenance',
  ADD COLUMN IF NOT EXISTS subtype TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'pm_portal';

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

-- 5. Idempotent Golden Demo Fixtures for PM Demo Organization (if present)
DO $$
DECLARE
  v_org_id UUID;
  v_prop_id UUID;
  v_vendor_id UUID := 'b30dad74-432f-4a66-b995-26e2efa090ce';
  v_pm_user_id UUID;
BEGIN
  -- Locate PM demo organization (Blue Wave Hospitality or Lookara Luxury Stays)
  SELECT organization_id, user_id INTO v_org_id, v_pm_user_id
  FROM organization_users ou
  JOIN users u ON ou.user_id = u.id
  WHERE LOWER(u.email) = 'pm@lookara.com' AND ou.status = 'active'
  LIMIT 1;

  IF v_org_id IS NOT NULL THEN
    -- Locate a property in this organization
    SELECT id INTO v_prop_id FROM properties WHERE organization_id = v_org_id LIMIT 1;

    -- Ensure Apex Maintenance vendor exists
    INSERT INTO vendors (id, company_name, service_types, rating, status)
    VALUES (v_vendor_id, 'Apex Maintenance', ARRAY['hvac', 'plumbing', 'turnover', 'inspection'], 4.9, 'approved')
    ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name, status = 'approved';

    INSERT INTO organization_vendors (organization_id, vendor_id, status, tier)
    VALUES (v_org_id, v_vendor_id, 'active', 'preferred')
    ON CONFLICT (organization_id, vendor_id) DO UPDATE SET status = 'active', tier = 'preferred';

    -- Ensure all open jobs in this organization without a vendor assignment get assigned to Apex Maintenance
    INSERT INTO job_assignments (job_id, vendor_id, assigned_by, status)
    SELECT j.id, v_vendor_id, v_pm_user_id, 'assigned'
    FROM jobs j
    WHERE j.organization_id = v_org_id
      AND NOT EXISTS (SELECT 1 FROM job_assignments ja WHERE ja.job_id = j.id);

    -- Ensure SLA snapshot exists on 99999999-9999-9999-9999-999999999903
    IF EXISTS (SELECT 1 FROM jobs WHERE id = '99999999-9999-9999-9999-999999999903') THEN
      INSERT INTO job_sla_snapshots (
        job_id, acknowledge_target_at, arrival_target_at, completion_target_at,
        escalation_target_at, verification_target_at, current_risk_tier
      )
      SELECT
        '99999999-9999-9999-9999-999999999903',
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '2 hours',
        NOW() + INTERVAL '2 hours',
        NOW() + INTERVAL '1 hour',
        NOW() + INTERVAL '4 hours',
        'on_track'
      WHERE NOT EXISTS (
        SELECT 1 FROM job_sla_snapshots WHERE job_id = '99999999-9999-9999-9999-999999999903'
      );

      -- Ensure sample evidence exists on 99999999-9999-9999-9999-999999999903
      INSERT INTO job_evidence (
        id, job_id, uploaded_by, vendor_id, evidence_type, file_url, caption,
        gps_latitude, gps_longitude
      )
      VALUES (
        '88888888-8888-8888-8888-888888888803',
        '99999999-9999-9999-9999-999999999903',
        v_pm_user_id,
        v_vendor_id,
        'completion_photo',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        'Completed plumbing & turnover verification photo',
        25.7906540,
        -80.1300455
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Ensure Incident 77777777-7777-7777-7777-777777777771 exists in incidents table
    IF v_prop_id IS NOT NULL THEN
      INSERT INTO incidents (
        id, organization_id, property_id, reported_by, title, description, severity, status
      )
      VALUES (
        '77777777-7777-7777-7777-777777777771',
        v_org_id,
        v_prop_id,
        v_pm_user_id,
        'Emergency Pipe Burst & Water Leak',
        'Active water leak reported in main bathroom ceiling requiring immediate shutoff and remediation.',
        'critical',
        'open'
      )
      ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        status = 'open',
        severity = 'critical';
    END IF;

    -- Ensure Disputed Invoice 34f01749-625e-4cfd-b309-b13f0f613b66 exists
    INSERT INTO invoices (
      id, organization_id, vendor_id, job_id, invoice_number, amount, tax, total, status, due_date
    )
    VALUES (
      '34f01749-625e-4cfd-b309-b13f0f613b66',
      v_org_id,
      v_vendor_id,
      CASE WHEN EXISTS (SELECT 1 FROM jobs WHERE id = '99999999-9999-9999-9999-999999999903')
           THEN '99999999-9999-9999-9999-999999999903'::uuid ELSE NULL END,
      'INV-2026-9903',
      450.00,
      36.00,
      486.00,
      'disputed',
      NOW() + INTERVAL '7 days'
    )
    ON CONFLICT (id) DO UPDATE SET
      organization_id = EXCLUDED.organization_id,
      status = 'disputed',
      total = EXCLUDED.total;

    -- Ensure Quote Approval 0b91ec16-a3e0-4a39-8208-25b964102188 exists and a job has quote_required = true
    UPDATE jobs SET quote_required = true
    WHERE id IN ('99999999-9999-9999-9999-999999999902', 'e7a06c1c-2b2e-4d50-a147-101c0171dbb5')
      AND organization_id = v_org_id;

    INSERT INTO approvals (
      id, job_id, organization_id, requested_by, approval_type, status, amount, notes
    )
    VALUES (
      '0b91ec16-a3e0-4a39-8208-25b964102188',
      CASE WHEN EXISTS (SELECT 1 FROM jobs WHERE id = '99999999-9999-9999-9999-999999999902')
           THEN '99999999-9999-9999-9999-999999999902'::uuid ELSE NULL END,
      v_org_id,
      v_pm_user_id,
      'quote',
      'awaiting_owner_decision',
      485.00,
      'Compressor capacitor and refrigerant recharge quote awaiting owner decision.'
    )
    ON CONFLICT (id) DO UPDATE SET
      organization_id = EXCLUDED.organization_id,
      status = 'awaiting_owner_decision',
      amount = EXCLUDED.amount;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Golden fixture migration upsert skipped: %', SQLERRM;
END $$;



