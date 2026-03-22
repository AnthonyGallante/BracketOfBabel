import React from "react";
import { useSearchParams } from "react-router-dom";
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
import { formatInteger } from "../components/bracket/bracketUtils.js";
import { setDocumentMeta } from "../utils/meta.js";
import {
  getLiveMensBracketSelections,
  LIVE_MENS_BRACKET_NOTE,
  LIVE_MENS_BRACKET_UPDATED,
} from "../config/liveMensBracketSelections.js";
import {
  getLiveWomensBracketSelections,
  LIVE_WOMENS_BRACKET_NOTE,
  LIVE_WOMENS_BRACKET_UPDATED,
} from "../config/liveWomensBracketSelections.js";
import { TOURNAMENTS, setSelectedTournament } from "../engine/tournamentState.js";
import { useSelectedTournament } from "../hooks/useSelectedTournament.js";
import "./home.css";

const RESULTS_PER_PAGE = 20n;

export default function RemainingBracketsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePageOrZero(searchParams.get("page"));
  const tournament = useSelectedTournament();

  const selections = React.useMemo(() => {
    return tournament === TOURNAMENTS.WOMEN
      ? getLiveWomensBracketSelections()
      : getLiveMensBracketSelections();
  }, [tournament]);

  const liveUpdated =
    tournament === TOURNAMENTS.WOMEN ? LIVE_WOMENS_BRACKET_UPDATED : LIVE_MENS_BRACKET_UPDATED;
  const liveNote = tournament === TOURNAMENTS.WOMEN ? LIVE_WOMENS_BRACKET_NOTE : LIVE_MENS_BRACKET_NOTE;

  React.useEffect(() => {
    const title = "Remaining brackets (live) | Bracket Archive";
    const description =
      "Brackets still possible given completed tournament games. Same logic as Find, with results filled in for you.";
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

  const unknownCount = countUnknownBits(selections);
  const totalMatches = matchingBracketCount(selections);
  const totalPages =
    totalMatches === 0n ? 1n : (totalMatches - 1n) / RESULTS_PER_PAGE + 1n;

  const matchingIds = React.useMemo(
    () => generateMatchingBracketIds(selections, page, RESULTS_PER_PAGE),
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

  React.useEffect(() => {
    if (page >= totalPages) setPage(0n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, totalPages]);

  const previewBits = React.useMemo(
    () => selections.map((v) => (v === null ? 0 : v)),
    [selections],
  );
  const previewId = React.useMemo(() => intFromBracket(previewBits), [previewBits]);

  const selectTournament = (value) => {
    setSelectedTournament(value);
  };

  return (
    <div className="home-shell mx-auto max-w-7xl px-4 py-10">
      <div className="relative z-10 mb-6 flex flex-col items-center text-center">
        <p
          className="bg-gradient-to-br from-[var(--text)] via-[var(--accent)] to-[var(--win)] bg-clip-text font-mono text-[clamp(1.25rem,min(6vw,2.75rem),2.75rem)] font-bold leading-none tracking-tight text-transparent tabular-nums"
          aria-label={`${formatInteger(totalMatches)} brackets still possible`}
        >
          {formatInteger(totalMatches)}
        </p>
        <p className="mt-3 w-full text-center font-mono text-sm font-semibold text-[var(--text)] sm:text-base">
          brackets still possible
        </p>
      </div>

      <div className="relative z-10 rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 backdrop-blur-sm sm:p-6">
        <div className="font-mono text-lg">View remaining brackets</div>
        <div className="mt-3 grid max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            className={[
              "rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
              tournament === TOURNAMENTS.MEN
                ? "border-[var(--accent)] bg-[color:rgba(74,158,255,0.18)] text-[var(--text)]"
                : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]",
            ].join(" ")}
            onClick={() => selectTournament(TOURNAMENTS.MEN)}
            aria-pressed={tournament === TOURNAMENTS.MEN}
          >
            Men&apos;s Tournament
          </button>
          <button
            type="button"
            className={[
              "rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
              tournament === TOURNAMENTS.WOMEN
                ? "border-[var(--accent)] bg-[color:rgba(74,158,255,0.18)] text-[var(--text)]"
                : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]",
            ].join(" ")}
            onClick={() => selectTournament(TOURNAMENTS.WOMEN)}
            aria-pressed={tournament === TOURNAMENTS.WOMEN}
          >
            Women&apos;s Tournament
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Results snapshot: <span className="font-mono">{liveUpdated}</span>. {liveNote}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <div className="font-mono text-sm text-[var(--text-muted)]">
            Unknown bits: <span className="text-[var(--text)]">{unknownCount}</span> · Matches{" "}
            <span className="font-mono text-[var(--text)]">{formatInteger(totalMatches)}</span> brackets
            (2^{unknownCount})
          </div>
          <div className="font-mono text-xs text-[var(--text-muted)]">
            Preview prefix ID (unknowns as 0):{" "}
            <span className="text-[var(--text)]">{formatInteger(previewId)}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-6 space-y-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 backdrop-blur-sm">
          <div className="font-mono text-sm text-[var(--text-muted)]">
            Matching brackets (page {formatInteger(page)})
          </div>
          <div className="mt-2 text-xs text-[var(--text-muted)]">
            Showing up to {formatInteger(RESULTS_PER_PAGE)} per page. Bits {TOTAL_BITS} total; live results follow
            the selected tournament&apos;s field.
          </div>
        </div>

        <BracketGrid stubs={stubs} />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/remaining"
          queryKey="page"
          ariaLabel="Remaining brackets pagination"
        />
      </div>
    </div>
  );
}
