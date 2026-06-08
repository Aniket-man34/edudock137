import type { Metadata } from "next";
import { Wrench, BookOpen, AlertTriangle } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import SuggestionForm from "@/components/SuggestionForm";

export const runtime = "edge";

export const metadata: Metadata = buildPageMetadata({ pageKey: "submit" });
export const revalidate = 3600;

export default function SubmitPage({
  searchParams,
}: {
  searchParams: { kind?: string };
}) {
  const kindParam = searchParams?.kind;
  const defaultKind: "tool" | "pdf" | "issue" =
    kindParam === "tool" || kindParam === "pdf" || kindParam === "issue"
      ? kindParam
      : "tool";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Breadcrumbs items={[{ label: "Submit" }]} />

      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight mb-4 leading-tight">
          Submit to <span className="gradient-text">EduDock</span>
        </h1>
        <p className="text-lg text-foreground/80 leading-relaxed max-w-2xl">
          Help us keep the directory fresh. Suggest a study tool, contribute a
          PDF, or report a broken link — we read every submission.
        </p>
      </header>

      <section
        aria-labelledby="submission-types"
        className="grid sm:grid-cols-3 gap-3 mb-8 text-sm"
      >
        <h2 id="submission-types" className="sr-only">
          What you can submit
        </h2>
        <div className="glass-card-static p-4 rounded-xl">
          <Wrench
            className="h-5 w-5 text-emerald-500 mb-2"
            aria-hidden="true"
          />
          <p className="font-semibold mb-0.5">Suggest a tool</p>
          <p className="text-xs text-muted-foreground">
            Calculators, sims, references — anything that helps studying.
          </p>
        </div>
        <div className="glass-card-static p-4 rounded-xl">
          <BookOpen
            className="h-5 w-5 text-violet-500 mb-2"
            aria-hidden="true"
          />
          <p className="font-semibold mb-0.5">Contribute a PDF</p>
          <p className="text-xs text-muted-foreground">
            Notes, worksheets, books you have rights to share.
          </p>
        </div>
        <div className="glass-card-static p-4 rounded-xl">
          <AlertTriangle
            className="h-5 w-5 text-amber-500 mb-2"
            aria-hidden="true"
          />
          <p className="font-semibold mb-0.5">Report an issue</p>
          <p className="text-xs text-muted-foreground">
            Broken link, wrong info, accessibility problem.
          </p>
        </div>
      </section>

      <SuggestionForm defaultKind={defaultKind} source="submit" allowKindToggle />

      <p className="mt-8 text-xs text-muted-foreground">
        By submitting, you confirm you have the rights to share any uploaded
        material. We never publish your email address.
      </p>
    </div>
  );
}
