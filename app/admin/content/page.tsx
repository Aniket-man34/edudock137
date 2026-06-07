"use client";

import dynamic from "next/dynamic";

const ContentManager = dynamic(
  () => import("@/components/admin/ContentManager"),
  { ssr: false }
);

export default function AdminContentPage() {
  return <ContentManager />;
}
