import fs from "node:fs";
import path from "node:path";
import { getSitemapRoutes } from "./routes";

const siteUrl = process.env.SITE_URL || "https://aircoolercover.com";
const distDir = path.resolve(process.cwd(), "dist");

function escapeXml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toAbsolute(route: string) {
  return `${siteUrl.replace(/\/$/, "")}${route === "/" ? "/" : route}`;
}

function main() {
  if (!fs.existsSync(distDir)) {
    throw new Error(`dist folder not found at: ${distDir}`);
  }

  const routes = getSitemapRoutes();
  const now = new Date().toISOString();

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    routes
      .map((r) => {
        const loc = escapeXml(toAbsolute(r));
        return `  <url><loc>${loc}</loc><lastmod>${now}</lastmod></url>`;
      })
      .join("\n") +
    `\n</urlset>\n`;

  fs.writeFileSync(path.join(distDir, "sitemap.xml"), xml, "utf8");
  // eslint-disable-next-line no-console
  console.log(`sitemap.xml generated (${routes.length} urls)`);
}

main();

