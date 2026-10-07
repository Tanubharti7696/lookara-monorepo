import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@lookara/auth';

@Controller('api/v1/vendors')
@UseGuards(JwtAuthGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.vendorsService.findAll(user);
  }

  @Get('coverage')
  async getCoverage(@CurrentUser() user: JwtPayload) {
    return this.vendorsService.getCoverage(user);
  }

  @Post(':id/coverage')
  async addCoverage(
    @Param('id') vendorId: string,
    @Body('propertyId') propertyId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.vendorsService.addCoverage(vendorId, propertyId, user);
  }

  @Delete(':id/coverage/:propertyId')
  async removeCoverage(
    @Param('id') vendorId: string,
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.vendorsService.removeCoverage(vendorId, propertyId, user);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') vendorId: string,
    @Body('status') status: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.vendorsService.updateStatus(vendorId, status, user);
  }
}
