import { useState } from 'react';
import { useNotes } from '../contexts/NotesContext';
import type { Note as NoteType } from '../types';
import axios from 'axios';

const NOTES_URL = 'http://localhost:3001/notes';
interface NoteProps {
  note: NoteType;
  onSuccess: () => void;
}

const Note = ({ note, onSuccess }: NoteProps) => {
  const { _id, title, author, content } = note;
  const { dispatch } = useNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editAuthorName, setEditAuthorName] = useState(author?.name ?? '');
  const [editContent, setEditContent] = useState(content);

  const resetEditFields = () => {
    setEditTitle(title);
    setEditAuthorName(author?.name ?? '');
    setEditContent(content);
  };

  const handleDelete = async () => {
    await axios.delete(`${NOTES_URL}/${_id}`);
    dispatch({ type: 'SET_NOTIFICATION', payload: 'Note deleted' });
    onSuccess();
  };

  const handleSave = async () => {
    await axios.put(`${NOTES_URL}/${_id}`, {
      title: editTitle,
      content: editContent,
      author: editAuthorName.trim()
        ? { name: editAuthorName.trim(), email: author?.email ?? '' }
        : null,
    });
    dispatch({ type: 'SET_NOTIFICATION', payload: 'Note updated' });
    setIsEditing(false);
    onSuccess();
  };

  const handleCancel = () => {
    resetEditFields();
    setIsEditing(false);
  };

  const startEditing = () => {
    resetEditFields();
    setIsEditing(true);
  };

  return (
    <div className="note" data-testid={_id}>
      <div className="note-body">
        {isEditing ? (
          <>
            <input
              className="note-field"
              type="text"
              aria-label="Title"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
            />
            <input
              className="note-field"
              type="text"
              aria-label="Author"
              value={editAuthorName}
              onChange={e => setEditAuthorName(e.target.value)}
            />
            <textarea
              className="note-field"
              data-testid={`text_input-${_id}`}
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
            />
          </>
        ) : (
          <>
            <h2 className="note-title">{title}</h2>
            <p className="note-author">By {author?.name ?? 'Unknown'}</p>
            <p className="note-content">{content}</p>
          </>
        )}
      </div>
      <div className="note-buttons">
        <button className="neon-btn" data-testid={`delete-${_id}`} onClick={handleDelete}>
          <p>Delete</p>
        </button>
        {isEditing ? (
          <>
            <button className="neon-btn" data-testid={`text_input_save-${_id}`} onClick={handleSave}>
              <p>Save</p>
            </button>
            <button className="neon-btn" data-testid={`text_input_cancel-${_id}`} onClick={handleCancel}>
              <p>Cancel</p>
            </button>
          </>
        ) : (
          <button className="neon-btn" data-testid={`edit-${_id}`} onClick={startEditing}>
            <p>Edit</p>
          </button>
        )}
      </div>
    </div>
  );
};

export default Note;
