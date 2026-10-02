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
});
