// apps/backend/src/dispatch/dispatch.controller.ts
import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@lookara/auth';

@Controller('api/v1/dispatch')
@UseGuards(JwtAuthGuard)
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get('candidates/:jobId')
  async getCandidates(@Param('jobId') jobId: string, @CurrentUser() user: JwtPayload) {
    return this.dispatchService.getCandidates(jobId, user);
  }

  @Post('assign')
  async assignVendor(
    @CurrentUser() user: JwtPayload,
    @Body('jobId') jobId: string,
    @Body('vendorId') vendorId: string,
  ) {
    return this.dispatchService.assignVendor(jobId, vendorId, user);
  }
}
