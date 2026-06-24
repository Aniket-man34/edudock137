import type { Metadata } from "next";

// ── DOMAIN CONSTANTS ──────────────────────────────────────────────
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://edudock.in";
export const SITE_NAME = "EduDock";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/social.png`;
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

export const ANDROID_PACKAGE_NAME = "in.edudock.app";

// ── DEFAULTS ──────────────────────────────────────────────────────
export const SEO_DEFAULTS = {
  title: "EduDock — Your Educational Resource Hub",
  description:
    "Discover curated educational tools, PDFs, study materials, and real-time updates for students and educators.",
  ogType: "website" as const,
  twitterCard: "summary_large_image" as const,
  ogImage: DEFAULT_OG_IMAGE,
};

export const PAGE_SEO: Record<
  string,
  { title: string; description: string; path: string }
> = {
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
  about: {
    title: "About EduDock — what we make and why",
    description:
      "EduDock is a free, ad-light hub of curated study tools, PDFs, and exam updates for students and educators.",
    path: "/about",
  },
  contact: {
    title: "Contact EduDock",
    description:
      "Get in touch with EduDock — questions, feedback, partnerships, or report a broken link.",
    path: "/contact",
  },
  submit: {
    title: "Submit to EduDock — tools, PDFs, fixes",
    description:
      "Suggest a study tool, contribute a PDF, or report a broken link. We review every submission.",
    path: "/submit",
  },
  saved: {
    title: "Saved | EduDock",
    description: "Items you've saved for later on this device.",
    path: "/saved",
  },
};

// ── SEO ROW (DB site_seo_settings) ────────────────────────────────
export interface SiteSeoRow {
  id: string;
  page_name: string;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_type: string | null;
  twitter_card: string | null;
  schema_markup: string | null;
  canonical_url: string | null;
  created_at?: string;
  updated_at?: string;
}

// ── METADATA BUILDERS ─────────────────────────────────────────────

interface BuildArgs {
  pageKey: keyof typeof PAGE_SEO;
  seo?: SiteSeoRow | null;
  noindex?: boolean;
  ogType?: "website" | "article";
}

export function buildPageMetadata({
  pageKey,
  seo,
  noindex = false,
  ogType,
}: BuildArgs): Metadata {
  const defaults = PAGE_SEO[pageKey] ?? PAGE_SEO.home;
  const title = seo?.meta_title?.trim() || defaults.title;
  const description = seo?.meta_description?.trim() || defaults.description;
  const ogTitle = seo?.og_title?.trim() || title;
  const ogDescription = seo?.og_description?.trim() || description;
  const ogImage = seo?.og_image?.trim() || DEFAULT_OG_IMAGE;
  const resolvedOgType =
    (ogType || (seo?.og_type?.trim() as "website" | "article" | undefined)) ||
    "website";
  const canonical =
    seo?.canonical_url?.trim() || `${SITE_URL}${defaults.path}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: resolvedOgType,
      url: canonical,
      title: ogTitle,
      description: ogDescription,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: (seo?.twitter_card?.trim() as any) || "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
  };
}

interface ArticleArgs {
  title: string;
  description: string;
  image: string | null;
  url: string;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authorName?: string | null;
  metaTitleOverride?: string | null;
  metaDescriptionOverride?: string | null;
}

export function buildArticleMetadata(args: ArticleArgs): Metadata {
  const title =
    args.metaTitleOverride?.trim() || `${args.title} | ${SITE_NAME}`;
  const description =
    args.metaDescriptionOverride?.trim() ||
    args.description?.trim().substring(0, 160) ||
    SEO_DEFAULTS.description;
  const image = args.image?.trim() || DEFAULT_OG_IMAGE;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: args.url },
    openGraph: {
      type: "article",
      url: args.url,
      title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: args.title,
        },
      ],
      publishedTime: args.publishedTime ?? undefined,
      modifiedTime: args.modifiedTime ?? args.publishedTime ?? undefined,
      authors: args.authorName ? [args.authorName] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    other: args.authorName
      ? {
          "article:author": args.authorName,
        }
      : undefined,
  };
}

// ── SCHEMA GENERATORS (JSON-LD) ───────────────────────────────────
export function generateOrganizationSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    sameAs: [
      `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`,
    ],
  };
}

export function generateWebSiteSchema(): object {
  return {
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
  };
}

// Organization + WebSite are emitted globally by the public layout, so the
// home page only contributes the app-install SoftwareApplication record.
export function generateHomeSchemas(): object[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      operatingSystem: "Android",
      applicationCategory: "EducationalApplication",
      url: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`,
      offers: { "@type": "Offer", price: "0" },
    },
  ];
}

export function generateArticleSchema(post: {
  title: string;
  description: string | null;
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
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  };
}

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

// Tools render as WebApplication so Google can surface them as a web app in
// rich results (the admin "WebApp" JSON-LD template matches this @type).
export function generateWebApplicationSchema(tool: {
  title: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  url: string;
  slug: string | null;
  id: string;
  author_name?: string | null;
}): object {
  const canonicalUrl = `${SITE_URL}/tools/${tool.slug || tool.id}`;
  const desc =
    tool.short_description?.trim() ||
    tool.description?.substring(0, 160).replace(/\n/g, " ") ||
    "Explore this educational tool on EduDock.";
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.title,
    description: desc,
    image: tool.image_url || DEFAULT_OG_IMAGE,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    url: tool.url,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: {
      "@type": "Person",
      name: tool.author_name || "EduDock Official",
    },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  };
}

// Back-compat alias: older imports referenced generateSoftwareApplicationSchema.
export const generateSoftwareApplicationSchema = generateWebApplicationSchema;

// Admin-authored JSON-LD (schema_markup jsonb) takes priority over the
// generated fallback. We accept an object, a JSON string, or an array of
// either, normalize to a non-empty plain object, and inject "@context" if the
// admin omitted it. Anything malformed falls back to the generated schema.
export function resolveSchemaMarkup(
  raw: unknown,
  fallback: object,
): object | object[] {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return fallback;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return fallback;
    }
  }

  const withContext = (obj: Record<string, unknown>) =>
    obj["@context"] ? obj : { "@context": "https://schema.org", ...obj };

  if (Array.isArray(parsed)) {
    const items = parsed.filter(
      (i): i is Record<string, unknown> =>
        !!i && typeof i === "object" && Object.keys(i).length > 0,
    );
    return items.length ? items.map(withContext) : fallback;
  }

  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    return Object.keys(obj).length ? withContext(obj) : fallback;
  }

  return fallback;
}

// ── DB FETCHER (server, request-deduplicated) ─────────────────────
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@/integrations/supabase/server";

const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export const fetchSiteSeo = cache(async (
  supabase: SupabaseClient,
  pageName: string
): Promise<SiteSeoRow | null> => {
  try {
    const { data, error } = await (supabase as any)
      .from("site_seo_settings")
      .select("*")
      .eq("page_name", pageName)
      .maybeSingle();
    if (error) return null;
    return (data as SiteSeoRow) ?? null;
  } catch {
    return null;
  }
});

export const fetchUpdate = cache(async (slug: string): Promise<any> => {
  try {
    const supabase = createServerClient();
    const column = isUUID(slug) ? "id" : "slug";
    const { data, error } = await (supabase as any)
      .from("updates")
      .select("*, categories(name)")
      .eq(column, slug)
      .maybeSingle();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
});

export const fetchPdf = cache(async (slug: string): Promise<any> => {
  try {
    const supabase = createServerClient();
    const column = isUUID(slug) ? "id" : "slug";
    const { data, error } = await (supabase as any)
      .from("pdfs")
      .select("*, categories(name)")
      .eq(column, slug)
      .maybeSingle();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
});

export const fetchTool = cache(async (slug: string): Promise<any> => {
  try {
    const supabase = createServerClient();
    const column = isUUID(slug) ? "id" : "slug";
    const { data, error } = await (supabase as any)
      .from("tools")
      .select("*, categories(name)")
      .eq(column, slug)
      .maybeSingle();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
});
