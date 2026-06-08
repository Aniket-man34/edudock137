import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Heart, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { PAGE_SEO, SITE_URL, buildPageMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = buildPageMetadata({ pageKey: "about" });
export const revalidate = 3600;

const VALUES = [
  {
    icon: Heart,
    title: "Free, on purpose",
    text: "Every tool, PDF, and update lives behind zero paywalls. We index and curate — we don't gatekeep.",
  },
  {
    icon: ShieldCheck,
    title: "Light on tracking",
    text: "We only collect anonymous page-view counts so we know what's working. No third-party ads, no profiling.",
  },
  {
    icon: Users,
    title: "Built with the community",
    text: "Anyone can submit a tool, contribute a PDF, or report a broken link. Real people review every submission.",
  },
  {
    icon: Sparkles,
    title: "Refreshed weekly",
    text: "New PDFs, exam alerts, and tool launches go out every Friday. The home page stays fresh on a 60-second cache.",
  },
];

export default function AboutPage() {
  return (
    <article className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <Breadcrumbs items={[{ label: "About" }]} />

      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight mb-4 leading-tight">
          We make studying online{" "}
          <span className="gradient-text">less of a tab graveyard.</span>
        </h1>
        <p className="text-lg text-foreground/80 leading-relaxed max-w-2xl">
          EduDock is a free hub for students and educators. We hand-pick study
          tools, host free PDFs, and post timely exam updates — all in one fast,
          calm corner of the web.
        </p>
      </header>

      <section
        aria-labelledby="values-heading"
        className="grid sm:grid-cols-2 gap-4 mb-12"
      >
        <h2 id="values-heading" className="sr-only">
          What we care about
        </h2>
        {VALUES.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="glass-card-static p-6 rounded-2xl"
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 ring-1 ring-primary/15 mb-3"
              aria-hidden="true"
            >
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold font-display tracking-tight mb-1.5">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {text}
            </p>
          </div>
        ))}
      </section>

      <section className="prose prose-blue max-w-none dark:prose-invert mb-12 prose-headings:font-display prose-a:text-primary">
        <h2>What you&rsquo;ll find here</h2>
        <p>
          Three places to start, all linked from the top nav:
        </p>
        <ul>
          <li>
            <Link href="/tools">Tools</Link> — curated web apps, calculators,
            simulators, and reference utilities for everyday study.
          </li>
          <li>
            <Link href="/pdfs">PDFs</Link> — free notes, books, and worksheets
            you can preview or download in one tap.
          </li>
          <li>
            <Link href="/updates">Updates</Link> — exam alerts, scholarship
            news, and platform release notes, sorted by recency or popularity.
          </li>
        </ul>

        <h2>Want to contribute?</h2>
        <p>
          Found a study tool worth sharing, wrote notes you&rsquo;d like to host,
          or spotted a broken link? Use the{" "}
          <Link href="/submit">submit page</Link> — we read everything and reply
          when we&rsquo;ve added or fixed it. If you&rsquo;d rather just say
          hello, the <Link href="/contact">contact page</Link> works too.
        </p>
      </section>

      <NewsletterForm
        source="about"
        title="Stay in the loop"
        subtitle="One Friday digest a week. New PDFs, fresh tools, and the exam updates worth your attention."
      />

      <div className="mt-10 flex flex-wrap items-center gap-3 text-sm">
        <Link href="/submit" className="btn-primary">
          Submit something <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link href="/contact" className="btn-secondary">
          Contact us
        </Link>
        <Link
          href={`${SITE_URL}/privacy`}
          className="text-muted-foreground hover:text-foreground transition-colors link-underline"
        >
          Read our privacy policy
        </Link>
      </div>
    </article>
  );
}
