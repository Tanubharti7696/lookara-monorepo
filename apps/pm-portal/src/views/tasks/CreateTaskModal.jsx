// src/views/tasks/CreateTaskModal.jsx
import { apiFetch } from '../../utils/api';
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';

const TRADES = [
  'Plumbing', 'Electrical', 'HVAC', 'Pool & Water Systems', 'Cleaning',
  'Landscaping', 'Handyman / General Repair', 'Carpentry', 'Painting',
  'Flooring', 'Roofing', 'Locksmith & Access', 'Appliance Repair',
  'Pest Control', 'Technology & Smart Home', 'Fire & Life Safety',
  'Security Systems', 'Pressure Washing', 'Waste Removal',
];

export default function CreateTaskModal({ open, mode = 'task', onClose, onCreate }) {
  const [form, setForm] = useState({});
  const [properties, setProperties] = useState([]);

  // Fetch properties for the dropdown
  useEffect(() => {
    if (open) {
      setForm({ severity: mode === 'incident' ? 'critical' : 'medium' });
      apiFetch(`/api/v1/properties`)
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            setProperties(data.data.map(p => ({
              id: p.id,
              label: `${p.name || p.address_line_1} · ${p.city || 'Unknown'}`
            })));
          }
        })
        .catch(console.error);
    }
  }, [open, mode]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    const defaultPropertyId = properties.length > 0 ? properties[0].id : null;
    const defaultTrade = TRADES[0];

    onCreate?.({
      mode,
      title: form.title || '',
      propertyId: form.propertyId || defaultPropertyId,
      trade: form.trade || defaultTrade,
      unit: form.unit || '',
      severity: form.severity || (mode === 'incident' ? 'critical' : 'medium'),
      issue: form.issue || (mode === 'incident' ? 'Emergency Incident' : ''),
      description: form.description || '',
      cost: form.cost || '0.00',
    });
    onClose?.();
  };

  const title = mode === 'incident' ? 'Report Incident' : 'Create Task';
  const sub   = mode === 'incident'
    ? 'Select a case type — the form adapts to your selection'
    : 'Planned operational work · Repair · Inspection · Service';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      sub={sub}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit}>
            {mode === 'incident' ? 'Report Incident' : 'Create Task'}
          </button>
        </>
      }
    >
      <div className="ct-form">
        {/* Task Title / Name */}
        <div className="ct-field">
          <label className="ct-label">Task Name / Title <span className="ct-req">*</span></label>
          <input
            className="ct-input"
            type="text"
            placeholder="e.g. Repair Leaking Sink, AC Maintenance..."
            value={form.title || ''}
            onChange={(e) => setField('title', e.target.value)}
          />
        </div>

        {/* Universal: Property + Unit */}
        <div className="ct-row ct-row--2">
          <div className="ct-field">
            <label className="ct-label">Property <span className="ct-req">*</span></label>
            <select
              className="ct-input"
              value={form.propertyId || ''}
              onChange={(e) => setField('propertyId', e.target.value)}
            >
              <option value="">Select property…</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div className="ct-field">
            <label className="ct-label">Unit / Room</label>
            <input
              className="ct-input"
              type="text"
              placeholder="e.g. 4B, Kitchen, Roof"
              value={form.unit || ''}
              onChange={(e) => setField('unit', e.target.value)}
            />
          </div>
        </div>

        {/* Universal: Trade */}
        <div className="ct-field">
          <label className="ct-label">Trade <span className="ct-req">*</span></label>
          <select
            className="ct-input"
            value={form.trade || ''}
            onChange={(e) => setField('trade', e.target.value)}
          >
            <option value="">Select trade…</option>
            {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="ct-hint">Drives vendor eligibility and compliance requirements — can't be left blank.</div>
        </div>

        {/* Severity + Priority */}
        <div className="ct-row ct-row--2">
          <div className="ct-field">
            <label className="ct-label">Severity</label>
            <select
              className="ct-input"
              value={form.severity || 'medium'}
              onChange={(e) => setField('severity', e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {mode === 'incident' && (
            <div className="ct-field">
              <label className="ct-label">Incident Type</label>
              <select
                className="ct-input"
                value={form.incidentType || ''}
                onChange={(e) => setField('incidentType', e.target.value)}
              >
                <option value="">Select type…</option>
                <option>Emergency</option>
                <option>Damage</option>
                <option>Safety Hazard</option>
                <option>Guest Complaint</option>
                <option>Maintenance Failure</option>
                <option>Compliance Issue</option>
              </select>
            </div>
          )}
        </div>

        {/* Incident: specific issue */}
        {mode === 'incident' && (
          <div className="ct-field">
            <label className="ct-label">Specific Issue <span className="ct-req">*</span></label>
            <input
              className="ct-input"
              type="text"
              placeholder="e.g. Water leak, Lock failure, Exposed wiring"
              value={form.issue || ''}
              onChange={(e) => setField('issue', e.target.value)}
            />
          </div>
        )}

        {/* Description */}
        <div className="ct-field">
          <label className="ct-label">Description</label>
          <textarea
            className="ct-input ct-input--textarea"
            rows={3}
            placeholder="Describe the issue, what was observed, or what work is needed…"
            value={form.description || ''}
            onChange={(e) => setField('description', e.target.value)}
          />
        </div>

        {/* Estimated Cost */}
        <div className="ct-field">
          <label className="ct-label">Estimated Cost</label>
          <input
            className="ct-input"
            type="number"
            placeholder="0.00"
            value={form.cost || ''}
            onChange={(e) => setField('cost', e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}