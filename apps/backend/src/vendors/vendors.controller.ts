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
}
