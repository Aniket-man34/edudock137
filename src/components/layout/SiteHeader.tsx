"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench, BookOpen, Bell, Search, X, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import BookmarksNavLink from "@/components/BookmarksNavLink";
import { useSiteSearch } from "./SearchProvider";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Tools", path: "/tools", icon: Wrench },
  { label: "PDFs", path: "/pdfs", icon: BookOpen },
  { label: "Updates", path: "/updates", icon: Bell },
];

function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  const glyph = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const text = size === "sm" ? "text-lg" : "text-xl";
  const icon = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`relative inline-flex items-center justify-center ${glyph} rounded-xl gradient-brand text-white shadow-[0_4px_14px_-3px_hsl(var(--brand-1)/0.6)] ring-1 ring-white/20`}
        aria-hidden="true"
      >
        <GraduationCap className={icon} strokeWidth={2.4} />
      </span>
      <span
        className={`font-display ${text} font-bold gradient-text-animated tracking-tight`}
      >
        EduDock
      </span>
    </span>
  );
}

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const { searchQuery, setSearchQuery } = useSiteSearch();

  const isActiveRoute = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  const isHome = pathname === "/";

  return (
    <>
      {/* Desktop Navbar */}
      <header
        role="banner"
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 glass-navbar h-[68px] items-center px-8 gap-8"
      >
        <Link
          href="/"
          className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
          aria-label="EduDock home"
        >
          <BrandMark />
        </Link>

        {!isHome && (
          <div className="flex-1 max-w-sm mx-auto">
            <label htmlFor="site-search-desktop" className="sr-only">
              Search EduDock
            </label>
            <div className="relative flex items-center w-full group">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none" />
              <Input
                id="site-search-desktop"
                type="search"
                placeholder="Search tools, PDFs, updates…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search EduDock"
                className="w-full h-10 pl-9 pr-9 bg-muted/40 border-transparent text-sm rounded-xl focus:bg-card focus:border-primary/30 transition-all"
              />
              <div className="absolute right-2 flex items-center justify-center">
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setSearchQuery("")}
                      className="flex items-center justify-center h-7 w-7 text-muted-foreground hover:text-foreground rounded-full hover:bg-foreground/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
        {isHome && <div className="flex-1" aria-hidden="true" />}

        <nav aria-label="Primary" className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 ring-1 ring-primary/20"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <BookmarksNavLink />
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header
        role="banner"
        className="md:hidden fixed top-0 left-0 right-0 z-50 glass-navbar h-14 flex items-center px-4 gap-2.5"
      >
        <Link
          href="/"
          className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
          aria-label="EduDock home"
        >
          <BrandMark size="sm" />
        </Link>
        {!isHome ? (
          <div className="flex-1">
            <label htmlFor="site-search-mobile" className="sr-only">
              Search EduDock
            </label>
            <div className="relative flex items-center w-full">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="site-search-mobile"
                type="search"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search EduDock"
                className="w-full h-9 pl-8 pr-8 bg-muted/40 border-transparent text-xs rounded-lg focus:bg-card focus:border-primary/30 transition-all"
              />
              <div className="absolute right-1.5 flex items-center justify-center">
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setSearchQuery("")}
                      className="flex items-center justify-center h-7 w-7 text-muted-foreground hover:text-foreground rounded-full hover:bg-foreground/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Clear search"
                    >
                      <X className="h-3 w-3" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1" aria-hidden="true" />
        )}
        <ThemeToggle className="p-1.5" />
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Primary mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-navbar border-t border-b-0 rounded-none safe-bottom"
      >
        <div className="flex items-center justify-around h-[64px] px-2">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={isActive ? "page" : undefined}
                className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-1.5 px-3 rounded-2xl relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/10 ring-1 ring-primary/20"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon
                  aria-hidden="true"
                  className={`h-5 w-5 relative z-10 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-[11px] font-semibold relative z-10 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
