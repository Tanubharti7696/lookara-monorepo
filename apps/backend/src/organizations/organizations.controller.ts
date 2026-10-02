// apps/backend/src/organizations/organizations.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/v1/organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.orgsService.findAll({
      search,
      status,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orgsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.orgsService.update(id, data);
  }

  @Get(':id/users')
  async findUsers(@Param('id') id: string) {
    return this.orgsService.findUsers(id);
  }

  @Post(':id/users')
  async addUser(@Param('id') orgId: string, @Body() data: any) {
    return this.orgsService.addUser(orgId, data);
  }

  @Patch(':id/users/:userId')
  async updateUser(@Param('id') orgId: string, @Param('userId') userId: string, @Body() data: any) {
    return this.orgsService.updateUser(orgId, userId, data);
  }

  @Delete(':id/users/:userId')
  async removeUser(@Param('id') orgId: string, @Param('userId') userId: string) {
    return this.orgsService.removeUser(orgId, userId);
  }
}
