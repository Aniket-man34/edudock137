"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function PdfClickTracker({
  pdfId,
  clicks,
}: {
  pdfId: string;
  clicks: number;
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    (supabase as any)
      .from("pdfs")
      .update({ clicks: (clicks || 0) + 1 })
      .eq("id", pdfId)
      .then(({ error }: any) => {
        if (error) console.error("Error updating PDF clicks:", error);
      });
  }, [pdfId, clicks]);

  return null;
}
