import { Controller, Get, Post, Param, Query, UseGuards, Body } from '@nestjs/common';
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

  @Get('templates')
  async getTemplates(@CurrentUser() user: JwtPayload) {
    return this.complianceService.getTemplates(user);
  }

  @Get('templates/:id')
  async getTemplate(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.complianceService.getTemplate(user, id);
  }

  @Post('templates')
  async saveTemplate(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.complianceService.saveTemplate(user, body);
  }
}
