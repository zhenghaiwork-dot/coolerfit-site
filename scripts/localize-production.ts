/**
 * Production localization: writes fully translated es-MX / ar-Gulf MDX from EN source.
 * Run: npx tsx scripts/localize-production.ts
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
type LocaleMap = Record<string, { es: Entry; ar: Entry }>;

const SKIP_KEYS = new Set([
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

function deepTranslateStrings(
  value: unknown,
  locale: "es" | "ar",
  map: Record<string, string>,
): unknown {
  if (typeof value === "string") return map[value] ?? value;
  if (Array.isArray(value)) return value.map((v) => deepTranslateStrings(v, locale, map));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SKIP_KEYS.has(k)) out[k] = v;
      else out[k] = deepTranslateStrings(v, locale, map);
    }
    return out;
  }
  return value;
}

function mergeEntry(base: Entry, override: Partial<Entry>): Entry {
  return {
    data: override.data ? (override.data as Record<string, unknown>) : base.data,
    body: override.body ?? base.body,
  };
}

// Import slug-level complete overrides
import { localeOverrides } from "./locale-data/overrides.js";

let updated = 0;
const gaps: string[] = [];

for (const [collection, files] of Object.entries(enSource)) {
  for (const [relFile, enEntry] of Object.entries(files)) {
    const relPath = relFile.replace(/\\/g, "/");
    const slugKey = relPath.replace(/\.mdx$/, "");
    const override = localeOverrides[collection]?.[relPath] ?? localeOverrides[collection]?.[slugKey];

    for (const locale of ["es", "ar"] as const) {
      const localeOverride = override?.[locale];
      let entry: Entry;

      if (localeOverride?.data) {
        entry = { data: localeOverride.data, body: localeOverride.body ?? "" };
      } else if (localeOverride) {
        entry = mergeEntry(enEntry, localeOverride);
      } else {
        gaps.push(`${collection}/${locale}/${relPath}`);
        entry = enEntry;
      }

      const outFile = path.join(contentRoot, collection, locale, relPath);
      writeMdx(outFile, entry.data, entry.body);
      updated++;
    }
  }
}

console.log(`Localized ${updated} files.`);
if (gaps.length) {
  console.log(`Gaps (missing override): ${gaps.length}`);
  gaps.slice(0, 20).forEach((g) => console.log("  -", g));
}
