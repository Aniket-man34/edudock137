import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Wrench, BookOpen, Bell, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';

const navItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Tools', path: '/tools', icon: Wrench },
  { label: 'PDFs', path: '/pdfs', icon: BookOpen },
  { label: 'Updates', path: '/updates', icon: Bell },
];

export default function PublicLayout() {
  const location = useLocation();
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebouncedSearch(300);

  // --- TRACK UNIQUE VISITOR ONCE PER SESSION ---
  useEffect(() => {
    const trackVisit = async () => {
      if (!sessionStorage.getItem('has_visited')) {
        try {
          console.log('[PageView] Attempting to track visit for:', location.pathname);

          const { data, error, status, statusText } = await supabase
            .from('page_views')
            .insert([{ path: location.pathname }])
            .select();

          if (error) {
            console.error('[PageView] Insert failed:', {
              error,
              status,
              statusText,
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
          } else {
            console.log('[PageView] Successfully tracked visit:', data);
            sessionStorage.setItem('has_visited', 'true');
          }
        } catch (error) {
          console.error('[PageView] Unexpected error:', error);
        }
      }
    };
    trackVisit();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Desktop Navbar */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 glass-navbar h-[60px] items-center px-8 gap-8">
        <Link to="/" className="font-display text-xl font-bold gradient-text shrink-0 tracking-tight">
          EduDock
        </Link>

        <div className="flex-1 max-w-sm mx-auto">
          {/* FLEX WRAPPER: Automatically locks absolute children to the exact vertical center */}
          <div className="relative flex items-center w-full group">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none" />

            <Input
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-9 bg-muted/40 border-transparent text-sm rounded-xl focus:bg-card focus:border-primary/30 transition-all"
            />

            {/* Clear Button Container - Anchored right, centered by Flexbox */}
            <div className="absolute right-2 flex items-center justify-center">
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSearchQuery('')}
                    className="flex items-center justify-center h-5 w-5 text-muted-foreground hover:text-foreground rounded-full hover:bg-foreground/10 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 glass-navbar h-14 flex items-center px-4 gap-2.5">
        <Link to="/" className="font-display text-lg font-bold gradient-text shrink-0">
          EduDock
        </Link>
        <div className="flex-1">
          {/* FLEX WRAPPER FOR MOBILE */}
          <div className="relative flex items-center w-full">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />

            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-8 bg-muted/40 border-transparent text-xs rounded-lg focus:bg-card focus:border-primary/30 transition-all"
            />

            {/* Clear Button Container */}
            <div className="absolute right-1.5 flex items-center justify-center">
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSearchQuery('')}
                    className="flex items-center justify-center h-5 w-5 text-muted-foreground hover:text-foreground rounded-full hover:bg-foreground/10 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <ThemeToggle className="p-1.5" />
      </header>

      {/* Main Content */}
      <main className="pt-[60px] md:pt-[60px] pb-20 md:pb-0">
        <Outlet context={{ searchQuery: debouncedSearch }} />
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-8 py-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} EduDock. All rights reserved.</p>
          <nav className="flex items-center gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </nav>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-navbar border-t border-b-0 rounded-none safe-bottom">
        <div className="flex items-center justify-around h-[60px] px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl transition-all relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 bg-primary/10 rounded-2xl"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon className={`h-5 w-5 relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] font-semibold relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}