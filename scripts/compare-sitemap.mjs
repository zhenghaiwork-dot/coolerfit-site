/**
 * The legacy dist is a single-file SPA, so its real URL inventory lives in
 * sitemap.xml. This diffs that list against the pages the Astro build emits.
 */
import fs from "node:fs";
import path from "node:path";

const [sitemapPath, distRoot] = process.argv.slice(2);

const xml = fs.readFileSync(sitemapPath, "utf8");
const oldRoutes = new Set(
  [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => {
    const p = new URL(m[1]).pathname.replace(/\/$/, "");
    return p || "/";
  }),
);

const newRoutes = new Set();
(function walk(dir, prefix) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "_astro" || entry.name === "api") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, `${prefix}/${entry.name}`);
    else if (entry.name === "index.html") newRoutes.add(prefix || "/");
  }
})(distRoot, "");

const missing = [...oldRoutes].filter((r) => !newRoutes.has(r)).sort();
const extra = [...newRoutes].filter((r) => !oldRoutes.has(r)).sort();

console.log(`sitemap: ${oldRoutes.size} urls   build: ${newRoutes.size} pages\n`);
console.log(`MISSING (${missing.length}):`);
for (const r of missing) console.log("  " + r);
console.log(`\nNOT IN SITEMAP (${extra.length}):`);
for (const r of extra) console.log("  " + r);
