/** Source of truth: src/content/resources/{locale}/…/*.mdx */
import generated from "./_generated/resources.json";

export interface ResourceSection {
  heading: string;
  level?: "h2" | "h3";
  body: string;
  bullets?: string[];
  sectionLinks?: { label: string; path: string }[];
  dataTable?: { headers: string[]; rows: string[][] };
}

export interface ResourcePage {
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  intro?: string;
  sections: ResourceSection[];
  relatedLinks: { label: string; path: string }[];
  deepDiveLinks?: { label: string; path: string }[];
  faqs?: { q: string; a: string }[];
}

export const resourcePages = generated as ResourcePage[];

export function getResourceBySlug(slug: string): ResourcePage | undefined {
  return resourcePages.find((p) => p.slug === slug);
}
