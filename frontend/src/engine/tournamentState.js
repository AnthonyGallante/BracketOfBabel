export const STORAGE_KEY = "mm_tournament";

/** Fired on the same document after `setSelectedTournament` updates storage. */
export const TOURNAMENT_CHANGE_EVENT = "mm-tournament-changed";

export const TOURNAMENTS = {
  MEN: "men",
  WOMEN: "women",
};

export function normalizeTournament(value) {
  return value === TOURNAMENTS.WOMEN ? TOURNAMENTS.WOMEN : TOURNAMENTS.MEN;
}

export function getSelectedTournament() {
  if (typeof window === "undefined") return TOURNAMENTS.MEN;
  return normalizeTournament(window.localStorage.getItem(STORAGE_KEY));
}

export function setSelectedTournament(value) {
  const normalized = normalizeTournament(value);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, normalized);
    window.dispatchEvent(
      new CustomEvent(TOURNAMENT_CHANGE_EVENT, { detail: { tournament: normalized } }),
    );
  }
  return normalized;
}

/**
 * Subscribe to tournament changes (same-tab `setSelectedTournament`, cross-tab `storage`, or manual storage edits).
 * @param {() => void} callback
 * @returns {() => void}
 */
export function subscribeToTournamentChanges(callback) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY || e.key === null) callback();
  };
  const onCustom = () => callback();
  window.addEventListener("storage", onStorage);
  window.addEventListener(TOURNAMENT_CHANGE_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TOURNAMENT_CHANGE_EVENT, onCustom);
  };
}
