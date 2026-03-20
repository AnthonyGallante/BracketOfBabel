// bracketEngine.js
//
// Thin façade exporting the public API for the bracket engine.
// Internals are split into smaller modules to keep files maintainable.

export * from "./constants.js";
export { bracketFromInt, intFromBracket } from "./bracketDecode.js";
export { mostLikelyBracket } from "./mostLikely.js";
export { bracketLogProbability, bracketProbability } from "./bracketProbability.js";

import { BRACKETS_PER_PAGE } from "./constants.js";

export function pageFromBracketId(id) {
  // BigInt-safe page index (0-based).
  if (typeof id !== "bigint") throw new TypeError("id must be a BigInt");
  return id / BRACKETS_PER_PAGE;
}

export function firstBracketOnPage(page) {
  if (typeof page !== "bigint") throw new TypeError("page must be a BigInt");
  return page * BRACKETS_PER_PAGE;
}

