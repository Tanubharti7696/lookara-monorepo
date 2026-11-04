import { Module } from '@nestjs/common';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { TasksModule } from '../tasks/tasks.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TasksModule, AuditModule],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService],
})
export class VendorsModule {}
