/**
 * Writes fully localized es/ar MDX from EN source + bundled translations.
 * Run: node scripts/locale-data/write-localized.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dump as yamlDump, load as yamlLoad } from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const contentRoot = path.join(root, "src/content");

function parseMdx(file) {
  const raw = fs.readFileSync(file, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`Invalid MDX: ${file}`);
  return { data: yamlLoad(match[1]), body: (match[2] ?? "").trim() };
}

function writeMdx(file, data, body) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const fm = yamlDump(data, { lineWidth: -1, noRefs: true }).trimEnd();
  fs.writeFileSync(file, `---\n${fm}\n---\n${body ? `\n${body}\n` : ""}`, "utf8");
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : e.name.endsWith(".mdx") ? [full] : [];
  });
}

// Load per-collection locale bundles (generated/ maintained alongside EN)
const bundleRoot = path.dirname(fileURLToPath(import.meta.url));
const collections = ["resources", "features", "pages", "categories", "products", "blog"];

let written = 0;
const missing = [];

for (const collection of collections) {
  for (const locale of ["es", "ar"]) {
    const bundlePath = path.join(bundleRoot, `${locale}-${collection}.json`);
    if (!fs.existsSync(bundlePath)) {
      missing.push(bundlePath);
      continue;
    }
    const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
    const enDir = path.join(contentRoot, collection, "en");

    for (const enFile of walk(enDir)) {
      const rel = path.relative(enDir, enFile).replace(/\\/g, "/");
      const slug = rel.replace(/\.mdx$/, "");
      const entry = bundle[slug] ?? bundle[rel];
      if (!entry) {
        missing.push(`${locale}-${collection}/${slug}`);
        continue;
      }
      writeMdx(path.join(contentRoot, collection, locale, rel), entry.data, entry.body ?? "");
      written++;
    }
  }
}

console.log(`Wrote ${written} localized files.`);
if (missing.length) {
  console.log(`Missing bundles/entries: ${missing.length}`);
  missing.slice(0, 30).forEach((m) => console.log("  -", m));
}
