/**
 * Sync blog accessors. Source of truth: `src/content/blog/{locale}/*.mdx`
 * Regenerated via `npx tsx scripts/sync-data-from-mdx.ts`.
 */
import generated from "./_generated/blog.json";

export interface BlogPost {
  slug: string;
  title: string;
  seoTitle?: string;
  excerpt: string;
  pillarSlug?: string;
  isPillar: boolean;
  clusterSlugs?: string[];
  internalLinks: { label: string; path: string }[];
  canonicalNote?: string;
  companionResource?: { label: string; path: string };
  intro?: string;
  noIndex?: boolean;
  content: BlogSection[];
}

export interface BlogSection {
  heading: string;
  level: "h2" | "h3";
  body: string;
  bullets?: string[];
  sectionLinks?: { label: string; path: string }[];
  table?: { label: string; without: string; with: string }[];
  dataTable?: { headers: string[]; rows: string[][] };
  image?: { src: string; alt: string; caption?: string };
}

export const blogPosts = generated as BlogPost[];

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getPillarPosts(): BlogPost[] {
  return blogPosts.filter((p) => p.isPillar);
}

export function getClusterPosts(pillarSlug: string): BlogPost[] {
  return blogPosts.filter((p) => p.pillarSlug === pillarSlug);
}

export function getBlogWordCount(post: BlogPost): number {
  const parts = [post.excerpt, post.intro ?? ""];
  for (const section of post.content) {
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

export function getBlogReadingMinutes(post: BlogPost): number {
  return Math.max(1, Math.ceil(getBlogWordCount(post) / 200));
}
