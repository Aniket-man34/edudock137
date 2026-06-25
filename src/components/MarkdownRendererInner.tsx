"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import type { Components } from "react-markdown";
import { Check, Copy } from "lucide-react";
import remarkAutolink from "@/lib/remarkAutolink";

/**
 * Inline code — rendered as a compact <code> chip.
 *
 * In react-markdown v9+ the `inline` prop was removed. We now distinguish
 * inline vs block code by overriding `pre` (which only wraps block code)
 * separately. Any `<code>` that reaches this renderer is therefore inline.
 */
function InlineCode({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className="px-1.5 py-0.5 rounded-md bg-muted text-[0.85em] font-mono text-primary border border-border/40"
      {...props}
    >
      {children}
    </code>
  );
}

/**
 * A fenced code block with a copy button and language label.
 *
 * react-markdown wraps every fenced (block) code span in a
 * `<pre><code class="language-xxx">…</code></pre>`. By overriding `pre` we
 * render the styled block here. The inner `<code>` is rendered as a *plain*
 * element (NOT via the `code` component override, which is for inline chips)
 * so block code keeps its monospace look without inline-chip styling.
 */
function CodeBlock({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  // Extract the raw text + language from the nested <code> child.
  let lang = "";
  let text = "";
  let codeClassName: string | undefined;

  const childArray = React.Children.toArray(children);
  const codeEl = childArray.find(
    (c): c is React.ReactElement<{ className?: string; children?: React.ReactNode }> =>
      React.isValidElement(c) && (c.type === "code" || c.props?.className),
  );

  if (codeEl && codeEl.props) {
    codeClassName = codeEl.props.className;
    const match = /language-(\w+)/.exec(codeClassName || "");
    lang = match ? match[1] : "";
    text = extractText(codeEl.props.children);
  } else {
    text = extractText(children);
  }
  text = text.replace(/\n$/, "");

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
        {/* Render the inner code as a plain element so it does NOT pick up the
            inline-chip styling from the `code` component override. */}
        <code className={codeClassName}>{text}</code>
      </pre>
    </div>
  );
}

/** Recursively pull plain text out of React children (handles nested nodes). */
function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    return extractText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
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
  // Headings — keep anchor-friendly styling AND forward the `id` that
  // rehype-slug attaches (so TOC anchor links resolve to the right element).
  h1: ({ node, children, ...props }) => (
    <h1
      className="text-3xl font-bold mt-8 mb-4 text-foreground scroll-mt-24"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ node, children, ...props }) => (
    <h2
      className="text-2xl font-bold mt-8 mb-3 text-foreground scroll-mt-24 border-b border-border/40 pb-2"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ node, children, ...props }) => (
    <h3
      className="text-xl font-semibold mt-6 mb-2 text-foreground scroll-mt-24"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ node, children, ...props }) => (
    <h4
      className="text-lg font-semibold mt-5 mb-2 text-foreground scroll-mt-24"
      {...props}
    >
      {children}
    </h4>
  ),

  // Paragraphs
  p: ({ node, children }) => (
    <p className="my-4 leading-7 text-foreground/90">{children}</p>
  ),

  // Links
  a: ({ node, href, children, ...props }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-primary font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
      {...props}
    >
      {children}
    </a>
  ),

  // Lists
  ul: ({ node, children }) => (
    <ul className="my-4 ml-6 list-disc space-y-1.5 text-foreground/90 marker:text-primary/60">
      {children}
    </ul>
  ),
  ol: ({ node, children }) => (
    <ol className="my-4 ml-6 list-decimal space-y-1.5 text-foreground/90 marker:text-primary/60 marker:font-semibold">
      {children}
    </ol>
  ),
  li: ({ node, children }) => <li className="pl-1 leading-7">{children}</li>,

  // Blockquotes — styled as callouts
  blockquote: ({ node, children }) => (
    <blockquote className="my-5 border-l-4 border-primary/60 bg-primary/5 rounded-r-lg py-3 pl-4 pr-3 text-foreground/80 italic">
      {children}
    </blockquote>
  ),

  // Code — inline chips render via `code`; fenced blocks render via `pre`.
  // This split is what makes inline code (e.g. a bare domain) render as text
  // instead of a full "CODE" block.
  code: InlineCode,
  pre: CodeBlock,

  // Tables
  table: ({ node, children }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-border/50">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ node, children }) => (
    <thead className="bg-muted/60">{children}</thead>
  ),
  th: ({ node, children }) => (
    <th className="px-4 py-2.5 text-left font-semibold text-foreground border-b border-border/50">
      {children}
    </th>
  ),
  td: ({ node, children }) => (
    <td className="px-4 py-2.5 text-foreground/80 border-b border-border/30">
      {children}
    </td>
  ),

  // Horizontal rule
  hr: ({ node }) => <hr className="my-8 border-border/50" />,

  // Images — responsive, lazy, with optional YouTube embed detection
  img: ({ node, src, alt }) => {
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
        remarkPlugins={[remarkGfm, remarkAutolink]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
