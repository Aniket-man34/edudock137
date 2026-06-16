"use client";

import { useState } from "react";
import { Mail, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterFormProps {
  source?: string;
  audience?: string | null;
  variant?: "card" | "inline";
  title?: string;
  subtitle?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterForm({
  source = "home",
  audience = null,
  variant = "card",
  title = "Get the Friday digest",
  subtitle = "One email a week with the best new PDFs, tools, and exam updates. No spam, unsubscribe anytime.",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    const cleaned = email.trim().toLowerCase();
    if (!EMAIL_RE.test(cleaned)) {
      toast.error("Enter a valid email address");
      return;
    }
    setState("loading");
    const { error } = await (supabase as any).rpc("subscribe_newsletter", {
      p_email: cleaned,
      p_source: source,
      p_audience: audience,
    });
    if (error) {
      setState("idle");
      toast.error("Couldn't subscribe — please try again");
      return;
    }
    setState("success");
    setEmail("");
    toast.success("You're in. Watch for our next digest.");
    // Re-enable the form after the confirmation so a different email
    // can be subscribed without a full page reload.
    setTimeout(() => setState("idle"), 4000);
  }

  const wrapper =
    variant === "card"
      ? "glass-card-static gradient-border rounded-3xl p-6 md:p-8 relative overflow-hidden"
      : "rounded-2xl border border-border/60 bg-muted/30 p-5";

  return (
    <section
      aria-labelledby="newsletter-heading"
      className={wrapper}
    >
      {variant === "card" && (
        <div
          className="absolute -top-20 -right-20 w-56 h-56 bg-primary/[0.08] blur-3xl rounded-full pointer-events-none"
          aria-hidden="true"
        />
      )}
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 ring-1 ring-primary/20"
            aria-hidden="true"
          >
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <h2
            id="newsletter-heading"
            className="text-lg md:text-xl font-bold font-display tracking-tight"
          >
            {title}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{subtitle}</p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col sm:flex-row gap-2"
        >
          <label htmlFor={`nl-${source}`} className="sr-only">
            Email address
          </label>
          <input
            id={`nl-${source}`}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state !== "idle"}
            aria-invalid={state === "idle" && email !== "" && !EMAIL_RE.test(email)}
            className="flex-1 h-11 rounded-xl border border-input bg-background px-4 text-sm transition-[box-shadow,border-color] duration-fast ease-out focus-visible:outline-none focus-visible:border-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.18)] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={state !== "idle"}
            className="btn-primary"
          >
            {state === "loading" && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {state === "success" && (
              <Check className="h-4 w-4" aria-hidden="true" />
            )}
            {state === "idle" && "Subscribe"}
            {state === "loading" && "Subscribing"}
            {state === "success" && "Subscribed"}
          </button>
        </form>
      </div>
    </section>
  );
}
