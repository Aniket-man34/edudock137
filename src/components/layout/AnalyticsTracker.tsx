"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (lastTrackedRef.current === pathname) return;
    lastTrackedRef.current = pathname;

    const record = async () => {
      try {
        await (supabase as any).from("page_views").insert([{ path: pathname }]);
      } catch (err) {
        console.error("[Analytics]", err);
      }
    };
    record();
  }, [pathname]);

  return null;
}
