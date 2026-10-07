import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@lookara/auth';

@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getReports(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getReports(user);
  }

  @Get('dashboard-trends')
  async getDashboardTrends(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getDashboardTrends(user);
  }
}
