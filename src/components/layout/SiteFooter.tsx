import Link from "next/link";
import { Mail, Github, Twitter } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80 backdrop-blur-sm pb-24 md:pb-0">
      <div className="container mx-auto px-4 md:px-8 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2 space-y-3">
            <Link
              href="/"
              className="font-display text-xl font-bold gradient-text inline-block tracking-tight"
            >
              EduDock
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Curated tools, free PDFs, and timely updates for students and
              educators. One clean home for the things you actually use.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="mailto:hello@edudock.in"
                aria-label="Email EduDock"
                className="btn-icon"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/edudock"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="EduDock on X (Twitter)"
                className="btn-icon"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/edudock"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="EduDock on GitHub"
                className="btn-icon"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          <nav aria-label="Browse" className="flex flex-col gap-2 text-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-1">
              Browse
            </p>
            <Link
              href="/tools"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Tools
            </Link>
            <Link
              href="/pdfs"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              PDFs
            </Link>
            <Link
              href="/updates"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Updates
            </Link>
          </nav>

          <nav aria-label="Site" className="flex flex-col gap-2 text-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-1">
              Site
            </p>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/submit"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Submit
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} EduDock. All rights reserved.</p>
          <p>Made for learners, with care.</p>
        </div>
      </div>
    </footer>
  );
}
