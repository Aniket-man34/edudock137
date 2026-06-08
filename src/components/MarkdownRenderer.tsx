"use client";

import dynamic from "next/dynamic";

const Inner = dynamic(() => import("./MarkdownRendererInner"), {
  ssr: true,
  loading: () => (
    <div className="space-y-3" aria-hidden="true">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-2/3" />
    </div>
  ),
});

export default function MarkdownRenderer({ content }: { content: string }) {
  return <Inner content={content} />;
}
