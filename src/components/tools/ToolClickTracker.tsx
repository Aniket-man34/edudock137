"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function ToolClickTracker({
  toolId,
  clicks,
}: {
  toolId: string;
  clicks: number;
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    (supabase as any)
      .from("tools")
      .update({ clicks: (clicks || 0) + 1 })
      .eq("id", toolId)
      .then(({ error }: any) => {
        if (error) console.error("Error updating tool clicks:", error);
      });
  }, [toolId, clicks]);

  return null;
}
