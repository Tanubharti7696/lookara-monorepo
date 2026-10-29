-- packages/database/migrations/004_sla_escalation_clock_and_hierarchy.sql
-- Migration to support Escalation clock and 5-tier deterministic hierarchy tracking

DO $$
BEGIN
  -- Add escalation_mins to sla_templates
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sla_templates' AND column_name = 'escalation_mins') THEN
    ALTER TABLE sla_templates ADD COLUMN escalation_mins INTEGER;
  END IF;

  -- Add escalation_target to job_sla_snapshots
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sla_snapshots' AND column_name = 'escalation_target') THEN
    ALTER TABLE job_sla_snapshots ADD COLUMN escalation_target TIMESTAMPTZ;
  END IF;

  -- Add resolved_tier to job_sla_snapshots
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sla_snapshots' AND column_name = 'resolved_tier') THEN
    ALTER TABLE job_sla_snapshots ADD COLUMN resolved_tier TEXT;
  END IF;
END $$;
