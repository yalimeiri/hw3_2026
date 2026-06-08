import { Request, Response } from 'express';
import * as noteService from '../services/noteService';

export const getAllNotes = async (req: Request, res: Response) => {
  const { notes, count } = await noteService.getAllNotes(req.query);
  res.set('X-Total-Count', String(count));
  res.status(200).json(notes);
};

export const getNoteById = async (req: Request, res: Response) => {
  const note = await noteService.getNoteById(req.params.id as string);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.status(200).json(note);
};

export const getNoteByIndex = async (req: Request, res: Response) => {
  const index = Number(req.params.i);
  const note = await noteService.getNoteByIndex(index);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.status(200).json(note);
};

export const createNote = async (req: Request, res: Response) => {
  const { title, content, author } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }
  const note = await noteService.createNote({ title, content, author });
  res.status(201).json(note);
};

export const updateNoteById = async (req: Request, res: Response) => {
  const { title, content, author } = req.body;
  if (!title && !content && !author) {
    res.status(400).json({ error: 'At least one field is required' });
    return;
  }
  const note = await noteService.updateNoteById(req.params.id as string, req.body);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.status(200).json(note);
};

export const updateNoteByIndex = async (req: Request, res: Response) => {
  const { title, content, author } = req.body;
  if (!title && !content && !author) {
    res.status(400).json({ error: 'At least one field is required' });
    return;
  }
  const index = Number(req.params.i);
  const note = await noteService.updateNoteByIndex(index, req.body);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.status(200).json(note);
};

export const deleteNoteById = async (req: Request, res: Response) => {
  const note = await noteService.deleteNoteById(req.params.id as string);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.status(204).send();
};

export const deleteNoteByIndex = async (req: Request, res: Response) => {
  const index = Number(req.params.i);
  const note = await noteService.deleteNoteByIndex(index);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.status(204).send();
};