import { getProductItemBySlug } from "@/data/product-items";
import { getProductBySlug } from "@/data/products";
import { defaultLocale, localizedPath, type Locale } from "@/i18n/locales";

export type QuoteLinkInput = {
  /** Product SKU slug */
  productSlug?: string;
  /** Display name when slug is omitted */
  productName?: string;
  /** Category slug under /products/ */
  categorySlug?: string;
  categoryName?: string;
  /** Maps to Cover Type / Application field */
  coverType?: string;
  /** Pre-fill custom requirements */
  details?: string;
  /** Source page path, e.g. /product/foo (unprefixed; will be localized) */
  ref?: string;
  /** Target contact locale */
  locale?: Locale;
};

export type QuotePrefill = {
  productSlug: string;
  productName: string;
  categorySlug: string;
  categoryName: string;
  coverType: string;
  details: string;
  ref: string;
  /** Human-readable summary for the context banner */
  summary: string;
};

const emptyPrefill = (): Omit<QuotePrefill, "summary"> => ({
  productSlug: "",
  productName: "",
  categorySlug: "",
  categoryName: "",
  coverType: "",
  details: "",
  ref: "",
});

export function buildQuoteUrl(input: QuoteLinkInput = {}): string {
  const locale = input.locale ?? defaultLocale;
  const params = new URLSearchParams();
  if (input.productSlug) params.set("product", input.productSlug);
  if (input.productName) params.set("productName", input.productName);
  if (input.categorySlug) params.set("category", input.categorySlug);
  if (input.categoryName) params.set("categoryName", input.categoryName);
  if (input.coverType) params.set("coverType", input.coverType);
  if (input.details) params.set("details", input.details);
  if (input.ref) {
    // Prefer unprefixed refs; if already localized, store as-is.
    params.set("ref", input.ref);
  }
  const q = params.toString();
  const contact = localizedPath(locale, "/contact");
  return q ? `${contact}?${q}` : contact;
}

function buildSummary(fields: Omit<QuotePrefill, "summary">): string {
  if (fields.productName) return fields.productName;
  if (fields.categoryName) return fields.categoryName;
  if (fields.coverType) return fields.coverType;
  return "";
}

/** Parse ?product= & friends into contact form defaults. */
export function parseQuotePrefill(searchParams: URLSearchParams): QuotePrefill | null {
  const raw = {
    ...emptyPrefill(),
    productSlug: searchParams.get("product")?.trim() ?? "",
    productName: searchParams.get("productName")?.trim() ?? "",
    categorySlug: searchParams.get("category")?.trim() ?? "",
    categoryName: searchParams.get("categoryName")?.trim() ?? "",
    coverType: searchParams.get("coverType")?.trim() ?? "",
    details: searchParams.get("details")?.trim() ?? "",
    ref: searchParams.get("ref")?.trim() ?? "",
  };

  if (raw.productSlug && !raw.productName) {
    const item = getProductItemBySlug(raw.productSlug);
    if (item) raw.productName = item.name;
  }

  if (raw.categorySlug && !raw.categoryName) {
    const cat = getProductBySlug(raw.categorySlug);
    if (cat) raw.categoryName = cat.title;
  }

  const summary = buildSummary(raw);
  if (!summary && !raw.details && !raw.ref) return null;

  return { ...raw, summary };
}

/** Map URL prefill → contact form field values + submit metadata. */
export function quotePrefillToForm(prefill: QuotePrefill) {
  const productField =
    prefill.productName ||
    prefill.categoryName ||
    prefill.coverType ||
    "";

  // Custom Requirements stays empty — context lives in the banner + pageUrl on submit.
  return {
    product: productField,
    details: "",
    productSlug: prefill.productSlug,
    productName: prefill.productName || prefill.categoryName || prefill.coverType,
    pageUrl: prefill.ref ? `${window.location.origin}${prefill.ref}` : window.location.href,
  };
}
