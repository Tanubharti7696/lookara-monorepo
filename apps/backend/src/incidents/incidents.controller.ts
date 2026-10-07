import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@lookara/auth';

@Controller('api/v1/incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  async findAll(@CurrentUser() user: JwtPayload, @Query('propertyId') propertyId?: string) {
    return this.incidentsService.findAll(user, propertyId);
  }

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() data: any) {
    return this.incidentsService.create(user, data);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('status') status: string
  ) {
    return this.incidentsService.updateStatus(id, user, status);
  }
}
