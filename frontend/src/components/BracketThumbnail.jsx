import React from "react";
import { Link } from "react-router-dom";
import { bracketFromInt } from "../engine/bracketEngine.js";
import { TOURNAMENTS } from "../engine/tournamentState.js";
import { REGIONS_WOMEN } from "../engine/teamsWomen.js";
import { formatInteger, teamLogoUrl } from "./bracket/bracketUtils.js";
import { useSelectedTournament } from "../hooks/useSelectedTournament.js";
import { compactTeamDisplayName } from "../utils/teamDisplayName.js";

function parseBracketId(id) {
  try {
    return BigInt(id);
  } catch {
    return null;
  }
}

function getRegionWinnersById(id, tournament) {
  const n = parseBracketId(id);
  if (n === null) return null;
  const decoded = bracketFromInt(n, tournament);
  const regions = decoded.rounds.elite_8.map((game) => game.region);

  const winners = {};
  decoded.rounds.elite_8.forEach((game, idx) => {
    winners[regions[idx]] = game.winner;
  });
  return { winners, regions };
}

/** Compact region label for thumbnail hover panel (men: E/W/S/M; women: R1–R4). */
function thumbnailRegionLabel(region, tournament) {
  if (tournament === TOURNAMENTS.WOMEN) {
    const i = REGIONS_WOMEN.indexOf(region);
    return i >= 0 ? `R${i + 1}` : region;
  }
  const men = { East: "E", South: "S", West: "W", Midwest: "M" };
  return men[region] ?? region;
}

function BitsPreviewSvg({ bits }) {
  const width = 252;
  const height = 28;
  const usable = bits.slice(0, 63);
  const segmentWidth = width / 63;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-8 w-full"
      role="img"
      aria-label="Bracket bits preview"
    >
      {usable.split("").map((bit, idx) => {
        const x = idx * segmentWidth;
        const isBottom = bit === "1";
        const color = isBottom ? "var(--accent-warm)" : "var(--win)";
        return (
          <rect
            key={idx}
            x={x}
            y={4}
            width={Math.max(1, segmentWidth - 0.5)}
            height={20}
            rx={0.4}
            fill={color}
            opacity={0.92}
          />
        );
      })}
    </svg>
  );
}

export default function BracketThumbnail({ id, bitsPreview, champion }) {
  const tournament = useSelectedTournament();
  const regionInfo = React.useMemo(() => getRegionWinnersById(id, tournament), [id, tournament]);
  const regions = regionInfo?.regions ?? [];
  const regionWinners = regionInfo?.winners ?? {};
  const [logoError, setLogoError] = React.useState(false);
  const winnerLogoUrl = teamLogoUrl(champion);
  React.useEffect(() => {
    setLogoError(false);
  }, [winnerLogoUrl]);

  return (
    <Link
      to={`/bracket/${id}`}
      className={[
        "group block rounded border border-[var(--border)] bg-[var(--surface)] p-2.5",
        "transition-transform duration-150 hover:-translate-y-0.5 hover:border-[var(--accent)]",
      ].join(" ")}
      aria-label={`Open bracket ${formatInteger(id)}. Champion ${champion.name}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono text-[10px] text-[var(--text-muted)]">#{formatInteger(id)}</div>
          <div className="truncate text-sm font-semibold text-[var(--text)]" title={champion.name}>
            {compactTeamDisplayName(champion)}
          </div>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_16px_-12px_rgba(74,158,255,0.55)]">
          {logoError ? (
            <span className="font-mono text-xs text-[var(--text-muted)]">
              {champion.seed}
            </span>
          ) : (
            <img
              key={winnerLogoUrl}
              src={winnerLogoUrl}
              alt={`${champion.name} logo`}
              className="h-7 w-7 object-contain"
              onError={() => setLogoError(true)}
            />
          )}
        </span>
      </div>
      <div className="mt-2 rounded border border-[var(--border)] px-1 py-0.5">
        <BitsPreviewSvg bits={bitsPreview} />
      </div>

      {/* Hover expansion panel */}
      <div
        className={[
          "mt-3 overflow-hidden border-t border-[var(--border)] pt-0",
          "max-h-0 opacity-0 transition-all duration-200",
          "group-hover:max-h-48 group-hover:pt-2.5 group-hover:opacity-100",
        ].join(" ")}
      >
        <div className="font-mono text-[10px] text-[var(--text-muted)]">Region winners</div>
        <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
          {regions.map((region) => {
            const w = regionWinners?.[region];
            const full = w?.name ?? "N/A";
            return (
              <div key={region} className="flex min-w-0 items-center justify-between gap-1.5">
                <span className="shrink-0 font-mono text-[var(--text-muted)]">
                  {thumbnailRegionLabel(region, tournament)}
                </span>
                <span className="min-w-0 truncate text-right text-[var(--text)]" title={full}>
                  {w ? compactTeamDisplayName(w) : "N/A"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}

