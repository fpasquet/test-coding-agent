import { TasksService } from './tasks.service.js';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(() => {
    service = new TasksService();
  });

  it('creates a task, not done, with an incremental id', () => {
    const first = service.create({ title: 'Write the README' });
    const second = service.create({ title: 'Add tests' });

    expect(first).toMatchObject({
      id: 1,
      title: 'Write the README',
      done: false,
    });
    expect(second.id).toBe(2);
  });

  it('lists the tasks in the order they were created', () => {
    service.create({ title: 'First' });
    service.create({ title: 'Second' });

    expect(service.findAll().map((task) => task.title)).toEqual([
      'First',
      'Second',
    ]);
  });

  it('updates a task', () => {
    const task = service.create({ title: 'Ship it' });

    expect(service.update(task.id, { done: true })).toMatchObject({
      id: task.id,
      done: true,
    });
  });

  it('removes a task', () => {
    const task = service.create({ title: 'Temporary' });
    service.remove(task.id);

    expect(service.findOne(task.id)).toBeUndefined();
  });

  it('paginates tasks with default values', () => {
    service.create({ title: 'Task 1' });
    service.create({ title: 'Task 2' });

    const result = service.findAllPaginated();
    expect(result).toMatchObject({
      page: 1,
      limit: 20,
      total: 2,
    });
    expect(result.items).toHaveLength(2);
  });

  it('paginates tasks with custom page and limit', () => {
    for (let i = 1; i <= 25; i++) {
      service.create({ title: `Task ${i}` });
    }

    const result = service.findAllPaginated(2, 10);
    expect(result).toMatchObject({
      page: 2,
      limit: 10,
      total: 25,
    });
    expect(result.items).toHaveLength(10);
    expect(result.items[0].title).toBe('Task 11');
  });

  it('filters tasks by done status', () => {
    const task1 = service.create({ title: 'Task 1' });
    const _task2 = service.create({ title: 'Task 2' });
    service.update(task1.id, { done: true });

    const result = service.findAllPaginated(1, 20, true);
    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(task1.id);
  });

  it('filters tasks by done=false', () => {
    const task1 = service.create({ title: 'Task 1' });
    const _task2 = service.create({ title: 'Task 2' });
    service.update(task1.id, { done: true });

    const result = service.findAllPaginated(1, 20, false);
    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(_task2.id);
  });
});
