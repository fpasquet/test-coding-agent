import type { Task } from './task.js';

export interface PaginatedTasksDto {
  items: Task[];
  total: number;
  page: number;
  limit: number;
}
