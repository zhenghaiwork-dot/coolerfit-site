import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const link = z.object({ label: z.string(), path: z.string() });

const blogSection = z.object({
  heading: z.string(),
  level: z.enum(["h2", "h3"]),
  body: z.string(),
  bullets: z.array(z.string()).optional(),
  sectionLinks: z.array(link).optional(),
  table: z
    .array(z.object({ label: z.string(), without: z.string(), with: z.string() }))
    .optional(),
  dataTable: z
    .object({ headers: z.array(z.string()), rows: z.array(z.array(z.string())) })
    .optional(),
  image: z
    .object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
    })
    .optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    pillarSlug: z.string().optional(),
    isPillar: z.boolean(),
    clusterSlugs: z.array(z.string()).optional(),
    internalLinks: z.array(link),
    canonicalNote: z.string().optional(),
    companionResource: link.optional(),
    noIndex: z.boolean().optional(),
    sections: z.array(blogSection),
  }),
});

const resources = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/resources" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    sections: z.array(
      z.object({
        heading: z.string(),
        body: z.string(),
        bullets: z.array(z.string()).optional(),
      }),
    ),
    relatedLinks: z.array(link),
    deepDiveLinks: z.array(link).optional(),
  }),
});

const features = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/features" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    benefits: z.array(z.string()),
    sections: z
      .array(
        z.object({
          heading: z.string(),
          body: z.string(),
          bullets: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    relatedProducts: z.array(link),
    relatedBlogSlugs: z.array(z.string()),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/products" }),
  schema: z.object({
    name: z.string(),
    summary: z.string(),
    image: z.string(),
    imageAlt: z.string().optional(),
    images: z.array(z.string()).optional(),
    imageAlts: z.array(z.string()).optional(),
    categorySlugs: z.array(z.string()),
    specs: z.array(z.object({ label: z.string(), value: z.string() })),
    features: z.array(z.string()),
    popular: z.boolean().optional(),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/categories" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    features: z.array(z.string()),
    internalLinks: z.array(link),
    relatedBlogSlugs: z.array(z.string()),
    canonicalSlug: z.string().optional(),
    seoIntro: z.string().optional(),
    seoHighlights: z.array(z.string()).optional(),
    seoFaqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { blog, resources, features, products, categories, pages };
