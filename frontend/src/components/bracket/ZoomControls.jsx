import React from "react";
import { clampZoom } from "./bracketUtils.js";

/*
 * ZoomControls
 * -------------
 * Small UI for adjusting bracket scale.
 *
 * Props:
 *   - zoom: current zoom factor (number)
 *   - setZoom: React state setter (can accept updater fn)
 */
export default function ZoomControls({ zoom, setZoom }) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="rounded border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--accent)] disabled:opacity-50"
        onClick={() => setZoom((z) => clampZoom(z - 0.05))}
        aria-label="Zoom out"
      >
        -
      </button>
      <div className="font-mono text-sm text-[var(--text-muted)]">
        Zoom {zoom.toFixed(2)}x
      </div>
      <button
        className="rounded border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--accent)] disabled:opacity-50"
        onClick={() => setZoom((z) => clampZoom(z + 0.05))}
        aria-label="Zoom in"
      >
        +
      </button>
    </div>
  );
}

