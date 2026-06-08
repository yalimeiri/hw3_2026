import type { Note, NotesState } from '../types';

export type Action =
  | { type: 'SET_NOTES'; payload: { notes: Note[]; totalPages: number } }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_NOTIFICATION'; payload: string | null }
  | { type: 'CACHE_PAGE'; payload: { page: number; notes: Note[] } }
  | { type: 'SET_CURRENT_NOTES'; payload: Note[] }
  | { type: 'CLEAR_CACHE' };

export const initialState: NotesState = {
  notes: [],
  currentPage: 1,
  totalPages: 0,
  notification: 'Notification area',
  cache: {},
};

const notesReducer = (state: NotesState, action: Action): NotesState => {
  switch (action.type) {
    case 'SET_NOTES':
      return {
        ...state,
        notes: action.payload.notes,
        totalPages: action.payload.totalPages,
      };
    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload,
        notes: state.cache[action.payload] ?? state.notes,
      };
    case 'SET_NOTIFICATION':
      return {
        ...state,
        notification: action.payload || '',
      };
    case 'CACHE_PAGE':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.page]: action.payload.notes,
        },
      };
    case 'SET_CURRENT_NOTES':
      return {
        ...state,
        notes: action.payload,
      };
    case 'CLEAR_CACHE':
      return {
        ...state,
        cache: {},
      };
    default:
      return state;
  }
};

export default notesReducer;
