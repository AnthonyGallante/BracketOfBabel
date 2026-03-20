import {
  BRACKETS_PER_PAGE,
  MAX_BRACKET_ID,
  TOTAL_BRACKET_COUNT,
  bracketFromInt,
} from "../engine/bracketEngine.js";

const APPROX_TOP_WIN_PROBABILITY = 0.5;
const APPROX_LOG_PROBABILITY = 63 * Math.log(0.5);
const APPROX_PROBABILITY = Math.exp(APPROX_LOG_PROBABILITY);

function parseQuery(urlPath) {
  const u = new URL(urlPath, "https://local.invalid");
  return u.searchParams;
}

function parseBracketId(idText) {
  if (!/^\d+$/.test(idText)) return null;
  const n = BigInt(idText);
  if (n < 0n || n > MAX_BRACKET_ID) return null;
  return n;
}

function withApproxWinProbabilities(bracket) {
  const patchGame = (game) => ({
    ...game,
    top_win_probability: APPROX_TOP_WIN_PROBABILITY,
    bottom_win_probability: APPROX_TOP_WIN_PROBABILITY,
  });

  return {
    ...bracket,
    games: bracket.games.map(patchGame),
    rounds: {
      ...bracket.rounds,
      round_of_64: bracket.rounds.round_of_64.map(patchGame),
      round_of_32: bracket.rounds.round_of_32.map(patchGame),
      sweet_16: bracket.rounds.sweet_16.map(patchGame),
      elite_8: bracket.rounds.elite_8.map(patchGame),
      final_four: bracket.rounds.final_four.map(patchGame),
      championship: bracket.rounds.championship.map(patchGame),
    },
  };
}

function listBrackets(path) {
  const q = parseQuery(path);
  const pageRaw = q.get("page") ?? "0";
  if (!/^\d+$/.test(pageRaw)) throw new Error("Invalid page");
  const page = BigInt(pageRaw);
  const start = page * BRACKETS_PER_PAGE;
  if (start >= TOTAL_BRACKET_COUNT) return [];

  const maxCount = 200n;
  const out = [];
  for (let i = 0n; i < maxCount; i++) {
    const id = start + i;
    if (id >= TOTAL_BRACKET_COUNT) break;
    const bracket = bracketFromInt(id);
    out.push({
      id: id.toString(),
      champion: bracket.champion,
      bits_preview: bracket.bits.join(""),
    });
  }
  return out;
}

function getBracket(path) {
  const m = path.match(/^\/api\/bracket\/(\d+)\/$/);
  if (!m) return null;
  const id = parseBracketId(m[1]);
  if (id === null) throw new Error("Invalid bracket id");
  return withApproxWinProbabilities(bracketFromInt(id));
}

function getBracketProbability(path) {
  const m = path.match(/^\/api\/bracket\/(\d+)\/probability\/$/);
  if (!m) return null;
  const id = parseBracketId(m[1]);
  if (id === null) throw new Error("Invalid bracket id");
  return {
    id: id.toString(),
    probability: APPROX_PROBABILITY,
    log_probability: APPROX_LOG_PROBABILITY,
  };
}

export function resolveLocalApi(path) {
  if (path.startsWith("/api/brackets/")) return listBrackets(path);
  const p = getBracketProbability(path);
  if (p) return p;
  const b = getBracket(path);
  if (b) return b;
  throw new Error(`No local API fallback for ${path}`);
}

