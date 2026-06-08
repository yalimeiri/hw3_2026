import { useState } from 'react';
import { useNotes } from '../contexts/NotesContext';
import axios from 'axios';

const NOTES_URL = 'http://localhost:3001/notes';

interface AddNoteProps {
  onSuccess: () => void;
}

const AddNote = ({ onSuccess }: AddNoteProps) => {
  const { dispatch } = useNotes();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleSave = async () => {
    if (!newContent) return;
    await axios.post(NOTES_URL, {
      title: newTitle || 'New Note',
      content: newContent,
      author: newAuthor ? { name: newAuthor, email: '' } : null
    });
    dispatch({ type: 'SET_NOTIFICATION', payload: 'Added a new note' });
    setNewTitle('');
    setNewAuthor('');
    setNewContent('');
    setIsAdding(false);
    onSuccess();
  };

  const handleCancel = () => {
    setNewTitle('');
    setNewAuthor('');
    setNewContent('');
    setIsAdding(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
      {isAdding ? (
        <div className="add-note-form">
          <h3>Create a New Note</h3>
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Author"
            value={newAuthor}
            onChange={e => setNewAuthor(e.target.value)}
          />
          <textarea
            placeholder="Content"
            value={newContent}
            name="text_input_new_note"
            onChange={e => setNewContent(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button className="neon-btn" name="text_input_save_new_note" onClick={handleSave}>
              <p>Save</p>
            </button>
            <button className="neon-btn" name="text_input_cancel_new_note" onClick={handleCancel}>
              <p>Cancel</p>
            </button>
          </div>
        </div>
      ) : (
        <button className="neon-btn" name="add_new_note" onClick={() => setIsAdding(true)}>
          <p>Add New Note</p>
        </button>
      )}
    </div>
  );
};

export default AddNote;