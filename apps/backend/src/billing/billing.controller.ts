import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@lookara/auth';

@Controller('api/v1/billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  async getBillingDetails(@CurrentUser() user: JwtPayload) {
    return this.billingService.getBillingDetails(user);
  }

  @Post('payment-methods')
  async addPaymentMethod(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.billingService.addPaymentMethod(user, body);
  }
}
