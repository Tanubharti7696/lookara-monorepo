// src/views/tasks/TaskActionBar.jsx
import { useEffect, useRef, useState } from 'react';

export default function TaskActionBar({ search, onSearchChange, onCreate }) {
  const [dropOpen, setDropOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const pick = (type) => {
    setDropOpen(false);
    onCreate(type);
  };

  return (
    <div className="tk-action-bar">
      <div className="tk-search-wrap">
        <span className="tk-search-icon">🔍</span>
        <input
          className="tk-search"
          type="text"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="tk-create-wrap" ref={wrapRef}>
        <button className="tk-create-btn" onClick={() => setDropOpen(v => !v)} type="button">
          + Create ▾
        </button>
        {dropOpen && (
          <div className="tk-create-menu">
            <div className="tk-create-menu__label">Create</div>
            <button className="tk-create-option" onClick={() => pick('task')} type="button">
              <span className="tk-create-option__icon">✚</span>
              <span>
                <div className="tk-create-option__title">Create Task</div>
                <div className="tk-create-option__sub">Planned operational work</div>
              </span>
            </button>

            <div className="tk-create-menu__divider" />
            <div className="tk-create-menu__label">Report</div>
            <button className="tk-create-option" onClick={() => pick('incident')} type="button">
              <span className="tk-create-option__icon">🚨</span>
              <span>
                <div className="tk-create-option__title">Report Incident</div>
                <div className="tk-create-option__sub">Unexpected issues & emergencies</div>
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}