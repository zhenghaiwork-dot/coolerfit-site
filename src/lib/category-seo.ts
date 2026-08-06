/**
 * Page H1 / meta title helpers — nav labels stay short.
 * Category pages own broad "Custom {category}" terms; feature & SKU pages use distinct phrasing.
 */

/** Product category landings — primary owner of "Custom + category" keywords. */
export function categoryPageH1(navTitle: string): string {
  if (/^custom\b/i.test(navTitle.trim())) return navTitle;
  return `Custom ${navTitle}`;
}

/**
 * Feature landings — include Custom without mirroring category H1s
 * (e.g. avoid duplicating "Custom UV-Resistant Cooler Covers").
 */
export function featurePageH1(navTitle: string): string {
  const title = navTitle.trim();
  if (/^custom\b/i.test(title)) return title;

  const forCovers = title.match(/^(.+?)\s+for\s+cooler covers$/i);
  if (forCovers) {
    return `${forCovers[1]} for Custom Cooler Covers`;
  }

  return `${title} — Custom Cover Options`;
}

/**
 * Product SKU detail — SKU name leads; Custom as suffix (long-tail, not category head terms).
 */
export function productDetailPageH1(productName: string): string {
  const name = productName.trim();
  if (/custom built$/i.test(name) || /^custom\b/i.test(name)) return name;
  return `${name} — Custom Built`;
}

export function productDetailMetaTitle(productName: string): string {
  const name = productName.trim();
  return `${name} — Custom Quote | CoolerFit`;
}
