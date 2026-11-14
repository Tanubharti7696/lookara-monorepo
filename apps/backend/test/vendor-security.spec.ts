import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VendorsService } from '../src/vendors/vendors.service';
import { TaskPolicyService } from '../src/tasks/task-policy.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as db from '@lookara/database';

vi.mock('@lookara/database', () => ({
  query: vi.fn(),
  getClient: vi.fn(),
}));

describe('VendorsService - Security & Concurrency (VEND-04 with REAL TaskPolicyService)', () => {
  let service: VendorsService;
  let mockAuditService: any;
  let mockTasksService: any;
  let realTaskPolicyService: TaskPolicyService;
  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuditService = {
      recordEvent: vi.fn().mockResolvedValue({}),
    };
    mockTasksService = {};
    // Use REAL TaskPolicyService instance - not a mocked validateTransition function!
    realTaskPolicyService = new TaskPolicyService();

    mockClient = {
      query: vi.fn(),
      release: vi.fn(),
    };
    vi.mocked(db.getClient).mockResolvedValue(mockClient as any);

    service = new VendorsService(mockAuditService, mockTasksService, realTaskPolicyService);
  });

  const mockUser: any = {
    sub: 'user-vendor-1',
    isVendor: true,
    email: 'vendor@example.com',
  };

  it('rejects respondToJob when job is not found', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'ven-1' }] } as any);
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [] }); // SELECT jobs FOR UPDATE

    await expect(service.respondToJob('job-missing', mockUser, { action: 'accept' }))
      .rejects.toThrow(NotFoundException);

    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('rejects respondToJob when job is already closed or cancelled (terminal status)', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'ven-1' }] } as any);
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 'job-1', status: 'closed' }] }); // SELECT jobs FOR UPDATE

    await expect(service.respondToJob('job-1', mockUser, { action: 'accept' }))
      .rejects.toThrow(BadRequestException);

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('rejects respondToJob when vendor has no assignment', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'ven-1' }] } as any);
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 'job-1', status: 'assigned' }] }) // SELECT jobs
      .mockResolvedValueOnce({ rows: [] }); // SELECT job_assignments returns empty

    await expect(service.respondToJob('job-1', mockUser, { action: 'accept' }))
      .rejects.toThrow(ForbiddenException);

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
  });

  it('atomically accepts job using real policy validation', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'ven-1' }] } as any);
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 'job-1', status: 'assigned', job_code: 'JOB-101', organization_id: 'org-1' }] }) // SELECT jobs FOR UPDATE
      .mockResolvedValueOnce({ rows: [{ id: 'assign-1', vendor_id: 'ven-1', assigned_at: new Date() }] }) // SELECT assignments FOR UPDATE
      .mockResolvedValueOnce({}) // UPDATE job_assignments
      .mockResolvedValueOnce({}) // INSERT job_offers
      .mockResolvedValueOnce({ rows: [{ id: 'job-1', status: 'accepted' }] }) // UPDATE jobs RETURNING *
      .mockResolvedValueOnce({}); // COMMIT

    const result = await service.respondToJob('job-1', mockUser, { action: 'accept' });

    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    expect(mockAuditService.recordEvent).toHaveBeenCalledWith(expect.objectContaining({
      actorType: 'vendor',
      eventType: 'job.accepted',
      targetId: 'job-1',
    }));
    expect(result.status).toBe('accepted');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('atomically declines job with REAL TaskPolicyService allowing vendor_decline to unassigned and preserving offer history in job_offers', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'ven-1' }] } as any);
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 'job-1', status: 'assigned', job_code: 'JOB-101', organization_id: 'org-1' }] }) // SELECT jobs FOR UPDATE
      .mockResolvedValueOnce({ rows: [{ id: 'assign-1', vendor_id: 'ven-1', assigned_at: new Date() }] }) // SELECT assignments FOR UPDATE
      .mockResolvedValueOnce({}) // INSERT job_offers (declined)
      .mockResolvedValueOnce({}) // DELETE job_assignments
      .mockResolvedValueOnce({ rows: [{ id: 'job-1', status: 'unassigned' }] }) // UPDATE jobs RETURNING *
      .mockResolvedValueOnce({}); // COMMIT

    const result = await service.respondToJob('job-1', mockUser, { action: 'decline', declineReason: 'Too busy' });

    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringMatching(/INSERT INTO job_offers.*decline_reason/i),
      expect.arrayContaining(['job-1', 'ven-1', 'Too busy'])
    );
    expect(mockAuditService.recordEvent).toHaveBeenCalledWith(expect.objectContaining({
      actorType: 'vendor',
      eventType: 'job.declined',
      targetId: 'job-1',
    }));
    expect(result.status).toBe('declined');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('prohibits vendor from directly transitioning a task to unassigned via standard policy', () => {
    // Verifies that a generic/direct transition call by a vendor to 'unassigned' is still forbidden
    expect(() => {
      realTaskPolicyService.validateTransition('assigned', 'unassigned', 'vendor', 'standard');
    }).toThrow(ForbiddenException);
  });
});
