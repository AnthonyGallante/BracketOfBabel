/**
 * Numeric input helpers for BigInt-backed UI fields.
 * We only permit ASCII digits to keep parsing predictable and safe.
 */

const DIGITS_ONLY_RE = /^\d+$/;

export function sanitizeDigits(value) {
  return String(value ?? "").replace(/[^\d]/g, "");
}

export function isDigitsOnly(value) {
  return DIGITS_ONLY_RE.test(String(value ?? ""));
}

/**
 * Parse sanitized non-negative integer text into BigInt.
 * Returns null for empty/invalid input or out-of-bounds values.
 */
export function parseBoundedBigInt(rawValue, { min = 0n, max = null } = {}) {
  const text = String(rawValue ?? "").trim();
  if (!isDigitsOnly(text)) return null;
  let parsed;
  try {
    parsed = BigInt(text);
  } catch {
    return null;
  }
  if (parsed < min) return null;
  if (max !== null && parsed > max) return null;
  return parsed;
}

