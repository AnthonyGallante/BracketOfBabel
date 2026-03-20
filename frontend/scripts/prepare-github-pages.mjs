import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(here, "..");
const repoRoot = resolve(frontendRoot, "..");
const distDir = resolve(frontendRoot, "dist");
const docsDir = resolve(repoRoot, "docs");
const distAssetsDir = resolve(distDir, "assets");
const docsAssetsDir = resolve(docsDir, "assets");

async function main() {
  await mkdir(docsDir, { recursive: true });

  // Replace docs/assets with the latest frontend build output.
  await rm(docsAssetsDir, { recursive: true, force: true });
  await cp(distAssetsDir, docsAssetsDir, { recursive: true });

  // GitHub Pages expects an index.html at the publish root.
  const indexHtml = await readFile(resolve(distDir, "index.html"), "utf8");
  await writeFile(resolve(docsDir, "index.html"), indexHtml, "utf8");

  // Optional SPA fallback if users hit non-hash deep URLs.
  await writeFile(resolve(docsDir, "404.html"), indexHtml, "utf8");

  // Disable Jekyll so files/folders starting with "_" are not ignored.
  await writeFile(resolve(docsDir, ".nojekyll"), "", "utf8");

  console.log("Prepared docs/ for GitHub Pages.");
}

main().catch((err) => {
  console.error("Failed to prepare GitHub Pages output:", err);
  process.exitCode = 1;
});

