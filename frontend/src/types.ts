export interface Author {
    name: string;
    email: string;
  }
  
  export interface Note {
    _id: string;
    title: string;
    author: Author | null;
    content: string;
  }
  
  export interface NotesState {
    notes: Note[];
    currentPage: number;
    totalPages: number;
    notification: string;
  }