// apps/backend/src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

import { TaskPolicyService } from './task-policy.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, TaskPolicyService],
  exports: [TasksService, TaskPolicyService],
})
export class TasksModule {}
