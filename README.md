# Bracket Archive

A deterministic archive of every possible 63-game single-elimination tournament bracket.

Instead of storing billions/trillions of rows, this project treats a bracket as a 63-bit binary sequence:

- one bit per game (`0` = top team wins, `1` = bottom team wins),
- packed into a single integer ID in `[0, 2^63 - 1]`,
- decoded on demand into a full bracket view.

That gives exactly:

- **9,223,372,036,854,775,808** distinct brackets.

---

## Why this project is interesting

- **Deterministic universe**: every valid bracket has a reversible ID.
- **No bracket table required**: bracket structure is computed from the ID.
- **BigInt-safe**: IDs are handled as `BigInt` in frontend and backend.
- **Static-host compatible**: works on GitHub Pages with local deterministic fallback for API-like reads.
- **Elo-driven win percentages**: game probabilities use Elo expected score math:
  \[
  P(A \text{ beats } B)=\frac{1}{1+10^{(R_B-R_A)/400}}
  \]
  (formula reference: [Elo rating system](https://en.wikipedia.org/wiki/Elo_rating_system)).

---

## Repository layout

```text
backend/                 Django API + bracket engine mirror
frontend/                React + Vite + Tailwind UI
data/
  ELO_Ratings.csv        Source Elo values used for probabilities
  teams.txt              Team metadata source
docs/
  index.html             GitHub Pages publish root (generated)
  assets/*               GitHub Pages static assets (generated)
  GITHUB_DEPLOYMENT.md   Deploy instructions
  SERVING.md             Local serving notes
static/                  Django static files (if needed)
```

---

## Core architecture

### 1) Bracket encoding model

- 63 tournament games => 63 bits.
- Bit positions are stable and deterministic across rounds.
- Integer ID is the bit-packed representation.
- Decode function reconstructs:
  - all rounds,
  - winner progression,
  - champion,
  - per-game top/bottom teams.

### 2) Frontend-first deterministic engine

Frontend contains a full engine mirror under `frontend/src/engine/`:

- `bracketDecode.js` — decode/encode (`bracketFromInt`, `intFromBracket`)
- `bracketProbability.js` — bracket probability math
- `teams.js` — seed/region/team roster (with Elo attached)
- `eloRatings.generated.js` — generated slug->Elo map from CSV
- `elo.js` — Elo expected-score helper

### 3) Backend API (Django)

Primary endpoints (when backend is running):

- `GET /api/brackets/?page=<n>`
- `GET /api/bracket/<id>/`
- `GET /api/bracket/<id>/probability/`

### 4) Static deployment fallback

On GitHub Pages there is no backend runtime, so `/api/*` URLs are unavailable.
The frontend handles this with a local fallback resolver that computes:

- browse pages,
- bracket decode payloads,
- probability payloads,

directly in-browser using deterministic engine logic and Elo ratings.

---

## Elo data pipeline

Elo values come from `data/ELO_Ratings.csv`.

Build-time script:

- `frontend/scripts/generate-elo-ratings.mjs`

It:

1. reads `School` + `ELO` columns from CSV,
2. matches team names to the roster in `teams.js`,
3. generates `frontend/src/engine/eloRatings.generated.js`,
4. injects `elo` into each team object.

If a roster team is missing from the CSV, generation fails fast.

---

## Local development

### Prerequisites

- Python 3.11+ (or compatible with project setup)
- Node.js 18+ and npm

### Backend

```bash
cd backend
py manage.py migrate
py manage.py runserver
```

Backend runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` to Django in dev.

---

## Build and deploy

### Standard production build

```bash
cd frontend
npm run build
```

### GitHub Pages build

```bash
cd frontend
npm run build:github
```

This command:

1. regenerates Elo map from CSV,
2. builds Vite with GitHub mode (`--mode github --base=./`),
3. copies output to `docs/` (`index.html`, `assets/*`, `404.html`, `.nojekyll`).

Then enable GitHub Pages to serve from branch folder `/docs`.
See `docs/GITHUB_DEPLOYMENT.md` for full steps.

---

## User-facing pages

- **Home** — quick lookup + browse/find/random navigation
- **Browse** — paged bracket thumbnails
- **Find a Bracket** — game-by-game bit picker with live matching IDs
- **Bracket Viewer** — full bracket tree, per-game winner highlighting, Elo tooltip probabilities
- **About** — deterministic model + project inspiration

---

## Security and input handling

- Numeric fields are sanitized and validated to digits only.
- Paste/drop/key filtering is enforced for integer entry fields.
- BigInt parsing is bounded before navigation/fetch.
- No arbitrary code evaluation paths are used for user text input.

---

## Notes for contributors

- Keep ID handling `BigInt`-safe.
- Do not replace deterministic decode/encode flow with mutable bracket storage.
- If team rosters change, update `teams.js` and regenerate Elo mapping.
- Keep generated file `eloRatings.generated.js` in sync with CSV via build scripts.

---

## Inspiration

Conceptually inspired by the “complete but addressable universe” idea from [Library of Babel](https://libraryofbabel.info/): not by storing every object explicitly, but by defining a deterministic mapping from an address to generated content.

