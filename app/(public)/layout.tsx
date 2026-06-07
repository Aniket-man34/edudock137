import type { ReactNode } from "react";
import { SearchProvider } from "@/components/layout/SearchProvider";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import AnalyticsTracker from "@/components/layout/AnalyticsTracker";

export default function PublicGroupLayout({ children }: { children: ReactNode }) {
  return (
    <SearchProvider>
      <div className="min-h-screen bg-background relative">
        <SiteHeader />
        <AnalyticsTracker />
        <main className="pt-[64px] md:pt-[64px] pb-20 md:pb-0">{children}</main>
        <SiteFooter />
      </div>
    </SearchProvider>
  );
}
