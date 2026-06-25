"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import type { Components } from "react-markdown";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

/**
 * A self-contained code block with a copy button and language label.
 */
function CodeBlock({
  inline,
  className,
  children,
  ...props
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const [copied, setCopied] = useState(false);

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded-md bg-muted text-[0.85em] font-mono text-primary border border-border/40"
        {...props}
      >
        {children}
      </code>
    );
  }

  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "";
  const text = String(children).replace(/\n$/, "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="group relative my-5 rounded-xl overflow-hidden border border-border/50 bg-[#0d1117]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.03]">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          {lang || "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" aria-hidden="true" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" aria-hidden="true" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

/**
 * Detects a YouTube URL and returns the video id, otherwise null.
 */
function youtubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

const components: Components = {
  // Headings — add anchor-friendly styling and scroll margin for sticky header.
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground scroll-mt-24">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-bold mt-8 mb-3 text-foreground scroll-mt-24 border-b border-border/40 pb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold mt-6 mb-2 text-foreground scroll-mt-24">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-lg font-semibold mt-5 mb-2 text-foreground scroll-mt-24">
      {children}
    </h4>
  ),

  // Paragraphs
  p: ({ children }) => (
    <p className="my-4 leading-7 text-foreground/90">{children}</p>
  ),

  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-primary font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
    >
      {children}
    </a>
  ),

  // Lists
  ul: ({ children }) => (
    <ul className="my-4 ml-6 list-disc space-y-1.5 text-foreground/90 marker:text-primary/60">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 ml-6 list-decimal space-y-1.5 text-foreground/90 marker:text-primary/60 marker:font-semibold">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,

  // Blockquotes — styled as callouts
  blockquote: ({ children }) => (
    <blockquote className="my-5 border-l-4 border-primary/60 bg-primary/5 rounded-r-lg py-3 pl-4 pr-3 text-foreground/80 italic">
      {children}
    </blockquote>
  ),

  // Code — inline + block with copy button
  code: CodeBlock,

  // Tables
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-border/50">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-muted/60">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left font-semibold text-foreground border-b border-border/50">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-foreground/80 border-b border-border/30">
      {children}
    </td>
  ),

  // Horizontal rule
  hr: () => <hr className="my-8 border-border/50" />,

  // Images — responsive, lazy, with optional YouTube embed detection
  img: ({ src, alt }) => {
    const url = String(src ?? "");
    const yt = youtubeId(url);
    if (yt) {
      return (
        <div className="my-6 aspect-video rounded-xl overflow-hidden border border-border/50">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${yt}`}
            title={alt || "YouTube video"}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt || ""}
        loading="lazy"
        className="my-6 rounded-xl max-w-full h-auto border border-border/40 shadow-sm"
      />
    );
  },
};

export default function MarkdownRendererInner({
  content,
}: {
  content: string;
}) {
  return (
    <div className="prose-edudock max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
