/** Source of truth: `src/content/features/{locale}/*.mdx` */
import generated from "./_generated/features.json";

export interface FeatureSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface FeaturePage {
  slug: string;
  title: string;
  description: string;
  intro?: string;
  benefits: string[];
  sections?: FeatureSection[];
  faqs?: { q: string; a: string }[];
  relatedProducts: { label: string; path: string }[];
  relatedBlogSlugs: string[];
}

export const featurePages = generated as FeaturePage[];

export function getFeatureBySlug(slug: string): FeaturePage | undefined {
  return featurePages.find((p) => p.slug === slug);
}
