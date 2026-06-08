import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Wrench, Bell, Home } from "lucide-react";
import { createServerClient } from "@/integrations/supabase/server";
import { PAGE_SEO, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: PAGE_SEO.notFound.title,
  description: PAGE_SEO.notFound.description,
  robots: { index: false, follow: true },
  alternates: { canonical: SITE_URL },
};

export const revalidate = 300;

export default async function NotFound() {
  const supabase = createServerClient();
  const [{ data: tools }, { data: pdfs }, { data: updates }] = await Promise.all([
    supabase
      .from("tools")
      .select("id, title, slug")
      .order("clicks", { ascending: false, nullsFirst: false })
      .limit(4),
    supabase
      .from("pdfs")
      .select("id, title, slug")
      .order("clicks", { ascending: false, nullsFirst: false })
      .limit(4),
    supabase
      .from("updates")
      .select("id, title, slug")
      .order("clicks", { ascending: false, nullsFirst: false })
      .limit(4),
  ]);

  return (
    <div className="min-h-screen bg-background px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center">
          <div className="glass-card-static inline-flex p-8 rounded-3xl mb-6">
            <h1 className="font-display text-7xl md:text-8xl font-extrabold gradient-text">
              404
            </h1>
          </div>
          <p className="mb-2 text-2xl font-bold font-display">
            We can&rsquo;t find that page
          </p>
          <p className="mb-8 text-muted-foreground max-w-md mx-auto">
            The link may be outdated. Try one of these popular destinations
            instead.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <Link href="/" className="btn-primary">
              <Home className="h-4 w-4" aria-hidden="true" /> Back home
            </Link>
            <Link href="/pdfs" className="btn-secondary">
              <BookOpen className="h-4 w-4" aria-hidden="true" /> Browse PDFs
            </Link>
            <Link href="/tools" className="btn-secondary">
              <Wrench className="h-4 w-4" aria-hidden="true" /> Explore tools
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <PopularBlock
            title="Popular tools"
            href="/tools"
            icon={Wrench}
            items={(tools ?? []).map((t) => ({
              title: t.title,
              href: `/tools/${t.slug || t.id}`,
            }))}
          />
          <PopularBlock
            title="Popular PDFs"
            href="/pdfs"
            icon={BookOpen}
            items={(pdfs ?? []).map((p) => ({
              title: p.title,
              href: `/pdfs/${p.slug || p.id}`,
            }))}
          />
          <PopularBlock
            title="Latest updates"
            href="/updates"
            icon={Bell}
            items={(updates ?? []).map((u) => ({
              title: u.title,
              href: `/updates/${u.slug || u.id}`,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

function PopularBlock({
  title,
  href,
  icon: Icon,
  items,
}: {
  title: string;
  href: string;
  icon: any;
  items: Array<{ title: string; href: string }>;
}) {
  return (
    <div className="glass-card-static p-5 rounded-2xl">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 ring-1 ring-primary/15"
          aria-hidden="true"
        >
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-base font-bold font-display tracking-tight">
          {title}
        </h2>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {items.map((item, i) => (
            <li key={i}>
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors line-clamp-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">No items yet.</p>
      )}
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 link-underline"
      >
        View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </div>
  );
}
