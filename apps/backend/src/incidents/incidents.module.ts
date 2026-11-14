import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { EmergencyController } from './emergency.controller';
import { IncidentsService } from './incidents.service';
import { AuditModule } from '../audit/audit.module';
import { DispatchModule } from '../dispatch/dispatch.module';

@Module({
  imports: [AuditModule, DispatchModule],
  controllers: [IncidentsController, EmergencyController],
  providers: [IncidentsService],
  exports: [IncidentsService]
})
export class IncidentsModule {}

