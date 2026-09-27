// apps/backend/src/properties/properties.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';

export interface CreatePropertyDto {
  organizationId?: string;
  name: string;
  code?: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  type?: string;
  amenities?: any[];
  media?: any[];
  owner?: string;
  ownerEmail?: string;
  manager?: string;
  template?: string;
  unit?: string;
}

@Injectable()
export class PropertiesService {
  async findAll(user: JwtPayload, options: {
    organizationId?: string;
    status?: string;
    city?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, options.pageSize || 25);
    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    // Scope by User Role
    if (user.isOwner && !user.isAdmin && !user.activeOrganizationId) {
      // Owner only sees their assigned properties
      conditions.push(`p.id IN (
        SELECT po.property_id FROM property_owners po
        JOIN owners o ON po.owner_id = o.id
        WHERE o.user_id = $${idx++} AND po.relationship_status = 'active'
      )`);
      values.push(user.sub);
    } else if (user.activeOrganizationId) {
      // PM Staff sees their active organization's properties
      conditions.push(`p.organization_id = $${idx++}`);
      values.push(user.activeOrganizationId);
    } else if (options.organizationId && user.isAdmin) {
      conditions.push(`p.organization_id = $${idx++}`);
      values.push(options.organizationId);
    }

    if (options.status) {
      conditions.push(`p.status = $${idx++}`);
      values.push(options.status);
    }
    if (options.city) {
      conditions.push(`p.city ILIKE $${idx++}`);
      values.push(options.city);
    }
    if (options.search) {
      conditions.push(`(p.name ILIKE $${idx} OR p.address_line_1 ILIKE $${idx} OR p.code ILIKE $${idx})`);
      values.push(`%${options.search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT count(*) as total FROM properties p ${where}`, values);
    const total = parseInt(countRes.rows[0].total, 10);

    values.push(pageSize, offset);
    const sql = `
      SELECT p.*, o.name AS organization_name,
        (SELECT count(*) FROM jobs j WHERE j.property_id = p.id AND j.status IN ('pending_dispatch', 'assigned', 'accepted', 'in_progress')) as active_jobs_count,
        (SELECT count(*) FROM incidents inc WHERE inc.property_id = p.id AND inc.status IN ('open', 'in_progress')) as active_incidents_count
      FROM properties p
      JOIN organizations o ON p.organization_id = o.id
      ${where}
      ORDER BY p.name ASC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    const res = await query(sql, values);

    return {
      data: res.rows,
      meta: { page, pageSize, total },
    };
  }

  async findOne(id: string, user: JwtPayload) {
    const res = await query(
      `SELECT p.*, o.name as organization_name
       FROM properties p
       JOIN organizations o ON p.organization_id = o.id
       WHERE p.id = $1`,
      [id],
    );

    if (res.rows.length === 0) throw new NotFoundException('Property not found');
    const property = res.rows[0];

    // Enforce owner / organization isolation
    if (user.isOwner && !user.isAdmin && !user.activeOrganizationId) {
      const ownerCheck = await query(
        `SELECT 1 FROM property_owners po
         JOIN owners o ON po.owner_id = o.id
         WHERE po.property_id = $1 AND o.user_id = $2`,
        [id, user.sub],
      );
      if (ownerCheck.rows.length === 0) {
        throw new ForbiddenException('You do not have access to this property');
      }
    } else if (user.activeOrganizationId && property.organization_id !== user.activeOrganizationId && !user.isAdmin) {
      throw new ForbiddenException('Property does not belong to your active organization');
    }

    // Load owners
    const ownersRes = await query(
      `SELECT u.id as user_id, u.full_name, u.email, u.phone
       FROM property_owners po
       JOIN owners o ON po.owner_id = o.id
       JOIN users u ON o.user_id = u.id
       WHERE po.property_id = $1 AND po.relationship_status = 'active'`,
      [id],
    );

    return {
      ...property,
      owners: ownersRes.rows,
    };
  }

  async create(user: JwtPayload, dto: CreatePropertyDto) {
    const organizationId = dto.organizationId || user.activeOrganizationId;
    if (!organizationId) {
      throw new ForbiddenException('Organization context required to create property');
    }

    const sql = `
      INSERT INTO properties (
        organization_id, name, code, address_line_1, address_line_2,
        city, state, postal_code, timezone, latitude, longitude, status,
        beds, baths, sqft, property_type, amenities, media,
        owner_name, owner_email, manager_name, compliance_template
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *;
    `;
    const res = await query(sql, [
      organizationId,
      dto.name,
      dto.unit || null,
      dto.addressLine1 || null,
      dto.addressLine2 || null,
      dto.city,
      dto.state,
      dto.postalCode || null,
      dto.timezone || 'America/New_York',
      dto.latitude || null,
      dto.longitude || null,
      dto.beds || 0,
      dto.baths || 0,
      dto.sqft || 0,
      dto.type || 'STR',
      JSON.stringify(dto.amenities || []),
      JSON.stringify(dto.media || []),
      dto.owner || null,
      dto.ownerEmail || null,
      dto.manager || null,
      dto.template || null
    ]);

    return res.rows[0];
  }

  async update(id: string, user: JwtPayload, dto: any) {
    // Only PMs in the same org can update
    const propCheck = await query(`SELECT organization_id FROM properties WHERE id = $1`, [id]);
    if (!propCheck.rows.length) throw new NotFoundException('Property not found');
    if (propCheck.rows[0].organization_id !== user.activeOrganizationId && !user.isAdmin) {
      throw new ForbiddenException('Not authorized to update this property');
    }

    const sql = `
      UPDATE properties SET
        name = COALESCE($1, name),
        code = COALESCE($2, code),
        address_line_1 = COALESCE($3, address_line_1),
        city = COALESCE($4, city),
        state = COALESCE($5, state),
        postal_code = COALESCE($6, postal_code),
        status = COALESCE($7, status),
        beds = COALESCE($8, beds),
        baths = COALESCE($9, baths),
        sqft = COALESCE($10, sqft),
        property_type = COALESCE($11, property_type),
        owner_name = COALESCE($12, owner_name),
        owner_email = COALESCE($13, owner_email),
        manager_name = COALESCE($14, manager_name),
        compliance_template = COALESCE($15, compliance_template),
        media = COALESCE($16, media)
      WHERE id = $17
      RETURNING *;
    `;
    const res = await query(sql, [
      dto.name,
      dto.unit,
      dto.address,
      dto.city,
      dto.state,
      dto.zip,
      dto.status,
      dto.beds,
      dto.baths,
      dto.sqft,
      dto.type,
      dto.owner,
      dto.ownerEmail,
      dto.manager,
      dto.template,
      dto.media ? JSON.stringify(dto.media) : null,
      id
    ]);
    return res.rows[0];
  }

  async remove(id: string, user: JwtPayload) {
    const propCheck = await query(`SELECT organization_id FROM properties WHERE id = $1`, [id]);
    if (!propCheck.rows.length) throw new NotFoundException('Property not found');
    if (propCheck.rows[0].organization_id !== user.activeOrganizationId && !user.isAdmin) {
      throw new ForbiddenException('Not authorized to delete this property');
    }
    
    await query(`DELETE FROM properties WHERE id = $1`, [id]);
    return { success: true };
  }
}
