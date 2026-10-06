// apps/backend/src/tasks/tasks.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { TasksService, type CreateTaskDto } from './tasks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@lookara/auth';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('api/v1/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks with optional filters' })
  @ApiQuery({ name: 'propertyId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'urgency', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
    @Query('urgency') urgency?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.tasksService.findAll(user, {
      propertyId,
      status,
      urgency,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tasksService.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update a task status' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('status') newStatus: string,
  ) {
    return this.tasksService.updateStatus(id, user, newStatus);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tasksService.remove(id, user);
  }
}
