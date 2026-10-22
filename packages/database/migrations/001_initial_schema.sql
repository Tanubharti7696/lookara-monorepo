-- packages/database/migrations/001_initial_schema.sql
-- Baseline schema definition for Lookara Milestone 1

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  tier VARCHAR(50) NOT NULL DEFAULT 'standard',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  roles TEXT[] NOT NULL DEFAULT '{"pm"}',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Properties
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  property_code VARCHAR(50),
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip VARCHAR(20) NOT NULL,
  market VARCHAR(100),
  property_type VARCHAR(50) NOT NULL DEFAULT 'multifamily',
  total_units INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  business_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  primary_trade VARCHAR(100) NOT NULL,
  tax_id VARCHAR(50),
  emergency_enabled BOOLEAN NOT NULL DEFAULT false,
  accepts_new_jobs BOOLEAN NOT NULL DEFAULT true,
  compliance_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  lifecycle_status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Vendor Trades
CREATE TABLE IF NOT EXISTS vendor_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  trade_code VARCHAR(50) NOT NULL,
  eligibility_status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, trade_code)
);

-- 6. Vendor Availability Schedule
CREATE TABLE IF NOT EXISTS vendor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time TIME,
  end_time TIME,
  is_off BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, weekday)
);

-- 7. Organization Vendors
CREATE TABLE IF NOT EXISTS organization_vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  relationship_status VARCHAR(50) NOT NULL DEFAULT 'neutral',
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, vendor_id)
);

-- 8. Vendor Property Coverage
CREATE TABLE IF NOT EXISTS vendor_property_coverage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, property_id)
);

-- 9. Compliance Requirements
CREATE TABLE IF NOT EXISTS compliance_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  trade_code VARCHAR(50),
  requirement_scope VARCHAR(50) NOT NULL DEFAULT 'shared',
  blocks_dispatch BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Vendor Documents
CREATE TABLE IF NOT EXISTS vendor_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  compliance_requirement_id UUID NOT NULL REFERENCES compliance_requirements(id) ON DELETE CASCADE,
  document_url TEXT NOT NULL,
  review_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  expiry_date DATE,
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. SLA Templates
CREATE TABLE IF NOT EXISTS sla_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  market VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  acknowledge_mins INT NOT NULL DEFAULT 30,
  arrival_mins INT NOT NULL DEFAULT 120,
  completion_mins INT NOT NULL DEFAULT 480,
  verification_mins INT NOT NULL DEFAULT 120,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Jobs (Tasks)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_code VARCHAR(50) UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  trade_code VARCHAR(50) NOT NULL,
  workflow_class VARCHAR(50) NOT NULL DEFAULT 'maintenance',
  subtype VARCHAR(50),
  severity VARCHAR(50) NOT NULL DEFAULT 'medium',
  source VARCHAR(50) NOT NULL DEFAULT 'pm_portal',
  status VARCHAR(50) NOT NULL DEFAULT 'unassigned' CHECK (status IN (
    'unassigned', 'dispatching', 'assigned', 'accepted', 'en_route', 'on_site',
    'in_progress', 'verification_pending', 'completed', 'closed', 'cancelled', 'escalated'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  service_type VARCHAR(100) NOT NULL DEFAULT 'standard',
  payout_amount NUMERIC(10, 2),
  rework_count INT NOT NULL DEFAULT 0,
  rework_reason TEXT,
  en_route_at TIMESTAMPTZ,
  on_site_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by_user_id UUID REFERENCES users(id),
  scheduled_start TIMESTAMPTZ,
  estimated_duration_minutes INT DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Job Assignments
CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  assignment_type VARCHAR(50) NOT NULL DEFAULT 'manual',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  en_route_at TIMESTAMPTZ,
  on_site_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 14. Job SLA Snapshots
CREATE TABLE IF NOT EXISTS job_sla_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID UNIQUE NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  sla_template_id UUID REFERENCES sla_templates(id),
  acknowledge_target TIMESTAMPTZ,
  arrival_target TIMESTAMPTZ,
  completion_target TIMESTAMPTZ,
  verification_target TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Job Evidence
CREATE TABLE IF NOT EXISTS job_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
  evidence_type VARCHAR(50) NOT NULL DEFAULT 'photo',
  file_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Audit Events
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_type VARCHAR(50) NOT NULL,
  actor_user_id UUID,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  category VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  summary TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
