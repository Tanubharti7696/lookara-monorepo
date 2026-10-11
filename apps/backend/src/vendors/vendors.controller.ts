import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@lookara/auth';

@Controller('api/v1/vendors')
@UseGuards(JwtAuthGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.vendorsService.findAll(user);
  }

  @Get('coverage')
  async getCoverage(@CurrentUser() user: JwtPayload) {
    return this.vendorsService.getCoverage(user);
  }

  @Post(':id/coverage')
  async addCoverage(
    @Param('id') vendorId: string,
    @Body('propertyId') propertyId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.vendorsService.addCoverage(vendorId, propertyId, user);
  }

  @Delete(':id/coverage/:propertyId')
  async removeCoverage(
    @Param('id') vendorId: string,
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.vendorsService.removeCoverage(vendorId, propertyId, user);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') vendorId: string,
    @Body('status') status: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.vendorsService.updateStatus(vendorId, status, user);
  }

  @Get('portal/jobs')
  async getVendorJobs(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
  ) {
    return this.vendorsService.getVendorJobs(user, status);
  }

  @Post('portal/jobs/:id/respond')
  async respondToJob(
    @Param('id') jobId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { action: 'accept' | 'decline'; declineReason?: string },
  ) {
    return this.vendorsService.respondToJob(jobId, user, body);
  }

  @Patch('portal/jobs/:id/execution')
  async updateJobExecution(
    @Param('id') jobId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { status: 'in_progress' | 'verification_pending' | 'completed'; notes?: string },
  ) {
    return this.vendorsService.updateJobExecution(jobId, user, body);
  }
}
