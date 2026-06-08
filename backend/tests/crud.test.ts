import request from 'supertest';
import app from '../expressApp';
import connectDB from '../config/db';
import mongoose from 'mongoose';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('CRUD operations', () => {
  let createdId: string;
  let token: string;

  beforeAll(async () => {
    await request(app)
      .post('/users')
      .send({
        name: 'Crud Tester',
        email: 'crud@test.com',
        username: 'crud_test_user',
        password: 'password123',
      });

    const loginRes = await request(app)
      .post('/login')
      .send({
        username: 'crud_test_user',
        password: 'password123',
      });

    token = loginRes.body.token;
  });

  // CREATE
  test('should create a new note', async () => {
    const res = await request(app)
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Jest Test Note',
        content: 'Created by jest test',
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Jest Test Note');
    createdId = res.body._id;
  });

  // READ
  test('should get the created note by id', async () => {
    const res = await request(app).get(`/notes/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(createdId);
  });

  // UPDATE
  test('should update the note', async () => {
    const res = await request(app)
      .put(`/notes/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title', content: 'Updated content' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  // DELETE
  test('should delete the note', async () => {
    const res = await request(app)
      .delete(`/notes/${createdId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});