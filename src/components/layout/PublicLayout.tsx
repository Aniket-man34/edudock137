import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Wrench, BookOpen, Bell, Search, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Tools', path: '/tools', icon: Wrench },
  { label: 'PDFs', path: '/pdfs', icon: BookOpen },
  { label: 'Updates', path: '/updates', icon: Bell },
];

export default function PublicLayout() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background relative">
      {/* Desktop Navbar */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 glass-navbar h-[60px] items-center px-8 gap-8">
        <Link to="/" className="font-display text-xl font-bold gradient-text shrink-0 tracking-tight">
          EduDock
        </Link>

        <div className="flex-1 max-w-sm mx-auto">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/40 border-transparent h-9 text-sm rounded-xl focus:bg-card focus:border-primary/30 transition-all"
            />
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
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
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
          <Link to="/admin" className="btn-icon">
            <Shield className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 glass-navbar h-14 flex items-center px-4 gap-2.5">
        <Link to="/" className="font-display text-lg font-bold gradient-text shrink-0">
          EduDock
        </Link>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-muted/40 border-transparent h-8 text-xs rounded-lg focus:bg-card focus:border-primary/30"
            />
          </div>
        </div>
        <ThemeToggle className="p-1.5" />
        <Link to="/admin" className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <Shield className="h-4 w-4" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="pt-[60px] md:pt-[60px] pb-20 md:pb-10">
        <Outlet context={{ searchQuery }} />
      </main>

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
