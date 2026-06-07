import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { createServerClient } from "@/integrations/supabase/server";
import { buildPageMetadata, fetchSiteSeo } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createServerClient();
  const seo = await fetchSiteSeo(supabase, "terms");
  return buildPageMetadata({ pageKey: "terms", seo });
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back to Home</span>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold font-display">Terms of Service</h1>
      </div>
      <p className="text-muted-foreground italic mb-10">
        Last Updated: April 5, 2026
      </p>

      <div className="space-y-8">
        <section className="glass-card-static p-6 rounded-2xl">
          <h2 className="text-xl font-bold font-display mb-3">
            1. Acceptance of Terms
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using the EduDock platform (edudock.in), you agree
            to be bound by these Terms of Service. If you do not agree to these
            terms, please do not use our services. Your continued use of the
            platform constitutes acceptance of any modifications to these terms.
          </p>
        </section>

        <section className="glass-card-static p-6 rounded-2xl">
          <h2 className="text-xl font-bold font-display mb-3">
            2. User Responsibilities
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            As a user of EduDock, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Use the platform only for lawful educational purposes</li>
            <li>
              Not engage in any malicious activities or attempt unauthorized
              access
            </li>
            <li>
              Not misuse the services provided or distribute harmful content
            </li>
            <li>Respect the intellectual property rights of others</li>
            <li>Provide accurate information when required</li>
          </ul>
        </section>

        <section className="glass-card-static p-6 rounded-2xl">
          <h2 className="text-xl font-bold font-display mb-3">
            3. Acceptable Use
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to restrict, suspend, or terminate access to
            any user found violating these terms or engaging in disruptive
            behavior. This includes, but is not limited to, spamming, hacking,
            distributing malware, or any activity that could damage the platform
            or other users&rsquo; experience.
          </p>
        </section>

        <section className="glass-card-static p-6 rounded-2xl">
          <h2 className="text-xl font-bold font-display mb-3">
            4. Intellectual Property
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            All content on EduDock, including text, graphics, logos, and
            software, is the property of EduDock or its content suppliers and is
            protected by intellectual property laws.
          </p>
        </section>

        <section className="glass-card-static p-6 rounded-2xl">
          <h2 className="text-xl font-bold font-display mb-3">5. Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed">
            The materials on EduDock are provided &ldquo;as is&rdquo; without
            warranties of any kind, either express or implied. We make no
            warranties regarding the accuracy, reliability, or completeness of
            content uploaded by third parties.
          </p>
        </section>

        <section className="glass-card-static p-6 rounded-2xl">
          <h2 className="text-xl font-bold font-display mb-3">
            6. Limitation of Liability
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            EduDock shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising from your use of the
            platform.
          </p>
        </section>

        <section className="glass-card-static p-6 rounded-2xl">
          <h2 className="text-xl font-bold font-display mb-3">
            7. Changes to Terms
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these terms at any time. Changes will
            be effective immediately upon posting on this page.
          </p>
        </section>

        <section className="glass-card-static p-6 rounded-2xl">
          <h2 className="text-xl font-bold font-display mb-3">8. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about these Terms of Service, please contact
            us at:{" "}
            <strong className="text-foreground">support@edudock.in</strong>
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-border text-center">
        <p className="text-muted-foreground text-sm">
          Also see our{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
