import { Controller, Get, Post, Body, Query, Param, UseGuards, BadRequestException } from '@nestjs/common';
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

  @Get('approvals')
  async getApprovals(@CurrentUser() user: JwtPayload, @Query('type') type?: string) {
    return this.billingService.getApprovals(user, type);
  }

  @Get('approvals/:id')
  async getApprovalById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.billingService.getApprovalById(user, id);
  }

  @Post('billing/payment-methods')
  async addPaymentMethod(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.billingService.addPaymentMethod(user, body);
  }

  @Post('storage/upload')
  async uploadStorage(
    @CurrentUser() user: JwtPayload,
    @Body() body: { filename?: string; mimeType?: string; base64Content: string }
  ) {
    if (!body || !body.base64Content) {
      throw new BadRequestException('base64Content is required');
    }
    const ext = body.filename?.split('.').pop() || 'jpg';
    const key = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const fileUrl = body.base64Content.startsWith('data:')
      ? body.base64Content
      : `data:${body.mimeType || 'image/jpeg'};base64,${body.base64Content}`;

    return {
      success: true,
      key,
      fileUrl,
      filename: body.filename || `upload-${Date.now()}.${ext}`,
      mimeType: body.mimeType || 'image/jpeg',
    };
  }
}
