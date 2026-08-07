/**
 * Page H1 / meta title helpers — nav labels stay short.
 * English pages keep "Custom …" SEO phrasing; es/ar use the localized title as-is.
 */
import { defaultLocale, type Locale } from "@/i18n/locales";

/** Product category landings — primary owner of "Custom + category" keywords (EN only). */
export function categoryPageH1(navTitle: string, locale: Locale = defaultLocale): string {
  const title = navTitle.trim();
  if (locale !== "en") return title;
  if (/^custom\b/i.test(title)) return title;
  return `Custom ${title}`;
}

/**
 * Feature landings — include Custom without mirroring category H1s (EN only).
 */
export function featurePageH1(navTitle: string, locale: Locale = defaultLocale): string {
  const title = navTitle.trim();
  if (locale !== "en") return title;
  if (/^custom\b/i.test(title)) return title;

  const forCovers = title.match(/^(.+?)\s+for\s+cooler covers$/i);
  if (forCovers) {
    return `${forCovers[1]} for Custom Cooler Covers`;
  }

  return `${title} — Custom Cover Options`;
}

/**
 * Product SKU detail — SKU name leads; Custom as suffix on EN only.
 */
export function productDetailPageH1(productName: string, locale: Locale = defaultLocale): string {
  const name = productName.trim();
  if (locale !== "en") return name;
  if (/custom built$/i.test(name) || /^custom\b/i.test(name)) return name;
  return `${name} — Custom Built`;
}

export function productDetailMetaTitle(productName: string, locale: Locale = defaultLocale): string {
  const name = productName.trim();
  if (locale === "es") return `${name} — Cotización a medida | CoolerFit`;
  if (locale === "ar") return `${name} — عرض سعر مخصّص | CoolerFit`;
  return `${name} — Custom Quote | CoolerFit`;
}
