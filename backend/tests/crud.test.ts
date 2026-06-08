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

  // CREATE
  test('should create a new note', async () => {
    const res = await request(app)
      .post('/notes')
      .send({
        title: 'Jest Test Note',
        content: 'Created by jest test',
        author: { name: 'Tester', email: 'test@test.com' }
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
      .send({ title: 'Updated Title', content: 'Updated content' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  // DELETE
  test('should delete the note', async () => {
    const res = await request(app).delete(`/notes/${createdId}`);
    expect(res.status).toBe(204);
  });
});