import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { EmergencyController } from './emergency.controller';
import { IncidentsService } from './incidents.service';
import { AuditModule } from '../audit/audit.module';
import { DispatchModule } from '../dispatch/dispatch.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [AuditModule, DispatchModule, TasksModule],
  controllers: [IncidentsController, EmergencyController],
  providers: [IncidentsService],
  exports: [IncidentsService]
})
export class IncidentsModule {}

