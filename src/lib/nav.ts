import type { UiDict } from "@/i18n/ui";

export interface DropdownItem {
  label: string;
  path: string;
}

export interface NavGroup {
  heading: string;
  items: DropdownItem[];
}

export interface NavItem {
  label: string;
  path: string;
  dropdown?: NavGroup[];
}

/** Structural nav (English labels are fallbacks; use localizeNavLinks at render). */
export const navLinks: NavItem[] = [
  { label: "Home", path: "/" },
  {
    label: "Products",
    path: "/products",
    dropdown: [
      {
        heading: "By Cooler Type",
        items: [
          { label: "Evaporative Cooler Covers", path: "/products/evaporative-cooler-covers" },
          { label: "Side Draft Covers", path: "/products/side-draft-cooler-covers" },
          { label: "Down Draft Covers", path: "/products/down-draft-cooler-covers" },
          { label: "Rooftop Covers", path: "/products/rooftop-cooler-covers" },
          { label: "Window Covers", path: "/products/window-cooler-covers" },
        ],
      },
      {
        heading: "By Feature",
        items: [
          { label: "UV-Resistant Covers", path: "/products/uv-resistant-cooler-covers" },
          { label: "Waterproof Covers", path: "/products/waterproof-cooler-covers" },
          { label: "Winter Covers", path: "/products/winter-cooler-covers" },
          { label: "Insulated Covers", path: "/products/insulated-cooler-covers" },
          { label: "Mesh Covers", path: "/products/mesh-cooler-covers" },
          { label: "Windproof Covers", path: "/products/windproof-cooler-covers" },
          { label: "Dust Protection Covers", path: "/products/dust-protection-cooler-covers" },
        ],
      },
      {
        heading: "By Application",
        items: [
          { label: "Residential Covers", path: "/products/residential-cooler-covers" },
          { label: "Commercial Covers", path: "/products/commercial-cooler-covers" },
          { label: "Industrial Covers", path: "/products/industrial-cooler-covers" },
          { label: "Outdoor Covers", path: "/products/outdoor-cooler-covers" },
          { label: "Rooftop HVAC Covers", path: "/products/rooftop-hvac-covers" },
          { label: "Extreme Weather Covers", path: "/products/extreme-weather-cooler-covers" },
        ],
      },
      {
        heading: "Size & Fit",
        items: [
          { label: "Custom Size Covers", path: "/products/custom-size-cooler-covers" },
          { label: "Square & Rectangular", path: "/products/square-rectangular-cooler-covers" },
          { label: "Round Covers", path: "/products/round-cooler-covers" },
          { label: "Oversized Covers", path: "/products/oversized-cooler-covers" },
        ],
      },
    ],
  },
  {
    label: "Custom",
    path: "/custom-solutions",
    dropdown: [
      {
        heading: "Customization",
        items: [
          { label: "Custom Materials", path: "/custom/materials" },
          { label: "Custom Sizes", path: "/custom/sizes" },
          { label: "Opening Design", path: "/custom/opening-design" },
          { label: "Logo Printing", path: "/custom/logo-printing" },
        ],
      },
      {
        heading: "Order Options",
        items: [
          { label: "Bulk Orders", path: "/products/bulk-order-cooler-covers" },
          { label: "Small Batch Orders", path: "/products/small-batch-cooler-covers" },
          { label: "Custom Solutions Overview", path: "/custom-solutions" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    path: "/blog",
    dropdown: [
      {
        heading: "Guides",
        items: [
          { label: "Materials Guide", path: "/materials" },
          { label: "Size Guide", path: "/sizes" },
          { label: "How to Measure", path: "/sizes/how-to-measure" },
          { label: "Installation Guide", path: "/resources/installation" },
          { label: "Maintenance Guide", path: "/resources/maintenance" },
        ],
      },
      {
        heading: "Features",
        items: [
          { label: "UV Protection", path: "/products/uv-resistant-cooler-covers" },
          { label: "Rain-Proof Design", path: "/products/waterproof-cooler-covers" },
          { label: "Winter Protection", path: "/blog/winterizing-evaporative-cooler" },
          { label: "Vented Design", path: "/products/mesh-cooler-covers" },
        ],
      },
      {
        heading: "Blog",
        items: [
          { label: "All Articles", path: "/blog" },
          { label: "Cooler Covers Guide", path: "/blog/evaporative-cooler-covers-guide" },
          { label: "Custom Covers Guide", path: "/blog/custom-cooler-covers" },
          { label: "Materials & Performance", path: "/blog/cooler-cover-materials-performance" },
        ],
      },
    ],
  },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const headingMap: Record<string, keyof UiDict["chrome"]> = {
  "By Cooler Type": "byCoolerType",
  "By Feature": "byFeature",
  "By Application": "byApplication",
  "Size & Fit": "sizeAndFit",
  Customization: "customization",
  "Order Options": "orderOptions",
  Guides: "guides",
  Features: "featuresGroup",
  Blog: "blogGroup",
};

const pathLabelMap: Record<string, keyof UiDict["chrome"] | "nav.customSolutions" | "nav.blog"> = {
  "/materials": "materialsGuide",
  "/sizes": "sizeGuide",
  "/sizes/how-to-measure": "howToMeasure",
  "/resources/installation": "installationGuide",
  "/resources/maintenance": "maintenanceGuide",
  "/custom/materials": "customMaterials",
  "/custom/sizes": "customSizes",
  "/custom/opening-design": "openingDesign",
  "/custom/logo-printing": "logoPrinting",
  "/custom-solutions": "customOverview",
  "/products/bulk-order-cooler-covers": "bulkOrders",
  "/products/small-batch-cooler-covers": "smallBatchOrders",
  "/blog": "allArticles",
  "/blog/evaporative-cooler-covers-guide": "coolerCoversGuide",
  "/blog/custom-cooler-covers": "customCoversGuide",
  "/blog/cooler-cover-materials-performance": "materialsPerformance",
  "/blog/winterizing-evaporative-cooler": "winterProtection",
};

/** Feature-shortcut labels that reuse chrome keys even when path is a product category. */
const featureShortcutLabels: Record<string, keyof UiDict["chrome"]> = {
  "/products/uv-resistant-cooler-covers": "uvProtection",
  "/products/waterproof-cooler-covers": "rainProof",
  "/products/mesh-cooler-covers": "ventedDesign",
};

function topLabel(path: string, t: UiDict): string {
  if (path === "/") return t.common.home;
  if (path === "/products") return t.nav.products;
  if (path === "/custom-solutions") return t.nav.custom;
  if (path === "/blog") return t.nav.resources;
  if (path === "/about") return t.nav.about;
  if (path === "/contact") return t.nav.contact;
  return path;
}

function itemLabel(
  path: string,
  fallback: string,
  t: UiDict,
  titles: Record<string, string>,
  groupHeading: string,
): string {
  // Resources "Features" shortcuts use short chrome labels (not category SEO titles).
  if (groupHeading === "Features") {
    const shortcut = featureShortcutLabels[path];
    if (shortcut) return t.chrome[shortcut];
    if (path === "/blog/winterizing-evaporative-cooler") return t.chrome.winterProtection;
  }

  if (titles[path]) return titles[path];

  const chromeKey = pathLabelMap[path];
  if (chromeKey === "nav.customSolutions") return t.nav.customSolutions;
  if (chromeKey === "nav.blog") return t.nav.blog;
  if (chromeKey) return t.chrome[chromeKey];

  if (path.startsWith("/products/")) {
    const slug = path.slice("/products/".length);
    if (titles[`cat:${slug}`]) return titles[`cat:${slug}`];
  }
  if (path.startsWith("/blog/")) {
    const slug = path.slice("/blog/".length);
    if (titles[`blog:${slug}`]) return titles[`blog:${slug}`];
  }

  return fallback;
}

/**
 * Localize nav structure. `titles` may include:
 * - full paths ("/products/foo")
 * - `cat:{slug}` / `blog:{slug}` keys from content collections
 */
export function localizeNavLinks(t: UiDict, titles: Record<string, string> = {}): NavItem[] {
  return navLinks.map((link) => ({
    label: topLabel(link.path, t),
    path: link.path,
    dropdown: link.dropdown?.map((group) => ({
      heading: (() => {
        const key = headingMap[group.heading];
        return key ? t.chrome[key] : group.heading;
      })(),
      items: group.items.map((item) => ({
        path: item.path,
        label: itemLabel(item.path, item.label, t, titles, group.heading),
      })),
    })),
  }));
}

/** Matches the React header's isActive: exact for "/", prefix for everything else. */
export function isNavActive(link: NavItem, pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  if (link.path === "/") return path === "/";
  return path.startsWith(link.path);
}
