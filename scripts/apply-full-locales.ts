/**
 * Full production localization from EN MDX + complete es/ar overrides.
 * Run: npx tsx scripts/apply-full-locales.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseMdx, writeMdx, walkMdx } from "./lib/mdx-io.js";
import { localeOverrides } from "./locale-data/overrides.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "src", "content");

const collections = ["resources", "features", "pages", "categories", "products", "blog"] as const;

let updated = 0;
const gaps: string[] = [];

for (const collection of collections) {
  const enDir = path.join(contentRoot, collection, "en");
  for (const enFile of walkMdx(enDir)) {
    const rel = path.relative(enDir, enFile).replace(/\\/g, "/");
    const slug = rel.replace(/\.mdx$/, "");
    const { data, body } = parseMdx(enFile);
    const key = `${collection}/${slug}`;

    for (const locale of ["es", "ar"] as const) {
      const override =
        localeOverrides[key]?.[locale] ??
        localeOverrides[`${collection}/${rel}`]?.[locale];

      if (!override) {
        gaps.push(`${collection}/${locale}/${rel}`);
        continue;
      }

      writeMdx(path.join(contentRoot, collection, locale, rel), override.data, override.body ?? "");
      updated++;
    }
  }
}

console.log(`Updated ${updated} localized MDX files.`);
if (gaps.length) {
  console.log(`Missing overrides (${gaps.length}):`);
  gaps.forEach((g) => console.log("  -", g));
}
