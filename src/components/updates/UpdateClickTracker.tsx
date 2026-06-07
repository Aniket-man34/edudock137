"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function UpdateClickTracker({
  updateId,
  clicks,
}: {
  updateId: string;
  clicks: number;
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    (supabase as any)
      .from("updates")
      .update({ clicks: (clicks || 0) + 1 })
      .eq("id", updateId)
      .then(({ error }: any) => {
        if (error) console.error("Error updating click count:", error);
      });
  }, [updateId, clicks]);

  return null;
}
