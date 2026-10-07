import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@lookara/auth';

@Controller('api/v1/compliance')
@UseGuards(JwtAuthGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get()
  async findAll(@CurrentUser() user: JwtPayload, @Query('propertyId') propertyId?: string) {
    return this.complianceService.findAll(user, propertyId);
  }

  @Post(':id/schedule')
  async scheduleTask(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.complianceService.scheduleTask(id, user);
  }
}
