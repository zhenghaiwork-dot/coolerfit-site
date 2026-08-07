/**
 * Writes thin Astro route stubs under src/pages/{es,ar}/ for key sections.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = path.join(root, "src", "pages");

function write(rel, contents) {
  const full = path.join(pages, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents, "utf8");
  console.log(rel);
}

for (const locale of ["es", "ar"]) {
  write(
    `${locale}/index.astro`,
    `---
import HomePage from "@/templates/HomePage.astro";
---
<HomePage locale="${locale}" />
`,
  );

  write(
    `${locale}/contact.astro`,
    `---
import ContactPage from "@/templates/ContactPage.astro";
---
<ContactPage locale="${locale}" />
`,
  );

  write(
    `${locale}/about.astro`,
    `---
import AboutPage from "@/templates/AboutPage.astro";
---
<AboutPage locale="${locale}" />
`,
  );

  write(
    `${locale}/privacy.astro`,
    `---
import PrivacyPage from "@/templates/PrivacyPage.astro";
---
<PrivacyPage locale="${locale}" />
`,
  );

  write(
    `${locale}/custom-solutions.astro`,
    `---
import CustomSolutionsPage from "@/templates/CustomSolutionsPage.astro";
---
<CustomSolutionsPage locale="${locale}" />
`,
  );

  write(
    `${locale}/sitemap.astro`,
    `---
import SitemapPage from "@/templates/SitemapPage.astro";
---
<SitemapPage locale="${locale}" />
`,
  );

  write(
    `${locale}/products/index.astro`,
    `---
import ProductsIndexPage from "@/templates/ProductsIndexPage.astro";
---
<ProductsIndexPage locale="${locale}" />
`,
  );

  write(
    `${locale}/products/[id].astro`,
    `---
import ProductsCategoryPage from "@/templates/ProductsCategoryPage.astro";
import { getCategoryEntries, categorySlug } from "@/lib/content";

export async function getStaticPaths() {
  const entries = await getCategoryEntries("${locale}");
  return entries.map((e) => ({ params: { id: categorySlug(e) }, props: { entry: e } }));
}

const { entry } = Astro.props;
---
<ProductsCategoryPage locale="${locale}" entry={entry} />
`,
  );

  write(
    `${locale}/product/[slug].astro`,
    `---
import ProductDetailPage from "@/templates/ProductDetailPage.astro";
import { getProductEntries, productSlug, toProductItem } from "@/lib/content";

export async function getStaticPaths() {
  const entries = await getProductEntries("${locale}");
  return entries.map((e) => ({
    params: { slug: productSlug(e) },
    props: { product: toProductItem(e) },
  }));
}

const { product } = Astro.props;
---
<ProductDetailPage locale="${locale}" product={product} />
`,
  );

  write(
    `${locale}/blog/index.astro`,
    `---
import BlogIndexPage from "@/templates/BlogIndexPage.astro";
---
<BlogIndexPage locale="${locale}" />
`,
  );

  write(
    `${locale}/blog/[slug].astro`,
    `---
import BlogPostPage from "@/templates/BlogPostPage.astro";
import { getBlogEntries, blogSlug, toBlogPost } from "@/lib/content";

export async function getStaticPaths() {
  const entries = await getBlogEntries("${locale}");
  return entries.map((e) => ({
    params: { slug: blogSlug(e) },
    props: { post: toBlogPost(e) },
  }));
}

const { post } = Astro.props;
---
<BlogPostPage locale="${locale}" post={post} />
`,
  );

  write(
    `${locale}/features/[slug].astro`,
    `---
import FeatureDetailPage from "@/templates/FeatureDetailPage.astro";
import { getFeatureEntries, featureSlug, toFeaturePage } from "@/lib/content";

export async function getStaticPaths() {
  const entries = await getFeatureEntries("${locale}");
  return entries.map((e) => ({
    params: { slug: featureSlug(e) },
    props: { feature: toFeaturePage(e) },
  }));
}

const { feature } = Astro.props;
---
<FeatureDetailPage locale="${locale}" feature={feature} />
`,
  );

  write(
    `${locale}/[...slug].astro`,
    `---
import ResourcePage from "@/templates/ResourcePage.astro";
import { getResourceEntries, resourceSlug, toResourcePage } from "@/lib/content";

export async function getStaticPaths() {
  const entries = await getResourceEntries("${locale}");
  return entries.map((e) => ({
    params: { slug: resourceSlug(e) },
    props: { resource: toResourcePage(e) },
  }));
}

const { resource } = Astro.props;
---
<ResourcePage locale="${locale}" resource={resource} />
`,
  );
}

console.log("Locale routes generated.");
