import React from "react";
import { useNavigate } from "react-router-dom";
import { MAX_BRACKET_ID } from "../engine/bracketEngine.js";
import { ACTIVE_BRACKET_LAYOUT_PROFILE } from "../config/bracketLayout.js";
import GameSlot from "./bracket/GameSlot.jsx";
import ZoomControls from "./bracket/ZoomControls.jsx";
import SharePanel from "./bracket/SharePanel.jsx";
import { formatInteger, formatProbSci, regionLabel } from "./bracket/bracketUtils.js";
import "../pages/home.css";

/** Section title for each round (top-to-bottom order within a column). */
const ROUND_HEADING =
  "font-mono text-xs font-semibold uppercase tracking-wide text-[var(--text)]";

// BracketViewer is responsible for:
// - laying out four regional columns (2×2) + championship section below
// - BigInt-safe navigation/share controls
// - hover tooltip toggling (delegated to GameSlot for visuals)
export default function BracketViewer({ bracket, probability }) {
  const navigate = useNavigate();
  const bracketId = BigInt(bracket.id); // JSON-safe id string -> BigInt for arithmetic
  const regions = ["East", "South", "West", "Midwest"];

  const [regionFilter, setRegionFilter] = React.useState("All");
  const [zoom, setZoom] = React.useState(1.0);
  const [hoverKey, setHoverKey] = React.useState(null);
  const keyFor = (roundName, idx) => `${roundName}:${idx}`;

  const rounds = bracket.rounds;
  const allRegionRounds = regions
    .map((region, regionIdx) => ({
      region,
      regionIdx,
      round_of_64: rounds.round_of_64.slice(regionIdx * 8, regionIdx * 8 + 8),
      round_of_32: rounds.round_of_32.slice(regionIdx * 4, regionIdx * 4 + 4),
      sweet_16: rounds.sweet_16.slice(regionIdx * 2, regionIdx * 2 + 2),
      elite_8: rounds.elite_8.slice(regionIdx, regionIdx + 1),
    }));
  const regionRounds = allRegionRounds.filter(
    (r) => regionFilter === "All" || r.region === regionFilter,
  );
  const regionByName = Object.fromEntries(allRegionRounds.map((r) => [r.region, r]));
  const layout = ACTIVE_BRACKET_LAYOUT_PROFILE;
  const layoutRegions = [layout.topLeft, layout.topRight, layout.bottomLeft, layout.bottomRight];
  const hasLayoutRegions = layoutRegions.every((name) => regionByName[name]);

  const bracketUrl = window.location.href;
  const goPrev = () => bracketId > 0n && navigate(`/bracket/${(bracketId - 1n).toString()}`);
  const goNext = () =>
    bracketId < MAX_BRACKET_ID && navigate(`/bracket/${(bracketId + 1n).toString()}`);
  const randomGo = () => {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    let id = 0n;
    for (const b of bytes) id = (id << 8n) + BigInt(b);
    const mask = (1n << 63n) - 1n;
    navigate(`/bracket/${(id & mask).toString()}`);
  };

  const renderRegionColumn = (r) => (
    <div key={r.region} className="min-w-0 w-full max-w-full">
      <div className="font-mono text-sm text-[var(--text-muted)]">{r.region} region</div>
      <div className="mt-3 flex flex-col gap-4">
        <div className="border-t border-[var(--border)] pt-3">
          <div className={ROUND_HEADING}>Round of 64</div>
          <div className="mt-2 space-y-3">
            {r.round_of_64.map((game, idx) => {
              const k = keyFor("round_of_64", r.regionIdx * 8 + idx);
              return (
                <div key={k} onMouseEnter={() => setHoverKey(k)} onMouseLeave={() => setHoverKey(null)}>
                  <GameSlot game={game} showTooltip={hoverKey === k} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="border-t border-[var(--border)] pt-3">
          <div className={ROUND_HEADING}>Round of 32</div>
          <div className="mt-2 space-y-3">
            {r.round_of_32.map((game, idx) => {
              const k = keyFor("round_of_32", r.regionIdx * 4 + idx);
              return (
                <div key={k} onMouseEnter={() => setHoverKey(k)} onMouseLeave={() => setHoverKey(null)}>
                  <GameSlot game={game} showTooltip={hoverKey === k} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="border-t border-[var(--border)] pt-3">
          <div className={ROUND_HEADING}>Round of 16</div>
          <div className="mt-2 space-y-3">
            {r.sweet_16.map((game, idx) => {
              const k = keyFor("sweet_16", r.regionIdx * 2 + idx);
              return (
                <div key={k} onMouseEnter={() => setHoverKey(k)} onMouseLeave={() => setHoverKey(null)}>
                  <GameSlot game={game} showTooltip={hoverKey === k} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="border-t border-[var(--border)] pt-3">
          <div className={ROUND_HEADING}>Round of 8</div>
          <div className="mt-2">
            {r.elite_8.map((game) => {
              const k = keyFor("elite_8", r.regionIdx);
              return (
                <div key={k} onMouseEnter={() => setHoverKey(k)} onMouseLeave={() => setHoverKey(null)}>
                  <GameSlot game={game} showTooltip={hoverKey === k} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderChampionshipColumn = () => (
    <section className="min-w-0 w-full max-w-full border-t border-[var(--border)] pt-6" aria-label="Championship path">
      <div className="font-mono text-sm text-[var(--text-muted)]">Championship path</div>
      <div className="mt-3 flex flex-col gap-4">
        <div>
          <div className={ROUND_HEADING}>Semi Finals</div>
          <div className="mt-3 space-y-4">
            {rounds.final_four.map((game, idx) => {
              const k = keyFor("final_four", idx);
              return (
                <div key={k} onMouseEnter={() => setHoverKey(k)} onMouseLeave={() => setHoverKey(null)}>
                  <GameSlot game={game} showTooltip={hoverKey === k} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="border-t border-[var(--border)] pt-4">
          <div className={ROUND_HEADING}>Championship Game</div>
          <div className="mt-3">
            {rounds.championship.map((game, idx) => {
              const k = keyFor("championship", idx);
              return (
                <div key={k} onMouseEnter={() => setHoverKey(k)} onMouseLeave={() => setHoverKey(null)}>
                  <GameSlot game={game} showTooltip={hoverKey === k} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="home-shell mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden px-4 py-8">
      <div className="relative z-10 flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-mono text-xs text-[var(--text-muted)]">Bracket ID: {formatInteger(bracket.id)}</div>
            <div className="mt-1 text-2xl font-semibold">
              Champion: <span className="text-[var(--accent)]">{bracket.champion.name}</span>
            </div>
          </div>
          <div className="text-sm text-[var(--text-muted)]">
            <div>
              Bracket probability: <span className="font-mono">{formatProbSci(probability.probability)}</span>
            </div>
            <div className="mt-1">
              log probability:{" "}
              <span className="font-mono">{probability.log_probability.toFixed(6)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <div className="flex items-center gap-2">
            {["All", ...regions].map((r) => {
              const selected = regionFilter === r;
              return (
                <button
                  key={r}
                  className={[
                    "rounded border px-3 py-1 text-sm",
                    selected
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]",
                  ].join(" ")}
                  onClick={() => setRegionFilter(r)}
                  aria-label={`Region filter ${r}`}
                >
                  {r === "All" ? "All regions" : regionLabel(r)}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ZoomControls zoom={zoom} setZoom={setZoom} />
            <div className="flex items-center gap-2">
              <button
                className="rounded border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--accent)] disabled:opacity-50"
                onClick={goPrev}
                disabled={bracketId <= 0n}
                aria-label="Previous Bracket"
              >
                Previous
              </button>
              <button
                className="rounded border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--accent)] disabled:opacity-50"
                onClick={goNext}
                disabled={bracketId >= MAX_BRACKET_ID}
                aria-label="Next Bracket"
              >
                Next
              </button>
              <button
                className="rounded border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--accent)]"
                onClick={randomGo}
                aria-label="Random Bracket"
              >
                Random
              </button>
            </div>
          </div>
        </div>

        <SharePanel
          bracketUrl={bracketUrl}
          bracketId={String(bracket.id)}
          championName={bracket.champion.name}
        />
      </div>

      <div className="relative z-10 mt-6 w-full min-w-0 max-w-full overflow-x-hidden overflow-y-visible rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-3 backdrop-blur-sm sm:p-4">
        {/* CSS zoom scales layout width so the bracket can stay within the viewport (vertical scroll only). */}
        <div className="w-full min-w-0 max-w-full" style={{ zoom }}>
          {/* Traditional layout:
              East top-left, West top-right, South bottom-left, Midwest bottom-right.
              When filtering to a single region, stack region + finals vertically (no horizontal scroll). */}
          {regionFilter === "All" ? (
            <div className="flex w-full min-w-0 max-w-full flex-col gap-8">
              {/* Four regions in a 2×2 grid — full width for both columns (no center column). */}
              <div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-6">
                <div className="min-w-0">
                  {hasLayoutRegions ? renderRegionColumn(regionByName[layout.topLeft]) : null}
                </div>
                <div className="min-w-0">
                  {hasLayoutRegions ? renderRegionColumn(regionByName[layout.topRight]) : null}
                </div>
                <div className="min-w-0">
                  {hasLayoutRegions ? renderRegionColumn(regionByName[layout.bottomLeft]) : null}
                </div>
                <div className="min-w-0">
                  {hasLayoutRegions ? renderRegionColumn(regionByName[layout.bottomRight]) : null}
                </div>
              </div>
              {renderChampionshipColumn()}
            </div>
          ) : (
            <div className="flex w-full min-w-0 max-w-full flex-col gap-6">
              <div className="flex min-w-0 flex-col gap-6">
                {regionRounds.map((r) => renderRegionColumn(r))}
              </div>
              <div className="min-w-0 w-full">{renderChampionshipColumn()}</div>
            </div>
          )}
          <div className="mt-6 text-xs text-[var(--text-muted)] border-t border-[var(--border)] pt-3">
            This site is an independent fan project and is not affiliated with or endorsed by the NCAA or any of its member institutions.
          </div>
        </div>
      </div>
    </div>
  );
}

