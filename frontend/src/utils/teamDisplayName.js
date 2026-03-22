/**
 * Compact team names for tight UI (Find page, thumbnails, mobile).
 * Prefer explicit abbreviations when known; otherwise shorten common suffixes.
 */

/** @type {Record<string, string>} slug → short display (e.g. media / NCAA common usage) */
const ABBREV_BY_SLUG = {
  "virginia-commonwealth": "VCU",
  "central-florida": "UCF",
  "long-island-university": "LIU",
  "uc-san-diego": "UCSD",
  "texas-christian": "TCU",
  "saint-marys-ca": "Saint Mary's",
  "brigham-young": "BYU",
};

/**
 * @param {{ name?: string; slug?: string } | null | undefined} team
 * @returns {string}
 */
export function compactTeamDisplayName(team) {
  if (!team?.name) return "";
  const slug = team.slug;
  if (slug && ABBREV_BY_SLUG[slug]) return ABBREV_BY_SLUG[slug];

  let name = team.name;
  // "Long Island University" → "Long Island U", etc.
  name = name.replace(/\s+University\b/gi, " U");
  // "Michigan State" → "Michigan St"; "North Dakota State" → "North Dakota St"
  name = name.replace(/\s+State\b/g, " St");
  name = name.replace(/\s+/g, " ").trim();
  return name;
}
