import { resolveLocalApi } from "./localApiFallback.js";
const DEFAULT_API_BASE_URL = "";

export function getApiBaseUrl() {
  // Vite injects env vars with VITE_ prefix.
  const v = import.meta.env.VITE_API_BASE_URL;
  // Allow explicitly setting to empty string.
  if (v !== undefined) return String(v);
  return DEFAULT_API_BASE_URL;
}

export function apiUrl(path) {
  return `${getApiBaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function apiGetJson(path) {
  try {
    const res = await fetch(apiUrl(path), { method: "GET" });
    if (!res.ok) {
      // Static hosts (e.g. GitHub Pages) do not provide /api routes.
      // Fall back to local deterministic compute for supported endpoints.
      if (path.startsWith("/api/")) return resolveLocalApi(path);
      const text = await res.text().catch(() => "");
      throw new Error(`GET ${path} failed: ${res.status} ${text}`);
    }
    return res.json();
  } catch (err) {
    if (path.startsWith("/api/")) return resolveLocalApi(path);
    throw err;
  }
}

