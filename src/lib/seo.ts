import { SITE_URL } from "@/lib/site";

/** Trim to ~160 chars for SERP snippets without cutting mid-word when possible. */
export function truncateMetaDescription(text: string, max = 160): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  const slice = trimmed.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 80 ? slice.slice(0, lastSpace) : slice).trim()}…`;
}

/** Keep SERP titles concise while preserving the brand suffix when present. */
export function truncateMetaTitle(text: string, max = 60): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  const suffix = clean.endsWith(" | CoolerFit") ? " | CoolerFit" : "";
  const available = max - suffix.length - 1;
  const base = suffix ? clean.slice(0, -suffix.length) : clean;
  const slice = base.slice(0, Math.max(20, available));
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 20 ? slice.slice(0, lastSpace) : slice).trim()}…${suffix}`;
}

export function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;
