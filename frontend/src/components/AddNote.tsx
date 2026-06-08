import { useState } from 'react';
import { useNotes } from '../contexts/NotesContext';
import api, { NOTES_URL } from '../utils/api';

interface AddNoteProps {
  onSuccess: () => void;
}

const AddNote = ({ onSuccess }: AddNoteProps) => {
  const { dispatch } = useNotes();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSave = async () => {
    if (!newContent) {
      return;
    }

    await api.post(NOTES_URL, {
      title: newTitle || 'New Note',
      content: newContent,
    });

    dispatch({ type: 'SET_NOTIFICATION', payload: 'Added a new note' });
    setNewTitle('');
    setNewContent('');
    setShowAiPrompt(false);
    setAiPrompt('');
    setIsAdding(false);
    onSuccess();
  };

  const handleCancel = () => {
    setNewTitle('');
    setNewContent('');
    setShowAiPrompt(false);
    setAiPrompt('');
    setIsAdding(false);
  };

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      return;
    }

    setIsGenerating(true);

    try {
      const response = await api.post('/ai/complete', { prompt: aiPrompt });
      setNewContent((previous) => `${previous}${response.data.text}`);
    } catch (error) {
      console.error('AI generation failed:', error);
      dispatch({ type: 'SET_NOTIFICATION', payload: 'AI generation failed' });
    } finally {
      setIsGenerating(false);
    }
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
            onChange={(event) => setNewTitle(event.target.value)}
          />
          <div className="note-content-row">
            <textarea
              placeholder="Content"
              value={newContent}
              name="text_input_new_note"
              onChange={(event) => setNewContent(event.target.value)}
            />
            <button
              type="button"
              className="neon-btn ai-star-btn"
              data-testid="help_me_write"
              onClick={() => setShowAiPrompt((previous) => !previous)}
            >
              ★
            </button>
          </div>
          {showAiPrompt && (
            <div className="ai-prompt-row">
              <input
                data-testid="help_me_write_prompt"
                type="text"
                placeholder="Ask the AI assistant..."
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
              />
              <button
                data-testid="help_me_write_submit"
                className="neon-btn"
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                Generate
              </button>
            </div>
          )}
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
