-- Migration 008: Add decline_reason to job_offers and normalize sla_templates.market type
-- Resolves Milestone 1 v10 Review Finding #5 & Finding #4

ALTER TABLE job_offers
  ADD COLUMN IF NOT EXISTS decline_reason TEXT;

ALTER TABLE sla_templates
  ALTER COLUMN market TYPE TEXT;

