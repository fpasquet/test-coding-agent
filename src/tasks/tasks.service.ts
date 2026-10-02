import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateTaskDto } from './create-task.dto.js';
import type { Task } from './task.js';
import type { UpdateTaskDto } from './update-task.dto.js';

/** The tasks, kept in memory: they are gone when the application stops. */
@Injectable()
export class TasksService {
  private readonly tasks: Task[] = [];
  private nextId = 1;

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: number): Task {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
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

  update(id: number, dto: UpdateTaskDto): Task {
    const task = this.findOne(id);
    Object.assign(task, dto);
    return task;
  }

  remove(id: number): void {
    this.findOne(id);
    const index = this.tasks.findIndex((task) => task.id === id);
    this.tasks.splice(index, 1);
  }
}
