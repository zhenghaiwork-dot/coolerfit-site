import type { ProductItem } from "@/data/product-items";

/** Square main gallery — matches ProductDetail `aspect-square`. */
export const PRODUCT_IMAGE_MAIN_PX = 1200;

/** List / related card thumbnails. */
export const PRODUCT_IMAGE_CARD_PX = 800;

export function productImageSrc(slug: string, filename: string): string {
  return `/images/products/${slug}/${filename}`;
}

export function isProductImageUrl(src: string): boolean {
  return /^(\/|https?:\/\/)/i.test(src);
}

export type ProductGalleryItem = { src: string; alt: string };

export function getProductGallery(product: ProductItem): ProductGalleryItem[] {
  const sources = product.images?.length ? product.images : [product.image];
  return sources.map((src, index) => ({
    src,
    alt:
      product.imageAlts?.[index] ??
      (index === 0 ? product.imageAlt ?? product.name : `${product.name} — detail ${index + 1}`),
  }));
}
