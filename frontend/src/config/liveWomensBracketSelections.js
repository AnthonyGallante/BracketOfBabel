/**
 * Live women's tournament results encoded as Find-page selections.
 *
 * Same semantics as `liveMensBracketSelections.js`: index `i` is game `i` (0–62);
 * `0` = top team won, `1` = bottom won, `null` = unknown.
 *
 * Last updated: see `LIVE_WOMENS_BRACKET_UPDATED` below.
 */

/** ISO date string (YYYY-MM-DD) — bump when you edit results. */
export const LIVE_WOMENS_BRACKET_UPDATED = "2026-03-18";

/** Short note for the UI (optional). */
export const LIVE_WOMENS_BRACKET_NOTE =
  "Round of 64 snapshot; later rounds unknown until games finish.";

/**
 * @returns {(number|null)[]} length 63
 */
export function getLiveWomensBracketSelections() {
  return [...LIVE_WOMENS_BRACKET_SELECTIONS];
}

/** @type {(number|null)[]} */
const LIVE_WOMENS_BRACKET_SELECTIONS = [
  // Round of 64 (games 1–32 → indices 0–31). Derived from announced winners vs R64 top/bottom order.
  0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // Round of 32+ (indices 32–62) — not encoded in this snapshot
  null, 1, null, null, null, null, null, null, null, 1, 1, 1, null, null, null, 1,
  null, null, null, null, null, null, null, null,
  null, null, null, null,
  null, null, 
  null,
];
