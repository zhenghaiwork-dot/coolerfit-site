/**
 * Content Collection accessors. Entry ids look like `en/slug` or `en/nested/slug`.
 */
import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "@/i18n/locales";

export type BlogEntry = CollectionEntry<"blog">;
export type ResourceEntry = CollectionEntry<"resources">;
export type FeatureEntry = CollectionEntry<"features">;
export type ProductEntry = CollectionEntry<"products">;
export type CategoryEntry = CollectionEntry<"categories">;
export type PageEntry = CollectionEntry<"pages">;

function localeOf(id: string): string {
  const normalized = id.replace(/\\/g, "/");
  return normalized.split("/")[0] ?? "en";
}

function slugOf(id: string): string {
  const normalized = id.replace(/\\/g, "/").replace(/\.mdx$/i, "");
  const parts = normalized.split("/");
  // Prefer locale/slug…; if id has no locale prefix, use whole id as slug.
  return parts.length > 1 ? parts.slice(1).join("/") : parts[0] ?? "";
}

function inLocale<T extends { id: string }>(entries: T[], locale: Locale) {
  return entries.filter((e) => localeOf(e.id) === locale);
}

export async function getBlogEntries(locale: Locale = "en") {
  return inLocale(await getCollection("blog"), locale);
}

export async function getBlogBySlug(slug: string, locale: Locale = "en") {
  return (await getBlogEntries(locale)).find((e) => slugOf(e.id) === slug);
}

export async function getPillarPosts(locale: Locale = "en") {
  return (await getBlogEntries(locale)).filter((e) => e.data.isPillar);
}

export async function getClusterPosts(pillarSlug: string, locale: Locale = "en") {
  return (await getBlogEntries(locale)).filter((e) => e.data.pillarSlug === pillarSlug);
}

export function blogSlug(entry: BlogEntry) {
  return slugOf(entry.id);
}

export function toBlogPost(entry: BlogEntry) {
  return {
    slug: blogSlug(entry),
    title: entry.data.title,
    seoTitle: entry.data.seoTitle,
    excerpt: entry.data.excerpt,
    pillarSlug: entry.data.pillarSlug,
    isPillar: entry.data.isPillar,
    clusterSlugs: entry.data.clusterSlugs,
    internalLinks: entry.data.internalLinks,
    canonicalNote: entry.data.canonicalNote,
    companionResource: entry.data.companionResource,
    intro: (entry.body ?? "").trim() || undefined,
    noIndex: entry.data.noIndex,
    content: entry.data.sections,
  };
}

export function getBlogWordCount(entry: BlogEntry): number {
  const parts = [entry.data.excerpt, entry.body ?? ""];
  for (const section of entry.data.sections) {
    parts.push(section.heading, section.body);
    if (section.bullets) parts.push(...section.bullets);
    if (section.table) {
      for (const row of section.table) parts.push(row.label, row.without, row.with);
    }
    if (section.dataTable) {
      parts.push(...section.dataTable.headers);
      for (const row of section.dataTable.rows) parts.push(...row);
    }
  }
  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}

export function getBlogReadingMinutes(entry: BlogEntry): number {
  return Math.max(1, Math.ceil(getBlogWordCount(entry) / 200));
}

export async function getResourceEntries(locale: Locale = "en") {
  return inLocale(await getCollection("resources"), locale);
}

export async function getResourceBySlug(slug: string, locale: Locale = "en") {
  return (await getResourceEntries(locale)).find((e) => slugOf(e.id) === slug);
}

export function resourceSlug(entry: ResourceEntry) {
  return slugOf(entry.id);
}

/** Shape expected by resource page templates / CustomResourcePage. */
export function toResourcePage(entry: ResourceEntry) {
  return {
    slug: resourceSlug(entry),
    title: entry.data.title,
    seoTitle: entry.data.seoTitle,
    description: entry.data.description,
    intro: undefined as string | undefined,
    sections: entry.data.sections,
    relatedLinks: entry.data.relatedLinks,
    deepDiveLinks: entry.data.deepDiveLinks,
    faqs: entry.data.faqs,
  };
}

export async function getFeatureEntries(locale: Locale = "en") {
  return inLocale(await getCollection("features"), locale);
}

export async function getFeatureBySlug(slug: string, locale: Locale = "en") {
  return (await getFeatureEntries(locale)).find((e) => slugOf(e.id) === slug);
}

export function featureSlug(entry: FeatureEntry) {
  return slugOf(entry.id);
}

/** Shape expected by feature page templates. */
export function toFeaturePage(entry: FeatureEntry) {
  return {
    slug: featureSlug(entry),
    title: entry.data.title,
    description: entry.data.description,
    intro: undefined as string | undefined,
    benefits: entry.data.benefits,
    sections: entry.data.sections,
    faqs: entry.data.faqs,
    relatedProducts: entry.data.relatedProducts,
    relatedBlogSlugs: entry.data.relatedBlogSlugs,
  };
}

export async function getProductEntries(locale: Locale = "en") {
  return inLocale(await getCollection("products"), locale);
}

export async function getProductItemBySlug(slug: string, locale: Locale = "en") {
  return (await getProductEntries(locale)).find((e) => slugOf(e.id) === slug);
}

export async function getProductItemsByCategory(categorySlug: string, locale: Locale = "en") {
  return (await getProductEntries(locale)).filter((e) => e.data.categorySlugs.includes(categorySlug));
}

export function productSlug(entry: ProductEntry) {
  return slugOf(entry.id);
}

/** Shape expected by existing product image helpers. */
export function toProductItem(entry: ProductEntry) {
  return {
    slug: productSlug(entry),
    name: entry.data.name,
    summary: entry.data.summary,
    description: (entry.body ?? "").trim(),
    image: entry.data.image,
    imageAlt: entry.data.imageAlt,
    images: entry.data.images,
    imageAlts: entry.data.imageAlts,
    categorySlugs: entry.data.categorySlugs,
    specs: entry.data.specs,
    features: entry.data.features,
    popular: entry.data.popular,
  };
}

export async function getCategoryEntries(locale: Locale = "en") {
  return inLocale(await getCollection("categories"), locale);
}

export async function getCategoryBySlug(slug: string, locale: Locale = "en") {
  return (await getCategoryEntries(locale)).find((e) => slugOf(e.id) === slug);
}

export function categorySlug(entry: CategoryEntry) {
  return slugOf(entry.id);
}

export function toProductCategory(entry: CategoryEntry) {
  const seoContent =
    entry.data.seoIntro && entry.data.seoHighlights && entry.data.seoFaqs
      ? {
          intro: entry.data.seoIntro,
          highlights: entry.data.seoHighlights,
          faqs: entry.data.seoFaqs,
        }
      : undefined;

  return {
    slug: categorySlug(entry),
    title: entry.data.title,
    seoTitle: entry.data.seoTitle,
    description: entry.data.description,
    features: entry.data.features,
    internalLinks: entry.data.internalLinks,
    relatedBlogSlugs: entry.data.relatedBlogSlugs,
    canonicalSlug: entry.data.canonicalSlug,
    seoContent,
  };
}

export async function getPageEntry(page: string, locale: Locale = "en") {
  const entries = inLocale(await getCollection("pages"), locale);
  return entries.find((e) => slugOf(e.id) === page);
}
