// Shared BigInt-safe constants for bracket IDs and pagination.

export const TOTAL_BITS = 63;
export const MAX_BRACKET_ID = 9223372036854775807n; // 2^63 - 1 (inclusive)
export const BRACKETS_PER_PAGE = 200n;

// For compatibility with earlier spec skeleton:
// TOTAL_BRACKETS means the inclusive maximum bracket id (2^63 - 1).
export const TOTAL_BRACKETS = MAX_BRACKET_ID;

// Total number of distinct brackets (includes id=0).
export const TOTAL_BRACKET_COUNT = MAX_BRACKET_ID + 1n; // 2^63

// Page indices are 0-based, so valid pages are [0, TOTAL_PAGES-1].
export const TOTAL_PAGES = (TOTAL_BRACKET_COUNT - 1n) / BRACKETS_PER_PAGE + 1n;

