import {
  BRACKETS_PER_PAGE,
  MAX_BRACKET_ID,
  TOTAL_BRACKET_COUNT,
  bracketLogProbability,
  bracketProbability,
  bracketFromInt,
} from "../engine/bracketEngine.js";
import { eloWinProbability } from "../engine/elo.js";
import { ELO_BY_SLUG } from "../engine/eloRatings.generated.js";

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

function withEloWinProbabilities(bracket) {
  const toProbGame = (game) => {
    const topElo = ELO_BY_SLUG[game.top_team.slug];
    const bottomElo = ELO_BY_SLUG[game.bottom_team.slug];
    const topWin = eloWinProbability(topElo, bottomElo);
    return {
      ...game,
      top_win_probability: topWin,
      bottom_win_probability: 1.0 - topWin,
    };
  };

  return {
    ...bracket,
    games: bracket.games.map(toProbGame),
    rounds: {
      ...bracket.rounds,
      round_of_64: bracket.rounds.round_of_64.map(toProbGame),
      round_of_32: bracket.rounds.round_of_32.map(toProbGame),
      sweet_16: bracket.rounds.sweet_16.map(toProbGame),
      elite_8: bracket.rounds.elite_8.map(toProbGame),
      final_four: bracket.rounds.final_four.map(toProbGame),
      championship: bracket.rounds.championship.map(toProbGame),
    },
  };
}

function toEloMap() {
  return ELO_BY_SLUG;
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
  return withEloWinProbabilities(bracketFromInt(id));
}

function getBracketProbability(path) {
  const m = path.match(/^\/api\/bracket\/(\d+)\/probability\/$/);
  if (!m) return null;
  const id = parseBracketId(m[1]);
  if (id === null) throw new Error("Invalid bracket id");
  const elo = toEloMap();
  return {
    id: id.toString(),
    probability: bracketProbability(id, elo),
    log_probability: bracketLogProbability(id, elo),
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

