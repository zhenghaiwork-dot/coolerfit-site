import type { IconName } from "@/lib/icons";
import type { UiDict } from "@/i18n/ui";

export type CustomPageMeta = {
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: IconName;
  hero: { src: string; alt: string };
  accent: string;
};

const customPageDefs = [
  {
    slug: "custom/materials",
    icon: "Layers" as const,
    hero: {
      src: "/images/custom/materials.webp",
      alt: "Fabric swatches for custom evaporative cooler covers",
    },
    accent: "from-primary/15 via-primary/5 to-transparent",
    labelKey: "customMaterials" as const,
    descKey: "customMaterialsDesc" as const,
    shortKey: "customMaterials" as const,
  },
  {
    slug: "custom/sizes",
    icon: "Ruler" as const,
    hero: {
      src: "/images/custom/dimensions.webp",
      alt: "Measuring a portable wheeled evaporative air cooler for a custom cover",
    },
    accent: "from-accent/15 via-accent/5 to-transparent",
    labelKey: "customSizes" as const,
    descKey: "customSizesDesc" as const,
    shortKey: "customSizes" as const,
  },
  {
    slug: "custom/opening-design",
    icon: "Scissors" as const,
    hero: {
      src: "/images/custom/openings.webp",
      alt: "Custom vent and pipe openings on a cooler cover pattern",
    },
    accent: "from-primary/12 via-secondary to-transparent",
    labelKey: "openingDesign" as const,
    descKey: "openingDesignDesc" as const,
    shortKey: "openingDesign" as const,
  },
  {
    slug: "custom/logo-printing",
    icon: "Stamp" as const,
    hero: {
      src: "/images/custom/branding.webp",
      alt: "Custom logo printing on an evaporative cooler cover",
    },
    accent: "from-accent/12 via-primary/5 to-transparent",
    labelKey: "logoPrinting" as const,
    descKey: "logoPrintingDesc" as const,
    shortKey: "logoPrinting" as const,
  },
];

/** English defaults (EN pages / sync helpers). */
export const CUSTOM_PAGES: CustomPageMeta[] = customPageDefs.map((d) => ({
  slug: d.slug,
  label: d.labelKey === "customMaterials" ? "Custom Materials"
    : d.labelKey === "customSizes" ? "Custom Sizes"
    : d.labelKey === "openingDesign" ? "Opening Design"
    : "Logo Printing",
  shortLabel:
    d.labelKey === "customMaterials" ? "Materials"
    : d.labelKey === "customSizes" ? "Sizes"
    : d.labelKey === "openingDesign" ? "Openings"
    : "Logo Printing",
  description:
    d.descKey === "customMaterialsDesc"
      ? "Fabric weight, coatings, and linings matched to your climate and exposure."
      : d.descKey === "customSizesDesc"
        ? "Any W×D×H dimension — submission format, limits, and irregular cabinets."
        : d.descKey === "openingDesignDesc"
          ? "Vents, service panels, and duct cutouts positioned to your cabinet layout."
          : "Screen print, heat transfer, or embroidery for contractor and fleet branding.",
  icon: d.icon,
  hero: d.hero,
  accent: d.accent,
}));

export function getCustomPages(t: UiDict): CustomPageMeta[] {
  return customPageDefs.map((d, i) => ({
    ...CUSTOM_PAGES[i],
    label: t.chrome[d.labelKey],
    shortLabel: t.chrome[d.shortKey],
    description: t.chrome[d.descKey],
  }));
}

export function getCustomPageMeta(slug: string, t?: UiDict): CustomPageMeta | undefined {
  if (t) return getCustomPages(t).find((p) => p.slug === slug);
  return CUSTOM_PAGES.find((p) => p.slug === slug);
}
