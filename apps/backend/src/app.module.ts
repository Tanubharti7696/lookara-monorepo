// apps/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PropertiesModule } from './properties/properties.module';
import { TasksModule } from './tasks/tasks.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { VendorsModule } from './vendors/vendors.module';
import { ComplianceModule } from './compliance/compliance.module';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    OrganizationsModule,
    PropertiesModule,
    TasksModule,
    DispatchModule,
    DashboardModule,
    VendorsModule,
    ComplianceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
