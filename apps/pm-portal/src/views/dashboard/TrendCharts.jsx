// src/views/dashboard/TrendCharts.jsx
import { useChart } from '../../hooks/useChart';
import {
  setupCanvas, clearCanvas, makeLinearScale, drawChartFrame,
  drawLine, drawArea, drawBand, drawForecast, drawMultiLine,
} from '../../utils/charts';

/* ── Generic Trend Card wrapper ── */
function TrendCard({ tone, title, value, delta, deltaTone, context, legend, children }) {
  return (
    <div className={`tcc tcc--${tone}`}>
      <div className="tcc__header">
        <div className="tcc__title">{title}</div>
        <div className="tcc__value">{value}</div>
        {delta && <div className={`tcc__delta tcc__delta--${deltaTone}`}>{delta}</div>}
        {context && <div className="tcc__context">{context}</div>}
      </div>
      <div className="tcc__canvas-wrap">{children}</div>
      {legend && (
        <div className="tcc__legend">
          {legend.map((l, i) => (
            <div className="tcc__leg-item" key={i}>
              <span className="tcc__leg-dot" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 1. Occupancy Chart ── */
function OccupancyChart({ data }) {
  const ref = useChart((canvas) => {
    if (!data) return;
    const { ctx, w, h } = setupCanvas(canvas);
    clearCanvas(ctx, w, h);

    const history = data.history.map(p => p.v);
    const forecast = data.forecast.map(p => p.v);
    const combined = [...history, ...forecast];
    const min = Math.min(...combined) - 2;
    const max = Math.max(...combined) + 2;
    const yScale = makeLinearScale(min, max, 6);

    const plot = drawChartFrame(ctx, w, h, {
      padL: 48, padR: 10, padT: 10, padB: 22,
      yScale, xTicks: 6, yLabel: 'Occupancy %',
      xLabelsFn: (i) => ['-28d','-21d','-14d','-7d','Today','+7d','+14d'][i] ?? '',
      yFmt: (v) => `${Math.round(v)}%`,
    });

    // danger band below 80%
    drawBand(ctx, plot, yScale, yScale.min, 80, 'rgba(220,38,38,0.06)');

    // area + line
    drawArea(ctx, plot, history, yScale, 'rgba(34,197,94,0.08)');
    drawLine(ctx, plot, history, yScale, 'rgba(34,197,94,.88)', {
      width: 2.4, points: true, pointEvery: 4, lastMarker: true,
    });

    // dotted forecast
    drawForecast(ctx, plot, history, forecast, yScale, 'rgba(212,175,55,.65)');
  }, [data]);

  return <canvas ref={ref} className="tcc__canvas" />;
}

/* ── 2. SLA Chart ── */
function SlaChart({ data }) {
  const ref = useChart((canvas) => {
    if (!data) return;
    const { ctx, w, h } = setupCanvas(canvas);
    clearCanvas(ctx, w, h);

    const history = data.history.map(p => p.v);
    const forecast = data.forecast.map(p => p.v);
    const yScale = makeLinearScale(0, Math.max(...history, ...forecast) * 1.3, 5);

    const plot = drawChartFrame(ctx, w, h, {
      padL: 34, padR: 10, padT: 10, padB: 22,
      yScale, xTicks: 6, yLabel: 'Tasks',
      xLabelsFn: (i) => ['-28d','-21d','-14d','-7d','Today','+7d','+14d'][i] ?? '',
      yFmt: (v) => String(Math.round(v)),
    });

    // warn threshold band
    drawBand(ctx, plot, yScale, yScale.min, 4, 'rgba(245,158,11,0.05)');

    drawArea(ctx, plot, history, yScale, 'rgba(220,38,38,0.08)');
    drawLine(ctx, plot, history, yScale, 'rgba(220,38,38,.88)', {
      width: 2.4, points: true, pointEvery: 4, lastMarker: true,
      markerColor: 'rgba(220,38,38,.95)',
    });
    drawForecast(ctx, plot, history, forecast, yScale, 'rgba(212,175,55,.55)');
  }, [data]);

  return <canvas ref={ref} className="tcc__canvas" />;
}

/* ── 3. Compliance multi-line chart ── */
function ComplianceChart({ data }) {
  const ref = useChart((canvas) => {
    if (!data) return;
    drawMultiLine(canvas, data.series, 60, 100);
  }, [data]);

  return <canvas ref={ref} className="tcc__canvas" />;
}

/* ── 4. Vendor chart ── */
function VendorChart({ data }) {
  const ref = useChart((canvas) => {
    if (!data) return;
    const { ctx, w, h } = setupCanvas(canvas);
    clearCanvas(ctx, w, h);

    const history = data.history.map(p => p.v);
    const forecast = data.forecast.map(p => p.v);
    const yScale = makeLinearScale(Math.min(...history) - 2, Math.max(...history) + 3, 5);

    const plot = drawChartFrame(ctx, w, h, {
      padL: 42, padR: 10, padT: 10, padB: 22,
      yScale, xTicks: 6, yLabel: 'Score',
      xLabelsFn: (i) => ['-28d','-21d','-14d','-7d','Today','+7d','+14d'][i] ?? '',
      yFmt: (v) => `${Math.round(v)}%`,
    });

    // danger band below 90%
    drawBand(ctx, plot, yScale, yScale.min, 90, 'rgba(220,38,38,0.05)');

    drawArea(ctx, plot, history, yScale, 'rgba(212,175,55,0.08)');
    drawLine(ctx, plot, history, yScale, 'rgba(212,175,55,.88)', {
      width: 2.4, points: true, pointEvery: 4, lastMarker: true,
    });
    drawForecast(ctx, plot, history, forecast, yScale, 'rgba(34,197,94,.55)');
  }, [data]);

  return <canvas ref={ref} className="tcc__canvas" />;
}

/* ── Section ── */
export default function TrendCharts({ trends }) {
  if (!trends) return <section className="dashboard-section"><div style={{padding: '2rem'}}>Loading trends...</div></section>;

  const T = trends;
  return (
    <section className="dashboard-section">
      <div className="dashboard-section__label">Operational Trends · 30-Day</div>
      <div className="tcc-grid">
        <TrendCard
          tone="green"
          title="Occupancy Context"
          value={T.occupancy?.value}
          delta={T.occupancy?.delta}
          deltaTone={T.occupancy?.deltaTone}
          context={T.occupancy?.context}
        >
          <OccupancyChart data={T.occupancy} />
        </TrendCard>

        <TrendCard
          tone="red"
          title="SLA Pressure Health"
          value={T.sla?.value}
          delta={T.sla?.delta}
          deltaTone={T.sla?.deltaTone}
          context={T.sla?.context}
        >
          <SlaChart data={T.sla} />
        </TrendCard>

        <TrendCard
          tone="amber"
          title="Compliance Health"
          value={T.compliance?.value}
          delta={T.compliance?.delta}
          deltaTone={T.compliance?.deltaTone}
          legend={T.compliance?.legend}
        >
          <ComplianceChart data={T.compliance} />
        </TrendCard>

        <TrendCard
          tone="gold"
          title="Vendor Health"
          value={T.vendor?.value}
          delta={T.vendor?.delta}
          deltaTone={T.vendor?.deltaTone}
          context={T.vendor?.context}
          legend={T.vendor?.legend}
        >
          <VendorChart data={T.vendor} />
        </TrendCard>
      </div>
    </section>
  );
}