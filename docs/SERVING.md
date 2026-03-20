# Serving the app (Django + React SPA)

## Single-server (recommended for local “production”)

1. **Build the frontend** (from the project root):

   ```bash
   cd frontend
   npm install
   npm run build
   ```

   Output goes to `frontend/dist/` (`index.html` + `assets/`).

2. **Run Django** (from the `backend/` folder):

   ```bash
   cd backend
   py manage.py runserver
   ```

3. Open **`http://127.0.0.1:8000/`** (not port 5173).

   - **`/`**, **`/browse`**, **`/bracket/<id>`**, etc. are served as **`index.html`** (SPA fallback).
   - **`/assets/*`** serves hashed JS/CSS from `frontend/dist/assets/`.
   - **`/api/*`** is the JSON API (same origin; no CORS setup needed).

If `frontend/dist/index.html` is missing, the home page returns **503** with instructions to run `npm run build`.

## Development (hot reload)

- **Django:** `py manage.py runserver` (API on port 8000).
- **Vite:** `cd frontend && npm run dev` (UI on port **5173**, proxies `/api` → 8000).

Use **`http://localhost:5173`** while developing; use **8000** when testing the built bundle behind Django.

## Static-only hosting (no Django for HTML)

If the API is hosted elsewhere, set `VITE_API_BASE_URL` when building the frontend so `fetch` targets the API origin.

For pure static file hosts (S3, Netlify, etc.), configure **SPA fallback**: every unknown path should return **`index.html`**.

Examples:

- **Netlify:** `_redirects` with `/* /index.html 200`
- **Nginx:** `try_files $uri $uri/ /index.html;`

## Security note

`serve_frontend_asset` and `serve_spa_index` are suitable for the app server behind a reverse proxy. For large-scale production, consider **WhiteNoise** or serving `dist/` from nginx/CDN and proxying `/api/` to Django.
