import React from "react";
import { teamLogoUrl } from "./bracketUtils.js";

/**
 * One team in a horizontal matchup (left = top seed slot, right = bottom seed slot).
 *
 * @param {object} props
 * @param {object} props.team — { seed, region, name, slug }
 * @param {boolean} props.isWinner
 * @param {"left"|"right"} props.side — layout: top team on the left, bottom on the right
 */
export default function TeamSlot({ team, isWinner, side }) {
  const [logoError, setLogoError] = React.useState(false);
  const src = teamLogoUrl(team);

  const winnerTone = "text-[var(--accent)]";
  const loserTone = "text-[var(--text-muted)] opacity-[0.55]";

  const nameClasses = [
    "truncate text-xs font-semibold sm:text-sm",
    isWinner ? winnerTone : loserTone,
  ].join(" ");

  const logoWrap = [
    "flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded border sm:h-8 sm:w-8",
    isWinner
      ? "border-[var(--border)] bg-[var(--surface)]"
      : "border-[var(--border)] bg-[var(--loss)] opacity-80 grayscale",
  ].join(" ");

  const row =
    side === "left"
      ? "flex h-full min-w-0 w-full flex-1 items-center gap-2 pl-2 pr-1 py-1.5 sm:pl-3 sm:pr-2 sm:py-2"
      : "flex h-full min-w-0 w-full flex-1 flex-row-reverse items-center gap-2 pl-1 pr-2 py-1.5 sm:pl-2 sm:pr-3 sm:py-2";

  const textBlockClass = side === "right" ? "min-w-0 flex-1 text-right" : "min-w-0 flex-1";

  return (
    <div className={row}>
      <div className={logoWrap}>
        {logoError ? (
          <div className="font-mono text-[10px] text-[var(--text-muted)]">{team.seed}</div>
        ) : (
          <img
            src={src}
            alt={`${team.name} logo`}
            className="h-6 w-6 object-contain sm:h-7 sm:w-7"
            onError={() => setLogoError(true)}
          />
        )}
      </div>
      <div className={textBlockClass}>
        <div className="font-mono text-[10px] text-[var(--text-muted)] sm:text-xs">
          Seed {team.seed}
        </div>
        <div className={nameClasses} title={team.name}>
          {team.name}
        </div>
      </div>
    </div>
  );
}
