import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CreateTaskDto } from './create-task.dto.js';
import type { Task } from './task.js';
import { TasksService } from './tasks.service.js';
import { UpdateTaskDto } from './update-task.dto.js';
import { FindTasksQueryDto } from './find-tasks-query.dto.js';
import type { PaginatedTasksDto } from './paginated-tasks.dto.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  findAll(
    @Query(new ValidationPipe({ transform: true }))
    query: FindTasksQueryDto,
  ): PaginatedTasksDto {
    return this.tasks.findAllPaginated(query.page, query.limit, query.done);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Task | undefined {
    return this.tasks.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTaskDto): Task {
    return this.tasks.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ): Task | undefined {
    return this.tasks.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): void {
    this.tasks.remove(id);
  }
}
