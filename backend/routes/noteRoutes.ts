import { Router } from 'express';
import * as noteController from '../controllers/noteController';
import auth from '../middlewares/auth';

const router = Router();

// Specific paths must come BEFORE /:id routes
// otherwise Express will treat "filter" / "by-index" as an id
router.get('/filter', noteController.filterNotes);

router.get('/by-index/:i', noteController.getNoteByIndex);
router.put('/by-index/:i', auth, noteController.updateNoteByIndex);
router.delete('/by-index/:i', auth, noteController.deleteNoteByIndex);

router.get('/', noteController.getAllNotes);
router.get('/:id', noteController.getNoteById);
router.post('/', auth, noteController.createNote);
router.put('/:id', auth, noteController.updateNoteById);
router.delete('/:id', auth, noteController.deleteNoteById);

export default router;