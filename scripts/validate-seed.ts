import { readFile } from "node:fs/promises";
import { validateSeed } from "emdash/seed";

const seed = JSON.parse(await readFile("seed/seed.json", "utf8"));
const result = validateSeed(seed);
for (const warning of result.warnings) console.warn(warning);
if (!result.valid) {
  for (const error of result.errors) console.error(error);
  process.exit(1);
}
for (const entries of Object.values(seed.content) as { status: string }[][]) {
  if (entries.some((entry) => entry.status !== "draft"))
    throw new Error(
      "Launch seed content must remain unpublished until reviewed.",
    );
}
console.log("Seed is valid; all initial content is draft-only.");
