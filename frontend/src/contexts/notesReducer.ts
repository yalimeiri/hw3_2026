import type { Note, NotesState } from '../types';

export type Action =
  | { type: 'SET_NOTES'; payload: { notes: Note[]; totalPages: number } }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_NOTIFICATION'; payload: string | null };

export const initialState: NotesState = {
  notes: [],
  currentPage: 1,
  totalPages: 0,
  notification: 'Notification area'
};

const notesReducer = (state: NotesState, action: Action): NotesState => {
  switch (action.type) {
    case 'SET_NOTES':
      return {
        ...state,
        notes: action.payload.notes,
        totalPages: action.payload.totalPages
      };
    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload
      };
    case 'SET_NOTIFICATION':
      return {
        ...state,
        notification: action.payload || ''
      };
    default:
      return state;
  }
};

export default notesReducer;