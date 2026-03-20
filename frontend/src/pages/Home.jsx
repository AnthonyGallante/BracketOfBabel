import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MAX_BRACKET_ID, TOTAL_BRACKET_COUNT } from "../engine/bracketEngine.js";
import { setDocumentMeta } from "../utils/meta.js";
import { parseBoundedBigInt, sanitizeDigits } from "../utils/numericInput.js";
import { formatInteger } from "../components/bracket/bracketUtils.js";
import "./home.css";

/** Large primary nav actions — sporty monospace + hover motion from home.css */
function HomeCtaLink({ to, label, icon, ariaLabel }) {
  return (
    <Link
      to={to}
      className="home-cta group flex min-w-[min(100%,280px)] items-center justify-center rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-8 py-4 font-mono text-base font-semibold text-[var(--text)] shadow-sm hover:border-[var(--accent)]"
      aria-label={ariaLabel}
    >
      <span className="flex items-center justify-center gap-3">
        <span className="text-[var(--accent)] transition-transform duration-300 group-hover:scale-110 group-hover:text-[var(--win)]">
          {icon}
        </span>
        <span>{label}</span>
      </span>
    </Link>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [lookup, setLookup] = React.useState("");
  const [lookupError, setLookupError] = React.useState("");

  React.useEffect(() => {
    const title = "Bracket Archive";
    const description =
      "A deterministic archive of all 63-bit tournament brackets. Browse, search by bracket id, or inspect random records.";
    setDocumentMeta({
      title,
      description,
      ogTitle: title,
      ogDescription: description,
      ogUrl: window.location.href,
      twitterTitle: title,
      twitterDescription: description,
    });
  }, []);

  const onLookupSubmit = (e) => {
    e.preventDefault();
    setLookupError("");
    const id = parseBoundedBigInt(lookup, { min: 0n, max: MAX_BRACKET_ID });
    if (id === null) {
      setLookupError(`Bracket ID must be in [0, ${formatInteger(MAX_BRACKET_ID)}].`);
      return;
    }
    navigate(`/bracket/${id.toString()}`);
  };

  const iconFind = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="10" cy="10" r="6" />
      <path d="M14 14l6 6" strokeLinecap="round" />
    </svg>
  );
  const iconBrowse = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="7" height="7" rx="1" />
      <rect x="14" y="4" width="7" height="7" rx="1" />
      <rect x="3" y="13" width="7" height="7" rx="1" />
      <rect x="14" y="13" width="7" height="7" rx="1" />
    </svg>
  );
  const iconRandom = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );

  return (
    <div className="home-shell mx-auto min-h-[calc(100vh-5rem)] max-w-5xl px-4 py-8 sm:py-12">
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center">
        {/* Simple top header */}
        <header className="mt-2 text-center sm:mt-4" aria-label="Archive header">
          <h1 className="bg-gradient-to-br from-[var(--text)] via-[var(--accent)] to-[var(--win)] bg-clip-text font-mono text-3xl font-bold leading-tight tracking-tight text-transparent sm:text-5xl">
            {formatInteger(TOTAL_BRACKET_COUNT)} brackets.
          </h1>
          <p className="mt-2 font-mono text-xl font-semibold text-[var(--text)] sm:text-3xl">
            All of them here.
          </p>
        </header>

        {/* Primary actions */}
        <nav
          className="mt-10 flex w-full max-w-2xl flex-col items-center justify-center gap-4 sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-5"
          aria-label="Primary navigation"
        >
          <HomeCtaLink to="/find" label="Find a Bracket" icon={iconFind} ariaLabel="Find a Bracket" />
          <HomeCtaLink to="/browse?page=0" label="Browse" icon={iconBrowse} ariaLabel="Browse Brackets" />
          <HomeCtaLink to="/random" label="Random" icon={iconRandom} ariaLabel="Random Bracket" />
        </nav>

        {/* Lookup */}
        <section
          className="mt-14 w-full max-w-xl sm:mt-16"
          aria-label="Bracket lookup by ID"
        >
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-sm sm:p-6">
            <div className="text-center">
              <div className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                Bracket lookup
              </div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">
                Query by Bracket ID in{" "}
                <span className="font-mono text-[var(--text)]">
                  [0, {formatInteger(MAX_BRACKET_ID)}]
                </span>
              </div>
            </div>

            <form
              onSubmit={onLookupSubmit}
              className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center"
            >
              <input
                value={lookup}
                onChange={(e) => setLookup(sanitizeDigits(e.target.value))}
                onKeyDown={(e) => {
                  if (e.ctrlKey || e.metaKey || e.altKey) return;
                  if (
                    e.key.length === 1 &&
                    !/\d/.test(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text");
                  setLookup((prev) => `${prev}${sanitizeDigits(text)}`);
                }}
                onDrop={(e) => e.preventDefault()}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-sm text-[var(--text)] outline-none ring-0 transition-shadow duration-200 placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(74,158,255,0.2)]"
                aria-label="Bracket id input"
                placeholder="Enter Bracket ID (e.g. 0)"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                title="Bracket ID is a 63-bit integer key."
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] px-6 py-3 font-mono text-sm font-semibold text-[var(--text)] transition-all duration-200 hover:border-[var(--accent)] hover:shadow-[0_8px_24px_-8px_rgba(74,158,255,0.35)] active:scale-[0.98] sm:min-w-[120px]"
                aria-label="Search bracket id"
              >
                Search
              </button>
            </form>
            {lookupError && (
              <div className="mt-3 text-center text-xs text-[var(--danger)]" aria-live="polite">
                {lookupError}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
