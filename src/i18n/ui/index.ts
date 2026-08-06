import type { Locale } from "@/i18n/locales";
import { en, type UiDict } from "./en";
import { es } from "./es";
import { ar } from "./ar";

const catalogs: Record<Locale, UiDict> = { en, es, ar };

export function ui(locale: Locale): UiDict {
  return catalogs[locale] ?? en;
}

export type { UiDict };
