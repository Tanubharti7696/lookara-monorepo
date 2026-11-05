import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@lookara/auth';

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('billing')
  async getBillingDetails(@CurrentUser() user: JwtPayload) {
    return this.billingService.getBillingDetails(user);
  }

  @Get('billing/invoices')
  async getInvoices(@CurrentUser() user: JwtPayload, @Query('status') status?: string) {
    return this.billingService.getInvoices(user, status);
  }

  @Get('payment-disputes')
  async getPaymentDisputes(@CurrentUser() user: JwtPayload) {
    return this.billingService.getInvoices(user, 'disputed');
  }

  @Post('billing/payment-methods')
  async addPaymentMethod(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.billingService.addPaymentMethod(user, body);
  }
}
