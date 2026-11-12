import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { EmergencyController } from './emergency.controller';
import { IncidentsService } from './incidents.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [IncidentsController, EmergencyController],
  providers: [IncidentsService],
  exports: [IncidentsService]
})
export class IncidentsModule {}
