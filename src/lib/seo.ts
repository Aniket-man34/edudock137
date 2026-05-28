/**
 * EduDock SEO Utility
 * Shared defaults, schema generators, and helper functions
 * for react-helmet-async across all pages.
 */

// ── DOMAIN CONSTANTS ──────────────────────────────────────────────
export const SITE_URL = "https://edudock.in";
export const SITE_NAME = "EduDock";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/social.png`;
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

// Android App package for Google Play verification / install prompts
export const ANDROID_PACKAGE_NAME = "in.edudock.app";
export const ANDROID_APP_ID = "REPLACE_WITH_GOOGLE_PLAY_APP_ID"; // e.g. com.example.app -> numeric ID

// ── DEFAULT META ──────────────────────────────────────────────────
export const SEO_DEFAULTS = {
  title: "EduDock — Your Educational Resource Hub",
  description:
    "Discover curated educational tools, PDFs, study materials, and real-time updates for students and educators.",
  canonical: SITE_URL,
  ogType: "website" as const,
  twitterCard: "summary_large_image" as const,
  ogImage: DEFAULT_OG_IMAGE,
};

// ── PAGE-SPECIFIC SEO DEFAULTS ────────────────────────────────────
export const PAGE_SEO: Record<string, { title: string; description: string; path: string }> = {
  home: {
    title: "EduDock — Your Educational Resource Hub",
    description:
      "Discover curated educational tools, PDFs, study materials, and real-time updates for students and educators.",
    path: "/",
  },
  tools: {
    title: "All Tools | EduDock",
    description:
      "Browse our curated collection of free educational tools for students, teachers, and lifelong learners.",
    path: "/tools",
  },
  pdfs: {
    title: "PDF Library | EduDock",
    description:
      "Explore our collection of free study materials, books, and notes in PDF format. Download and learn.",
    path: "/pdfs",
  },
  updates: {
    title: "Latest Updates | EduDock",
    description:
      "Stay informed with the latest educational news, exam alerts, resource launches, and platform updates.",
    path: "/updates",
  },
  privacy: {
    title: "Privacy Policy | EduDock",
    description:
      "EduDock privacy policy — how we collect, use, and protect your data.",
    path: "/privacy",
  },
  terms: {
    title: "Terms of Service | EduDock",
    description:
      "EduDock terms of service — rules, responsibilities, and usage guidelines for our platform.",
    path: "/terms",
  },
  notFound: {
    title: "404 — Page Not Found | EduDock",
    description: "The page you are looking for does not exist on EduDock.",
    path: "",
  },
};

// ── HELPER: Build full meta object for static pages ────────────────
export interface SEOMeta {
  title: string;
  description: string;
  canonical: string;
  ogType?: string;
  ogImage?: string;
}

export function buildSeoMeta(pageKey: string, overrides?: Partial<SEOMeta>): SEOMeta {
  const defaults = PAGE_SEO[pageKey] || PAGE_SEO.home;
  return {
    title: overrides?.title || defaults.title,
    description: overrides?.description || defaults.description,
    canonical: overrides?.canonical || `${SITE_URL}${defaults.path}`,
    ogType: overrides?.ogType || "website",
    ogImage: overrides?.ogImage || DEFAULT_OG_IMAGE,
  };
}

// ── SCHEMA GENERATORS ────────────────────────────────────────────

/** Homepage composite schema: WebSite + SearchAction + SoftwareApplication (Google Play install prompt) */
export function generateHomeSchemas(): object[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "EduDock",
      operatingSystem: "Android",
      applicationCategory: "EducationalApplication",
      url: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`,
      offers: {
        "@type": "Offer",
        price: "0",
      },
    },
  ];
}

/** Blog/Update post schema: Article */
export function generateArticleSchema(post: {
  title: string;
  description: string;
  image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  slug: string | null;
  id: string;
  author_name?: string | null;
}): object {
  const canonicalUrl = `${SITE_URL}/updates/${post.slug || post.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description:
      post.description?.substring(0, 160).replace(/\n/g, " ") ||
      "Read the full update on EduDock.",
    image: post.image_url || DEFAULT_OG_IMAGE,
    datePublished: post.created_at || undefined,
    dateModified: post.updated_at || post.created_at || undefined,
    author: {
      "@type": "Person",
      name: post.author_name || "EduDock Official",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };
}

/** PDF/Document schema: DigitalDocument */
export function generateDigitalDocumentSchema(doc: {
  title: string;
  description: string | null;
  cover_image_url: string | null;
  created_at: string | null;
  slug: string | null;
  id: string;
  author_name?: string | null;
}): object {
  const canonicalUrl = `${SITE_URL}/pdfs/${doc.slug || doc.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: doc.title,
    description:
      doc.description?.substring(0, 160).replace(/\n/g, " ") ||
      "Download this PDF study material from EduDock.",
    image: doc.cover_image_url || DEFAULT_OG_IMAGE,
    dateCreated: doc.created_at || undefined,
    author: {
      "@type": "Person",
      name: doc.author_name || "EduDock Official",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };
}

/** Tools listing page schema: CollectionPage */
export function generateCollectionPageSchema(page: {
  title: string;
  description: string;
  path: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.title,
    description: page.description,
    url: `${SITE_URL}${page.path}`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

// ── FALLBACK HELPER: null-safe field extraction ────────────────────
export function fallbackMetaTitle(dbTitle: string | null | undefined, rawTitle: string): string {
  return dbTitle?.trim() || rawTitle;
}

export function fallbackMetaDescription(
  dbDesc: string | null | undefined,
  content: string | null | undefined,
): string {
  if (dbDesc?.trim()) return dbDesc.trim().substring(0, 160);
  if (content?.trim()) return content.trim().replace(/\n/g, " ").substring(0, 160);
  return SEO_DEFAULTS.description;
}

export function fallbackOgImage(
  dbImage: string | null | undefined,
): string {
  return dbImage?.trim() || DEFAULT_OG_IMAGE;
}