/**
 * Localize money-page MDX (categories, products, features, pages) to es/ar.
 * Run: npx tsx scripts/localize-money-pages.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseMdx, writeMdx, walkMdx } from "./lib/mdx-io.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "src", "content");
const collections = ["categories", "products", "features", "pages"] as const;

const ES_MAP = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/locale-data/es-strings-map.json"), "utf8"),
) as Record<string, string>;
const AR_MAP = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/locale-data/ar-strings-map.json"), "utf8"),
) as Record<string, string>;

const SKIP = new Set([
  "path",
  "categorySlugs",
  "relatedBlogSlugs",
  "clusterSlugs",
  "pillarSlug",
  "canonicalSlug",
  "image",
  "images",
  "isPillar",
  "noIndex",
  "level",
  "popular",
]);

function isPassthrough(s: string): boolean {
  if (!s) return true;
  if (s.startsWith("/") || s.startsWith("http") || s.includes(".webp")) return true;
  if (/^[a-z0-9-]+$/.test(s) && s.includes("-")) return true;
  return false;
}

function translateString(s: string, locale: "es" | "ar"): string {
  if (isPassthrough(s)) return s;
  const map = locale === "es" ? ES_MAP : AR_MAP;
  return map[s] ?? s;
}

function deepTranslate(value: unknown, locale: "es" | "ar"): unknown {
  if (typeof value === "string") return translateString(value, locale);
  if (Array.isArray(value)) return value.map((v) => deepTranslate(v, locale));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SKIP.has(k) ? v : deepTranslate(v, locale);
    }
    return out;
  }
  return value;
}

let written = 0;
const untranslated: string[] = [];

for (const collection of collections) {
  const enDir = path.join(contentRoot, collection, "en");
  for (const enFile of walkMdx(enDir)) {
    const rel = path.relative(enDir, enFile).replace(/\\/g, "/");
    const en = parseMdx(enFile);
    for (const locale of ["es", "ar"] as const) {
      const data = deepTranslate(JSON.parse(JSON.stringify(en.data)), locale) as Record<
        string,
        unknown
      >;
      const body = deepTranslate(en.body, locale) as string;
      const outPath = path.join(contentRoot, collection, locale, rel);
      writeMdx(outPath, data, body);
      written++;

      const enJson = JSON.stringify({ data: en.data, body: en.body });
      const outJson = JSON.stringify({ data, body });
      if (enJson === outJson) untranslated.push(`${collection}/${locale}/${rel}`);
    }
  }
}

console.log(`Wrote ${written} localized money-page MDX files.`);
if (untranslated.length) {
  console.log(`Still identical to EN (${untranslated.length}):`);
  untranslated.slice(0, 15).forEach((f) => console.log(`  - ${f}`));
}
