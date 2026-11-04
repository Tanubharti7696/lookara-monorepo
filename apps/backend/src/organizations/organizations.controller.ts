import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@lookara/auth';

@Controller('api/v1/organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.orgsService.findAll(user, {
      search,
      status,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get(':id')
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.orgsService.findOne(user, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.orgsService.update(user, id, data);
  }

  @Get(':id/users')
  async findUsers(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.orgsService.findUsers(user, id);
  }

  @Post(':id/users')
  async addUser(
    @CurrentUser() user: JwtPayload,
    @Param('id') orgId: string,
    @Body() data: any,
  ) {
    return this.orgsService.addUser(user, orgId, data);
  }

  @Patch(':id/users/:userId')
  async updateUser(
    @CurrentUser() user: JwtPayload,
    @Param('id') orgId: string,
    @Param('userId') userId: string,
    @Body() data: any,
  ) {
    return this.orgsService.updateUser(user, orgId, userId, data);
  }

  @Delete(':id/users/:userId')
  async removeUser(
    @CurrentUser() user: JwtPayload,
    @Param('id') orgId: string,
    @Param('userId') userId: string,
  ) {
    return this.orgsService.removeUser(user, orgId, userId);
  }
}
