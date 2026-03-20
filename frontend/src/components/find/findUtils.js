import { BRACKETS_PER_PAGE, TOTAL_BITS } from "../../engine/bracketEngine.js";

export function countUnknownBits(selections) {
  let k = 0;
  for (const v of selections) if (v === null) k += 1;
  return k;
}

export function matchingBracketCount(selections) {
  const k = countUnknownBits(selections);
  return 1n << BigInt(k);
}

export function fixedBitPrefixInfo(selections) {
  const fixedPositions = [];
  const unknownPositions = [];
  for (let i = 0; i < TOTAL_BITS; i++) {
    if (selections[i] === null) unknownPositions.push(i);
    else fixedPositions.push(i);
  }
  return { fixedPositions, unknownPositions };
}

export function generateMatchingBracketIds(
  selections,
  pageBig,
  perPage = BRACKETS_PER_PAGE,
) {
  const { fixedPositions, unknownPositions } = fixedBitPrefixInfo(selections);
  const total = 1n << BigInt(unknownPositions.length);
  const pageSize = BigInt(perPage);
  const start = pageBig * pageSize;
  if (start >= total) return [];
  const end = start + pageSize < total ? start + pageSize : total;

  const ids = [];
  for (let matchIdx = start; matchIdx < end; matchIdx++) {
    let id = 0n;

    // Set fixed bits from user selections.
    for (const pos of fixedPositions) {
      if (selections[pos] === 1) id |= 1n << BigInt(pos);
    }

    // Set unknown bits from the match index bits.
    for (let j = 0; j < unknownPositions.length; j++) {
      const pos = unknownPositions[j];
      const bit = Number((matchIdx >> BigInt(j)) & 1n);
      if (bit === 1) id |= 1n << BigInt(pos);
    }

    ids.push(id);
  }
  return ids;
}

export function parsePageOrZero(v) {
  try {
    const p = BigInt(v ?? "0");
    return p < 0n ? 0n : p;
  } catch {
    return 0n;
  }
}

