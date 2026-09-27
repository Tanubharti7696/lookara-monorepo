// apps/backend/src/organizations/organizations.controller.ts
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
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

  @Get(':id/users')
  async findUsers(@Param('id') id: string) {
    return this.orgsService.findUsers(id);
  }
}
