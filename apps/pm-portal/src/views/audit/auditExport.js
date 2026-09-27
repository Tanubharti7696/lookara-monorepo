// src/views/audit/auditExport.js

const escCSV = (v) => {
  const s = String(v == null ? '' : v);
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? '"' + s.replace(/"/g, '""') + '"'
    : s;
};

/* ────────── CSV export ────────── */
export function exportCSV(events, onToast) {
  const headers = [
    'Event ID', 'Date', 'Age', 'Severity', 'Title',
    'Property', 'Actor', 'Domain', 'Action', 'Object', 'Result', 'Ledger Hash',
  ];
  const rows = events.map(ev => [
    ev.id, ev.date, ev.age, ev.sev.toUpperCase(),
    ev.title, ev.prop, ev.actor, ev.domain,
    ev.tech.action, ev.tech.object, ev.tech.result, ev.tech.hash,
  ].map(escCSV).join(','));

  const csv = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lookara-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  onToast?.(`CSV downloaded — ${events.length} event${events.length !== 1 ? 's' : ''}`, 'success');
}

/* ────────── PDF: audit report (cover + event table) ────────── */
export function exportPDFReport(events, onToast) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const critical  = events.filter(e => e.sev === 'critical').length;
  const attention = events.filter(e => e.sev === 'attention').length;
  const info      = events.filter(e => e.sev === 'info').length;

  const sevBadge = (sev) =>
    sev === 'critical' ? '<span style="color:#DC2626;font-weight:700;">● Critical</span>'
    : sev === 'attention' ? '<span style="color:#F59E0B;font-weight:700;">● Attention</span>'
    : '<span style="color:#6b7280;">● Info</span>';

  const tableRows = events.map((ev, i) => `
    <tr style="background:${i % 2 === 0 ? '#f9fafb' : '#ffffff'};">
      <td>${ev.id}</td>
      <td>${ev.date}</td>
      <td>${sevBadge(ev.sev)}</td>
      <td><strong>${ev.title}</strong><br><span style="color:#6b7280;font-size:11px;">${ev.tech.object}</span></td>
      <td>${ev.prop}</td>
      <td>${ev.actor}</td>
      <td>${ev.tech.result}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Lookara Audit Report — ${dateStr}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:system-ui,-apple-system,sans-serif;color:#111827;background:#fff;}
.cover{min-height:100vh;display:flex;flex-direction:column;justify-content:space-between;padding:60px 64px;background:#0B0D10;color:#fff;page-break-after:always;}
.cover-logo{font-size:28px;font-weight:900;color:#D4AF37;letter-spacing:-0.5px;}
.cover-center{flex:1;display:flex;flex-direction:column;justify-content:center;}
.cover-label{font-size:12px;font-weight:700;color:#A6B0BD;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;}
.cover-title{font-size:42px;font-weight:900;color:#fff;line-height:1.15;margin-bottom:10px;}
.cover-sub{font-size:16px;color:#A6B0BD;margin-bottom:40px;}
.cover-stats{display:flex;gap:32px;}
.cover-stat-num{font-size:36px;font-weight:800;line-height:1;margin-bottom:4px;}
.cover-stat-label{font-size:11px;font-weight:600;color:#A6B0BD;text-transform:uppercase;letter-spacing:0.5px;}
.cover-footer{font-size:12px;color:#4b5563;display:flex;justify-content:space-between;}
.report{padding:48px 56px;}
.section-title{font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #f3f4f6;}
.summary-strip{display:flex;gap:16px;margin-bottom:40px;}
.sum-card{flex:1;padding:16px 20px;border-radius:8px;border:1px solid #e5e7eb;}
.sum-num{font-size:28px;font-weight:800;margin-bottom:4px;}
.sum-label{font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.4px;}
.sum-total .sum-num{color:#111827;}
.sum-critical .sum-num{color:#DC2626;}
.sum-attention .sum-num{color:#F59E0B;}
.sum-info .sum-num{color:#6b7280;}
table{width:100%;border-collapse:collapse;font-size:12px;}
thead tr{background:#f9fafb;}
th{padding:10px 12px;text-align:left;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e5e7eb;}
td{padding:10px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;font-size:12px;}
tr:last-child td{border-bottom:none;}
.report-footer{margin-top:48px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;display:flex;justify-content:space-between;}
.confidential{display:inline-block;padding:2px 8px;background:#fef3c7;color:#92400e;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;}
@media print{.cover{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.sum-card{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style></head><body>

<div class="cover">
  <div class="cover-logo">Lookara</div>
  <div class="cover-center">
    <div class="cover-label">PM Portal · Audit History</div>
    <div class="cover-title">Audit Report</div>
    <div class="cover-sub">${dateStr} · Generated ${timeStr}</div>
    <div class="cover-stats">
      <div><div class="cover-stat-num" style="color:#fff;">${events.length}</div><div class="cover-stat-label">Total Events</div></div>
      <div><div class="cover-stat-num" style="color:#DC2626;">${critical}</div><div class="cover-stat-label">Critical</div></div>
      <div><div class="cover-stat-num" style="color:#F59E0B;">${attention}</div><div class="cover-stat-label">Attention</div></div>
      <div><div class="cover-stat-num" style="color:#A6B0BD;">${info}</div><div class="cover-stat-label">Info</div></div>
    </div>
  </div>
  <div class="cover-footer">
    <span>Lookara PM Portal · Confidential</span>
    <span>Sarah Chen · ${dateStr}</span>
  </div>
</div>

<div class="report">
  <div class="section-title">Summary</div>
  <div class="summary-strip">
    <div class="sum-card sum-total"><div class="sum-num">${events.length}</div><div class="sum-label">Total Events</div></div>
    <div class="sum-card sum-critical"><div class="sum-num">${critical}</div><div class="sum-label">Critical</div></div>
    <div class="sum-card sum-attention"><div class="sum-num">${attention}</div><div class="sum-label">Attention</div></div>
    <div class="sum-card sum-info"><div class="sum-num">${info}</div><div class="sum-label">Info</div></div>
  </div>

  <div class="section-title">Event Log</div>
  <table>
    <thead><tr>
      <th>Event ID</th><th>Date</th><th>Severity</th><th>Event</th>
      <th>Property</th><th>Actor</th><th>Result</th>
    </tr></thead>
    <tbody>${tableRows}</tbody>
  </table>

  <div class="report-footer">
    <span><span class="confidential">Confidential</span> · Lookara Audit Log · Immutable Record</span>
    <span>Generated ${dateStr} · ${timeStr}</span>
  </div>
</div>
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) { onToast?.('Allow pop-ups to open the PDF report', 'error'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
  onToast?.(`PDF report ready — ${events.length} events`, 'success');
}

/* ────────── PDF: single event record ────────── */
export function exportEventPDF(ev, onToast) {
  if (!ev) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const sevColor = ev.sev === 'critical' ? '#DC2626' : ev.sev === 'attention' ? '#F59E0B' : '#6b7280';
  const sevLabel = ev.sev === 'critical' ? 'CRITICAL' : ev.sev === 'attention' ? 'ATTENTION' : 'INFO';

  const fieldsHtml = (ev.fields || []).map(f => {
    const c = f.flag === 'bad' ? '#DC2626' : f.flag === 'good' ? '#16a34a' : f.flag === 'warn' ? '#F59E0B' : '#111827';
    return `<tr><td style="color:#6b7280;font-weight:600;width:160px;">${f.label}</td><td style="color:${c};font-weight:700;">${f.val}</td></tr>`;
  }).join('');

  const tlHtml = (ev.timeline || []).map(t => {
    const c = t.sev === 'critical' ? '#DC2626' : t.sev === 'attention' ? '#F59E0B' : '#9ca3af';
    return `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;width:16px;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c};margin-top:3px;"></span>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">
        <div style="font-weight:600;font-size:13px;color:#111827;">${t.action}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:2px;">${t.meta}</div>
      </td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Event Record — ${ev.id}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:system-ui,-apple-system,sans-serif;color:#111827;background:#fff;padding:48px 56px;max-width:800px;margin:0 auto;}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;padding-bottom:24px;border-bottom:3px solid #0B0D10;}
.logo{font-size:20px;font-weight:900;color:#0B0D10;letter-spacing:-0.3px;}
.header-right{text-align:right;font-size:11px;color:#6b7280;}
.sev-pill{display:inline-block;padding:3px 10px;border-radius:4px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;}
.event-title{font-size:22px;font-weight:800;color:#111827;line-height:1.3;margin-bottom:6px;}
.event-sub{font-size:13px;color:#6b7280;}
.section{margin-bottom:28px;}
.section-label{font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #f3f4f6;}
table{width:100%;border-collapse:collapse;font-size:13px;}
td{padding:8px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;}
tr:last-child td{border-bottom:none;}
.tech-table td{font-family:monospace;font-size:11px;}
.hash{font-family:monospace;font-size:11px;background:#f9fafb;padding:6px 10px;border-radius:4px;word-break:break-all;color:#374151;}
.footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:10px;color:#9ca3af;display:flex;justify-content:space-between;}
.immutable{display:inline-block;padding:2px 7px;background:#fef3c7;color:#92400e;border-radius:3px;font-size:9px;font-weight:800;text-transform:uppercase;}
@media print{body{padding:24px 32px;}}
</style></head><body>

<div class="header">
  <div>
    <div class="logo">Lookara</div>
    <div style="font-size:11px;color:#6b7280;margin-top:4px;">PM Portal · Event Record</div>
  </div>
  <div class="header-right">
    <div>${dateStr}</div>
    <div>Generated ${timeStr}</div>
    <div style="margin-top:4px;font-weight:700;color:#111827;">${ev.id}</div>
  </div>
</div>

<div style="margin-bottom:32px;">
  <div class="sev-pill" style="background:${sevColor}18;color:${sevColor};border:1px solid ${sevColor}40;">● ${sevLabel}</div>
  <div class="event-title">${ev.title}</div>
  <div class="event-sub">${ev.prop} · ${ev.actor} · ${ev.date}</div>
</div>

<div class="section">
  <div class="section-label">Event Summary</div>
  <p style="font-size:13px;color:#374151;line-height:1.75;">${ev.headline}</p>
</div>

<div class="section">
  <div class="section-label">Details</div>
  <table><tbody>${fieldsHtml}</tbody></table>
</div>

<div class="section">
  <div class="section-label">Timeline</div>
  <table><tbody>${tlHtml}</tbody></table>
</div>

<div class="section">
  <div class="section-label">Technical Details</div>
  <table class="tech-table"><tbody>
    <tr><td style="color:#6b7280;width:140px;">Event ID</td><td style="font-weight:700;">${ev.id}</td></tr>
    <tr><td style="color:#6b7280;">Actor</td><td>${ev.tech.actor}</td></tr>
    <tr><td style="color:#6b7280;">Action</td><td>${ev.tech.action}</td></tr>
    <tr><td style="color:#6b7280;">Object</td><td>${ev.tech.object}</td></tr>
    <tr><td style="color:#6b7280;">Domain</td><td>${ev.tech.domain}</td></tr>
    <tr><td style="color:#6b7280;">Result</td><td>${ev.tech.result}</td></tr>
  </tbody></table>
  <div style="margin-top:14px;">
    <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Ledger Hash</div>
    <div class="hash">${ev.tech.hash}</div>
  </div>
</div>

<div class="footer">
  <span><span class="immutable">Immutable Record</span> · Lookara Audit Log · Confidential</span>
  <span>Exported by Sarah Chen · ${dateStr}</span>
</div>
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) { onToast?.('Allow pop-ups to export this event', 'error'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
  onToast?.(`Event record ready — ${ev.id}`, 'success');
}