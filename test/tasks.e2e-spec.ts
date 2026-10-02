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

  it('lists the tasks', async () => {
    await request(app.getHttpServer()).post('/tasks').send({ title: 'First' });
    await request(app.getHttpServer()).post('/tasks').send({ title: 'Second' });

    const res = await request(app.getHttpServer()).get('/tasks').expect(200);
    expect(res.body).toHaveLength(2);
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

  it('returns 404 when getting a non-existent task', async () => {
    await request(app.getHttpServer())
      .get('/tasks/999')
      .expect(404)
      .expect((res) =>
        expect(res.body.message).toBe('Task 999 not found'),
      );
  });

  it('returns 404 when updating a non-existent task', async () => {
    await request(app.getHttpServer())
      .patch('/tasks/999')
      .send({ done: true })
      .expect(404)
      .expect((res) =>
        expect(res.body.message).toBe('Task 999 not found'),
      );
  });

  it('returns 404 when deleting a non-existent task', async () => {
    await request(app.getHttpServer())
      .delete('/tasks/999')
      .expect(404)
      .expect((res) =>
        expect(res.body.message).toBe('Task 999 not found'),
      );
  });
});
