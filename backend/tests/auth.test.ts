import request from 'supertest';
import app from '../expressApp';
import connectDB from '../config/db';
import User from '../models/User';
import mongoose from 'mongoose';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication', () => {
  const username = `auth_user_${Date.now()}`;

  test('POST /users creates a new user and persists it', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        name: 'Auth Test User',
        email: 'auth@test.com',
        username,
        password: 'password123',
      });

    expect(res.status).toBe(201);
    expect(res.body.username).toBe(username);
    expect(res.body.passwordHash).toBeUndefined();

    const userInDb = await User.findOne({ username });
    expect(userInDb).not.toBeNull();
    expect(userInDb?.name).toBe('Auth Test User');
    expect(userInDb?.email).toBe('auth@test.com');
  });

  test('POST /login returns a signed token for valid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        username,
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(0);
  });
});
