/** Source of truth: `src/content/categories/{locale}/*.mdx` */
import generated from "./_generated/categories.json";

export interface ProductCategory {
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  features: string[];
  internalLinks: { label: string; path: string }[];
  relatedBlogSlugs: string[];
  canonicalSlug?: string;
  seoContent?: {
    intro: string;
    highlights: string[];
    faqs: { q: string; a: string }[];
  };
}

export const productCategories = generated as ProductCategory[];

export function getProductBySlug(slug: string): ProductCategory | undefined {
  return productCategories.find((p) => p.slug === slug);
}
