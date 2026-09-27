// src/hooks/useChart.js
import { useEffect, useRef } from 'react';

/**
 * Renders a canvas-based chart. The `drawFn` receives the canvas element
 * and is responsible for calling setupCanvas() to size it correctly.
 *
 * Re-draws on:
 *   - mount
 *   - window resize
 *   - parent container resize (via ResizeObserver)
 *   - any of the values in `deps`
 */
export function useChart(drawFn, deps = []) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId = null;

    const draw = () => {
      // Skip if parent has no size yet (e.g. hidden)
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect || rect.width < 10 || rect.height < 10) return;
      drawFn(canvas);
    };

    const scheduleDraw = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(draw);
    };

    // Initial draw
    scheduleDraw();

    // Observe container size
    const parent = canvas.parentElement;
    let ro;
    if (parent && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(scheduleDraw);
      ro.observe(parent);
    }

    // Fallback: window resize
    window.addEventListener('resize', scheduleDraw);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', scheduleDraw);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return canvasRef;
}