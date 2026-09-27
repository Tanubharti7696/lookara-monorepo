import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { PropertiesService, type CreatePropertyDto } from './properties.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@lookara/auth';

@Controller('api/v1/properties')
@UseGuards(JwtAuthGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get('debug')
  debugEnv() {
    return {
      hasDb: !!process.env.DATABASE_URL,
      dbVal: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + '...' : null,
    };
  }

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('organizationId') organizationId?: string,
    @Query('status') status?: string,
    @Query('city') city?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.propertiesService.findAll(user, {
      organizationId,
      status,
      city,
      search,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.propertiesService.findOne(id, user);
  }

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(user, dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() dto: any) {
    return this.propertiesService.update(id, user, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.propertiesService.remove(id, user);
  }
}
