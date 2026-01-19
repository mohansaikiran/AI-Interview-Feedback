import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { InterviewsModule } from '../interviews/interviews.module';

describe('Interviews E2E', () => {
  let app: INestApplication;
  let mongo: MongoMemoryServer;
  let token: string;
  let interviewId: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';

    mongo = await MongoMemoryServer.create();

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(mongo.getUri()),
        UsersModule,
        AuthModule,
        InterviewsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Setup only: create a user and get a token
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'candidate@test.com', password: 'Password123' })
      .expect(201);

    token = registerRes.body.accessToken;
  });

  afterAll(async () => {
    if (app) await app.close();
    if (mongo) await mongo.stop();
  });

  it('returns questions', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/interviews/questions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(5);
  });

  it('submits interview and returns feedback (with explanations)', async () => {
    const qRes = await request(app.getHttpServer())
      .get('/api/interviews/questions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const submitRes = await request(app.getHttpServer())
      .post('/api/interviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        answers: qRes.body.map((q: any) => ({
          questionId: q.id,
          response:
            'This is a sufficiently detailed response to demonstrate capability.',
        })),
      })
      .expect(201);

    interviewId = submitRes.body.interviewId;

    expect(interviewId).toBeDefined();
    expect(submitRes.body.feedback).toBeDefined();
    expect(submitRes.body.feedback.scores).toBeDefined();
    expect(submitRes.body.feedback.explanations).toBeDefined();
  });

  it('returns interview history list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/interviews')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].scores).toBeDefined();
  });

  it('returns interview detail including explanations', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/interviews/${interviewId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.questions).toHaveLength(5);
    expect(res.body.answers).toHaveLength(5);
    expect(res.body.feedback.scores).toBeDefined();
    expect(res.body.feedback.explanations).toBeDefined();
  });

  it('rejects requests without auth', async () => {
    await request(app.getHttpServer()).get('/api/interviews').expect(401);
  });

  it('prevents other users from accessing interview detail', async () => {
    const otherRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'other@test.com', password: 'Password123' })
      .expect(201);

    const otherToken = otherRes.body.accessToken;

    await request(app.getHttpServer())
      .get(`/api/interviews/${interviewId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);
  });
});