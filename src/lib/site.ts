export const SITE_URL = "https://aircoolercover.com";
export const SITE_NAME = "CoolerFit";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export const SITE_CONTACT = {
  email: "custom@aircoolercover.com",
  phone: "+86 156 0868 0459",
  address: "Southern Business District, Yinzhou District, Ningbo City, Zhejiang Province, P.R.China",
} as const;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    email: SITE_CONTACT.email,
    telephone: SITE_CONTACT.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONTACT.address,
      addressLocality: "Ningbo",
      addressRegion: "Zhejiang",
      addressCountry: "CN",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: ["en-US", "es-MX", "ar"],
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
