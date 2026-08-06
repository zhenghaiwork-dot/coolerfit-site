/** Prints the route inventory so page templates can be checked off against it. */
import { getAllRoutes, getSitemapRoutes } from "./routes";

const all = getAllRoutes();
const sitemap = getSitemapRoutes();

const base = ["/", "/products", "/custom-solutions", "/about", "/contact", "/privacy", "/blog", "/sitemap"];
const groups: Record<string, string[]> = {
  base: [],
  "products/*": [],
  "product/*": [],
  "blog/*": [],
  "features/*": [],
  resources: [],
};

for (const r of all) {
  if (base.includes(r)) groups.base.push(r);
  else if (r.startsWith("/products/")) groups["products/*"].push(r);
  else if (r.startsWith("/product/")) groups["product/*"].push(r);
  else if (r.startsWith("/blog/")) groups["blog/*"].push(r);
  else if (r.startsWith("/features/")) groups["features/*"].push(r);
  else groups.resources.push(r);
}

for (const [name, list] of Object.entries(groups)) {
  console.log(`${name.padEnd(12)} ${String(list.length).padStart(3)}`);
}
console.log(`${"TOTAL".padEnd(12)} ${String(all.length).padStart(3)}`);
console.log(`${"sitemap".padEnd(12)} ${String(sitemap.length).padStart(3)}`);
console.log("\nresource routes:", groups.resources.join(", "));
