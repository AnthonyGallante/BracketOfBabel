const STORAGE_KEY = "mm_tournament";

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
  }
  return normalized;
}
