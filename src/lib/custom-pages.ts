import type { IconName } from "@/lib/icons";

export type CustomPageMeta = {
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: IconName;
  hero: { src: string; alt: string };
  accent: string;
};

export const CUSTOM_PAGES: CustomPageMeta[] = [
  {
    slug: "custom/materials",
    label: "Custom Materials",
    shortLabel: "Materials",
    description: "Fabric weight, coatings, and linings matched to your climate and exposure.",
    icon: "Layers",
    hero: {
      src: "/images/custom/materials.webp",
      alt: "Fabric swatches for custom evaporative cooler covers",
    },
    accent: "from-primary/15 via-primary/5 to-transparent",
  },
  {
    slug: "custom/sizes",
    label: "Custom Sizes",
    shortLabel: "Sizes",
    description: "Any W×D×H dimension — submission format, limits, and irregular cabinets.",
    icon: "Ruler",
    hero: {
      src: "/images/custom/dimensions.webp",
      alt: "Measuring a portable wheeled evaporative air cooler for a custom cover",
    },
    accent: "from-accent/15 via-accent/5 to-transparent",
  },
  {
    slug: "custom/opening-design",
    label: "Opening Design",
    shortLabel: "Openings",
    description: "Vents, service panels, and duct cutouts positioned to your cabinet layout.",
    icon: "Scissors",
    hero: {
      src: "/images/custom/openings.webp",
      alt: "Custom vent and pipe openings on a cooler cover pattern",
    },
    accent: "from-primary/12 via-secondary to-transparent",
  },
  {
    slug: "custom/logo-printing",
    label: "Logo Printing",
    shortLabel: "Logo Printing",
    description: "Screen print, heat transfer, or embroidery for contractor and fleet branding.",
    icon: "Stamp",
    hero: {
      src: "/images/custom/branding.webp",
      alt: "Custom logo printing on an evaporative cooler cover",
    },
    accent: "from-accent/12 via-primary/5 to-transparent",
  },
];

export function getCustomPageMeta(slug: string): CustomPageMeta | undefined {
  return CUSTOM_PAGES.find((p) => p.slug === slug);
}
