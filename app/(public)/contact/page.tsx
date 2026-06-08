import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, Github, Twitter } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import SuggestionForm from "@/components/SuggestionForm";

export const metadata: Metadata = buildPageMetadata({ pageKey: "contact" });
export const revalidate = 3600;

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
      <Breadcrumbs items={[{ label: "Contact" }]} />

      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight mb-4 leading-tight">
          Get in touch
        </h1>
        <p className="text-lg text-foreground/80 leading-relaxed max-w-2xl">
          Questions, feedback, partnerships, or just want to say hi — pick
          whichever channel works for you. We answer everything in business
          days.
        </p>
      </header>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
        <section aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading" className="sr-only">
            Contact form
          </h2>
          <SuggestionForm defaultKind="contact" source="contact" />
        </section>

        <aside aria-labelledby="contact-channels-heading" className="space-y-4">
          <h2
            id="contact-channels-heading"
            className="text-xs font-bold uppercase tracking-[0.18em] text-foreground"
          >
            Other ways to reach us
          </h2>

          <a
            href="mailto:hello@edudock.in"
            className="glass-card-static block p-5 rounded-2xl hover:-translate-y-0.5 hover:border-primary/30 transition-[transform,border-color] duration-fast ease-out motion-reduce:hover:translate-y-0 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 ring-1 ring-primary/15"
                aria-hidden="true"
              >
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <p className="font-semibold font-display tracking-tight">
                Email
              </p>
            </div>
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              hello@edudock.in
            </p>
          </a>

          <Link
            href="/submit"
            className="glass-card-static block p-5 rounded-2xl hover:-translate-y-0.5 hover:border-primary/30 transition-[transform,border-color] duration-fast ease-out motion-reduce:hover:translate-y-0 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 ring-1 ring-primary/15"
                aria-hidden="true"
              >
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <p className="font-semibold font-display tracking-tight">
                Submit content
              </p>
            </div>
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Suggest a tool, contribute a PDF, or report a broken link.
            </p>
          </Link>

          <div className="glass-card-static p-5 rounded-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-foreground mb-3">
              Social
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://twitter.com/edudock"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="EduDock on X (Twitter)"
                className="btn-icon"
              >
                <Twitter className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="https://github.com/edudock"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="EduDock on GitHub"
                className="btn-icon"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
