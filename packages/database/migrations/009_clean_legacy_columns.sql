-- 009_clean_legacy_columns.sql
-- Remove legacy columns from earlier prototypes to maintain 100% strict canonical parity with schema.sql
ALTER TABLE jobs DROP COLUMN IF EXISTS skill_code;
ALTER TABLE jobs DROP COLUMN IF EXISTS urgency;
