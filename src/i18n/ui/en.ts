export const en = {
  nav: {
    products: "Products",
    customSolutions: "Custom Solutions",
    resources: "Resources",
    blog: "Blog",
    about: "About",
    contact: "Get a Quote",
    requestQuote: "Request Quote",
  },
  common: {
    home: "Home",
    learnMore: "Learn More",
    viewDetails: "View Details",
    backToProducts: "Back to Products",
    privacy: "Privacy Policy",
    allRights: "All rights reserved.",
    readingMin: "min read",
    pillarGuide: "Pillar Guide",
    relatedProducts: "Related Products",
    specifications: "Specifications",
    features: "Features",
    customizeQuote: "Customize & Get Quote",
    language: "Language",
  },
  home: {
    eyebrow: "Built to Your Exact Specs",
    h1Before: "Custom",
    h1Accent: "Evaporative Cooler Covers",
    heroBody:
      "Covers for portable evaporative air coolers — the wheeled, floor-standing units used across residential, commercial, and industrial sites. Send us your dimensions, photos, or drawings; we manufacture made-to-measure.",
    heroMeta: "Standard sizes available · MOQ from 1 unit · Logo printing & custom cutouts supported",
    ctaQuote: "Get a Free Quote",
    ctaHow: "How Custom Works",
  },
  contact: {
    label: "Get in Touch",
    heading: "Get a Quote",
    subtext:
      "Every cover is custom-made to your measurements and requirements. Send dimensions, reference photos, or drawings — we'll confirm specs and reply with a quote within 24 hours.",
    send: "Send Request",
    sending: "Sending…",
  },
  form: {
    name: "Name *",
    email: "Email *",
    phone: "Phone (optional)",
    company: "Company",
    coverType: "Cover Type",
    quantity: "Estimated Quantity",
    details: "Additional Details",
    submitInquiry: "Submit Inquiry",
    submitting: "Submitting...",
  },
  toast: {
    inquirySent: "Inquiry submitted",
    quoteSent: "Quote request sent",
  },
} as const;

export type UiDict = typeof en;
