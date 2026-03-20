import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

async function main() {
  const here = fileURLToPath(new URL(".", import.meta.url));
  const frontendRoot = resolve(here, "..");
  const outPath = resolve(frontendRoot, "src", "engine", "eloRatings.generated.js");
  const output =
    "// AUTO-GENERATED compatibility export.\n" +
    "export { ELO_BY_SLUG_MEN as ELO_BY_SLUG } from './eloRatingsMen.generated.js';\n";

  await writeFile(outPath, output, "utf8");
  console.log(`Generated ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

