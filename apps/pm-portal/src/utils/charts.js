// src/utils/charts.js

export function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(10, Math.floor(rect.width));
  const h = Math.max(10, Math.floor(rect.height));
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

export function clearCanvas(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
}

function niceNum(range, round) {
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / Math.pow(10, exponent);
  let niceFraction;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exponent);
}

export function makeLinearScale(min, max, ticks = 5) {
  if (min === max) max = min + 1;
  const range = niceNum(max - min, false);
  const step = niceNum(range / (ticks - 1), true);
  const graphMin = Math.floor(min / step) * step;
  const graphMax = Math.ceil(max / step) * step;
  const values = [];
  for (let v = graphMin; v <= graphMax + 0.5 * step; v += step) values.push(v);
  return { min: graphMin, max: graphMax, step, values };
}

export function fmtNumber(v) {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
  if (abs >= 10_000) return (v / 1_000).toFixed(0) + 'k';
  if (abs >= 1_000) return (v / 1_000).toFixed(1) + 'k';
  if (abs >= 100) return v.toFixed(0);
  if (abs >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

/* ── Chart frame with axes, grids, ticks ── */
export function drawChartFrame(ctx, w, h, opt) {
  const padL = opt.padL ?? 44;
  const padR = opt.padR ?? 12;
  const padT = opt.padT ?? 12;
  const padB = opt.padB ?? 22;
  const plot = { x: padL, y: padT, w: w - padL - padR, h: h - padT - padB };

  ctx.save();

  // plot background
  ctx.fillStyle = 'rgba(0,0,0,.10)';
  ctx.fillRect(plot.x, plot.y, plot.w, plot.h);

  // plot border
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1;
  ctx.strokeRect(plot.x, plot.y, plot.w, plot.h);

  // Y grid + labels
  const yScale = opt.yScale;
  ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(166,176,189,.90)';
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  yScale.values.forEach(v => {
    const yy = plot.y + plot.h * (1 - (v - yScale.min) / (yScale.max - yScale.min));
    ctx.beginPath();
    ctx.moveTo(plot.x, yy);
    ctx.lineTo(plot.x + plot.w, yy);
    ctx.stroke();

    const txt = opt.yFmt ? opt.yFmt(v) : fmtNumber(v);
    ctx.fillText(txt, plot.x - 8, yy);

    ctx.beginPath();
    ctx.moveTo(plot.x - 3, yy);
    ctx.lineTo(plot.x, yy);
    ctx.stroke();
  });

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // X ticks
  const xTicks = opt.xTicks ?? 6;
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  for (let i = 0; i <= xTicks; i++) {
    const xx = plot.x + (plot.w * i) / xTicks;
    ctx.beginPath();
    ctx.moveTo(xx, plot.y);
    ctx.lineTo(xx, plot.y + plot.h);
    ctx.stroke();

    if (opt.xLabelsFn) {
      const label = opt.xLabelsFn(i, xTicks);
      if (label) {
        ctx.fillStyle = 'rgba(166,176,189,.80)';
        ctx.fillText(label, xx - 10, plot.y + plot.h + 14);
      }
    }
  }

  // Axis labels
  if (opt.yLabel) {
    ctx.fillStyle = 'rgba(166,176,189,.85)';
    ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(opt.yLabel, plot.x + 6, plot.y + 14);
  }

  ctx.restore();
  return plot;
}

/* ── Draw a solid line series ── */
export function drawLine(ctx, plot, series, yScale, color, opts = {}) {
  const n = series.length;
  const xFor = i => plot.x + plot.w * (i / (n - 1));
  const yFor = v => plot.y + plot.h * (1 - (v - yScale.min) / (yScale.max - yScale.min));

  ctx.save();
  ctx.lineWidth = opts.width ?? 2.2;
  ctx.strokeStyle = color;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x = xFor(i);
    const y = yFor(series[i]);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  if (opts.points) {
    ctx.fillStyle = color;
    const every = opts.pointEvery ?? Math.max(1, Math.floor(n / 10));
    for (let i = 0; i < n; i += every) {
      ctx.beginPath();
      ctx.arc(xFor(i), yFor(series[i]), 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (opts.lastMarker) {
    ctx.fillStyle = opts.markerColor ?? 'rgba(212,175,55,.95)';
    ctx.beginPath();
    ctx.arc(xFor(n - 1), yFor(series[n - 1]), 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ── Area fill under a line ── */
export function drawArea(ctx, plot, series, yScale, fill) {
  const n = series.length;
  const xFor = i => plot.x + plot.w * (i / (n - 1));
  const yFor = v => plot.y + plot.h * (1 - (v - yScale.min) / (yScale.max - yScale.min));
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x = xFor(i);
    const y = yFor(series[i]);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineTo(plot.x + plot.w, plot.y + plot.h);
  ctx.lineTo(plot.x, plot.y + plot.h);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

/* ── Horizontal reference band ── */
export function drawBand(ctx, plot, yScale, fromVal, toVal, fill) {
  const y1 = plot.y + plot.h * (1 - (fromVal - yScale.min) / (yScale.max - yScale.min));
  const y2 = plot.y + plot.h * (1 - (toVal - yScale.min) / (yScale.max - yScale.min));
  const top = Math.min(y1, y2);
  const h = Math.abs(y1 - y2);
  ctx.save();
  ctx.fillStyle = fill;
  ctx.fillRect(plot.x, top, plot.w, h);
  ctx.restore();
}

/* ── Forecast line (dotted, anchored at end of history) ── */
export function drawForecast(ctx, plot, history, forecast, yScale, color) {
  const combined = [...history, ...forecast];
  const n = combined.length;
  const start = history.length - 1;
  const xFor = i => plot.x + plot.w * (i / (n - 1));
  const yFor = v => plot.y + plot.h * (1 - (v - yScale.min) / (yScale.max - yScale.min));

  ctx.save();
  ctx.setLineDash([6, 4]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.beginPath();
  for (let i = start; i < n; i++) {
    const x = xFor(i);
    const y = yFor(combined[i].v);
    if (i === start) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

/* ── Multi-line chart (e.g. Compliance: 4 categories on one canvas) ── */
export function drawMultiLine(canvas, series, yMin, yMax) {
  const { ctx, w, h } = setupCanvas(canvas);
  clearCanvas(ctx, w, h);

  const ml = 38, mr = 12, mt = 8, mb = 22;
  const cw = w - ml - mr;
  const ch = h - mt - mb;
  const pts = series[0].data.length;

  const xP = i => ml + (i / (pts - 1)) * cw;
  const yP = v => mt + ch - ((v - yMin) / (yMax - yMin)) * ch;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = yP(yMin + (i / 4) * (yMax - yMin));
    ctx.beginPath();
    ctx.moveTo(ml, y);
    ctx.lineTo(w - mr, y);
    ctx.stroke();
  }

  // Y labels
  ctx.fillStyle = 'rgba(166,176,189,0.7)';
  ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 4; i++) {
    const v = yMin + (i / 4) * (yMax - yMin);
    ctx.fillText(Math.round(v) + '%', ml - 4, yP(v));
  }

  // X labels
  const xlabs = ['-28d', '-14d', 'Today'];
  const xidx = [0, Math.floor(pts / 2), pts - 1];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  xidx.forEach((i, n) => {
    ctx.fillStyle = xlabs[n] === 'Today' ? 'rgba(212,175,55,0.9)' : 'rgba(166,176,189,0.7)';
    ctx.fillText(xlabs[n], xP(i), h - mb + 5);
  });

  // Today divider
  ctx.save();
  ctx.strokeStyle = 'rgba(212,175,55,0.25)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(xP(pts - 1), mt);
  ctx.lineTo(xP(pts - 1), h - mb);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Lines + end dots
  series.forEach(s => {
    ctx.beginPath();
    s.data.forEach((v, i) => {
      const x = xP(i);
      const y = yP(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    const lx = xP(pts - 1);
    const ly = yP(s.data[pts - 1]);
    ctx.beginPath();
    ctx.arc(lx, ly, 3, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.strokeStyle = '#14171C';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();
  });

  return { ctx, w, h, plot: { x: ml, y: mt, w: cw, h: ch } };
}