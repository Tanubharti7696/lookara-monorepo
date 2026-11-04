import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { OrganizationPolicyService } from './organization-policy.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, OrganizationPolicyService],
  exports: [OrganizationsService, OrganizationPolicyService],
})
export class OrganizationsModule {}
