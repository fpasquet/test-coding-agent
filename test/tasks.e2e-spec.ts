import { ValidationPipe } from '@nestjs/common';
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
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
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

  it('rejects a task with an empty title', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: '' })
      .expect(400);
  });

  it('rejects a task with no title', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({})
      .expect(400);
  });

  it('rejects a task with a title longer than 120 characters', async () => {
    const longTitle = 'a'.repeat(121);
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: longTitle })
      .expect(400);
  });

  it('rejects a request with an unknown field', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Test', unknownField: 'value' })
      .expect(400);
  });
});
