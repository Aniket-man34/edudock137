import type { Metadata } from "next";
import Link from "next/link";
import { PAGE_SEO, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: PAGE_SEO.notFound.title,
  description: PAGE_SEO.notFound.description,
  robots: { index: false, follow: true },
  alternates: { canonical: SITE_URL },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="glass-card-static inline-flex p-8 rounded-3xl mb-6">
          <h1 className="font-display text-7xl md:text-8xl font-extrabold gradient-text">
            404
          </h1>
        </div>
        <p className="mb-2 text-2xl font-bold font-display">Page not found</p>
        <p className="mb-8 text-muted-foreground">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been
          moved.
        </p>
        <Link href="/" className="btn-primary">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
