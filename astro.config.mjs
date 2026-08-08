// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

import { blogRedirects } from './src/lib/blog-redirects.ts';

const redirects = Object.fromEntries(
  ['en', 'es', 'ar'].flatMap((locale) =>
    Object.entries(blogRedirects).map(([slug, to]) => {
      const prefix = locale === 'en' ? '' : `/${locale}`;
      return [`${prefix}/blog/${slug}`, `${prefix}${to}`];
    }),
  ),
);

// https://astro.build/config
export default defineConfig({
  site: 'https://aircoolercover.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        return { ...item, lastmod: new Date().toISOString() };
      },
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          es: 'es-MX',
          ar: 'ar',
        },
      },
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'ar'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  redirects,
  vite: {
    plugins: [tailwindcss()],
  },
});
