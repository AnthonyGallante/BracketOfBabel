import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import BracketGrid from "../components/BracketGrid.jsx";
import Pagination from "../components/Pagination.jsx";
import {
  TOTAL_BITS,
  bracketFromInt,
  intFromBracket,
} from "../engine/bracketEngine.js";
import {
  countUnknownBits,
  generateMatchingBracketIds,
  matchingBracketCount,
  parsePageOrZero,
} from "../components/find/findUtils.js";
import { formatInteger, teamLogoUrl } from "../components/bracket/bracketUtils.js";
import { useSelectedTournament } from "../hooks/useSelectedTournament.js";
import "./home.css";

const FIND_RESULTS_PER_PAGE = 20n;

function TeamChip({ team }) {
  const [logoError, setLogoError] = React.useState(false);
  const logoUrl = teamLogoUrl(team);

  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded border border-[var(--border)] bg-[var(--surface)]">
        {logoError ? (
          <span className="font-mono text-[10px] text-[var(--text-muted)]">{team.seed}</span>
        ) : (
          <img
            src={logoUrl}
            alt={`${team.name} logo`}
            className="h-4 w-4 object-contain"
            onError={() => setLogoError(true)}
          />
        )}
      </span>
      <span className="truncate text-[var(--text)]">{team.name}</span>
    </span>
  );
}

export default function FindPage() {
  const tournament = useSelectedTournament();
  // selections[i] is one of: 0, 1, or null (unselected / "?").
  const [selections, setSelections] = React.useState(() =>
    new Array(TOTAL_BITS).fill(null),
  );
  const [searchParams, setSearchParams] = useSearchParams();

  // We use ?page= for filtered match pagination.
  const page = parsePageOrZero(searchParams.get("page"));

  // Use a deterministic "preview bracket" so each game row can show top/bottom teams.
  // For unknown bits, we temporarily fill with 0 for preview only.
  const previewBits = React.useMemo(
    () => selections.map((v) => (v === null ? 0 : v)),
    [selections],
  );
  const previewId = React.useMemo(() => intFromBracket(previewBits), [previewBits]);
  const previewBracket = React.useMemo(
    () => bracketFromInt(previewId, tournament),
    [previewId, tournament],
  );

  const unknownCount = countUnknownBits(selections);
  const totalMatches = matchingBracketCount(selections);
  const totalPages =
    totalMatches === 0n ? 1n : (totalMatches - 1n) / FIND_RESULTS_PER_PAGE + 1n;

  const matchingIds = React.useMemo(
    () => generateMatchingBracketIds(selections, page, FIND_RESULTS_PER_PAGE),
    [selections, page],
  );

  const stubs = React.useMemo(() => {
    return matchingIds.map((idBig) => {
      const decoded = bracketFromInt(idBig, tournament);
      return {
        id: idBig.toString(),
        champion: decoded.champion,
        bits_preview: decoded.bits.join(""),
      };
    });
  }, [matchingIds, tournament]);

  const setPage = (p) => setSearchParams({ page: p.toString() });

  // Keep page in bounds when selections change and page becomes invalid.
  React.useEffect(() => {
    if (page >= totalPages) setPage(0n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, totalPages]);

  const setBit = (idx, bitOrNull) => {
    setSelections((prev) => {
      const next = [...prev];
      next[idx] = bitOrNull;
      return next;
    });
    // Reset to first page so users immediately see the first matching results.
    setPage(0n);
  };

  const clearAll = () => {
    setSelections(new Array(TOTAL_BITS).fill(null));
    setPage(0n);
  };

  const complete = unknownCount === 0;
  const finalId = complete ? intFromBracket(selections) : null;

  // Game labels grouped by round for readability.
  const groups = [
    { title: "Round of 64", start: 0, end: 31 },
    { title: "Round of 32", start: 32, end: 47 },
    { title: "Regional semifinal", start: 48, end: 55 },
    { title: "Regional final", start: 56, end: 59 },
    { title: "Championship round of 4", start: 60, end: 61 },
    { title: "Championship game", start: 62, end: 62 },
  ];

  return (
    <div className="home-shell mx-auto max-w-7xl px-4 py-10">
      <div className="relative z-10 rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 backdrop-blur-sm">
        <div className="font-mono text-lg">Find a Bracket</div>
        <div className="mt-2 text-sm text-[var(--text-muted)]">
          Select winners game-by-game. Unselected games remain <span className="font-mono">?</span>.
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
          <div className="font-mono text-sm text-[var(--text-muted)]">
            Your selections match 2^{unknownCount} brackets ({formatInteger(totalMatches)} total)
          </div>
          <button
            className="rounded border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--accent)]"
            onClick={clearAll}
            aria-label="Clear all selections"
          >
            Clear all
          </button>
        </div>

        {complete && finalId !== null && (
          <div className="mt-3 border-t border-[var(--border)] pt-3">
            <Link
              to={`/bracket/${finalId.toString()}`}
              className="inline-flex rounded border border-[var(--accent)] px-3 py-1 text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black"
              aria-label="View this complete bracket"
            >
              View This Bracket
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 backdrop-blur-sm">
          <div className="font-mono text-sm text-[var(--text-muted)]">
            Interactive game picker
          </div>

          <div className="mt-3 max-h-[70vh] overflow-auto space-y-4 pr-2">
            {groups.map((group) => (
              <div key={group.title} className="border-t border-[var(--border)] pt-3">
                <div className="font-mono text-sm font-semibold tracking-wide text-[var(--text)]">
                  {group.title}
                </div>

                <div className="mt-2 space-y-2">
                  {Array.from({ length: group.end - group.start + 1 }, (_, offset) => {
                    const idx = group.start + offset;
                    const game = previewBracket.games[idx];
                    const selected = selections[idx];
                    return (
                      <div key={idx} className="rounded border border-[var(--border)] p-2">
                        <div className="mb-2 font-mono text-[11px] text-[var(--text-muted)]">
                          Game {idx} {selected === null ? "(?)" : `(bit ${selected})`}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            className={[
                              "rounded border px-2 py-1.5 text-xs text-left transition-colors",
                              selected === 0
                                ? "border-[var(--accent)] bg-[color:rgba(74,158,255,0.15)] text-[var(--text)]"
                                : "border-[var(--border)] bg-[color:rgba(61,66,82,0.35)] text-[var(--text)] hover:border-[var(--accent)]",
                            ].join(" ")}
                            onClick={() => setBit(idx, 0)}
                            aria-label={`Select top team for game ${idx}`}
                            title="bit 0: top team wins"
                          >
                            <TeamChip team={game.top_team} />
                          </button>
                          <button
                            className={[
                              "rounded border px-2 py-1.5 text-xs text-left transition-colors",
                              selected === 1
                                ? "border-[var(--accent-warm)] bg-[color:rgba(245,166,35,0.16)] text-[var(--text)]"
                                : "border-[var(--border)] bg-[color:rgba(61,66,82,0.35)] text-[var(--text)] hover:border-[var(--accent-warm)]",
                            ].join(" ")}
                            onClick={() => setBit(idx, 1)}
                            aria-label={`Select bottom team for game ${idx}`}
                            title="bit 1: bottom team wins"
                          >
                            <TeamChip team={game.bottom_team} />
                          </button>
                          <button
                            className={[
                              "rounded border px-2 py-1.5 text-xs transition-colors",
                              selected === null
                                ? "border-[var(--text-muted)] bg-[color:rgba(90,96,112,0.12)] text-[var(--text)]"
                                : "border-[var(--border)] bg-[color:rgba(61,66,82,0.3)] text-[var(--text-muted)] hover:border-[var(--text-muted)]",
                            ].join(" ")}
                            onClick={() => setBit(idx, null)}
                            aria-label={`Clear selection for game ${idx}`}
                            title="Unselected (?)"
                          >
                            ?
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 backdrop-blur-sm">
            <div className="font-mono text-sm text-[var(--text-muted)]">
              First matching brackets (page {formatInteger(page)})
            </div>
            <div className="mt-2 text-xs text-[var(--text-muted)]">
              Showing up to {formatInteger(FIND_RESULTS_PER_PAGE)} matches for your current bit pattern.
            </div>
          </div>

          <BracketGrid stubs={stubs} />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/find"
            queryKey="page"
            ariaLabel="Find bracket result pagination"
          />
        </div>
      </div>
    </div>
  );
}

