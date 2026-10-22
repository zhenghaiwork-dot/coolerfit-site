export type InquirySource = {
  page: string;
  position: string;
};

const STORAGE_KEY = "coolerfit_inquiry_source_v1";
const CONTACT_PATH = /^\/(?:es\/|ar\/)?contact\/?$/;

function safePath(value: string): string {
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return "";
    return url.pathname.slice(0, 240);
  } catch {
    return "";
  }
}

function safePosition(value: string): string {
  const normalized = value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized.slice(0, 48);
}

function positionFor(anchor: HTMLAnchorElement): string {
  const explicit = anchor.dataset.inquiryPosition;
  if (explicit) return safePosition(explicit);
  if (anchor.closest("[data-mobile-menu]")) return "header-mobile";
  if (anchor.closest("header")) return "header-desktop";
  if (anchor.closest("footer")) return "footer-contact";
  return "main-contact-cta";
}

export function rememberInquirySource(anchor: HTMLAnchorElement): void {
  const destination = safePath(anchor.href);
  if (!CONTACT_PATH.test(destination)) return;

  const source: InquirySource = {
    page: safePath(window.location.href),
    position: positionFor(anchor),
  };
  if (!source.page || !source.position) return;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(source));
  } catch {
    // Storage may be disabled; inquiry submission still works without attribution.
  }
}

export function getInquirySource(): InquirySource | null {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null") as Partial<InquirySource> | null;
    if (!parsed) return null;
    const page = safePath(parsed.page ?? "");
    const position = safePosition(parsed.position ?? "");
    return page && position ? { page, position } : null;
  } catch {
    return null;
  }
}

export function clearInquirySource(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // No-op when storage is unavailable.
  }
}

export function initInquirySourceTracking(): void {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest<HTMLAnchorElement>("a[href]");
    if (anchor) rememberInquirySource(anchor);
  });
}
