import { Router } from 'express';
import { createNote, updateNote, deleteNote, getNoteById, getNotes } from '../controllers/note.controller.js';

const noteRouter = Router();

noteRouter.get('/', getNotes);
noteRouter.get('/:id', getNoteById);
noteRouter.post('/create', createNote);
noteRouter.put('/:id', updateNote);
noteRouter.delete('/:id', deleteNote);

export default noteRouter;