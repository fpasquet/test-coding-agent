import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

describe('Tasks (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates a task, then reads it back', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Write the README' })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/tasks/${created.body.id}`)
      .expect(200)
      .expect((res) =>
        expect(res.body).toMatchObject({
          title: 'Write the README',
          done: false,
        }),
      );
  });

  it('lists the tasks with default pagination', async () => {
    await request(app.getHttpServer()).post('/tasks').send({ title: 'First' });
    await request(app.getHttpServer()).post('/tasks').send({ title: 'Second' });

    const res = await request(app.getHttpServer()).get('/tasks').expect(200);
    expect(res.body).toMatchObject({
      page: 1,
      limit: 20,
      total: 2,
    });
    expect(res.body.items).toHaveLength(2);
  });

  it('marks a task as done', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Ship it' });

    await request(app.getHttpServer())
      .patch(`/tasks/${created.body.id}`)
      .send({ done: true })
      .expect(200)
      .expect((res) => expect(res.body.done).toBe(true));
  });

  it('deletes a task', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Temporary' });

    await request(app.getHttpServer())
      .delete(`/tasks/${created.body.id}`)
      .expect(204);
  });

  it('paginates tasks to a second page', async () => {
    for (let i = 1; i <= 25; i++) {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: `Task ${i}` });
    }

    const page1 = await request(app.getHttpServer())
      .get('/tasks?page=1&limit=10')
      .expect(200);
    expect(page1.body.items).toHaveLength(10);
    expect(page1.body.total).toBe(25);
    expect(page1.body.page).toBe(1);

    const page2 = await request(app.getHttpServer())
      .get('/tasks?page=2&limit=10')
      .expect(200);
    expect(page2.body.items).toHaveLength(10);
    expect(page2.body.page).toBe(2);
    expect(page2.body.items[0].title).toBe('Task 11');
  });

  it('filters tasks by done status', async () => {
    const task1 = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Done task' });
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Pending task' });

    await request(app.getHttpServer())
      .patch(`/tasks/${task1.body.id}`)
      .send({ done: true });

    const doneRes = await request(app.getHttpServer())
      .get('/tasks?done=true')
      .expect(200);
    expect(doneRes.body.items).toHaveLength(1);
    expect(doneRes.body.total).toBe(1);

    const pendingRes = await request(app.getHttpServer())
      .get('/tasks?done=false')
      .expect(200);
    expect(pendingRes.body.items).toHaveLength(1);
    expect(pendingRes.body.total).toBe(1);
  });

  it('rejects invalid query parameters', async () => {
    await request(app.getHttpServer())
      .get('/tasks?page=0')
      .expect(400);

    await request(app.getHttpServer())
      .get('/tasks?limit=500')
      .expect(400);

    await request(app.getHttpServer())
      .get('/tasks?done=maybe')
      .expect(400);
  });
});
