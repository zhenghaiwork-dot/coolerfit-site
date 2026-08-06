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
  es: "es",
  ar: "ar",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Prefix a site path for a locale. English stays unprefixed. */
export function localizedPath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return normalized === "" ? "/" : normalized;
  if (normalized === "/") return `/${locale}/`;
  return `/${locale}${normalized}`;
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
