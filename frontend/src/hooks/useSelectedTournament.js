import { useSyncExternalStore } from "react";
import {
  TOURNAMENTS,
  getSelectedTournament,
  subscribeToTournamentChanges,
} from "../engine/tournamentState.js";

/**
 * Tracks `mm_tournament` in localStorage and re-renders when it changes (including from other tabs).
 * @returns {typeof TOURNAMENTS.MEN | typeof TOURNAMENTS.WOMEN}
 */
export function useSelectedTournament() {
  return useSyncExternalStore(
    subscribeToTournamentChanges,
    getSelectedTournament,
    () => TOURNAMENTS.MEN,
  );
}
