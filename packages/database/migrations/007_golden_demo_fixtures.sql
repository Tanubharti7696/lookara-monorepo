-- Migration 007: Idempotent Golden Demo Fixtures for PM Demo Organization (Blue Wave Hospitality)
-- Ensures all documented golden IDs (Task 9903, Incident 7771, Disputed Invoice 34f01749, Quote Approval 0b91ec16, and Vendor Assignments) exist on deployed environments.

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS rework_parent_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL;

DO $$
DECLARE
  v_org_id UUID;
  v_prop_id UUID;
  v_vendor_id UUID;
  v_pm_user_id UUID;
  v_owner_id UUID;
BEGIN
  -- Locate PM demo organization and PM user
  SELECT ou.organization_id, ou.user_id INTO v_org_id, v_pm_user_id
  FROM organization_users ou
  JOIN users u ON ou.user_id = u.id
  WHERE LOWER(u.email) = 'pm@lookara.com' AND ou.status = 'active'
  LIMIT 1;

  IF v_org_id IS NOT NULL THEN
    -- Locate a property in this organization
    SELECT id INTO v_prop_id FROM properties WHERE organization_id = v_org_id LIMIT 1;

    -- Locate or create an active vendor for this organization
    SELECT v.id INTO v_vendor_id
    FROM vendors v
    JOIN organization_vendors ov ON ov.vendor_id = v.id
    WHERE ov.organization_id = v_org_id
    LIMIT 1;

    IF v_vendor_id IS NULL THEN
      SELECT id INTO v_vendor_id FROM vendors LIMIT 1;
    END IF;

    IF v_vendor_id IS NULL THEN
      INSERT INTO vendors (id, business_name, display_name, vendor_type, primary_trade, city, state, lifecycle_status, emergency_enabled)
      VALUES ('b30dad74-432f-4a66-b995-26e2efa090ce', 'Apex Pro Maintenance', 'Apex Maintenance', 'company', 'plumbing', 'Tampa', 'FL', 'active', true)
      ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, lifecycle_status = 'active'
      RETURNING id INTO v_vendor_id;
    END IF;

    INSERT INTO organization_vendors (organization_id, vendor_id, relationship_status)
    VALUES (v_org_id, v_vendor_id, 'preferred')
    ON CONFLICT (organization_id, vendor_id) DO UPDATE SET relationship_status = 'preferred';

    -- Locate or create an owner for approvals in this organization
    SELECT po.owner_id INTO v_owner_id
    FROM property_owners po
    WHERE po.property_id = v_prop_id
    LIMIT 1;

    IF v_owner_id IS NULL THEN
      SELECT id INTO v_owner_id FROM owners LIMIT 1;
    END IF;

    IF v_prop_id IS NOT NULL THEN
      -- 1. Golden Verification Task 99999999-9999-9999-9999-999999999903
      INSERT INTO jobs (id, job_code, organization_id, property_id, created_by_user_id, trade_code, workflow_class, title, description, severity, source, service_type, status, scheduled_start)
      VALUES ('99999999-9999-9999-9999-999999999903', 'JOB-VER-03', v_org_id, v_prop_id, v_pm_user_id, 'HVAC', 'maintenance', 'Filter & Coil Clean Unit 203', 'Verification awaiting review', 'medium', 'pm_portal', 'routine', 'verification_pending', now() + interval '2 hours')
      ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        property_id = EXCLUDED.property_id,
        status = 'verification_pending',
        scheduled_start = COALESCE(jobs.scheduled_start, EXCLUDED.scheduled_start);

      -- Assign vendor to all open demo jobs in this organization that lack an assignment
      INSERT INTO job_assignments (job_id, vendor_id, assignment_type, assigned_at, accepted_at)
      SELECT j.id, v_vendor_id, 'manual', now() - interval '2 hours', now() - interval '90 minutes'
      FROM jobs j
      WHERE j.organization_id = v_org_id
        AND NOT EXISTS (SELECT 1 FROM job_assignments ja WHERE ja.job_id = j.id);

      -- Ensure SLA snapshot on 99999999-9999-9999-9999-999999999903
      INSERT INTO job_sla_snapshots (job_id, acknowledge_target, arrival_target, completion_target, verification_target, escalation_target, resolved_tier)
      VALUES ('99999999-9999-9999-9999-999999999903', now() - interval '3 hours', now() - interval '2 hours', now() + interval '4 hours', now() + interval '6 hours', now() + interval '2 hours', 'organization')
      ON CONFLICT (job_id) DO NOTHING;

      -- Ensure sample evidence on 99999999-9999-9999-9999-999999999903
      INSERT INTO job_evidence (job_id, uploaded_by_user_id, vendor_id, evidence_type, file_url, notes, gps_latitude, gps_longitude)
      SELECT '99999999-9999-9999-9999-999999999903', v_pm_user_id, v_vendor_id, 'after_photo', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800', 'Filter replaced and evaporator coils cleaned.', 25.7906540, -80.1300455
      WHERE NOT EXISTS (SELECT 1 FROM job_evidence WHERE job_id = '99999999-9999-9999-9999-999999999903');

      -- 2. Golden Incident 77777777-7777-7777-7777-777777777771
      INSERT INTO incidents (id, incident_code, organization_id, property_id, title, incident_type, severity, status, summary, estimated_cost_min, estimated_cost_max, owner_action_required)
      VALUES ('77777777-7777-7777-7777-777777777771', 'INC-2026-7771', v_org_id, v_prop_id, 'Main Line Backflow & Pressure Failure', 'emergency', 'critical', 'in_progress', 'Catastrophic backflow pressure drop in main mechanical room. Immediate shutoff valve access required.', 450.00, 1200.00, false)
      ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        property_id = EXCLUDED.property_id,
        status = 'in_progress';

      -- 3. Golden Disputed Invoice 34f01749-625e-4cfd-b309-b13f0f613b66
      INSERT INTO invoices (id, organization_id, amount, currency, status, due_date, pdf_url)
      VALUES ('34f01749-625e-4cfd-b309-b13f0f613b66', v_org_id, 450.00, 'USD', 'disputed', now() + interval '7 days', 'INV-DISPUTE-101')
      ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        status = 'disputed';

      -- 4. Golden Quote Approval 0b91ec16-a3e0-4a39-8208-25b964102188 & Quote Task 99999999-9999-9999-9999-999999999904
      IF v_owner_id IS NOT NULL THEN
        INSERT INTO approvals (id, approval_code, organization_id, property_id, owner_id, approval_type, title, description, amount, urgency, status, pm_recommendation)
        VALUES ('0b91ec16-a3e0-4a39-8208-25b964102188', 'APP-101', v_org_id, v_prop_id, v_owner_id, 'repair', 'Roof Shingle Replacement Quote', 'Estimate from Apex Roofing', 1850.00, 'urgent', 'awaiting_owner_decision', 'Approve quote before storm season.')
        ON CONFLICT (id) DO UPDATE SET
          organization_id = EXCLUDED.organization_id,
          property_id = EXCLUDED.property_id,
          status = 'awaiting_owner_decision';
      END IF;

      INSERT INTO jobs (id, job_code, organization_id, property_id, created_by_user_id, trade_code, workflow_class, title, description, severity, source, service_type, payout_amount, quote_required, status, scheduled_start)
      VALUES ('99999999-9999-9999-9999-999999999904', 'JOB-QUOTE-04', v_org_id, v_prop_id, v_pm_user_id, 'ROOF', 'maintenance', 'Roof Shingle Replacement Quote Review', 'Vendor submitted $1,850 quote for storm shingle replacement', 'high', 'pm_portal', 'repair', 1850.00, true, 'unassigned', now() + interval '4 hours')
      ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        property_id = EXCLUDED.property_id,
        quote_required = true;

      INSERT INTO job_assignments (job_id, vendor_id, assignment_type, assigned_at)
      SELECT '99999999-9999-9999-9999-999999999904', v_vendor_id, 'manual', now() - interval '1 hour'
      WHERE NOT EXISTS (SELECT 1 FROM job_assignments WHERE job_id = '99999999-9999-9999-9999-999999999904');
    END IF;
  END IF;
END $$;

