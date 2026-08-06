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

/** Matches the React header's isActive: exact for "/", prefix for everything else. */
export function isNavActive(link: NavItem, pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  if (link.path === "/") return path === "/";
  return path.startsWith(link.path);
}
