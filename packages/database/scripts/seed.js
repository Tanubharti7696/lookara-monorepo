// packages/database/scripts/seed.js
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/lookara';

const isCloudDb =
  process.env.DATABASE_SSL === 'true' ||
  (!connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')) ||
  connectionString.includes('sslmode=require') ||
  connectionString.includes('neon.tech') ||
  connectionString.includes('supabase');

function buildSslConfig() {
  if (!isCloudDb) return undefined;
  return {
    rejectUnauthorized: true,
    ...(process.env.DATABASE_SSL_CA ? { ca: process.env.DATABASE_SSL_CA } : {}),
  };
}

async function seed() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    console.error('[Seed] FATAL: Seed script containing demo passwords is strictly prohibited in production.');
    process.exit(1);
  }

  console.log('[Seed] Connecting to PostgreSQL at', connectionString.replace(/:[^:@]+@/, ':****@'));
  const client = new Client({
    connectionString,
    ssl: buildSslConfig(),
  });
  await client.connect();

  try {
    console.log('[Seed] Seeding core platform data...');
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Organizations
    const orgBlueWaveRes = await client.query(`
      INSERT INTO organizations (name, slug, status, city, state, country)
      VALUES ('Blue Wave Hospitality', 'blue-wave-hospitality', 'active', 'Miami', 'FL', 'US')
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `);
    const orgBlueWaveId = orgBlueWaveRes.rows[0].id;

    const orgCoastalRes = await client.query(`
      INSERT INTO organizations (name, slug, status, city, state, country)
      VALUES ('Coastal STR Management', 'coastal-str', 'active', 'Orlando', 'FL', 'US')
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `);
    const orgCoastalId = orgCoastalRes.rows[0].id;

    console.log('[Seed] Organizations created/verified.');

    // 2. Users
    // PM Admin
    const pmUserRes = await client.query(`
      INSERT INTO users (full_name, email, password_hash, phone, account_status)
      VALUES ('Carlos Mendez', 'pm@lookara.com', $1, '+1 (305) 555-0101', 'active')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id;
    `, [passwordHash]);
    const pmUserId = pmUserRes.rows[0].id;

    // Ops Manager
    const opsUserRes = await client.query(`
      INSERT INTO users (full_name, email, password_hash, phone, account_status)
      VALUES ('Jordan Clarke', 'ops@lookara.com', $1, '+1 (407) 555-0102', 'active')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id;
    `, [passwordHash]);
    const opsUserId = opsUserRes.rows[0].id;

    // Vendor User
    const vendorUserRes = await client.query(`
      INSERT INTO users (full_name, email, password_hash, phone, account_status)
      VALUES ('Dave Mitchell', 'vendor@lookara.com', $1, '+1 (813) 555-0103', 'active')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id;
    `, [passwordHash]);
    const vendorUserId = vendorUserRes.rows[0].id;

    // Owner User
    const ownerUserRes = await client.query(`
      INSERT INTO users (full_name, email, password_hash, phone, account_status)
      VALUES ('Marcus Sterling', 'owner@lookara.com', $1, '+1 (407) 555-0192', 'active')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id;
    `, [passwordHash]);
    const ownerUserId = ownerUserRes.rows[0].id;

    // Platform Super Admin
    const adminUserRes = await client.query(`
      INSERT INTO users (full_name, email, password_hash, phone, account_status)
      VALUES ('Elena Vance', 'admin@lookara.com', $1, '+1 (800) 555-0100', 'active')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id;
    `, [passwordHash]);
    const adminUserId = adminUserRes.rows[0].id;

    console.log('[Seed] Users seeded successfully.');

    // 3. Organization Memberships
    await client.query(`
      INSERT INTO organization_users (organization_id, user_id, role, status)
      VALUES ($1, $2, 'admin', 'active')
      ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role;
    `, [orgBlueWaveId, pmUserId]);

    await client.query(`
      INSERT INTO organization_users (organization_id, user_id, role, status)
      VALUES ($1, $2, 'ops_manager', 'active')
      ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role;
    `, [orgCoastalId, opsUserId]);

    // 4. Platform Admin Access
    await client.query(`
      INSERT INTO platform_admin_access (user_id, admin_role, status)
      VALUES ($1, 'super_admin', 'active')
      ON CONFLICT (user_id) DO UPDATE SET admin_role = EXCLUDED.admin_role;
    `, [adminUserId]);

    // 5. Owners Table
    const ownerEntryRes = await client.query(`
      INSERT INTO owners (user_id, status)
      VALUES ($1, 'active')
      ON CONFLICT (user_id) DO UPDATE SET status = 'active'
      RETURNING id;
    `, [ownerUserId]);
    const ownerId = ownerEntryRes.rows[0].id;

    // 6. Properties
    const prop1Res = await client.query(`
      INSERT INTO properties (organization_id, name, code, address_line_1, city, state, postal_code, timezone, status)
      VALUES ($1, 'Seaside Villa', 'SV-01', '104 Pelican Walk', 'Clearwater Beach', 'FL', '33767', 'America/New_York', 'active')
      RETURNING id;
    `, [orgBlueWaveId]);
    const prop1Id = prop1Res.rows[0].id;

    const prop2Res = await client.query(`
      INSERT INTO properties (organization_id, name, code, address_line_1, city, state, postal_code, timezone, status)
      VALUES ($1, 'Lake Nona Villa', 'LN-02', '8204 Tavistock Lakes Blvd', 'Orlando', 'FL', '32827', 'America/New_York', 'active')
      RETURNING id;
    `, [orgBlueWaveId]);
    const prop2Id = prop2Res.rows[0].id;

    const prop3Res = await client.query(`
      INSERT INTO properties (organization_id, name, code, address_line_1, city, state, postal_code, timezone, status)
      VALUES ($1, 'Palm Grove Retreat', 'PG-03', '412 Royal Palm Way', 'Naples', 'FL', '34102', 'America/New_York', 'active')
      RETURNING id;
    `, [orgCoastalId]);
    const prop3Id = prop3Res.rows[0].id;

    console.log('[Seed] Properties created.');

    // 7. Property Owners link
    await client.query(`
      INSERT INTO property_owners (property_id, owner_id, relationship_status)
      VALUES ($1, $2, 'active'), ($3, $2, 'active')
      ON CONFLICT (property_id, owner_id) DO NOTHING;
    `, [prop1Id, ownerId, prop2Id]);

    // 8. Vendors
    const vendorRes = await client.query(`
      INSERT INTO vendors (user_id, business_name, display_name, vendor_type, primary_trade, city, state, lifecycle_status, emergency_enabled)
      VALUES ($1, 'Apex Pro Maintenance', 'Apex Maintenance', 'company', 'plumbing', 'Tampa', 'FL', 'active', true)
      RETURNING id;
    `, [vendorUserId]);
    const vendorId = vendorRes.rows[0].id;

    await client.query(`
      INSERT INTO organization_vendors (organization_id, vendor_id, relationship_status)
      VALUES ($1, $2, 'preferred'), ($3, $2, 'neutral')
      ON CONFLICT (organization_id, vendor_id) DO NOTHING;
    `, [orgBlueWaveId, vendorId, orgCoastalId]);

    // 9. Sample Tasks / Jobs
    const job1Res = await client.query(`
      INSERT INTO jobs (job_code, organization_id, property_id, created_by_user_id, trade_code, workflow_class, title, description, severity, source, service_type, payout_amount, status)
      VALUES ('JOB-101', $1, $2, $3, 'PLUMB', 'emergency', 'Emergency Leak Repair', 'Ceiling leak in master bathroom, urgent pipe repair needed.', 'critical', 'pm_portal', 'repair', 680.00, 'in_progress')
      ON CONFLICT (job_code) DO NOTHING
      RETURNING id;
    `, [orgBlueWaveId, prop1Id, pmUserId]);

    const job2Res = await client.query(`
      INSERT INTO jobs (job_code, organization_id, property_id, created_by_user_id, trade_code, workflow_class, title, description, severity, source, service_type, payout_amount, status)
      VALUES ('JOB-102', $1, $2, $3, 'HVAC', 'maintenance', 'HVAC Seasonal Service', 'Preventive inspection before peak summer season.', 'medium', 'pm_portal', 'maintenance', 340.00, 'accepted')
      ON CONFLICT (job_code) DO NOTHING
      RETURNING id;
    `, [orgBlueWaveId, prop2Id, pmUserId]);

    console.log('[Seed] Jobs seeded.');

    // 10. Sample Incidents & Approvals
    if (job1Res.rows.length > 0) {
      const jobId = job1Res.rows[0].id;
      const incRes = await client.query(`
        INSERT INTO incidents (incident_code, organization_id, property_id, related_job_id, title, incident_type, severity, status, summary, estimated_cost_min, estimated_cost_max, owner_action_required)
        VALUES ('INC-201', $1, $2, $3, 'Bathroom Ceiling Water Leak', 'emergency', 'critical', 'in_progress', 'Leak reported above bathroom vanity. PM dispatched vendor.', 500.00, 800.00, true)
        ON CONFLICT (incident_code) DO NOTHING
        RETURNING id;
      `, [orgBlueWaveId, prop1Id, jobId]);

      if (incRes.rows.length > 0) {
        const incidentId = incRes.rows[0].id;
        await client.query(`
          INSERT INTO approvals (approval_code, organization_id, property_id, owner_id, related_job_id, related_incident_id, approval_type, title, description, amount, urgency, status, pm_recommendation)
          VALUES ('APR-301', $1, $2, $3, $4, $5, 'repair', 'Approval required — Leak Repair $680', 'PM is requesting approval for emergency leak repair. Vendor on standby — act within 12h.', 680.00, 'urgent', 'awaiting_owner_decision', 'Vendor is on standby and parts are in stock. Recommend immediate approval.')
          ON CONFLICT (approval_code) DO NOTHING;
        `, [orgBlueWaveId, prop1Id, ownerId, jobId, incidentId]);
      }
    }

    // 11. Mobile App Evaluation Golden Fixtures (Task 9903, Incident 7771, Disputed Invoice, Quote Approval)
    const verTaskId = '99999999-9999-9999-9999-999999999903';
    await client.query(`
      INSERT INTO jobs (id, job_code, organization_id, property_id, created_by_user_id, trade_code, workflow_class, title, description, severity, source, service_type, status)
      VALUES ($1, 'JOB-VER-03', $2, $3, $4, 'HVAC', 'maintenance', 'Filter & Coil Clean Unit 203', 'Verification awaiting review', 'medium', 'pm_portal', 'routine', 'verification_pending')
      ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        property_id = EXCLUDED.property_id,
        status = 'verification_pending';
    `, [verTaskId, orgBlueWaveId, prop1Id, pmUserId]);

    // Link Vendor Apex Maintenance to Task 9903
    await client.query(`
      INSERT INTO job_assignments (job_id, vendor_id, assignment_type, assigned_at, accepted_at)
      SELECT $1, $2, 'manual', now() - interval '2 hours', now() - interval '90 minutes'
      WHERE NOT EXISTS (SELECT 1 FROM job_assignments WHERE job_id = $1 AND vendor_id = $2);
    `, [verTaskId, vendorId]);

    // Ensure SLA snapshot for Task 9903
    await client.query(`
      INSERT INTO job_sla_snapshots (job_id, acknowledge_target, arrival_target, completion_target, verification_target, escalation_target, resolved_tier)
      VALUES ($1, now() - interval '3 hours', now() - interval '2 hours', now() + interval '4 hours', now() + interval '6 hours', now() + interval '2 hours', 'organization')
      ON CONFLICT (job_id) DO NOTHING;
    `, [verTaskId]);

    // Ensure sample evidence for Task 9903
    await client.query(`
      INSERT INTO job_evidence (job_id, uploaded_by_user_id, evidence_type, file_url, notes)
      SELECT $1, $2, 'after_photo', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800', 'Filter replaced and evaporator coils cleaned.'
      WHERE NOT EXISTS (SELECT 1 FROM job_evidence WHERE job_id = $1);
    `, [verTaskId, vendorUserId]);

    // Golden Incident 77777777-7777-7777-7777-777777777771
    const goldenIncId = '77777777-7777-7777-7777-777777777771';
    await client.query(`
      INSERT INTO incidents (id, incident_code, organization_id, property_id, title, incident_type, severity, status, summary, estimated_cost_min, estimated_cost_max, owner_action_required)
      VALUES ($1, 'INC-2026-7771', $2, $3, 'Main Line Backflow & Pressure Failure', 'emergency', 'critical', 'in_progress', 'Catastrophic backflow pressure drop in main mechanical room. Immediate shutoff valve access required.', 450.00, 1200.00, false)
      ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        property_id = EXCLUDED.property_id,
        status = 'in_progress';
    `, [goldenIncId, orgBlueWaveId, prop1Id]);

    // Golden Disputed Invoice 34f01749-625e-4cfd-b309-b13f0f613b66
    await client.query(`
      INSERT INTO invoices (id, organization_id, amount, currency, status, due_date, pdf_url)
      VALUES ('34f01749-625e-4cfd-b309-b13f0f613b66', $1, 450.00, 'USD', 'disputed', now() + interval '7 days', 'INV-DISPUTE-101')
      ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        status = 'disputed';
    `, [orgBlueWaveId]);

    // Golden Quote Approval 0b91ec16-a3e0-4a39-8208-25b964102188
    await client.query(`
      INSERT INTO approvals (id, approval_code, organization_id, property_id, owner_id, approval_type, title, description, amount, urgency, status, pm_recommendation)
      VALUES ('0b91ec16-a3e0-4a39-8208-25b964102188', 'APP-101', $1, $2, $3, 'repair', 'Roof Shingle Replacement Quote', 'Estimate from Apex Roofing', 1850.00, 'urgent', 'awaiting_owner_decision', 'Approve quote before storm season.')
      ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        property_id = EXCLUDED.property_id,
        status = 'awaiting_owner_decision';
    `, [orgBlueWaveId, prop1Id, ownerId]);

    // Golden Quote Review Task so GET /tasks?status=quote_review or awaiting_owner_decision returns non-empty
    await client.query(`
      INSERT INTO jobs (id, job_code, organization_id, property_id, created_by_user_id, trade_code, workflow_class, title, description, severity, source, service_type, payout_amount, quote_required, status)
      VALUES ('99999999-9999-9999-9999-999999999904', 'JOB-QUOTE-04', $1, $2, $3, 'ROOF', 'maintenance', 'Roof Shingle Replacement Quote Review', 'Vendor submitted $1,850 quote for storm shingle replacement', 'high', 'pm_portal', 'repair', 1850.00, true, 'unassigned')
      ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        property_id = EXCLUDED.property_id,
        quote_required = true;
    `, [orgBlueWaveId, prop1Id, pmUserId]);

    // 12. Initial Audit Log Entry
    await client.query(`
      INSERT INTO audit_events (event_code, actor_type, actor_user_id, organization_id, target_type, target_id, category, event_type, summary)
      VALUES ('AUDIT-001', 'system', $1, $2, 'organization', $2, 'system', 'system.bootstrap', 'Platform database successfully seeded for Milestone 1.')
      ON CONFLICT (event_code) DO NOTHING;
    `, [pmUserId, orgBlueWaveId]);

    console.log('[Seed] Seeding completed successfully!');
    console.log('--- CREDENTIALS (Password: password123) ---');
    console.log('PM Admin:      pm@lookara.com');
    console.log('Ops Manager:   ops@lookara.com');
    console.log('Vendor:        vendor@lookara.com');
    console.log('Owner:         owner@lookara.com');
    console.log('Super Admin:   admin@lookara.com');
  } catch (err) {
    console.error('[Seed] Seeding error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
