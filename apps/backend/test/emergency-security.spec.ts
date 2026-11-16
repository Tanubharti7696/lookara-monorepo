import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IncidentsService } from '../src/incidents/incidents.service';
import { TasksService } from '../src/tasks/tasks.service';
import { DispatchService } from '../src/dispatch/dispatch.service';
import * as db from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';

vi.mock('@lookara/database', () => ({
  query: vi.fn(),
  getClient: vi.fn(),
}));

describe('Emergency & Incident Security (Milestone 1 v11 Findings #1, #2, #3)', () => {
  let incidentsService: IncidentsService;
  let auditServiceMock: any;
  let dispatchServiceMock: any;
  let tasksServiceMock: any;

  const activePmUser: JwtPayload = {
    sub: 'pm-active-1',
    email: 'pm.active@lookara.test',
    fullName: 'Active PM',
    activePortal: 'pm',
    activeOrganizationId: 'org-1-uuid',
    activeRole: 'ops_manager',
    isOwner: false,
    isVendor: false,
    isAdmin: false,
    allowedPortals: ['pm'],
  };

  const revokedPmUser: JwtPayload = {
    sub: 'pm-revoked-1',
    email: 'pm.revoked@lookara.test',
    fullName: 'Revoked PM',
    activePortal: 'pm',
    activeOrganizationId: 'org-1-uuid',
    activeRole: 'ops_manager',
    isOwner: false,
    isVendor: false,
    isAdmin: false,
    allowedPortals: ['pm'],
  };

  const viewerUser: JwtPayload = {
    sub: 'pm-viewer-1',
    email: 'viewer@lookara.test',
    fullName: 'Read Only Viewer',
    activePortal: 'pm',
    activeOrganizationId: 'org-1-uuid',
    activeRole: 'viewer',
    isOwner: false,
    isVendor: false,
    isAdmin: false,
    allowedPortals: ['pm'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.query).mockReset();
    auditServiceMock = { recordEvent: vi.fn().mockResolvedValue({ id: 'audit-1' }) };
    dispatchServiceMock = {
      assignVendor: vi.fn().mockResolvedValue({ status: 'assigned', vendorId: 'v-1' }),
      autoDispatch: vi.fn().mockResolvedValue({ status: 'dispatching' }),
    };
    tasksServiceMock = {
      create: vi.fn().mockResolvedValue({
        id: 'task-from-engine-1',
        job_code: 'JOB-ENG-1234',
        organization_id: 'org-1-uuid',
        property_id: 'prop-1-uuid',
        status: 'unassigned',
        severity: 'critical',
      }),
    };

    incidentsService = new IncidentsService(
      auditServiceMock,
      dispatchServiceMock as any,
      tasksServiceMock as any
    );
  });

  describe('Finding #1: Live membership & role checks in Emergency/Incident operations (P0)', () => {
    it('blocks revoked PM token from creating an incident', async () => {
      // Mock organization_users query returning empty (user revoked/disabled)
      vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);

      await expect(
        incidentsService.create(revokedPmUser, {
          propertyId: 'prop-1-uuid',
          title: 'Ceiling Collapse',
          description: 'Emergency ceiling collapse',
          severity: 'critical',
        })
      ).rejects.toThrow(/membership/i);
    });

    it('blocks read-only viewer PM from creating an incident', async () => {
      // Live membership exists but role is 'viewer'
      vi.mocked(db.query).mockResolvedValueOnce({
        rows: [{ role: 'viewer', status: 'active' }],
      } as any);

      await expect(
        incidentsService.create(viewerUser, {
          propertyId: 'prop-1-uuid',
          title: 'Ceiling Collapse',
          description: 'Emergency ceiling collapse',
          severity: 'critical',
        })
      ).rejects.toThrow(/viewer.*restricted to read-only/i);
    });

    it('blocks read-only viewer PM from escalating an incident', async () => {
      vi.mocked(db.query).mockResolvedValueOnce({
        rows: [{ role: 'viewer', status: 'active' }],
      } as any);

      await expect(
        incidentsService.escalateIncident('inc-1', viewerUser, { reason: 'Urgent' })
      ).rejects.toThrow(/viewer.*restricted to read-only/i);
    });

    it('blocks read-only viewer PM from toggling emergency mode', async () => {
      vi.mocked(db.query).mockResolvedValueOnce({
        rows: [{ role: 'viewer', status: 'active' }],
      } as any);

      await expect(
        incidentsService.updateEmergencyMode(viewerUser, { enabled: true, reason: 'Storm' })
      ).rejects.toThrow(/viewer.*restricted to read-only/i);
    });

    it('blocks read-only viewer PM from dispatching an incident', async () => {
      vi.mocked(db.query).mockResolvedValueOnce({
        rows: [{ role: 'viewer', status: 'active' }],
      } as any);

      await expect(
        incidentsService.dispatchIncident('inc-1', viewerUser, { vendorId: 'v-1' })
      ).rejects.toThrow(/viewer.*restricted to read-only/i);
    });
  });

  describe('Finding #2: Incident work orders route through Task Engine (P0)', () => {
    it('creates linked remediation task via TasksService.create() with full SLA snapshot', async () => {
      // 1. Membership check passes
      vi.mocked(db.query).mockResolvedValueOnce({
        rows: [{ role: 'ops_manager', status: 'active' }],
      } as any);
      // 2. Incident insert
      vi.mocked(db.query).mockResolvedValueOnce({
        rows: [{
          id: 'inc-100',
          incident_code: 'INC-10042',
          title: 'Major Flood',
          property_id: 'prop-1-uuid',
          severity: 'critical',
        }],
      } as any);
      // 3. Update incident with related_job_id
      vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);

      const result = await incidentsService.create(activePmUser, {
        propertyId: 'prop-1-uuid',
        title: 'Major Flood',
        description: 'Water heater ruptured',
        severity: 'critical',
        tradeCode: 'plumbing',
        createLinkedTask: true,
      });

      // Verify TasksService.create was invoked with proper parameters
      expect(tasksServiceMock.create).toHaveBeenCalledTimes(1);
      const taskCallArgs = tasksServiceMock.create.mock.calls[0];
      expect(taskCallArgs[0]).toEqual(activePmUser);
      expect(taskCallArgs[1]).toMatchObject({
        propertyId: 'prop-1-uuid',
        workflowClass: 'maintenance',
        severity: 'critical',
        serviceType: 'emergency',
        source: 'incident',
      });

      expect(result.linkedJob).toBeDefined();
      expect(result.linkedJob.id).toBe('task-from-engine-1');
      expect(result.related_job_id).toBe('task-from-engine-1');
    });

    it('createTaskForIncident routes through TasksService.create()', async () => {
      // 1. Membership check
      vi.mocked(db.query).mockResolvedValueOnce({
        rows: [{ role: 'ops_manager', status: 'active' }],
      } as any);
      // 2. findOne membership check
      vi.mocked(db.query).mockResolvedValueOnce({
        rows: [{ role: 'ops_manager', status: 'active' }],
      } as any);
      // 3. findOne query
      vi.mocked(db.query).mockResolvedValueOnce({
        rows: [{
          id: 'inc-200',
          incident_code: 'INC-20011',
          title: 'Electrical Short',
          description: 'Sparks in panel',
          property_id: 'prop-1-uuid',
          severity: 'critical',
        }],
      } as any);
      // 4. Update incident with related_job_id
      vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);

      const job = await incidentsService.createTaskForIncident('inc-200', activePmUser, {
        tradeCode: 'electrical',
      });

      expect(tasksServiceMock.create).toHaveBeenCalledTimes(1);
      expect(job.id).toBe('task-from-engine-1');
    });
  });

  describe('Finding #3: Emergency Mode persistence and versioning (P1)', () => {
    it('persists emergency mode state and increments version across requests', async () => {
      // Call 1: Update emergency mode -> enabled = true
      // Membership check for update
      vi.mocked(db.query).mockResolvedValueOnce({
        rows: [{ role: 'ops_manager', status: 'active' }],
      } as any);
      // Membership check for getEmergencyMode
      vi.mocked(db.query).mockResolvedValueOnce({
        rows: [{ role: 'ops_manager', status: 'active' }],
      } as any);
      // Query audit_events (no previous state -> returns empty)
      vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);

      const updateResult = await incidentsService.updateEmergencyMode(activePmUser, {
        enabled: true,
        reason: 'Hurricane Warning',
      });

      expect(updateResult.enabled).toBe(true);
      expect(updateResult.version).toBe(2);
      expect(auditServiceMock.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          targetType: 'emergency_mode',
          eventType: 'emergency_mode.changed',
          metadata: expect.objectContaining({
            enabled: true,
            version: 2,
            reason: 'Hurricane Warning',
          }),
        })
      );

      // Call 2: Query emergency mode -> returns persisted state from audit_events
      // Membership check
      vi.mocked(db.query).mockResolvedValueOnce({
        rows: [{ role: 'ops_manager', status: 'active' }],
      } as any);
      // Query audit_events returning the saved state
      vi.mocked(db.query).mockResolvedValueOnce({
        rows: [{
          created_at: new Date().toISOString(),
          metadata: {
            enabled: true,
            version: 2,
            reason: 'Hurricane Warning',
            scope: 'organization',
          },
        }],
      } as any);

      const mode = await incidentsService.getEmergencyMode(activePmUser);
      expect(mode.enabled).toBe(true);
      expect(mode.version).toBe(2);
      expect(mode.reason).toBe('Hurricane Warning');
    });
  });
});
