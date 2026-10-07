-- Lookara PostgreSQL Schema (Authoritative Milestone 1 Foundation)
-- Matches DOCX/Step 1-data model..docx and lookara-db-architecture-dev.html

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (PM Companies)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','limited','suspended')),
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'US',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Properties
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  status TEXT NOT NULL CHECK (status IN ('active','inactive')),
  beds INTEGER DEFAULT 0,
  baths NUMERIC(3,1) DEFAULT 0,
  sqft INTEGER DEFAULT 0,
  property_type TEXT,
  amenities JSONB,
  media JSONB,
  owner_name TEXT,
  owner_email TEXT,
  manager_name TEXT,
  compliance_template TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_properties_org ON properties(organization_id);

-- 3. Users (One identity per human across all portals)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  phone TEXT,
  avatar_url TEXT,
  account_status TEXT NOT NULL CHECK (account_status IN ('active','invited','limited','suspended','disabled')),
  token_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Organization Users (PM staff memberships & roles)
CREATE TABLE IF NOT EXISTS organization_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner','admin','ops_manager','coordinator','viewer')),
  status TEXT NOT NULL CHECK (status IN ('active','invited','disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_org_users_org ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_users_user ON organization_users(user_id);

-- 5. Owners & Property Owners
CREATE TABLE IF NOT EXISTS owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active','invited','disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS property_owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  relationship_status TEXT NOT NULL CHECK (relationship_status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, owner_id)
);

-- 6. Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  business_name TEXT,
  display_name TEXT NOT NULL,
  vendor_type TEXT NOT NULL CHECK (vendor_type IN ('individual','company')),
  primary_trade TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'US',
  max_radius_miles INTEGER,
  lifecycle_status TEXT NOT NULL CHECK (lifecycle_status IN ('invited','onboarding','active','limited','blocked','suspended')),
  lifecycle_reason TEXT,
  emergency_enabled BOOLEAN NOT NULL DEFAULT false,
  accepts_new_jobs BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  trade_code TEXT NOT NULL,
  is_primary_identity_trade BOOLEAN NOT NULL DEFAULT false,
  eligibility_status TEXT NOT NULL CHECK (eligibility_status IN ('active','limited','blocked')),
  eligibility_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, trade_code)
);
CREATE INDEX IF NOT EXISTS idx_vendor_trades_vendor ON vendor_trades(vendor_id);

CREATE TABLE IF NOT EXISTS vendor_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_trade_id UUID NOT NULL REFERENCES vendor_trades(id) ON DELETE CASCADE,
  skill_code TEXT NOT NULL,
  skill_priority TEXT NOT NULL CHECK (skill_priority IN ('primary','secondary')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vendor_trade_id, skill_code)
);

CREATE TABLE IF NOT EXISTS vendor_coverage_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  zone_name TEXT NOT NULL,
  zone_type TEXT NOT NULL CHECK (zone_type IN ('primary','extended')),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- 7. Organization Vendors (Private PM-Vendor Relationship)
CREATE TABLE IF NOT EXISTS organization_vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  relationship_status TEXT NOT NULL CHECK (relationship_status IN ('preferred','neutral','limited','not_receiving')),
  invited_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, vendor_id)
);

-- 8. Platform Admin Access
CREATE TABLE IF NOT EXISTS platform_admin_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_role TEXT NOT NULL DEFAULT 'super_admin',
  status TEXT NOT NULL CHECK (status IN ('active','disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 9. Compliance Engine
CREATE TABLE IF NOT EXISTS compliance_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  requirement_scope TEXT NOT NULL CHECK (requirement_scope IN ('shared','trade_specific')),
  trade_code TEXT,
  document_type TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  blocks_dispatch BOOLEAN NOT NULL DEFAULT false,
  warning_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  vendor_trade_id UUID REFERENCES vendor_trades(id) ON DELETE SET NULL,
  compliance_requirement_id UUID NOT NULL REFERENCES compliance_requirements(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('vendor_upload','provider_verified','system_generated')),
  file_url TEXT,
  external_reference TEXT,
  review_status TEXT NOT NULL CHECK (review_status IN ('pending','approved','rejected','reupload_required')),
  extracted_status TEXT NOT NULL CHECK (extracted_status IN ('not_started','processing','completed','failed')),
  effective_date DATE,
  expiry_date DATE,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vendor_documents_vendor ON vendor_documents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_documents_review ON vendor_documents(review_status);

CREATE TABLE IF NOT EXISTS vendor_property_coverage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, property_id)
);

-- 10. Jobs / Tasks & Dispatch
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_code TEXT UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES users(id),
  trade_code TEXT NOT NULL,
  workflow_class TEXT NOT NULL,
  subtype TEXT,
  severity TEXT NOT NULL,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL,
  payout_amount NUMERIC(12,2),
  quote_required BOOLEAN NOT NULL DEFAULT false,
  assessment_required BOOLEAN NOT NULL DEFAULT false,
  access_ready BOOLEAN NOT NULL DEFAULT false,
  scheduled_start TIMESTAMPTZ,
  estimated_duration_minutes INTEGER,
  status TEXT NOT NULL CHECK (status IN (
    'unassigned',
    'dispatching',
    'assigned',
    'accepted',
    'in_progress',
    'completed',
    'verification_pending',
    'closed',
    'cancelled',
    'escalated'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_jobs_org ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_property ON jobs(property_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

CREATE TABLE IF NOT EXISTS job_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('exclusive','priority','open_pool','assigned')),
  offer_status TEXT NOT NULL CHECK (offer_status IN ('offered','accepted','declined','expired','missed','withdrawn')),
  offered_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_job_offers_job ON job_offers(job_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_vendor ON job_offers(vendor_id);

CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('auto','manual')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 11. Incidents & Approvals
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_code TEXT UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  related_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('maintenance_issue','emergency','guest_damage','inspection_finding')),
  severity TEXT NOT NULL CHECK (severity IN ('low','moderate','high','critical')),
  status TEXT NOT NULL CHECK (status IN ('open','in_progress','under_control','resolved','closed')),
  summary TEXT,
  estimated_cost_min NUMERIC(12,2),
  estimated_cost_max NUMERIC(12,2),
  owner_action_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_code TEXT UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  related_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  related_incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
  approval_type TEXT NOT NULL CHECK (approval_type IN ('repair','maintenance','owner_stay','reserve_use','policy')),
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2),
  urgency TEXT NOT NULL CHECK (urgency IN ('urgent','normal','low')),
  status TEXT NOT NULL CHECK (status IN (
    'awaiting_owner_decision',
    'owner_question_pending_pm_response',
    'pm_responded_awaiting_owner_decision',
    'approved',
    'declined',
    'expired'
  )),
  pm_recommendation TEXT,
  owner_question TEXT,
  pm_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ
);

-- 12. Flags & Disputes
CREATE TABLE IF NOT EXISTS flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('no_show','late_arrival','quality_issue','compliance_issue','dispute_loss')),
  severity TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  source_type TEXT NOT NULL CHECK (source_type IN ('pm','system','admin')),
  source_user_id UUID REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('open','under_review','resolved','dismissed','escalated')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_code TEXT UNIQUE NOT NULL,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  opened_by_type TEXT NOT NULL CHECK (opened_by_type IN ('pm','vendor')),
  opened_by_user_id UUID NOT NULL REFERENCES users(id),
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('payment','scope','access','quality')),
  status TEXT NOT NULL CHECK (status IN ('open','waiting_on_pm','waiting_on_vendor','ready_for_decision','resolved','closed')),
  pm_position TEXT,
  vendor_position TEXT,
  decision_result TEXT CHECK (decision_result IN ('support_pm','support_vendor')),
  decision_note TEXT,
  decided_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- 13. Notifications & Audit Engine (Mandatory append-only log)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('in_app','email','sms','push')),
  category TEXT NOT NULL CHECK (category IN ('approval','incident','financial','compliance','system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  delivery_status TEXT NOT NULL CHECK (delivery_status IN ('pending','sent','failed','read')),
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_code TEXT UNIQUE NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('admin','pm','vendor','owner','system')),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  category TEXT NOT NULL,
  event_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  session_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_category ON audit_events(category);
CREATE INDEX IF NOT EXISTS idx_audit_events_target ON audit_events(target_type, target_id);

-- Migration for missing property columns (idempotent)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS beds INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS baths NUMERIC(3,1) DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS sqft INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities JSONB;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS media JSONB;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS manager_name TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS compliance_template TEXT;

-- 11. SLAs
CREATE TABLE IF NOT EXISTS sla_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  severity TEXT NOT NULL,
  acknowledge_mins INTEGER NOT NULL,
  arrival_mins INTEGER NOT NULL,
  completion_mins INTEGER NOT NULL,
  verification_mins INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_sla_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  sla_template_id UUID NOT NULL REFERENCES sla_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(property_id)
);

CREATE TABLE IF NOT EXISTS job_sla_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  sla_template_id UUID REFERENCES sla_templates(id),
  acknowledge_target TIMESTAMPTZ,
  arrival_target TIMESTAMPTZ,
  completion_target TIMESTAMPTZ,
  verification_target TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id)
);

-- Property Compliance Engine
CREATE TABLE IF NOT EXISTS property_compliance_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  compliance_type TEXT NOT NULL CHECK (compliance_type IN ('Inspection', 'License', 'Insurance', 'Certificate', 'HOA')),
  status TEXT NOT NULL CHECK (status IN ('missing', 'action', 'scheduled', 'review', 'compliant')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  due_date DATE,
  renewal_cycle TEXT NOT NULL CHECK (renewal_cycle IN ('Annual', 'Semi-annual', 'Quarterly', 'Monthly', 'None')),
  jurisdiction TEXT,
  blocks_rentals BOOLEAN NOT NULL DEFAULT false,
  requires_inspection BOOLEAN NOT NULL DEFAULT false,
  assigned_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_compliance_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  compliance_item_id UUID NOT NULL REFERENCES property_compliance_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
