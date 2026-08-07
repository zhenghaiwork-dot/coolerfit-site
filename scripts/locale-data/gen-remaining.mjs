/**
 * Generate remaining es/ar chunk files from embedded translation pairs.
 * Run: node scripts/locale-data/gen-remaining.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const chunkDir = path.join(dir, "chunks");

function pairsToMap(pairs) {
  const m = {};
  for (const [k, v] of pairs) m[k] = v;
  return m;
}

function writeChunk(locale, batchNum, pairs) {
  const out = path.join(chunkDir, `${locale}-${batchNum}.json`);
  fs.writeFileSync(out, JSON.stringify(pairsToMap(pairs), null, 2) + "\n");
  console.log(`Wrote ${locale}-${batchNum}.json ${pairs.length} entries`);
}

// Import pair data from separate modules to keep file manageable
const modules = [
  "./pairs/es-3.mjs",
  "./pairs/es-4.mjs",
  "./pairs/es-5.mjs",
  "./pairs/es-6.mjs",
  "./pairs/es-7.mjs",
  "./pairs/ar-2.mjs",
  "./pairs/ar-3.mjs",
  "./pairs/ar-4.mjs",
  "./pairs/ar-5.mjs",
  "./pairs/ar-6.mjs",
  "./pairs/ar-7.mjs",
];

for (const mod of modules) {
  const { locale, batch, pairs } = await import(mod);
  writeChunk(locale, batch, pairs);
}

console.log("Done generating remaining chunks.");
