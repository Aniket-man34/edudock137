"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function UpdateClickTracker({
  updateId,
}: {
  updateId: string;
  /** @deprecated retained for API compatibility */
  clicks?: number;
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    (supabase as any)
      .rpc("increment_update_clicks", { p_id: updateId })
      .then(({ error }: any) => {
        if (error && process.env.NODE_ENV !== "production") {
          console.error("Error incrementing update clicks:", error);
        }
      });
  }, [updateId]);

  return null;
}
