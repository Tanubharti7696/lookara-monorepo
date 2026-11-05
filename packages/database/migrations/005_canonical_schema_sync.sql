-- Migration 005: Reconcile and synchronize full canonical 38-table schema
-- Resolves DB-06: Ensures migration pipeline creates all canonical tables, indexes, and constraints

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

CREATE TABLE IF NOT EXISTS platform_admin_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_role TEXT NOT NULL DEFAULT 'super_admin',
  status TEXT NOT NULL CHECK (status IN ('active','disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 9. Compliance Engine

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

CREATE TABLE IF NOT EXISTS property_sla_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  sla_template_id UUID NOT NULL REFERENCES sla_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(property_id)
);

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

-- Calendar & Bookings (Phase 5)

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'guest_stay', -- guest_stay, owner_stay, block
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed', -- confirmed, pending, cancelled
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    guest_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bookings_org ON bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);

-- Compliance Templates (Phase 6)

CREATE TABLE IF NOT EXISTS compliance_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_compliance_templates_org ON compliance_templates(organization_id);

CREATE TABLE IF NOT EXISTS template_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES compliance_templates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    cycle VARCHAR(50) NOT NULL,
    due_month INT,
    due_day INT,
    is_inspection BOOLEAN DEFAULT false,
    ops_blocker BOOLEAN DEFAULT false,
    priority VARCHAR(50) DEFAULT 'medium',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_template_requirements_tmpl ON template_requirements(template_id);

-- Analytics & Reports (Phase 7)

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'operational', 'financial', 'compliance'
    parameters JSONB DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'ready',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reports_org ON reports(organization_id);

-- Billing & Financials (Phase 8)

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_tier VARCHAR(50) NOT NULL DEFAULT 'pro',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(organization_id);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(organization_id);

CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'card', 'bank_transfer'
    last_four VARCHAR(4),
    brand VARCHAR(50),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_payment_methods_org ON payment_methods(organization_id);

