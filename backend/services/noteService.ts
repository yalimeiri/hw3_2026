import Note from '../models/Note';
import { POSTS_PER_PAGE } from '../consts';

export const getAllNotes = async (query: Record<string, unknown>) => {
  const page = Number(query._page) || 1;
  const perPage = Number(query._per_page) || POSTS_PER_PAGE;
  const skip = (page - 1) * perPage;

  const [notes, count] = await Promise.all([
    Note.find().sort({ _id: -1 }).skip(skip).limit(perPage),
    Note.countDocuments()
  ]);

  return { notes, count };
};

export const getNoteById = async (id: string) => {
  return await Note.findById(id);
};

export const getNoteByIndex = async (index: number) => {
  const notes = await Note.find().sort({ _id: -1 });
  return notes[index] ?? null;
};

export const createNote = async (data: Record<string, unknown>) => {
  const note = new Note(data);
  return await note.save();
};

export const updateNoteById = async (id: string, data: Record<string, unknown>) => {
  return await Note.findByIdAndUpdate(id, data, { new: true });
};

export const updateNoteByIndex = async (index: number, data: Record<string, unknown>) => {
  const note = await getNoteByIndex(index);
  if (!note) return null;
  return await Note.findByIdAndUpdate(note._id, data, { new: true });
};

export const deleteNoteById = async (id: string) => {
  return await Note.findByIdAndDelete(id);
};

export const deleteNoteByIndex = async (index: number) => {
  const note = await getNoteByIndex(index);
  if (!note) return null;
  return await Note.findByIdAndDelete(note._id);
};