import request from 'supertest';
import app from '../expressApp';
import connectDB from '../config/db';
import Note from '../models/Note';
import mongoose from 'mongoose';

const FILTER_KEYWORD = 'filter-test-keyword-xyz789';

beforeAll(async () => {
  await connectDB();
  await Note.create({
    title: 'Filter test note',
    content: `Important note content containing ${FILTER_KEYWORD} for search.`,
    author: { name: 'Filter Tester', email: 'filter@test.com' },
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('GET /notes/filter', () => {
  test('returns notes matching the query substring', async () => {
    const res = await request(app).get(`/notes/filter?query=${FILTER_KEYWORD}`);

    expect(res.status).toBe(200);
    expect(res.headers['x-total-count']).toBeDefined();
    expect(Array.isArray(res.body)).toBe(true);
    expect(
      res.body.some((note: { content: string }) => note.content.includes(FILTER_KEYWORD)),
    ).toBe(true);
  });

  test('returns 400 when query is missing', async () => {
    const res = await request(app).get('/notes/filter');

    expect(res.status).toBe(400);
  });
});
