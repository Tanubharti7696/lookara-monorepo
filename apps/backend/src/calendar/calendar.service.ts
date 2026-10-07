import { Injectable } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';

@Injectable()
export class CalendarService {
  async getLanes(user: JwtPayload, startDate: string, endDate: string) {
    const orgId = user.activeOrganizationId;
    if (!orgId) return [];

    // Get all active properties for the org
    const propsRes = await query(
      `SELECT id, name FROM properties WHERE organization_id = $1 AND status = 'active' ORDER BY name`,
      [orgId]
    );
    const properties = propsRes.rows;

    // Get bookings overlapping the date range
    const bookingsRes = await query(
      `SELECT * FROM bookings 
       WHERE organization_id = $1 
         AND start_date <= $3 
         AND end_date >= $2
       ORDER BY start_date ASC`,
      [orgId, startDate, endDate],
    );
    const bookings = bookingsRes.rows;

    const start = new Date(startDate);
    
    // Construct lanes
    return properties.map(prop => {
      const propBookings = bookings.filter(b => b.property_id === prop.id);
      const days = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const dayStr = d.toISOString().split('T')[0];

        const booking = propBookings.find(b => {
          const bStart = new Date(b.start_date).toISOString().split('T')[0];
          const bEnd = new Date(b.end_date).toISOString().split('T')[0];
          return dayStr >= bStart && dayStr <= bEnd;
        });

        if (booking) {
          if (booking.type === 'owner_stay') {
             days.push({ state: booking.status === 'pending' ? 'owner-pending' : 'owner', chip: 'Owner Stay' });
          } else if (booking.type === 'block') {
             days.push({ state: 'vacant', chip: 'Blocked' });
          } else {
             days.push({ state: 'occupied', chip: 'Stay Block' });
          }
        } else {
          days.push({ state: 'vacant' });
        }
      }

      return {
        id: prop.id,
        name: prop.name,
        badge: { label: 'Ready', tone: 'ready' },
        days
      };
    });
  }

  async getBookings(user: JwtPayload, startDate: string, endDate: string) {
    const orgId = user.activeOrganizationId;
    if (!orgId) return [];

    const res = await query(
      `SELECT * FROM bookings 
       WHERE organization_id = $1 
         AND start_date <= $3 
         AND end_date >= $2
       ORDER BY start_date ASC`,
      [orgId, startDate, endDate],
    );

    return res.rows;
  }
}
