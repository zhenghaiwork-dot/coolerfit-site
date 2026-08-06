import { blogPosts } from "@/data/blog";
import { featurePages } from "@/data/features";
import { productItems } from "@/data/product-items";
import { productCategories } from "@/data/products";
import { resourcePages } from "@/data/resources";

const baseRoutes = [
  "/",
  "/products",
  "/custom-solutions",
  "/about",
  "/contact",
  "/privacy",
  "/blog",
  "/sitemap",
];

/** Blog posts stay noindex until `noIndex: false` is set on the post. */
export function isNoIndexRoute(route: string): boolean {
  if (route === "/blog") return false;
  if (route.startsWith("/blog/")) {
    const slug = route.replace(/^\/blog\//, "");
    const post = blogPosts.find((p) => p.slug === slug);
    return !(post && post.noIndex === false);
  }
  return false;
}

export function getAllRoutes(): string[] {
  const routes = new Set<string>();

  for (const r of baseRoutes) routes.add(r);

  for (const c of productCategories) routes.add(`/products/${c.slug}`);
  for (const p of productItems) routes.add(`/product/${p.slug}`);
  for (const b of blogPosts) routes.add(`/blog/${b.slug}`);
  for (const f of featurePages) routes.add(`/features/${f.slug}`);
  for (const r of resourcePages) routes.add(`/${r.slug}`);

  return Array.from(routes).sort();
}

/** Indexable routes for sitemap.xml (excludes placeholder blog posts and synonym category duplicates). */
export function getSitemapRoutes(): string[] {
  const synonymCategorySlugs = new Set(
    productCategories.filter((c) => c.canonicalSlug).map((c) => c.slug),
  );

  return getAllRoutes().filter(
    (route) =>
      !isNoIndexRoute(route) &&
      !synonymCategorySlugs.has(route.replace(/^\/products\//, "")),
  );
}
