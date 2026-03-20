import React from "react";

export default function LoadingSpinner({ label }) {
  return (
    <div className="flex items-center gap-3 text-[var(--text-muted)]">
      <div
        aria-label={label || "Loading"}
        className="h-5 w-5 animate-spin rounded-full border border-[var(--border)] border-t-[var(--accent)]"
      />
      <span className="text-sm">{label || "Loading..."}</span>
    </div>
  );
}

