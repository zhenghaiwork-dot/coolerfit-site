/**
 * MDX (source of truth) → sync JSON consumed by thin data modules / client helpers.
 * Run after editing content: npx tsx scripts/sync-data-from-mdx.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as yamlLoad } from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "src", "content");
const outDir = path.join(root, "src", "data", "_generated");

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".mdx")) out.push(full);
  }
  return out;
}

function parseMdx(file: string) {
  const raw = fs.readFileSync(file, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`No frontmatter: ${file}`);
  const data = yamlLoad(match[1]) as Record<string, unknown>;
  const body = (match[2] ?? "").trim();
  return { data, body };
}

function localeSlug(file: string, base: string) {
  const rel = path.relative(path.join(contentRoot, base), file).replace(/\\/g, "/");
  // en/foo.mdx or en/a/b.mdx
  const noExt = rel.replace(/\.mdx$/, "");
  const [locale, ...rest] = noExt.split("/");
  return { locale, slug: rest.join("/") };
}

fs.mkdirSync(outDir, { recursive: true });

// Blog
{
  const posts = walk(path.join(contentRoot, "blog"))
    .map((file) => {
      const { locale, slug } = localeSlug(file, "blog");
      if (locale !== "en") return null;
      const { data, body } = parseMdx(file);
      const sections = data.sections as unknown[];
      delete data.sections;
      return {
        ...data,
        slug,
        intro: body || undefined,
        content: sections,
      };
    })
    .filter(Boolean);
  fs.writeFileSync(path.join(outDir, "blog.json"), JSON.stringify(posts, null, 2));
  console.log("blog", posts.length);
}

// Resources
{
  const pages = walk(path.join(contentRoot, "resources"))
    .map((file) => {
      const { locale, slug } = localeSlug(file, "resources");
      if (locale !== "en") return null;
      const { data, body } = parseMdx(file);
      return { ...data, slug, intro: body || undefined };
    })
    .filter(Boolean);
  fs.writeFileSync(path.join(outDir, "resources.json"), JSON.stringify(pages, null, 2));
  console.log("resources", pages.length);
}

// Features
{
  const pages = walk(path.join(contentRoot, "features"))
    .map((file) => {
      const { locale, slug } = localeSlug(file, "features");
      if (locale !== "en") return null;
      const { data, body } = parseMdx(file);
      return { ...data, slug, intro: body || undefined };
    })
    .filter(Boolean);
  fs.writeFileSync(path.join(outDir, "features.json"), JSON.stringify(pages, null, 2));
  console.log("features", pages.length);
}

// Products
{
  const items = walk(path.join(contentRoot, "products"))
    .map((file) => {
      const { locale, slug } = localeSlug(file, "products");
      if (locale !== "en") return null;
      const { data, body } = parseMdx(file);
      return { ...data, slug, description: body };
    })
    .filter(Boolean);
  fs.writeFileSync(path.join(outDir, "product-items.json"), JSON.stringify(items, null, 2));
  console.log("products", items.length);
}

// Categories
{
  const cats = walk(path.join(contentRoot, "categories"))
    .map((file) => {
      const { locale, slug } = localeSlug(file, "categories");
      if (locale !== "en") return null;
      const { data } = parseMdx(file);
      const seoIntro = data.seoIntro as string | undefined;
      const seoHighlights = data.seoHighlights as string[] | undefined;
      const seoFaqs = data.seoFaqs as { q: string; a: string }[] | undefined;
      delete data.seoIntro;
      delete data.seoHighlights;
      delete data.seoFaqs;
      const seoContent =
        seoIntro && seoHighlights && seoFaqs
          ? { intro: seoIntro, highlights: seoHighlights, faqs: seoFaqs }
          : undefined;
      return { ...data, slug, seoContent };
    })
    .filter(Boolean);
  fs.writeFileSync(path.join(outDir, "categories.json"), JSON.stringify(cats, null, 2));
  console.log("categories", cats.length);
}

console.log("Synced to src/data/_generated/");
