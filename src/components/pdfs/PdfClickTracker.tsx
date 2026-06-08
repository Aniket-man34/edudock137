"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function PdfClickTracker({
  pdfId,
}: {
  pdfId: string;
  /** @deprecated retained for API compatibility */
  clicks?: number;
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    (supabase as any)
      .rpc("increment_pdf_clicks", { p_id: pdfId })
      .then(({ error }: any) => {
        if (error && process.env.NODE_ENV !== "production") {
          console.error("Error incrementing PDF clicks:", error);
        }
      });
  }, [pdfId]);

  return null;
}
