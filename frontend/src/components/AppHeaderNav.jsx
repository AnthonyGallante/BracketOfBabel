import React from "react";
import { NavLink } from "react-router-dom";

const base =
  [
    "inline-flex items-center rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider",
    "border-[var(--border)] bg-[var(--surface)]/85 text-[var(--text-muted)] backdrop-blur-sm",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
    "transition-all duration-200 ease-out",
    "hover:border-[var(--accent)] hover:text-[var(--text)]",
    "hover:shadow-[0_10px_28px_-12px_rgba(74,158,255,0.45)] motion-safe:hover:-translate-y-0.5",
    "active:translate-y-0 active:scale-[0.98] motion-reduce:hover:translate-y-0",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
  ].join(" ");

const active =
  "border-[var(--accent)] bg-[color:rgba(74,158,255,0.1)] text-[var(--accent)] shadow-[inset_0_0_0_1px_rgba(74,158,255,0.35)]";

/**
 * Top-bar nav pill matching site chrome (glass surface + accent on hover/active).
 */
export function AppHeaderNavLink({ to, end, children, ariaLabel }) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={ariaLabel}
      className={({ isActive }) => [base, isActive ? active : ""].join(" ")}
    >
      {children}
    </NavLink>
  );
}

export default function AppHeaderNav() {
  return (
    <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2">
      <AppHeaderNavLink to="/" end ariaLabel="Return to home page">
        Home
      </AppHeaderNavLink>
      <AppHeaderNavLink to="/about" ariaLabel="About this project">
        About
      </AppHeaderNavLink>
    </div>
  );
}
