/**
 * Complete es-MX / ar-Gulf MDX localization from English sources.
 * Run: npx tsx scripts/run-full-localization.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseMdx, writeMdx, walkMdx } from "./lib/mdx-io.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "src", "content");
const enSource = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/locale-data/en-source.json"), "utf8"),
) as Record<string, Record<string, { data: Record<string, unknown>; body: string }>>;

type Entry = { data: Record<string, unknown>; body: string };
type LocaleEntry = { es: Entry; ar: Entry };

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

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function isPassthrough(s: string): boolean {
  if (!s) return true;
  if (s.startsWith("/") || s.startsWith("http") || s.includes(".webp")) return true;
  if (/^[a-z0-9-]+$/.test(s) && s.includes("-")) return true;
  return false;
}

/** Exact string translations — populated from bundled maps */
let ES_MAP: Record<string, string> = {};
let AR_MAP: Record<string, string> = {};

function loadMaps() {
  const dir = path.join(root, "scripts/locale-data");
  if (fs.existsSync(path.join(dir, "es-strings-map.json"))) {
    ES_MAP = JSON.parse(fs.readFileSync(path.join(dir, "es-strings-map.json"), "utf8"));
  }
  if (fs.existsSync(path.join(dir, "ar-strings-map.json"))) {
    AR_MAP = JSON.parse(fs.readFileSync(path.join(dir, "ar-strings-map.json"), "utf8"));
  }
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

/** Slug-level complete overrides (preferred over string map) */
const OVERRIDES: Record<string, Record<string, LocaleEntry>> = {};

function loadOverrides() {
  const dir = path.join(root, "scripts/locale-data/overrides");
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const collection = file.replace(/-(es|ar)\.json$/, "").replace(/\.json$/, "");
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    if (!OVERRIDES[collection]) OVERRIDES[collection] = {};
    for (const [slug, entry] of Object.entries(data as Record<string, Entry>)) {
      const locale = file.includes("-ar.") ? "ar" : file.includes("-es.") ? "es" : null;
      if (!locale) continue;
      if (!OVERRIDES[collection][slug]) OVERRIDES[collection][slug] = {} as LocaleEntry;
      OVERRIDES[collection][slug][locale] = entry;
    }
  }
}

function localizeEntry(collection: string, slug: string, en: Entry, locale: "es" | "ar"): Entry {
  const override = OVERRIDES[collection]?.[slug]?.[locale];
  if (override) return override;
  return {
    data: deepTranslate(clone(en.data), locale) as Record<string, unknown>,
    body: deepTranslate(en.body, locale) as string,
  };
}

loadMaps();
loadOverrides();

let written = 0;
const untranslated = new Set<string>();

for (const [collection, files] of Object.entries(enSource)) {
  for (const [relFile, enEntry] of Object.entries(files)) {
    const rel = relFile.replace(/\\/g, "/");
    const slug = rel.replace(/\.mdx$/, "");
    for (const locale of ["es", "ar"] as const) {
      const out = localizeEntry(collection, slug, enEntry, locale);
      // Track strings still in English (simple heuristic: unchanged long strings)
      const check = JSON.stringify(out);
      const enCheck = JSON.stringify(enEntry);
      if (check === enCheck && locale === "es") untranslated.add(`${collection}/${slug}`);

      writeMdx(path.join(contentRoot, collection, locale, rel), out.data, out.body);
      written++;
    }
  }
}

console.log(`Wrote ${written} localized MDX files.`);

// Write string maps for any missing translations (for iterative fill)
const enStrings = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/locale-data/en-strings.json"), "utf8"),
) as string[];
const missingEs = enStrings.filter((s) => !isPassthrough(s) && !ES_MAP[s]);
const missingAr = enStrings.filter((s) => !isPassthrough(s) && !AR_MAP[s]);
console.log(`ES map: ${Object.keys(ES_MAP).length} entries, ${missingEs.length} missing`);
console.log(`AR map: ${Object.keys(AR_MAP).length} entries, ${missingAr.length} missing`);
if (untranslated.size) console.log(`Files identical to EN: ${untranslated.size}`);
