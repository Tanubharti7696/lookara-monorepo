// src/views/tasks/drawer/tabs/ActionTab.jsx
import { useState } from 'react';
import StatePanel from './StatePanel';
import { useTaskActions } from '../useTaskActions';

export default function ActionTab({ task, onUpdate, openOverlay }) {
  const [noteText, setNoteText] = useState('');
  const actions = useTaskActions(task, onUpdate);

  const submitNote = () => {
    if (!noteText.trim()) return;
    actions.addNote(noteText);
    setNoteText('');
  };

  const notes = (task.timeline || []).filter(e => e.type === 'note');

  return (
    <div>
      <StatePanel task={task} onUpdate={onUpdate} openOverlay={openOverlay} actions={actions} />

      {/* PM Note input */}
      <div className="lk-notes__input-wrap">
        <textarea
          className="lk-notes__textarea"
          placeholder="Add a PM note… (visible to PM team only)"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
        <div className="lk-notes__footer">
          <button className="lk-btn lk-btn--primary" onClick={submitNote} type="button">
            Add Note
          </button>
        </div>
      </div>

      <div className="lk-block">
        <div className="lk-block__title">PM Notes</div>
        {notes.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--slate)' }}>No notes yet.</div>
        ) : (
          notes.slice().reverse().map((n, i) => (
            <div key={i} className="lk-notes__item">
              <div className="lk-notes__item-head">
                <span className="lk-notes__author">{n.actor || 'PM'}</span>
                <span className="lk-notes__time">{n.ts}</span>
              </div>
              <div className="lk-notes__text">{n.label.replace(/^PM note:\s*/i, '')}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}