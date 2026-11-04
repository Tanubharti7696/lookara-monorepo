import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VendorsService } from '../src/vendors/vendors.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as db from '@lookara/database';

vi.mock('@lookara/database', () => ({
  query: vi.fn(),
  getClient: vi.fn(),
}));

describe('VendorsService - Security & Concurrency (VENDOR-07)', () => {
  let service: VendorsService;
  let mockAuditService: any;
  let mockTasksService: any;
  let mockTaskPolicyService: any;
  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuditService = {
      recordEvent: vi.fn().mockResolvedValue({}),
    };
    mockTasksService = {};
    mockTaskPolicyService = {
      validateTransition: vi.fn(),
    };

    mockClient = {
      query: vi.fn(),
      release: vi.fn(),
    };
    vi.mocked(db.getClient).mockResolvedValue(mockClient as any);

    service = new VendorsService(mockAuditService, mockTasksService, mockTaskPolicyService);
  });

  const mockUser: any = {
    sub: 'user-vendor-1',
    isVendor: true,
    email: 'vendor@example.com',
  };

  it('rejects respondToJob when job is not found', async () => {
    // Mock getVendorIdForUser
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'ven-1' }] } as any);
    // client.query for BEGIN, then job select returns 0 rows
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

  it('atomically accepts job and executes transition within transaction', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'ven-1' }] } as any);
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 'job-1', status: 'assigned', job_code: 'JOB-101' }] }) // SELECT jobs FOR UPDATE
      .mockResolvedValueOnce({ rows: [{ id: 'assign-1', vendor_id: 'ven-1' }] }) // SELECT assignments FOR UPDATE
      .mockResolvedValueOnce({}) // UPDATE job_assignments
      .mockResolvedValueOnce({ rows: [{ id: 'job-1', status: 'accepted' }] }) // UPDATE jobs RETURNING *
      .mockResolvedValueOnce({}); // COMMIT

    const result = await service.respondToJob('job-1', mockUser, { action: 'accept' });

    expect(mockTaskPolicyService.validateTransition).toHaveBeenCalledWith('assigned', 'accepted', 'vendor');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    expect(mockAuditService.recordEvent).toHaveBeenCalledWith(expect.objectContaining({
      actorType: 'vendor',
      eventType: 'job.accepted',
      targetId: 'job-1',
    }));
    expect(result.status).toBe('accepted');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('atomically declines job, resets job status to unassigned, and deletes assignment', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'ven-1' }] } as any);
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 'job-1', status: 'assigned', job_code: 'JOB-101' }] }) // SELECT jobs FOR UPDATE
      .mockResolvedValueOnce({ rows: [{ id: 'assign-1', vendor_id: 'ven-1' }] }) // SELECT assignments FOR UPDATE
      .mockResolvedValueOnce({}) // DELETE job_assignments
      .mockResolvedValueOnce({ rows: [{ id: 'job-1', status: 'unassigned' }] }) // UPDATE jobs RETURNING *
      .mockResolvedValueOnce({}); // COMMIT

    const result = await service.respondToJob('job-1', mockUser, { action: 'decline', declineReason: 'Too busy' });

    expect(mockTaskPolicyService.validateTransition).toHaveBeenCalledWith('assigned', 'unassigned', 'vendor');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    expect(mockAuditService.recordEvent).toHaveBeenCalledWith(expect.objectContaining({
      actorType: 'vendor',
      eventType: 'job.declined',
      targetId: 'job-1',
    }));
    expect(result.status).toBe('declined');
    expect(mockClient.release).toHaveBeenCalled();
  });
});
