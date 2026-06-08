import type { ReactNode } from "react";
import { SearchProvider } from "@/components/layout/SearchProvider";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import AnalyticsTracker from "@/components/layout/AnalyticsTracker";

export default function PublicGroupLayout({ children }: { children: ReactNode }) {
  return (
    <SearchProvider>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="min-h-screen bg-background relative">
        <SiteHeader />
        <AnalyticsTracker />
        <main
          id="main-content"
          tabIndex={-1}
          className="pt-14 md:pt-[64px] pb-24 md:pb-0 focus:outline-none"
        >
          {children}
        </main>
        <SiteFooter />
      </div>
    </SearchProvider>
  );
}
