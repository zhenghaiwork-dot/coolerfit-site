import { SITE_CONTACT } from "@/lib/site";

export type InquiryFormType = "simple" | "custom" | "contact";

export type InquiryPayload = {
  formType: InquiryFormType;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  productName?: string;
  productSlug?: string;
  coverType?: string;
  quantity?: string;
  dimensions?: string;
  message?: string;
  color?: string;
  material?: string;
  width?: string;
  height?: string;
  depth?: string;
  sizeUnit?: string;
  logoPosition?: string;
  openingDesign?: string;
  notes?: string;
  pageUrl?: string;
};

// Astro exposes client-visible env vars under the PUBLIC_ prefix, so the
// Vite-era VITE_INQUIRY_ENDPOINT name moves across with it.
const ENDPOINT = import.meta.env.PUBLIC_INQUIRY_ENDPOINT ?? "/api/inquiry.php";

const OPENING_LABELS: Record<string, string> = {
  none: "No Openings",
  "vent-top": "Top Ventilation",
  "vent-side": "Side Ventilation",
  "pipe-cutout": "Pipe Cutout",
  "drain-hole": "Drainage Hole",
  "full-custom": "Custom (Described in Notes)",
};

const LOGO_POSITION_LABELS: Record<string, string> = {
  center: "Center",
  "top-left": "Top Left",
  "top-right": "Top Right",
  "bottom-center": "Bottom Center",
  full: "Full Cover",
};

export function formatInquiryBody(payload: InquiryPayload, logoFileName?: string): string {
  const lines: string[] = [
    `Form: ${payload.formType}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
  ];

  if (payload.phone) lines.push(`Phone: ${payload.phone}`);
  if (payload.company) lines.push(`Company: ${payload.company}`);
  if (payload.productName) lines.push(`Product: ${payload.productName}`);
  if (payload.productSlug) lines.push(`Product slug: ${payload.productSlug}`);
  if (payload.coverType) lines.push(`Cover type: ${payload.coverType}`);
  if (payload.quantity) lines.push(`Quantity: ${payload.quantity}`);
  if (payload.dimensions) lines.push(`Dimensions: ${payload.dimensions}`);

  if (payload.material) lines.push(`Material: ${payload.material}`);
  if (payload.color) lines.push(`Color: ${payload.color}`);
  if (payload.width || payload.height || payload.depth) {
    const unit = payload.sizeUnit ?? "cm";
    lines.push(
      `Custom size: ${payload.width || "—"} W × ${payload.height || "—"} H × ${payload.depth || "—"} D (${unit})`,
    );
  }
  if (payload.openingDesign) {
    lines.push(`Opening / cutout: ${OPENING_LABELS[payload.openingDesign] ?? payload.openingDesign}`);
  }
  if (payload.logoPosition) {
    lines.push(`Logo position: ${LOGO_POSITION_LABELS[payload.logoPosition] ?? payload.logoPosition}`);
  }
  if (logoFileName) lines.push(`Logo file: ${logoFileName}`);
  if (payload.message) lines.push(`Message:\n${payload.message}`);
  if (payload.notes) lines.push(`Notes:\n${payload.notes}`);
  if (payload.pageUrl) lines.push(`Submitted from: ${payload.pageUrl}`);

  return lines.join("\n");
}

export function buildMailtoUrl(payload: InquiryPayload, logoFileName?: string): string {
  const product = payload.productName ? ` — ${payload.productName}` : "";
  const subject = encodeURIComponent(`CoolerFit Quote Request${product}`);
  const body = encodeURIComponent(formatInquiryBody(payload, logoFileName));
  return `mailto:${SITE_CONTACT.email}?subject=${subject}&body=${body}`;
}

export type SubmitInquiryResult =
  | { ok: true; method: "api" }
  | { ok: true; method: "mailto" }
  | { ok: false; method: "failed"; error?: string };

export type AntiSpamPayload = {
  formStartedAt: number;
  honeypot: string;
};

export async function submitInquiry(
  payload: InquiryPayload,
  logoFile?: File | null,
  antiSpam?: AntiSpamPayload,
): Promise<SubmitInquiryResult> {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value != null && value !== "") formData.append(key, value);
  });
  if (antiSpam) {
    formData.append("website", antiSpam.honeypot);
    formData.append("formStartedAt", String(antiSpam.formStartedAt));
  }
  if (logoFile) formData.append("logo", logoFile, logoFile.name);

  try {
    const res = await fetch(ENDPOINT, { method: "POST", body: formData });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (res.ok && data?.ok) return { ok: true, method: "api" };
    if (!res.ok && data?.error) {
      // Server rejected — try mailto only in local/dev without PHP
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      if (!isLocal) return { ok: false, method: "failed", error: data.error };
    }
  } catch {
    // Network error — mailto fallback below for local preview
  }

  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  if (isLocal) {
    window.location.href = buildMailtoUrl(payload, logoFile?.name);
    return { ok: true, method: "mailto" };
  }

  return {
    ok: false,
    method: "failed",
    error: "Could not reach the inquiry server. Please email us directly.",
  };
}

export function validateInquiryContact(
  name: string,
  email: string,
  locale: string = "en",
): string | null {
  const messages = {
    en: {
      name: "Please enter your name.",
      email: "Please enter your email.",
      invalid: "Please enter a valid email.",
    },
    es: {
      name: "Ingresa tu nombre.",
      email: "Ingresa tu correo.",
      invalid: "Ingresa un correo válido.",
    },
    ar: {
      name: "يرجى إدخال اسمك.",
      email: "يرجى إدخال بريدك الإلكتروني.",
      invalid: "يرجى إدخال بريد إلكتروني صالح.",
    },
  } as const;
  const key = locale.startsWith("es") ? "es" : locale.startsWith("ar") ? "ar" : "en";
  const m = messages[key];
  if (!name.trim()) return m.name;
  if (!email.trim()) return m.email;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return m.invalid;
  return null;
}
