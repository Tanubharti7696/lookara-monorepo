import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@lookara/auth';

@Controller('api/v1/emergency')
@UseGuards(JwtAuthGuard)
export class EmergencyController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get('overview')
  async getOverview(@CurrentUser() user: JwtPayload, @Query() query: any) {
    return this.incidentsService.getEmergencyOverview(user, query);
  }

  @Get('mode')
  async getMode(@CurrentUser() user: JwtPayload, @Query('propertyId') propertyId?: string) {
    return this.incidentsService.getEmergencyMode(user, propertyId);
  }

  @Put('mode')
  async updateMode(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.incidentsService.updateEmergencyMode(user, body);
  }
}

