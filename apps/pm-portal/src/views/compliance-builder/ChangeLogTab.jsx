// src/views/compliance-builder/ChangeLogTab.jsx
export default function ChangeLogTab({ entries }) {
  return (
    <div className="ctb-tab-pane">
      <div className="ctb-tab-pane__title" style={{ fontSize: 16 }}>Change Log</div>
      <div className="ctb-tab-pane__sub" style={{ marginBottom: 24 }}>
        Full audit trail of every change to this template.
      </div>

      {entries.map((e, i) => (
        <div key={i} className="ctb-changelog-item">
          <div className="ctb-changelog-icon">{e.icon}</div>
          <div style={{ flex: 1, paddingTop: 2 }}>
            <div className="ctb-changelog-title">{e.title}</div>
            <div className="ctb-changelog-detail">{e.detail}</div>
            <div className="ctb-changelog-meta">{e.user} · {e.date}</div>
          </div>
        </div>
      ))}
    </div>
  );
}