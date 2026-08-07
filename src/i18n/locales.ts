export const locales = ["en", "es", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeDirs: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  es: "ltr",
  ar: "rtl",
};

export const localeHtmlLang: Record<Locale, string> = {
  en: "en",
  es: "es-MX",
  ar: "ar",
};

/**
 * Primary market + writing target for each locale.
 * es → Mexico (LatAm Spanish, MX search habits)
 * ar → Gulf pan-Arabic (UAE/KSA tone; MSA + Gulf product terms)
 */
export const localeMarkets: Record<
  Locale,
  { primary: string; ogLocale: string; hreflang: string; writingGuide: string }
> = {
  en: {
    primary: "United States",
    ogLocale: "en_US",
    hreflang: "en-US",
    writingGuide: "US English; evaporative / swamp cooler covers.",
  },
  es: {
    primary: "Mexico",
    ogLocale: "es_MX",
    hreflang: "es-MX",
    writingGuide:
      "Español de México. Preferir «funda para enfriador evaporativo», «funda para cooler», «cotización»; evitar calcos de EN y peninsularismos innecesarios.",
  },
  ar: {
    primary: "Gulf (UAE / Saudi Arabia)",
    ogLocale: "ar_AE",
    hreflang: "ar",
    writingGuide:
      "عربية فصحى حديثة بلهجة خليجية للأعمال. المصطلح الشائع للمنتج: «مكيف صحراوي»؛ الغطاء: «كفر» أو «غطاء». تجنب الترجمة الحرفية من الإنجليزية.",
  },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Ensure directory URLs end with `/` (matches Astro `trailingSlash: 'always'`). */
export function withTrailingSlash(path: string): string {
  if (!path || path === "/") return "/";
  const hashIdx = path.indexOf("#");
  const queryIdx = path.indexOf("?");
  let cut = path.length;
  if (hashIdx !== -1) cut = Math.min(cut, hashIdx);
  if (queryIdx !== -1) cut = Math.min(cut, queryIdx);
  const base = path.slice(0, cut);
  const suffix = path.slice(cut);
  if (base === "/" || base.endsWith("/")) return path;
  return `${base}/${suffix}`;
}

/** Prefix a site path for a locale. English stays unprefixed. Always trailing-slash. */
export function localizedPath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  let out: string;
  if (locale === defaultLocale) {
    out = normalized === "" ? "/" : normalized;
  } else if (normalized === "/") {
    out = `/${locale}/`;
  } else {
    out = `/${locale}${normalized}`;
  }
  return withTrailingSlash(out);
}

/** Detect locale from a URL pathname. */
export function getLocaleFromPathname(pathname: string): Locale {
  const seg = pathname.replace(/^\//, "").split("/")[0];
  if (seg && isLocale(seg) && seg !== defaultLocale) return seg;
  return defaultLocale;
}

/** Strip locale prefix from pathname for cross-locale switching. */
export function stripLocalePrefix(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (locale === defaultLocale) return pathname || "/";
  const stripped = pathname.replace(new RegExp(`^/${locale}`), "") || "/";
  return stripped;
}
