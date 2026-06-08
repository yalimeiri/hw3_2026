import { useEffect, useState } from 'react';
import './App.css';
import Note from './components/Note';
import Pagination from './components/Pagination';
import AddNote from './components/AddNote';
import { useNotes } from './contexts/NotesContext';
import axios from 'axios';

const NOTES_URL = 'http://localhost:3001/notes';
const POSTS_PER_PAGE = 10;

function App() {
  const { state, dispatch } = useNotes();
  const { notes, currentPage, totalPages, notification } = state;
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    axios.get(NOTES_URL, {
      params: {
        _page: currentPage,
        _per_page: POSTS_PER_PAGE
      }
    })
    .then(response => {
      const totalItems = response.headers['x-total-count'];
      const total = Math.ceil(Number(totalItems) / POSTS_PER_PAGE);
      dispatch({
        type: 'SET_NOTES',
        payload: {
          notes: response.data,
          totalPages: total
        }
      });
    })
    .catch(error => console.error('Encountered an error:', error));
  }, [currentPage, refresh]);
  useEffect(() => {
    if (notification !== 'Notification area') {
       setTimeout(() => {
        dispatch({ type: 'SET_NOTIFICATION', payload: null });
      }, 3000);
    }
  }, [notification]);

  const triggerRefresh = () => {
    setRefresh(prev => prev + 1);
  };

  const handlePageChange = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  return (
    <div>
      {notification && notification !== 'Notification area' && (
  <div className="notification">{notification}</div>
)}
      <AddNote onSuccess={triggerRefresh} />
      {notes.map(note => (
        <Note key={note._id} note={note} onSuccess={triggerRefresh}/>
      ))}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default App;