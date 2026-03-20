import React from "react";
import TeamSlot from "./TeamSlot.jsx";

/**
 * Single game: one row — top team (left) vs bottom team (right).
 * Winner side: lighter background + inset accent outline; loser muted.
 *
 * @param {object} props
 * @param {object} props.game — top_team, bottom_team, winner, win probabilities
 * @param {boolean} props.showTooltip
 */
export default function GameSlot({ game, showTooltip }) {
  const topSlug = game.top_team.slug;
  const bottomSlug = game.bottom_team.slug;

  const isTopWinner = game.winner.slug === topSlug;
  const isBottomWinner = game.winner.slug === bottomSlug;

  const topP = game.top_win_probability;
  const bottomP = game.bottom_win_probability;

  const halfBase = "flex min-w-0 flex-1 items-stretch";
  const winnerHalf = [
    halfBase,
    "bg-[var(--matchup-winner-bg)]",
    "ring-2 ring-inset ring-[var(--accent)]",
  ].join(" ");
  const loserHalf = [halfBase, "bg-[var(--surface)]"].join(" ");

  return (
    <div
      className="relative w-full min-w-0 max-w-full"
      aria-label={`Game between ${game.top_team.name} and ${game.bottom_team.name}`}
    >
      <div
        className={[
          "flex w-full min-w-0 max-w-full items-stretch overflow-hidden rounded-md",
          "border border-[var(--border)]",
        ].join(" ")}
      >
        <div className={isTopWinner ? winnerHalf : loserHalf}>
          <TeamSlot team={game.top_team} isWinner={isTopWinner} side="left" />
        </div>
        <div
          className="w-px shrink-0 bg-[var(--border)]"
          aria-hidden="true"
        />
        <div className={isBottomWinner ? winnerHalf : loserHalf}>
          <TeamSlot team={game.bottom_team} isWinner={isBottomWinner} side="right" />
        </div>
      </div>

      {showTooltip && (
        <div
          className="absolute left-0 top-full z-10 mt-2 w-72 max-w-[min(18rem,calc(100vw-2rem))] rounded border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--text-muted)]"
          role="tooltip"
          aria-label="Elo matchup probabilities"
        >
          <div className="font-mono text-[10px] text-[var(--text-muted)]">
            Elo win probability
          </div>
          <div className="mt-2">
            <div className="flex justify-between gap-3">
              <span className="truncate">{game.top_team.name}</span>
              <span className="font-mono">
                {Number.isFinite(topP) ? (topP * 100).toFixed(2) : String(topP)}%
              </span>
            </div>
            <div className="mt-1 flex justify-between gap-3">
              <span className="truncate">{game.bottom_team.name}</span>
              <span className="font-mono">
                {Number.isFinite(bottomP) ? (bottomP * 100).toFixed(2) : String(bottomP)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
