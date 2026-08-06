/**
 * Diffs the routes present in the legacy dist against the new Astro build.
 * Both are walked for index.html files so the comparison is on real URLs.
 */
import fs from "node:fs";
import path from "node:path";

function routes(root) {
  const found = new Set();
  (function walk(dir, prefix) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "assets" || entry.name === "_astro" || entry.name === "api") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, `${prefix}/${entry.name}`);
      else if (entry.name === "index.html") found.add(prefix || "/");
      else if (entry.name.endsWith(".html")) found.add(`${prefix}/${entry.name.replace(/\.html$/, "")}`);
    }
  })(root, "");
  return found;
}

const [oldRoot, newRoot] = process.argv.slice(2);
const oldRoutes = routes(oldRoot);
const newRoutes = routes(newRoot);

const missing = [...oldRoutes].filter((r) => !newRoutes.has(r)).sort();
const extra = [...newRoutes].filter((r) => !oldRoutes.has(r)).sort();

console.log(`old: ${oldRoutes.size} routes   new: ${newRoutes.size} routes\n`);
console.log(`MISSING in new build (${missing.length}):`);
for (const r of missing) console.log("  " + r);
console.log(`\nEXTRA in new build (${extra.length}):`);
for (const r of extra) console.log("  " + r);
