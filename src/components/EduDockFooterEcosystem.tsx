import Link from "next/link";
import { BookOpen, Bell, Wrench, Info, Mail, FileText, Shield } from "lucide-react";

export default function EduDockFooterEcosystem() {
  return (
    <section className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-transparent py-16 md:py-20 mt-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight mb-4">
            Explore <span className="gradient-text">EduDock</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Hand-picked educational tools, study PDFs, and timely updates — all free,
            no paywalls, no clutter.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <Link
            href="/tools"
            className="glass-card-static p-6 rounded-2xl hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-fast group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400/20 to-green-400/10 ring-1 ring-emerald-400/20"
                aria-hidden="true"
              >
                <Wrench className="h-5 w-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold font-display group-hover:text-primary transition-colors">
                Tools
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Browse our curated collection of free educational tools for students and educators.
            </p>
          </Link>

          <Link
            href="/pdfs"
            className="glass-card-static p-6 rounded-2xl hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-fast group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400/20 to-purple-400/10 ring-1 ring-violet-400/20"
                aria-hidden="true"
              >
                <BookOpen className="h-5 w-5 text-violet-500" />
              </div>
              <h3 className="text-lg font-bold font-display group-hover:text-primary transition-colors">
                PDFs
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Access free study materials, books, and notes in PDF format. Download and learn.
            </p>
          </Link>

          <Link
            href="/updates"
            className="glass-card-static p-6 rounded-2xl hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-fast group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400/20 to-blue-400/10 ring-1 ring-sky-400/20"
                aria-hidden="true"
              >
                <Bell className="h-5 w-5 text-sky-500" />
              </div>
              <h3 className="text-lg font-bold font-display group-hover:text-primary transition-colors">
                Updates
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Stay informed with the latest exam alerts, resource launches, and platform news.
            </p>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            About
          </Link>
          <span className="text-border" aria-hidden="true">
            •
          </span>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            Contact
          </Link>
          <span className="text-border" aria-hidden="true">
            •
          </span>
          <Link
            href="/privacy"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            Privacy
          </Link>
          <span className="text-border" aria-hidden="true">
            •
          </span>
          <Link
            href="/terms"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Terms
          </Link>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EduDock. Hand-picked resources for students.
        </div>
      </div>
    </section>
  );
}
