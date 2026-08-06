/** Source of truth: src/content/resources/{locale}/…/*.mdx */
import generated from "./_generated/resources.json";

export interface ResourceSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface ResourcePage {
  slug: string;
  title: string;
  description: string;
  intro?: string;
  sections: ResourceSection[];
  relatedLinks: { label: string; path: string }[];
  deepDiveLinks?: { label: string; path: string }[];
}

export const resourcePages = generated as ResourcePage[];

export function getResourceBySlug(slug: string): ResourcePage | undefined {
  return resourcePages.find((p) => p.slug === slug);
}
