// src/views/reports/reportExport.js
import { REPORT_DATA } from '../../data/reports.jsx';

const escCSV = (v) => {
  const s = String(v ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? '"' + s.replace(/"/g, '""') + '"'
    : s;
};

export function generateReport({ type, range, format, onToast }) {
  const data = REPORT_DATA[type];
  if (!data) {
    onToast?.('Report type not found', 'error');
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const slug = type.toLowerCase().replace(/\s+/g, '-');

  if (format === 'csv') return exportCsv({ data, type, range, slug, now, onToast });
  return exportPdf({ data, type, range, slug, dateStr, timeStr, onToast });
}

/* ────────── CSV ────────── */
function exportCsv({ data, type, slug, now, onToast }) {
  const headers = ['Date', 'Severity', 'Event', 'Property', 'Actor', 'Result'];
  const rows = data.events.map(e =>
    [e.date, e.sev, e.event, e.property, e.actor, e.result].map(escCSV).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lookara-${slug}-${now.toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  onToast?.(`CSV downloaded — ${type} · ${data.events.length} events`, 'success');
}

/* ────────── PDF (print-ready HTML in new window) ────────── */
function exportPdf({ data, type, range, dateStr, timeStr, onToast }) {
  const kpiHtml = data.kpis.map(k => `
    <div style="flex:1;padding:14px 16px;border:1px solid #e5e7eb;border-radius:8px;min-width:120px;">
      <div style="font-size:22px;font-weight:800;color:#111827;line-height:1;margin-bottom:4px;">${k.val}</div>
      <div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px;">${k.label}</div>
      <div style="font-size:11px;font-weight:600;color:${k.deltaColor};">${k.delta}</div>
    </div>`).join('');

  const insightRows = data.insights.map((i, idx) => `
    <tr style="background:${idx % 2 === 0 ? '#f9fafb' : '#fff'};">
      <td style="padding:9px 10px;font-weight:600;">${i.signal}</td>
      <td style="padding:9px 10px;font-weight:800;color:${i.color};">${i.change}</td>
      <td style="padding:9px 10px;color:#6b7280;">${i.detail}</td>
    </tr>`).join('');

  const riskRows = data.risks.map((r, idx) => `
    <tr style="background:${idx % 2 === 0 ? '#f9fafb' : '#fff'};">
      <td style="padding:9px 10px;font-weight:600;color:#111827;">${r.title}</td>
      <td style="padding:9px 10px;color:#6b7280;">${r.location}</td>
      <td style="padding:9px 10px;font-weight:700;color:${r.tColor};">${r.trend}</td>
    </tr>`).join('');

  const sevColor = (s) => s === 'Critical' ? '#DC2626' : s === 'Attention' ? '#F59E0B' : '#6b7280';
  const eventRows = data.events.map((e, idx) => `
    <tr style="background:${idx % 2 === 0 ? '#f9fafb' : '#fff'};">
      <td style="padding:8px 10px;color:#6b7280;font-size:11px;">${e.date}</td>
      <td style="padding:8px 10px;font-weight:700;color:${sevColor(e.sev)};font-size:11px;">${e.sev}</td>
      <td style="padding:8px 10px;font-weight:600;font-size:12px;">${e.event}</td>
      <td style="padding:8px 10px;color:#6b7280;font-size:11px;">${e.property}</td>
      <td style="padding:8px 10px;color:#6b7280;font-size:11px;">${e.actor}</td>
      <td style="padding:8px 10px;font-size:11px;">${e.result}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Lookara — ${type}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:system-ui,-apple-system,sans-serif;color:#111827;background:#fff;}
.cover{min-height:100vh;display:flex;flex-direction:column;justify-content:space-between;padding:60px 64px;background:#0B0D10;color:#fff;page-break-after:always;}
.logo{font-size:26px;font-weight:900;color:#D4AF37;}
.cover-label{font-size:12px;font-weight:700;color:#A6B0BD;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;}
.cover-title{font-size:40px;font-weight:900;color:#fff;margin-bottom:8px;}
.cover-sub{font-size:15px;color:#A6B0BD;margin-bottom:40px;}
.kpi-strip{display:flex;gap:12px;flex-wrap:wrap;}
.cover-footer{font-size:12px;color:#6b7280;display:flex;justify-content:space-between;}
.body{padding:48px 56px;}
.sec{margin-bottom:32px;}
.sec-label{font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #f3f4f6;}
table{width:100%;border-collapse:collapse;}
th{padding:9px 10px;text-align:left;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #e5e7eb;}
.footer{margin-top:40px;padding-top:14px;border-top:1px solid #e5e7eb;font-size:10px;color:#9ca3af;display:flex;justify-content:space-between;}
.conf{display:inline-block;padding:2px 7px;background:#fef3c7;color:#92400e;border-radius:3px;font-size:9px;font-weight:800;text-transform:uppercase;}
@media print{.cover{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style></head><body>

<div class="cover">
  <div class="logo">Lookara</div>
  <div>
    <div class="cover-label">PM Portal · Operational Intelligence</div>
    <div class="cover-title">${type}</div>
    <div class="cover-sub">${range} · Generated ${dateStr} · ${timeStr}</div>
    <div class="kpi-strip">${kpiHtml}</div>
  </div>
  <div class="cover-footer">
    <span>Lookara PM Portal · Confidential</span>
    <span>Sarah Chen · ${dateStr}</span>
  </div>
</div>

<div class="body">
  <div class="sec">
    <div class="sec-label">Key Insights</div>
    <table><thead><tr><th>Signal</th><th>Change</th><th>Detail</th></tr></thead>
    <tbody>${insightRows}</tbody></table>
  </div>

  <div class="sec">
    <div class="sec-label">Top Risks</div>
    <table><thead><tr><th>Risk</th><th>Location</th><th>Trend</th></tr></thead>
    <tbody>${riskRows}</tbody></table>
  </div>

  <div class="sec">
    <div class="sec-label">Event Log — ${data.events.length} events · ${range}</div>
    <table><thead><tr><th>Date</th><th>Severity</th><th>Event</th><th>Property</th><th>Actor</th><th>Result</th></tr></thead>
    <tbody>${eventRows}</tbody></table>
  </div>

  <div class="footer">
    <span><span class="conf">Confidential</span> · Lookara Operational Intelligence · ${type}</span>
    <span>Generated ${dateStr} · ${timeStr}</span>
  </div>
</div>
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) {
    onToast?.('Allow pop-ups to open the report', 'error');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
  onToast?.(`PDF ready — ${type} · ${data.events.length} events`, 'success');
}