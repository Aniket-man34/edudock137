"use client";

import { useState } from "react";
import { Loader2, Send, Wrench, BookOpen, AlertTriangle, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Kind = "tool" | "pdf" | "issue" | "contact";

const KIND_OPTIONS: Array<{ key: Kind; label: string; icon: any; help: string }> = [
  { key: "tool", label: "Suggest a tool", icon: Wrench, help: "URL or name of the tool you'd like us to add." },
  { key: "pdf", label: "Contribute a PDF", icon: BookOpen, help: "Drop a link to the PDF or describe the materials." },
  { key: "issue", label: "Report an issue", icon: AlertTriangle, help: "Tell us what's broken and where you saw it." },
  { key: "contact", label: "Just say hi", icon: MessageSquare, help: "Anything else on your mind." },
];

interface SuggestionFormProps {
  defaultKind: Kind;
  source: string;
  allowKindToggle?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SuggestionForm({
  defaultKind,
  source,
  allowKindToggle = false,
}: SuggestionFormProps) {
  const [kind, setKind] = useState<Kind>(defaultKind);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const showUrlField = kind === "tool" || kind === "pdf" || kind === "issue";
  const help = KIND_OPTIONS.find((o) => o.key === kind)?.help ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const cleanedMsg = message.trim();
    if (cleanedMsg.length < 8) {
      toast.error("Tell us a little more — at least 8 characters.");
      return;
    }
    if (cleanedMsg.length > 4000) {
      toast.error("Message is too long.");
      return;
    }
    if (email && !EMAIL_RE.test(email.trim())) {
      toast.error("That email doesn't look right.");
      return;
    }
    if (showUrlField && url) {
      try {
        new URL(url);
      } catch {
        toast.error("URL must be a valid http(s) link.");
        return;
      }
    }

    setSubmitting(true);
    const { error } = await (supabase as any).rpc("submit_suggestion", {
      p_kind: kind,
      p_message: `[${source}] ${cleanedMsg}`,
      p_name: name.trim() || null,
      p_email: email.trim() || null,
      p_subject: subject.trim() || null,
      p_url: url.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Something went wrong — please try again or email us.");
      return;
    }

    setDone(true);
    setMessage("");
    setSubject("");
    setUrl("");
    toast.success("Thanks — we'll be in touch.");
  }

  if (done) {
    return (
      <div className="glass-card-static rounded-3xl p-8 text-center">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-success/15 ring-1 ring-success/30 mb-4"
          aria-hidden="true"
        >
          <Send className="h-5 w-5 text-success" />
        </div>
        <h2 className="text-xl font-bold font-display tracking-tight mb-2">
          Got it — thank you
        </h2>
        <p className="text-muted-foreground mb-6">
          We read every submission. If you left an email we&rsquo;ll reply when
          we&rsquo;ve had a look.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
          }}
          className="btn-secondary"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="glass-card-static rounded-3xl p-6 md:p-8 space-y-5"
    >
      {allowKindToggle && (
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-[0.18em] text-foreground mb-3">
            What are you sending?
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {KIND_OPTIONS.filter((o) => o.key !== "contact").map(
              ({ key, label, icon: Icon }) => {
                const isActive = kind === key;
                return (
                  <button
                    type="button"
                    key={key}
                    aria-pressed={isActive}
                    onClick={() => setKind(key)}
                    className={`group flex flex-col items-center justify-center text-center gap-1.5 px-3 py-3 rounded-xl border transition-[border-color,background-color] duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      isActive
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-background hover:border-primary/30"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span className="text-xs font-medium leading-tight">
                      {label}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </fieldset>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="suggest-name"
            className="block text-xs font-semibold mb-1.5"
          >
            Your name <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            id="suggest-name"
            type="text"
            autoComplete="name"
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-[box-shadow,border-color] duration-fast ease-out focus-visible:outline-none focus-visible:border-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.18)]"
          />
        </div>
        <div>
          <label
            htmlFor="suggest-email"
            className="block text-xs font-semibold mb-1.5"
          >
            Email <span className="text-muted-foreground font-normal">(if you want a reply)</span>
          </label>
          <input
            id="suggest-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={200}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-[box-shadow,border-color] duration-fast ease-out focus-visible:outline-none focus-visible:border-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.18)]"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="suggest-subject"
          className="block text-xs font-semibold mb-1.5"
        >
          Subject <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          id="suggest-subject"
          type="text"
          maxLength={200}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-[box-shadow,border-color] duration-fast ease-out focus-visible:outline-none focus-visible:border-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.18)]"
        />
      </div>

      {showUrlField && (
        <div>
          <label
            htmlFor="suggest-url"
            className="block text-xs font-semibold mb-1.5"
          >
            Link <span className="text-muted-foreground font-normal">(URL)</span>
          </label>
          <input
            id="suggest-url"
            type="url"
            inputMode="url"
            placeholder="https://"
            maxLength={600}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-[box-shadow,border-color] duration-fast ease-out focus-visible:outline-none focus-visible:border-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.18)]"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="suggest-message"
          className="block text-xs font-semibold mb-1.5"
        >
          Message
        </label>
        <textarea
          id="suggest-message"
          required
          minLength={8}
          maxLength={4000}
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-describedby="suggest-message-help"
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-[box-shadow,border-color] duration-fast ease-out focus-visible:outline-none focus-visible:border-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.18)] min-h-[140px]"
        />
        <p
          id="suggest-message-help"
          className="text-xs text-muted-foreground mt-1.5"
        >
          {help} {message.length}/4000
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
          {submitting ? "Sending" : "Send"}
        </button>
        <p className="text-xs text-muted-foreground">
          We don&rsquo;t share your details. Ever.
        </p>
      </div>
    </form>
  );
}
