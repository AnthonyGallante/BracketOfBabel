/**
 * Live men's tournament results encoded as Find-page selections.
 *
 * `selections[i]` is the outcome for **game index `i`** (0–62), same as the Find page:
 * - `0` — top team in that matchup won
 * - `1` — bottom team won
 * - `null` — not yet played / unknown
 *
 * Human "game numbers" in announcements are often **1-based**; our index is **0-based**
 * (game 1 → index 0). Update this file as more games finish.
 *
 * Last updated: see `LIVE_MENS_BRACKET_UPDATED` below.
 * 
 */

/** ISO date string (YYYY-MM-DD) — bump when you edit results. */
export const LIVE_MENS_BRACKET_UPDATED = "2026-03-27";

/** Short note for the UI (optional). */
export const LIVE_MENS_BRACKET_NOTE =
  "Round of 64 complete; round of 32 in progress. Unknown games match all outcomes for those bits.";

/**
 * @returns {(number|null)[]} length 63
 */
export function getLiveMensBracketSelections() {
  return [...LIVE_MENS_BRACKET_SELECTIONS];
}

/** @type {(number|null)[]} */
const LIVE_MENS_BRACKET_SELECTIONS = [
  // Round of 64 (games 1–32 → indices 0–31)
  0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  // Round of 32 (games 33–48 → indices 32–47) — partial
  0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1,
  // Sweet 16+ (indices 48–62) — not started in this snapshot
  0, 1, 0, 0, 0, 1, 0, 0, 
  1, 1, 0, 0, 
  null, null, 
  null,
];
