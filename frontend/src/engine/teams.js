import { ELO_BY_SLUG_MEN } from "./eloRatingsMen.generated.js";
import { ELO_BY_SLUG_WOMEN } from "./eloRatingsWomen.generated.js";
import { REGIONS_MEN, TEAMS_MEN } from "./teamsMen.js";
import { REGIONS_WOMEN, TEAMS_WOMEN } from "./teamsWomen.js";
import { TOURNAMENTS, getSelectedTournament } from "./tournamentState.js";

function makeTeam([seed, region, name, slug], eloBySlug) {
  return { seed, region, name, slug, elo: eloBySlug[slug] };
}

function buildRoster(teams, regions, eloBySlug) {
  const teamBySlug = new Map(teams.map((t) => [t[3], makeTeam(t, eloBySlug)]));
  const teamByRegionAndSeed = new Map(
    teams.map((t) => [`${t[1]}|${t[0]}`, makeTeam(t, eloBySlug)])
  );
  return { teams, regions, teamBySlug, teamByRegionAndSeed, eloBySlug };
}

const MEN = buildRoster(TEAMS_MEN, REGIONS_MEN, ELO_BY_SLUG_MEN);
const WOMEN = buildRoster(TEAMS_WOMEN, REGIONS_WOMEN, ELO_BY_SLUG_WOMEN);

export const REGIONS = MEN.regions;
export const TEAMS = MEN.teams;
export const TEAM_BY_SLUG = MEN.teamBySlug;
export const TEAM_BY_REGION_AND_SEED = MEN.teamByRegionAndSeed;
export const ELO_BY_SLUG = MEN.eloBySlug;

export function getRosterForTournament(tournament = getSelectedTournament()) {
  return tournament === TOURNAMENTS.WOMEN ? WOMEN : MEN;
}

export function getRegions(tournament = getSelectedTournament()) {
  return getRosterForTournament(tournament).regions;
}

export function getEloBySlug(tournament = getSelectedTournament()) {
  return getRosterForTournament(tournament).eloBySlug;
}

export function getTeamBySlug(slug, tournament = getSelectedTournament()) {
  return getRosterForTournament(tournament).teamBySlug.get(slug);
}

export function getTeamByRegionAndSeed(region, seed, tournament = getSelectedTournament()) {
  return getRosterForTournament(tournament).teamByRegionAndSeed.get(`${region}|${seed}`);
}

