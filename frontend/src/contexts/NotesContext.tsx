import { createContext, useContext, useReducer, type ReactNode } from 'react';
import notesReducer, { type Action, initialState } from './notesReducer';
import type { NotesState } from '../types';

interface NotesContextType {
  state: NotesState;
  dispatch: React.Dispatch<Action>;
}

const NotesContext = createContext<NotesContextType | null>(null);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  return (
    <NotesContext.Provider value={{ state, dispatch }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};