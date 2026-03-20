# GitHub Deployment Prep

This project is configured so you can deploy the frontend to GitHub Pages with one command.

## 1) Build GitHub Pages output

From the repository root:

```bash
cd frontend
npm install
npm run build:github
```

What this does:

- Builds the app in **GitHub mode** (`VITE_USE_HASH_ROUTER=true`) so routes work on static hosting.
- Uses relative asset paths (`--base=./`).
- Publishes static output into `docs/`:
  - `docs/index.html`
  - `docs/assets/*`
  - `docs/404.html`
  - `docs/.nojekyll`

## 2) Push to GitHub

Create a public repository, then push this project to it.

## 3) Enable GitHub Pages

In GitHub repository settings:

- **Settings → Pages**
- **Build and deployment**: Deploy from a branch
- **Branch**: `main` (or your default branch)
- **Folder**: `/docs`

After save, GitHub will publish `docs/index.html` as your site root.

## Notes

- The app uses hash routing in GitHub mode, so links look like:
  - `https://<user>.github.io/<repo>/#/browse`
- For static-only GitHub Pages, the frontend now includes a local deterministic fallback for:
  - `GET /api/brackets/?page=...`
  - `GET /api/bracket/<id>/`
  - `GET /api/bracket/<id>/probability/`
- If your API is hosted separately, set `VITE_API_BASE_URL` when building so frontend requests point to that backend (recommended for full parity with backend probability logic).

