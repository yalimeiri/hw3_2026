import request from 'supertest';
import type { Server } from 'http';
import app from '../expressApp';
import connectDB from '../config/db';
import Note from '../models/Note';
import { PORT } from '../consts';
import mongoose from 'mongoose';

const AI_KEYWORD = 'cryptographic-handshake-v7';

let server: Server | undefined;

const isServerRunning = async (): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:${PORT}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

beforeAll(async () => {
  await connectDB();

  if (!(await isServerRunning())) {
    server = await new Promise<Server>((resolve) => {
      const startedServer = app.listen(PORT, () => resolve(startedServer));
    });
  }

  await Note.create({
    title: 'AI test note',
    content: `Important note: my project uses ${AI_KEYWORD} as the auth identifier.`,
    author: { name: 'AI Tester', email: 'ai@test.com' },
  });

  await request(app)
    .post('/users')
    .send({
      name: 'AI Test User',
      email: 'ai-user@test.com',
      username: 'ai_test_user',
      password: 'password123',
    });
});

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server!.close((error) => (error ? reject(error) : resolve()));
    });
  }

  await mongoose.connection.close();
});

describe('POST /ai/complete', () => {
  test('returns text containing the seeded keyword', async () => {
    const loginRes = await request(app)
      .post('/login')
      .send({
        username: 'ai_test_user',
        password: 'password123',
      });

    expect(loginRes.status).toBe(200);

    const res = await request(app)
      .post('/ai/complete')
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .send({
        prompt: `Find a note that mentions ${AI_KEYWORD} and tell me what identifier my project uses.`,
      });

    if (res.status !== 200) {
      console.error('AI error response:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.text).toContain(AI_KEYWORD);
  }, 120000);
});
