// apps/backend/src/dashboard/dashboard.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@lookara/auth';

@Controller('api/v1/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getMetrics(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getMetrics(user);
  }

  @Get('home')
  async getHome(
    @CurrentUser() user: JwtPayload,
    @Query('date') date: string,
    @Query('timezone') timezone: string,
    @Query('portfolioId') portfolioId?: string,
    @Query('propertyId') propertyId?: string,
    @Query('criticalFilter') criticalFilter?: 'emergency' | 'sla_risk' | 'vendor_coverage' | 'all',
  ) {
    return this.dashboardService.getHome(user, {
      date,
      timezone,
      portfolioId,
      propertyId,
      criticalFilter,
    });
  }

  @Get('critical-actions')
  async getCriticalActions(
    @CurrentUser() user: JwtPayload,
    @Query('date') date: string,
    @Query('timezone') timezone: string,
    @Query('filter') filter?: 'emergency' | 'sla_risk' | 'vendor_coverage' | 'all',
    @Query('propertyId') propertyId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.dashboardService.getCriticalActions(user, {
      date,
      timezone,
      filter,
      propertyId,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
  }

  @Get('activity')
  async getActivity(
    @CurrentUser() user: JwtPayload,
    @Query('date') date: string,
    @Query('timezone') timezone: string,
    @Query('category') category?: 'sla' | 'dispatch' | 'compliance' | 'vendor' | 'task',
    @Query('propertyId') propertyId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.dashboardService.getActivity(user, {
      date,
      timezone,
      category,
      propertyId,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
  }
}
