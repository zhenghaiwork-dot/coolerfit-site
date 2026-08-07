/**
 * Astro emits sitemap-index.xml (+ sitemap-0.xml…).
 * Search engines and robots.txt expect the conventional /sitemap.xml entry.
 * Copy the index (or sole sitemap file) so both URLs work on any static host.
 */
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const canonical = path.join(dist, "sitemap.xml");
const indexFile = path.join(dist, "sitemap-index.xml");
const zeroFile = path.join(dist, "sitemap-0.xml");

function main() {
  if (!fs.existsSync(dist)) {
    console.warn("[alias-sitemap] dist/ missing — skip");
    return;
  }

  let source = null;
  if (fs.existsSync(indexFile)) source = indexFile;
  else if (fs.existsSync(zeroFile)) source = zeroFile;
  else {
    const found = fs.readdirSync(dist).filter((f) => /^sitemap.*\.xml$/i.test(f));
    if (found.length) source = path.join(dist, found[0]);
  }

  if (!source) {
    console.warn("[alias-sitemap] no Astro sitemap XML found — skip");
    return;
  }

  fs.copyFileSync(source, canonical);
  console.log(`[alias-sitemap] ${path.basename(source)} → sitemap.xml`);
}

main();
