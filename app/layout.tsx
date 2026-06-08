import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Providers } from "./providers";
import { SEO_DEFAULTS, SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";
import "./globals.css";

const SUPABASE_HOST = (() => {
  try {
    const u =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      "";
    return u ? new URL(u).origin : "";
  } catch {
    return "";
  }
})();

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO_DEFAULTS.title,
    template: "%s | EduDock",
  },
  description: SEO_DEFAULTS.description,
  applicationName: SITE_NAME,
  authors: [{ name: "EduDock" }],
  keywords: [
    "education",
    "study materials",
    "PDF",
    "tools",
    "students",
    "learning",
    "EduDock",
  ],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: SEO_DEFAULTS.title,
    description: SEO_DEFAULTS.description,
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "EduDock — curated educational tools, PDFs, and updates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_DEFAULTS.title,
    description: SEO_DEFAULTS.description,
    images: [DEFAULT_OG_IMAGE],
  },
  manifest: undefined,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e1a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        {SUPABASE_HOST && (
          <>
            <link rel="preconnect" href={SUPABASE_HOST} crossOrigin="" />
            <link rel="dns-prefetch" href={SUPABASE_HOST} />
          </>
        )}
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
