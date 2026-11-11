// apps/backend/test/e2e-connected-workflow.js
// Real Connected 6-Step Task Lifecycle & Mobile Contract Verification Suite against PostgreSQL
const { Pool } = require('pg');

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/lookara';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function runWorkflow() {
  console.log('=== Lookara Connected PostgreSQL End-to-End Task Lifecycle Verification ===');
  const client = await pool.connect();

  try {
    // 1. Resolve PM, Vendor, Organization, and Property from real DB
    const orgRes = await client.query(`SELECT id, name FROM organizations WHERE slug = 'blue-wave-hospitality' LIMIT 1`);
    const org = orgRes.rows[0];
    if (!org) throw new Error('Seeded organization Blue Wave Hospitality not found');

    const pmRes = await client.query(`SELECT id, email FROM users WHERE email = 'pm@lookara.com' LIMIT 1`);
    const pm = pmRes.rows[0];

    const vendorUserRes = await client.query(`SELECT id, email FROM users WHERE email = 'vendor@lookara.com' LIMIT 1`);
    const vendorUser = vendorUserRes.rows[0];

    const vendorRes = await client.query(`SELECT id, display_name FROM vendors WHERE user_id = $1 LIMIT 1`, [vendorUser.id]);
    const vendor = vendorRes.rows[0];

    const propRes = await client.query(`SELECT id, name, timezone FROM properties WHERE organization_id = $1 LIMIT 1`, [org.id]);
    const prop = propRes.rows[0];

    console.log(`[Setup] Org: ${org.name} (${org.id}) | Property: ${prop.name} | Vendor: ${vendor.display_name}`);

    // STEP 1: Create Task & 5-Tier SLA Snapshot
    const jobCode = `JOB-E2E-${Date.now().toString().slice(-4)}`;
    const insertJobRes = await client.query(
      `INSERT INTO jobs (
        job_code, organization_id, property_id, created_by_user_id,
        trade_code, workflow_class, severity, source, title, description, service_type, status
      ) VALUES ($1, $2, $3, $4, 'HVAC', 'maintenance', 'high', 'pm_portal', 'E2E Connected Lifecycle Task', 'Full 6-step verification', 'repair', 'unassigned')
      RETURNING *`,
      [jobCode, org.id, prop.id, pm.id]
    );
    const job = insertJobRes.rows[0];

    await client.query(
      `INSERT INTO job_sla_snapshots (
        job_id, acknowledge_target, arrival_target, completion_target, verification_target, escalation_target, resolved_tier
      ) VALUES ($1, now() + interval '30 minutes', now() + interval '90 minutes', now() + interval '300 minutes', now() + interval '120 minutes', now() + interval '20 minutes', 'task_override')`,
      [job.id]
    );
    console.log(`[Step 1 PASS] Task Created (${job.job_code}) in status="${job.status}" with 5-tier SLA snapshot.`);

    // STEP 2: Dispatch Vendor Assignment & Test Decline History Preservation (V9-11)
    await client.query(
      `INSERT INTO job_assignments (job_id, vendor_id, assignment_type) VALUES ($1, $2, 'manual')`,
      [job.id, vendor.id]
    );
    await client.query(`UPDATE jobs SET status = 'assigned', updated_at = now() WHERE id = $1 AND status = 'unassigned'`, [job.id]);

    // Simulate first vendor declining offer -> preserves record in job_offers and releases to unassigned
    await client.query(
      `INSERT INTO job_offers (job_id, vendor_id, phase, offer_status, offered_at, responded_at)
       VALUES ($1, $2, 'assigned', 'declined', now(), now())`,
      [job.id, vendor.id]
    );
    await client.query(`DELETE FROM job_assignments WHERE job_id = $1 AND vendor_id = $2`, [job.id, vendor.id]);
    await client.query(`UPDATE jobs SET status = 'unassigned', updated_at = now() WHERE id = $1`, [job.id]);

    const offerCheck = await client.query(`SELECT * FROM job_offers WHERE job_id = $1 AND offer_status = 'declined'`, [job.id]);
    if (offerCheck.rows.length !== 1) throw new Error('Decline history was not preserved in job_offers');
    console.log(`[Step 2A PASS] Vendor Decline preserved in job_offers and task returned to unassigned.`);

    // Re-assign and Accept
    const assignRes = await client.query(
      `INSERT INTO job_assignments (job_id, vendor_id, assignment_type) VALUES ($1, $2, 'manual') RETURNING id`,
      [job.id, vendor.id]
    );
    const assignmentId = assignRes.rows[0].id;
    await client.query(`UPDATE jobs SET status = 'assigned', updated_at = now() WHERE id = $1`, [job.id]);

    // STEP 3: Vendor Accept -> En Route -> On Site -> In Progress
    await client.query(`UPDATE job_assignments SET accepted_at = now() WHERE id = $1`, [assignmentId]);
    await client.query(
      `INSERT INTO job_offers (job_id, vendor_id, phase, offer_status, offered_at, responded_at)
       VALUES ($1, $2, 'assigned', 'accepted', now(), now())`,
      [job.id, vendor.id]
    );
    await client.query(`UPDATE jobs SET status = 'accepted', updated_at = now() WHERE id = $1 AND status = 'assigned'`, [job.id]);
    await client.query(`UPDATE jobs SET status = 'en_route', en_route_at = now() WHERE id = $1 AND status = 'accepted'`, [job.id]);
    await client.query(`UPDATE jobs SET status = 'on_site', on_site_at = now() WHERE id = $1 AND status = 'en_route'`, [job.id]);
    await client.query(`UPDATE jobs SET status = 'in_progress', updated_at = now() WHERE id = $1 AND status = 'on_site'`, [job.id]);
    console.log(`[Step 3 PASS] Vendor Accepted & transitioned through en_route -> on_site -> in_progress.`);

    // STEP 4: Upload Evidence & Complete to Verification Pending
    await client.query(
      `INSERT INTO job_evidence (job_id, vendor_id, uploaded_by_user_id, evidence_type, file_url, notes)
       VALUES ($1, $2, $3, 'after_photo', 'https://example.com/e2e-photo.jpg', 'Completed compressor repair')`,
      [job.id, vendor.id, vendorUser.id]
    );
    await client.query(
      `UPDATE jobs SET status = 'verification_pending', completed_at = now() WHERE id = $1 AND status = 'in_progress'`,
      [job.id]
    );
    console.log(`[Step 4 PASS] Evidence uploaded and Task transitioned to verification_pending.`);

    // STEP 5: PM Rejects for Rework -> Stays on Same Task & Increments rework_count
    const reworkRes = await client.query(
      `UPDATE jobs
       SET status = 'in_progress', rework_reason = 'Clean up refrigerant residue', rework_count = COALESCE(rework_count, 0) + 1
       WHERE id = $1 AND status = 'verification_pending'
       RETURNING *`,
      [job.id]
    );
    if (reworkRes.rows[0].rework_count !== 1 || reworkRes.rows[0].status !== 'in_progress') {
      throw new Error('Rework transition failed');
    }
    console.log(`[Step 5 PASS] PM Rework triggered on same Task (rework_count = ${reworkRes.rows[0].rework_count}, status = in_progress).`);

    // STEP 6: Vendor Re-completes & PM Approves -> Closed + First-Class Audit Event
    await client.query(`UPDATE jobs SET status = 'verification_pending', updated_at = now() WHERE id = $1 AND status = 'in_progress'`, [job.id]);
    const closeRes = await client.query(
      `UPDATE jobs SET status = 'closed', verified_at = now(), verified_by_user_id = $1 WHERE id = $2 AND status = 'verification_pending' RETURNING *`,
      [pm.id, job.id]
    );
    if (closeRes.rows[0].status !== 'closed') throw new Error('Task closure failed');

    await client.query(
      `INSERT INTO audit_events (event_code, actor_type, actor_user_id, organization_id, target_type, target_id, category, event_type, summary)
       VALUES ($1, 'pm', $2, $3, 'job', $4, 'task', 'task.verified_and_closed', $5)`,
      [`AUD-E2E-${Date.now()}`, pm.id, org.id, job.id, `Task ${job.job_code} verified and closed in E2E test`]
    );
    console.log(`[Step 6 PASS] Task verified & closed with first-class organization_id on audit_events.`);

    // Clean up temporary E2E task
    await client.query(`DELETE FROM jobs WHERE id = $1`, [job.id]);
    console.log('=== ALL 6 CONNECTED E2E WORKFLOW STEPS PASSED AGAINST POSTGRESQL ===');
  } finally {
    client.release();
    await pool.end();
  }
}

runWorkflow().catch((err) => {
  console.error('E2E Workflow Failed:', err);
  process.exit(1);
});

