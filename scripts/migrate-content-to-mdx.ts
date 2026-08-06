/**
 * One-shot exporter: TS data modules → Content Collection MDX (locale = en).
 * Run: npx tsx scripts/migrate-content-to-mdx.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dump as yamlDump } from "js-yaml";

import { blogPosts } from "../src/data/blog";
import { resourcePages } from "../src/data/resources";
import { featurePages } from "../src/data/features";
import { productItems } from "../src/data/product-items";
import { productCategories } from "../src/data/products";
import { categorySeoContent } from "../src/data/product-category-seo";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "src", "content");

function writeMdx(relPath: string, frontmatter: Record<string, unknown>, body = "") {
  const full = path.join(contentRoot, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  const fm = yamlDump(frontmatter, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  }).trimEnd();
  const text = `---\n${fm}\n---\n${body ? `\n${body.trim()}\n` : ""}`;
  fs.writeFileSync(full, text, "utf8");
  console.log("wrote", relPath);
}

for (const post of blogPosts) {
  const { content, slug, intro, ...meta } = post;
  writeMdx(`blog/en/${slug}.mdx`, { ...meta, sections: content }, intro ?? "");
}

for (const page of resourcePages) {
  const { sections, slug, intro, ...meta } = page;
  writeMdx(`resources/en/${slug}.mdx`, { ...meta, sections }, intro ?? "");
}

for (const page of featurePages) {
  const { slug, intro, sections, ...meta } = page;
  writeMdx(`features/en/${slug}.mdx`, { ...meta, sections: sections ?? [] }, intro ?? "");
}

for (const item of productItems) {
  const { slug, description, ...meta } = item;
  writeMdx(`products/en/${slug}.mdx`, meta, description);
}

for (const cat of productCategories) {
  const { slug, seoContent: inlineSeo, description, ...meta } = cat;
  const seoContent = inlineSeo ?? categorySeoContent[slug];
  const fm: Record<string, unknown> = { ...meta, description };
  if (seoContent) {
    fm.seoIntro = seoContent.intro;
    fm.seoHighlights = seoContent.highlights;
    fm.seoFaqs = seoContent.faqs;
  }
  writeMdx(`categories/en/${slug}.mdx`, fm, seoContent?.intro ?? description);
}

writeMdx(
  "pages/en/home.mdx",
  {
    title: "CoolerFit — Custom Evaporative Cooler Covers | aircoolercover.com",
    description:
      "Custom evaporative cooler covers built to your specs. Dustproof, UV-resistant, branded covers for residential and commercial use.",
  },
  "Custom evaporative cooler covers built to your exact specs.",
);

writeMdx(
  "pages/en/about.mdx",
  {
    title: "About CoolerFit | Custom Cooler Cover Manufacturer",
    description:
      "Learn about CoolerFit — specialized manufacturer of custom evaporative cooler covers for HVAC, property managers, and distributors.",
  },
  "CoolerFit manufactures custom evaporative cooler covers for residential, commercial, and industrial use.",
);

writeMdx(
  "pages/en/privacy.mdx",
  {
    title: "Privacy Policy | CoolerFit",
    description: "CoolerFit privacy policy for aircoolercover.com.",
  },
  "This privacy policy describes how CoolerFit collects and uses information on aircoolercover.com.",
);

writeMdx(
  "pages/en/custom-solutions.mdx",
  {
    title: "Custom Cooler Cover Solutions | CoolerFit",
    description:
      "How CoolerFit custom manufacturing works — sizing, materials, openings, and logo printing with no minimum order.",
  },
  "Every CoolerFit cover is made to your measurements and requirements.",
);

console.log("\nDone.");
