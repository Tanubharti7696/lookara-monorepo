import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import PageHeader from '../components/PageHeader';
import './IncidentsView.css';

export default function IncidentsView({ onToast }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.data || []);
      }
    } catch (e) {
      console.error(e);
      onToast?.('Failed to load incidents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const resolveIncident = async (id) => {
    try {
      const res = await apiFetch(`/api/v1/incidents/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'resolved' })
      });
      if (res.ok) {
        onToast?.('Incident resolved', 'success');
        loadIncidents();
      }
    } catch (e) {
      onToast?.('Error resolving incident', 'error');
    }
  };

  return (
    <div className="incidents-view" style={{ padding: '24px' }}>
      <PageHeader title="Incidents" />
      
      {loading ? (
        <div style={{ marginTop: '24px' }}>Loading incidents...</div>
      ) : incidents.length === 0 ? (
        <div style={{ marginTop: '24px', color: 'var(--text-muted)' }}>No incidents found.</div>
      ) : (
        <div className="incidents-list" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {incidents.map(inc => (
            <div key={inc.id} style={{
              background: '#1E293B', padding: '16px', borderRadius: '8px',
              border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{inc.title}</h3>
                <p style={{ margin: '0 0 8px 0', color: '#94A3B8' }}>{inc.description}</p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748B' }}>
                  <span>Property: {inc.propertyName || 'N/A'}</span>
                  <span>Reported by: {inc.reportedBy}</span>
                  <span style={{ 
                    color: inc.severity === 'critical' ? '#EF4444' : 
                           inc.severity === 'high' ? '#F97316' : 
                           inc.severity === 'medium' ? '#EAB308' : '#3B82F6' 
                  }}>Severity: {inc.severity}</span>
                </div>
              </div>
              <div>
                {inc.status === 'open' ? (
                  <button 
                    style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => resolveIncident(inc.id)}
                  >
                    Resolve
                  </button>
                ) : (
                  <span style={{ color: '#22C55E', fontWeight: 'bold', textTransform: 'capitalize' }}>{inc.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
