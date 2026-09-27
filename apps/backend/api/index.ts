import { Client } from 'pg';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-organization-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.url.startsWith('/api/v1/properties/debug')) {
    return res.status(200).json({
      hasDb: !!process.env.DATABASE_URL,
      dbVal: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + '...' : null,
    });
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();

    if (req.url.startsWith('/api/v1/properties')) {
      if (req.method === 'GET') {
        const result = await client.query(`
          SELECT p.*, o.name AS organization_name,
            (SELECT count(*) FROM jobs j WHERE j.property_id = p.id AND j.status IN ('pending_dispatch', 'assigned', 'accepted', 'in_progress')) as active_jobs_count
          FROM properties p
          LEFT JOIN organizations o ON p.organization_id = o.id
          ORDER BY p.name ASC
        `);
        return res.status(200).json({ data: result.rows, meta: { total: result.rows.length } });
      } else if (req.method === 'POST') {
        const body = req.body || {};
        const orgId = '0eeb2136-cea5-4f67-b53d-42ddac598353'; // mock
        const result = await client.query(`
          INSERT INTO properties (
            organization_id, name, code, address_line_1, city, state, postal_code, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING *
        `, [orgId, body.name, body.code || 'PRP-01', body.addressLine1, body.city, body.state, body.postalCode]);
        return res.status(201).json(result.rows[0]);
      }
    }

    if (req.url.startsWith('/api/v1/tasks')) {
      if (req.method === 'GET') {
        const result = await client.query(`
          SELECT j.*, p.name AS property_name, p.address_line_1, p.city, p.state
          FROM jobs j
          JOIN properties p ON j.property_id = p.id
          ORDER BY j.created_at DESC
        `);
        return res.status(200).json({ data: result.rows, meta: { total: result.rows.length } });
      } else if (req.method === 'POST') {
        const body = req.body || {};
        const orgId = '0eeb2136-cea5-4f67-b53d-42ddac598353'; // mock
        const jobCode = `JOB-${Date.now().toString().slice(-4)}`;
        const result = await client.query(`
          INSERT INTO jobs (
            job_code, organization_id, property_id, title, description, urgency, status, service_type, trade_code
          ) VALUES ($1, $2, $3, $4, $5, $6, 'pending_dispatch', 'repair', 'plumbing') RETURNING *
        `, [jobCode, orgId, body.propertyId, body.title, body.description, body.urgency || 'standard']);
        return res.status(201).json(result.rows[0]);
      } else if (req.method === 'PATCH') {
        const urlParts = req.url.split('?')[0].split('/');
        const id = urlParts[urlParts.length - 1];
        const body = req.body || {};
        const result = await client.query(`
          UPDATE jobs SET status = $1 WHERE id = $2 RETURNING *
        `, [body.status, id]);
        return res.status(200).json(result.rows[0]);
      }
    }

    if (req.url.startsWith('/api/v1/vendors')) {
      if (req.method === 'GET') {
        const result = await client.query(`
          SELECT * FROM vendors
          ORDER BY business_name ASC
        `);
        // Adding mocked data properties for UI compatibility
        const vendors = result.rows.map(v => ({
           id: v.id,
           name: v.display_name || v.business_name,
           trust: v.trust_score || Math.floor(Math.random() * 20 + 80),
           tier: v.trust_score > 90 ? 'Elite' : 'Solid',
           color: v.trust_score > 90 ? '#22C55E' : '#D4AF37',
           distanceMi: (Math.random() * 5).toFixed(1),
           avgResponseMin: Math.floor(Math.random() * 15 + 5)
        }));
        return res.status(200).json({ data: vendors, meta: { total: vendors.length } });
      }
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
}
