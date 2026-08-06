/** Source of truth: `src/content/products/{locale}/*.mdx` */
import generated from "./_generated/product-items.json";
import { productImageSrc } from "@/lib/product-images";

export interface ProductItem {
  slug: string;
  name: string;
  summary: string;
  description: string;
  image: string;
  imageAlt?: string;
  images?: string[];
  imageAlts?: string[];
  categorySlugs: string[];
  specs: { label: string; value: string }[];
  features: string[];
  popular?: boolean;
}

export const productItems = generated as ProductItem[];

export function getProductItemBySlug(slug: string): ProductItem | undefined {
  return productItems.find((p) => p.slug === slug);
}

export function getProductItemsByCategory(categorySlug: string): ProductItem[] {
  return productItems.filter((p) => p.categorySlugs.includes(categorySlug));
}

/** Helper kept for scripts that still build image paths. */
export const mainProductImage = (slug: string) => productImageSrc(slug, "01-main.webp");
