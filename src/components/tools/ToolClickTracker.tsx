"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function ToolClickTracker({
  toolId,
}: {
  toolId: string;
  /** @deprecated retained for API compatibility */
  clicks?: number;
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    (supabase as any)
      .rpc("increment_tool_clicks", { p_id: toolId })
      .then(({ error }: any) => {
        if (error && process.env.NODE_ENV !== "production") {
          console.error("Error incrementing tool clicks:", error);
        }
      });
  }, [toolId]);

  return null;
}
