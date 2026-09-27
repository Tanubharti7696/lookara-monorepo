// apps/owner-portal/src/components/StatementModal/StatementModal.tsx
import { useOwner } from '../../context/OwnerContext';
import { useToast } from '../../context/ToastContext';
import './StatementModal.css';

interface StatementModalProps {
  statementKey: string | null;
  onClose: () => void;
}

export default function StatementModal({ statementKey, onClose }: StatementModalProps) {
  const { statements } = useOwner();
  const { showToast } = useToast();

  const statement = statementKey ? statements[statementKey] : null;
  const isOpen = Boolean(statement);

  return (
    <>
      <div className={`overlay${isOpen ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <div
        className={`sm-modal${isOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Statement"
      >
        {statement && (
          <>
            <div className="sm-hdr">
              <div>
                <div className="sm-title">{statement.title}</div>
                <div className="sm-sub">{statement.sub}</div>
              </div>
              <button type="button" className="sm-close" onClick={onClose} aria-label="Close">✕</button>
            </div>

            <div className="sm-body">
              {statement.sections.map((section) => (
                <div key={section.heading}>
                  <div className="sm-section-heading">{section.heading}</div>
                  <div className="sm-section-panel">
                    {section.rows.map((row) => (
                      <div
                        key={row.label}
                        className={`sm-row${row.bold ? ' total' : ''}`}
                      >
                        <span className="sm-lbl">{row.label}</span>
                        <span
                          className={`sm-val${row.gold ? ' gold' : ''}${row.red ? ' red' : ''}`}
                          style={row.bold ? { fontWeight: 700 } : undefined}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {statement.isFinal && (
                <div className="sm-actions">
                  <button
                    type="button"
                    className="stmt-btn primary"
                    onClick={() => {
                      showToast(`Downloading ${statement.title} PDF…`, 'success');
                      onClose();
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 1v9M5 7l3 3 3-3M2 12v2a1 1 0 001 1h10a1 1 0 001-1v-2" />
                    </svg>
                    Download PDF
                  </button>
                  <button
                    type="button"
                    className="stmt-btn"
                    onClick={() => {
                      showToast('Exporting CSV…', 'success');
                      onClose();
                    }}
                  >
                    Export CSV
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
