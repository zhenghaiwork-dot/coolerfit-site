/** Retired blog slugs → canonical resource guides (301-style client redirect). */
export const blogRedirects: Record<string, string> = {
  "how-to-measure-cooler-cover": "/sizes/how-to-measure",
  "cover-material-comparison": "/materials",
  "how-to-install-cooler-cover": "/resources/installation",
  "how-to-clean-cooler-covers": "/resources/maintenance",
  "how-to-store-cooler-cover": "/resources/maintenance",
};

export function getBlogRedirect(slug: string): string | undefined {
  return blogRedirects[slug];
}
