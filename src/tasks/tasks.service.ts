import { Injectable } from '@nestjs/common';
import type { CreateTaskDto } from './create-task.dto.js';
import type { Task } from './task.js';
import type { UpdateTaskDto } from './update-task.dto.js';
import type { PaginatedTasksDto } from './paginated-tasks.dto.js';

/** The tasks, kept in memory: they are gone when the application stops. */
@Injectable()
export class TasksService {
  private readonly tasks: Task[] = [];
  private nextId = 1;

  findAllPaginated(
    page: number = 1,
    limit: number = 20,
    done?: boolean,
  ): PaginatedTasksDto {
    let filtered = this.tasks;
    if (done !== undefined) {
      filtered = this.tasks.filter((task) => task.done === done);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return { items, total, page, limit };
  }

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: number): Task | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  create(dto: CreateTaskDto): Task {
    const task: Task = {
      id: this.nextId++,
      title: dto.title,
      description: dto.description,
      done: false,
      createdAt: new Date().toISOString(),
    };
    this.tasks.push(task);
    return task;
  }

  update(id: number, dto: UpdateTaskDto): Task | undefined {
    const task = this.findOne(id);
    if (task) Object.assign(task, dto);
    return task;
  }

  remove(id: number): void {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index !== -1) this.tasks.splice(index, 1);
  }
}
