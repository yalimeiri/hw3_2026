import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Note from '../models/Note';

dotenv.config();

const importNotes = async () => {
  await mongoose.connect(process.env.MONGODB_CONNECTION_URL!);
  console.log('Connected to MongoDB');

  const filePath = path.join(__dirname, '../../frontend/data/notes.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  await Note.deleteMany({});
  console.log('Cleared existing notes');

  const transformed = data.notes.map((note: { title: string; content: string; author: string; author_email: string }) => ({
    title: note.title,
    content: note.content,
    author: {
      name: note.author,
      email: note.author_email
    }
  }));

  await Note.insertMany(transformed);
  console.log(`Imported ${transformed.length} notes`);

  await mongoose.connection.close();
};

importNotes();