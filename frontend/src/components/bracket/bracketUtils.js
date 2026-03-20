// bracketUtils.js
//
// Small, focused helper functions used by `BracketViewer.jsx` and its subcomponents.
// Keeping helpers outside the main viewer keeps the core file readable.

export function clampZoom(zoom) {
  // Bracket visualization should not be zoomed to extremes where it becomes unusable.
  const min = 0.7;
  const max = 1.25;
  return Math.min(max, Math.max(min, zoom));
}

export function teamLogoUrl(team) {
  // Requirements-provided logo URL formula (do not cache/redistribute).
  return `https://cdn.ssref.net/req/202510241/tlogo/ncaa/${team.slug}-2025.png`;
}

export function formatProbSci(p) {
  // Probability mass for a full bracket is extremely small; show scientific notation.
  if (!Number.isFinite(p)) return String(p);
  return p.toExponential(6);
}

/**
 * Format integer-like values with grouping commas.
 * Accepts bigint, number, or integer string; falls back to String(value).
 */
export function formatInteger(value) {
  if (typeof value === "bigint") return value.toLocaleString("en-US");
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value).toLocaleString("en-US");
  }
  if (typeof value === "string") {
    const s = value.trim();
    if (/^-?\d+$/.test(s)) return BigInt(s).toLocaleString("en-US");
  }
  return String(value);
}

export function shareToX(url, text = "") {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  if (text.trim()) {
    return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
  }
  return `https://twitter.com/intent/tweet?url=${u}`;
}

export function shareToReddit(url, title = "") {
  const u = encodeURIComponent(url);
  if (title.trim()) {
    return `https://www.reddit.com/submit?url=${u}&title=${encodeURIComponent(title)}`;
  }
  return `https://www.reddit.com/submit?url=${u}`;
}

/** Facebook web sharer (opens in a new tab). */
export function shareToFacebook(url) {
  const u = encodeURIComponent(url);
  return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
}

/** LinkedIn off-site share (URL only; LinkedIn fetches preview metadata). */
export function shareToLinkedIn(url) {
  const u = encodeURIComponent(url);
  return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
}

/**
 * Normalize a Mastodon server hostname for share links.
 * Accepts "mastodon.social", "https://mastodon.social/", etc.
 * @returns {string} hostname (lowercase), or "" if invalid
 */
export function normalizeMastodonHost(input) {
  if (!input || typeof input !== "string") return "";
  let s = input.trim();
  s = s.replace(/^https?:\/\//i, "");
  const slash = s.indexOf("/");
  if (slash !== -1) s = s.slice(0, slash);
  s = s.replace(/\/$/, "").trim();
  if (!s) return "";
  if (!/^[\w.-]+(:\d+)?$/i.test(s)) return "";
  return s.toLowerCase();
}

/**
 * Standard Mastodon web UI share intent (works on most Mastodon 3.x/4.x servers).
 * @param {string} host — e.g. mastodon.social
 * @param {string} text — pre-filled post body (usually includes URL)
 * @returns {string|null}
 */
export function buildMastodonShareUrl(host, text) {
  const h = normalizeMastodonHost(host);
  if (!h) return null;
  return `https://${h}/share?text=${encodeURIComponent(text)}`;
}

/**
 * Open default mail client with subject + body.
 * @param {{ subject: string, body: string }} opts
 */
export function shareViaEmail({ subject, body }) {
  const s = encodeURIComponent(subject);
  const b = encodeURIComponent(body);
  return `mailto:?subject=${s}&body=${b}`;
}

export function regionLabel(region) {
  return region;
}

