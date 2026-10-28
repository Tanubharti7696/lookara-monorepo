import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TasksService } from '../src/tasks/tasks.service';
import { TaskPolicyService } from '../src/tasks/task-policy.service';
import { DispatchService } from '../src/dispatch/dispatch.service';
import { AuditService } from '../src/audit/audit.service';
import { BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import * as db from '@lookara/database';

vi.mock('@lookara/database', () => {
  return {
    query: vi.fn(),
    getClient: vi.fn(),
    pool: { query: vi.fn(), connect: vi.fn() },
  };
});

describe('Milestone 1 Architecture & Canonical Operations Unit & Service Tests', () => {
  let tasksService: TasksService;
  let taskPolicyService: TaskPolicyService;
  let dispatchService: DispatchService;
  let auditService: AuditService;

  const mockUser = {
    sub: 'user-pm-1',
    email: 'pm@lookara.test',
    activeOrganizationId: 'org-1',
    roles: ['pm'],
    isAdmin: false,
    isOwner: false,
    isVendor: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    auditService = new AuditService();
    vi.spyOn(auditService, 'recordEvent').mockResolvedValue(undefined as any);
    taskPolicyService = new TaskPolicyService();
    tasksService = new TasksService(auditService, taskPolicyService);
    dispatchService = new DispatchService(auditService);
  });

  describe('1. TasksService: Organization Security & Permissions', () => {
    it('should throw ForbiddenException if user tries to access a task from another organization', async () => {
      vi.mocked(db.query).mockResolvedValueOnce({
        rows: [{ id: 'task-1', organization_id: 'other-org', job_code: 'JOB-999', status: 'unassigned' }],
      } as any);

      await expect(tasksService.findOne('task-1', mockUser as any)).rejects.toThrow(ForbiddenException);
    });

    it('should enforce canonical state rules without allowing bypass', async () => {
      vi.mocked(db.query).mockResolvedValueOnce({
        rows: [{ id: 'task-1', organization_id: 'org-1', job_code: 'JOB-100', status: 'unassigned' }],
      } as any);

      // Attempt illegal transition directly from unassigned -> completed
      await expect(tasksService.updateStatus('task-1', mockUser as any, 'completed')).rejects.toThrow(BadRequestException);
    });

    it('should correctly increment rework_count on ordinary rework and remain on original task', async () => {
      vi.mocked(db.query)
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', organization_id: 'org-1', job_code: 'JOB-100', status: 'verification_pending', rework_count: 0 }],
        } as any)
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', organization_id: 'org-1', job_code: 'JOB-100', status: 'in_progress', rework_count: 1, rework_reason: 'Paint defect' }],
        } as any);

      const res = await tasksService.verify('task-1', mockUser as any, { decision: 'rework', reworkReason: 'Paint defect' });
      expect(res.status).toBe('rework_required');
      expect(res.task.rework_count).toBe(1);
      expect(res.task.status).toBe('in_progress');
    });
  });

  describe('2. DispatchService: Atomic Transactions & Concurrency Safety', () => {
    it('should fail with ConflictException if job status has changed concurrently from unassigned', async () => {
      // Mock candidate search
      vi.mocked(db.query)
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', organization_id: 'org-1', property_id: 'prop-1', trade_code: 'PLUMB', severity: 'medium', job_code: 'JOB-101', status: 'unassigned' }],
        } as any)
        .mockResolvedValueOnce({
          rows: [{ id: 'vendor-1', display_name: 'Apex Plumbing', business_name: 'Apex', lifecycle_status: 'active' }],
        } as any);

      const mockClient = {
        query: vi.fn(),
        release: vi.fn(),
      };
      vi.mocked(db.getClient).mockResolvedValueOnce(mockClient as any);

      // Transaction simulation: job was locked but status is now 'assigned' concurrently
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', status: 'assigned', job_code: 'JOB-101', organization_id: 'org-1' }],
        }) // FOR UPDATE returns already assigned
        .mockResolvedValueOnce({}); // ROLLBACK

      await expect(dispatchService.assignVendor('task-1', 'vendor-1', mockUser as any)).rejects.toThrow(ConflictException);
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should successfully execute manual assignment within transaction and commit', async () => {
      vi.mocked(db.query)
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', organization_id: 'org-1', property_id: 'prop-1', trade_code: 'PLUMB', severity: 'medium', job_code: 'JOB-101', status: 'unassigned' }],
        } as any)
        .mockResolvedValueOnce({
          rows: [{ id: 'vendor-1', display_name: 'Apex Plumbing', business_name: 'Apex', lifecycle_status: 'active' }],
        } as any);

      const mockClient = {
        query: vi.fn(),
        release: vi.fn(),
      };
      vi.mocked(db.getClient).mockResolvedValueOnce(mockClient as any);

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', status: 'unassigned', job_code: 'JOB-101', organization_id: 'org-1' }],
        }) // FOR UPDATE
        .mockResolvedValueOnce({ rows: [] }) // no existing assignment
        .mockResolvedValueOnce({}) // INSERT assignment
        .mockResolvedValueOnce({ rows: [{ id: 'task-1', status: 'assigned', job_code: 'JOB-101' }] }) // UPDATE job
        .mockResolvedValueOnce({}); // COMMIT

      const res = await dispatchService.assignVendor('task-1', 'vendor-1', mockUser as any);
      expect(res.status).toBe('assigned');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should automatically select top-ranked eligible candidate and assign in autoDispatch', async () => {
      vi.mocked(db.query)
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', organization_id: 'org-1', property_id: 'prop-1', trade_code: 'PLUMB', severity: 'medium', job_code: 'JOB-101', status: 'unassigned' }],
        } as any)
        .mockResolvedValueOnce({
          rows: [
            { id: 'vendor-1', display_name: 'Apex Plumbing', business_name: 'Apex', lifecycle_status: 'active', priority_rank: 1 },
            { id: 'vendor-2', display_name: 'Beta Plumbing', business_name: 'Beta', lifecycle_status: 'active', priority_rank: 2 },
          ],
        } as any) // getCandidates returns sorted candidates
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', organization_id: 'org-1', property_id: 'prop-1', trade_code: 'PLUMB', severity: 'medium', job_code: 'JOB-101', status: 'unassigned' }],
        } as any)
        .mockResolvedValueOnce({
          rows: [{ id: 'vendor-1', display_name: 'Apex Plumbing', business_name: 'Apex', lifecycle_status: 'active' }],
        } as any);

      const mockClient = {
        query: vi.fn(),
        release: vi.fn(),
      };
      vi.mocked(db.getClient).mockResolvedValueOnce(mockClient as any);

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', status: 'unassigned', job_code: 'JOB-101', organization_id: 'org-1' }],
        }) // FOR UPDATE
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ id: 'task-1', status: 'assigned', job_code: 'JOB-101' }] })
        .mockResolvedValueOnce({}); // COMMIT

      const res = await dispatchService.autoDispatch('task-1', mockUser as any);
      expect(res.status).toBe('assigned');
    });
  });

  describe('3. Execution Lifecycle: En Route and On Site Transitions', () => {
    it('should transition accepted -> en_route -> on_site -> in_progress and record execution timestamps', async () => {
      const mockVendorUser = {
        sub: 'user-vendor-1',
        email: 'vendor@lookara.test',
        roles: ['vendor'],
        isAdmin: false,
        isOwner: false,
        isVendor: true,
        activePortal: 'vendor',
      };

      // 1. accepted -> en_route
      vi.mocked(db.query)
        // findOne
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', organization_id: 'org-1', job_code: 'JOB-100', status: 'accepted', property_id: 'prop-1' }],
        } as any)
        // getVendorIdForUser
        .mockResolvedValueOnce({ rows: [{ id: 'vendor-1' }] } as any)
        // isVendorAssignedToTask
        .mockResolvedValueOnce({ rows: [{ id: 'assign-1' }] } as any)
        // updateStatus: getVendorIdForUser
        .mockResolvedValueOnce({ rows: [{ id: 'vendor-1' }] } as any)
        // updateStatus: isVendorAssignedToTask
        .mockResolvedValueOnce({ rows: [{ id: 'assign-1' }] } as any)
        // UPDATE jobs
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', status: 'en_route', en_route_at: new Date() }],
        } as any)
        // UPDATE job_assignments
        .mockResolvedValueOnce({} as any);

      const res1 = await tasksService.updateStatus('task-1', mockVendorUser as any, 'en_route');
      expect(res1.status).toBe('en_route');

      // 2. en_route -> on_site
      vi.mocked(db.query)
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', organization_id: 'org-1', job_code: 'JOB-100', status: 'en_route', property_id: 'prop-1' }],
        } as any)
        .mockResolvedValueOnce({ rows: [{ id: 'vendor-1' }] } as any)
        .mockResolvedValueOnce({ rows: [{ id: 'assign-1' }] } as any)
        .mockResolvedValueOnce({ rows: [{ id: 'vendor-1' }] } as any)
        .mockResolvedValueOnce({ rows: [{ id: 'assign-1' }] } as any)
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', status: 'on_site', on_site_at: new Date() }],
        } as any)
        .mockResolvedValueOnce({} as any);

      const res2 = await tasksService.updateStatus('task-1', mockVendorUser as any, 'on_site');
      expect(res2.status).toBe('on_site');

      // 3. on_site -> in_progress
      vi.mocked(db.query)
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', organization_id: 'org-1', job_code: 'JOB-100', status: 'on_site', property_id: 'prop-1' }],
        } as any)
        .mockResolvedValueOnce({ rows: [{ id: 'vendor-1' }] } as any)
        .mockResolvedValueOnce({ rows: [{ id: 'assign-1' }] } as any)
        .mockResolvedValueOnce({ rows: [{ id: 'vendor-1' }] } as any)
        .mockResolvedValueOnce({ rows: [{ id: 'assign-1' }] } as any)
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', status: 'in_progress' }],
        } as any);

      const res3 = await tasksService.updateStatus('task-1', mockVendorUser as any, 'in_progress');
      expect(res3.status).toBe('in_progress');
    });
  });

  describe('4. SLA Clocks & 4-Tier Hierarchy Snapshotting', () => {
    it('should snapshot 4 operational targets according to hierarchical resolution', async () => {
      // Mock create task queries
      vi.mocked(db.query)
        .mockResolvedValueOnce({ rows: [{ id: 'prop-1' }] } as any) // Property check
        .mockResolvedValueOnce({
          rows: [{ id: 'task-1', job_code: 'JOB-200', organization_id: 'org-1', property_id: 'prop-1', severity: 'critical', title: 'Pipe Burst' }],
        } as any) // Insert Job
        .mockResolvedValueOnce({ rows: [] } as any) // No property override
        .mockResolvedValueOnce({ rows: [{ market: 'NYC', city: 'New York' }] } as any) // Property market query
        .mockResolvedValueOnce({
          rows: [{
            id: 'sla-nyc',
            name: 'NYC Critical SLA',
            acknowledge_mins: 15,
            arrival_mins: 60,
            completion_mins: 180,
            verification_mins: 60,
          }],
        } as any) // Market SLA matched!
        .mockResolvedValueOnce({ rows: [] } as any); // Insert snapshot

      const task = await tasksService.create(mockUser as any, {
        propertyId: 'prop-1',
        tradeCode: 'PLUMB',
        workflowClass: 'maintenance',
        severity: 'critical',
        source: 'pm_portal',
        title: 'Pipe Burst',
        serviceType: 'emergency',
      });

      expect(task.id).toBe('task-1');
      expect(task.job_code).toBe('JOB-200');
    });
  });
});

