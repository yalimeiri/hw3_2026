import { useState } from 'react';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import type { Note as NoteType } from '../types';
import api, { NOTES_URL } from '../utils/api';
import { sanitizeHtml } from '../utils/sanitizeHtml';

interface NoteProps {
  note: NoteType;
  onSuccess: () => void;
  sanitize: boolean;
}

const Note = ({ note, onSuccess, sanitize }: NoteProps) => {
  const { _id, title, author, content } = note;
  const { dispatch } = useNotes();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content);

  const canModify = user !== null && author?.email === user.email;

  // The note body is rendered as HTML so formatting tags (<b>, <i>, <ul>, ...)
  // are honored. When `sanitize` is on we scrub the HTML first; when it is off
  // we inject the raw content and any embedded payload runs. This single
  // dangerouslySetInnerHTML call is the entire XSS attack surface.
  const renderedContent = sanitize ? sanitizeHtml(content) : content;

  const resetEditFields = () => {
    setEditTitle(title);
    setEditContent(content);
  };

  const handleDelete = async () => {
    await api.delete(`${NOTES_URL}/${_id}`);
    dispatch({ type: 'SET_NOTIFICATION', payload: 'Note deleted' });
    onSuccess();
  };

  const handleSave = async () => {
    await api.put(`${NOTES_URL}/${_id}`, {
      title: editTitle,
      content: editContent,
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
              onChange={(event) => setEditTitle(event.target.value)}
            />
            <textarea
              className="note-field"
              data-testid={`text_input-${_id}`}
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
            />
          </>
        ) : (
          <>
            <h2 className="note-title">{title}</h2>
            <p className="note-author">By {author?.name ?? 'Unknown'}</p>
            <div
              className="note-content"
              data-testid="note_body"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          </>
        )}
      </div>
      {canModify && (
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
      )}
    </div>
  );
};

export default Note;
