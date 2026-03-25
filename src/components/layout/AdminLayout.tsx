import { useEffect, useState, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, Settings, Home, Menu, X, LogOut, 
  ChevronLeft, ChevronRight, ChevronDown, Search, 
  FileText, Bell, BarChart, Layers, Wrench, FolderOpen,
  Pencil, Trash2
} from 'lucide-react';

const managementLinks = [
  { name: 'Categories', icon: Layers, tab: 'categories' },
  { name: 'Tools', icon: Wrench, tab: 'tools' },
  { name: 'PDF Categories', icon: FolderOpen, tab: 'pdf-categories' },
  { name: 'PDFs', icon: FileText, tab: 'pdfs' },
  { name: 'Updates', icon: Bell, tab: 'updates' },
  { name: 'Analytics', icon: BarChart, tab: 'analytics' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  
  // Auth & Mobile States
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Desktop Sidebar States
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(true);

  // Search & Action States
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<{id: string, type: 'pdfs' | 'updates', name: string} | null>(null);

  // --- AUTH CHECK ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/admin');
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/admin');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // --- GLOBAL SEARCH QUERIES ---
  const { data: pdfs } = useQuery({
    queryKey: ['admin-global-pdfs'],
    queryFn: async () => {
      const { data } = await supabase.from('pdfs').select('id, name, cover_image_url');
      return data || [];
    }
  });

  const { data: updates } = useQuery({
    queryKey: ['admin-global-updates'],
    queryFn: async () => {
      const { data } = await supabase.from('updates').select('id, headline, image_url');
      return data || [];
    }
  });

  // --- DELETE MUTATION ---
  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string, type: 'pdfs' | 'updates' }) => {
      const { error } = await supabase.from(type).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pdfs'] });
      qc.invalidateQueries({ queryKey: ['updates'] });
      qc.invalidateQueries({ queryKey: ['admin-global-pdfs'] });
      qc.invalidateQueries({ queryKey: ['admin-global-updates'] });
      toast.success('Deleted successfully');
      setDeleteTarget(null);
    },
    onError: (e: any) => toast.error(e.message)
  });

  const pdfResults = search ? pdfs?.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 4) : [];
  const updateResults = search ? updates?.filter(u => u.headline.toLowerCase().includes(search.toLowerCase())).slice(0, 4) : [];
  const hasResults = (pdfResults?.length || 0) > 0 || (updateResults?.length || 0) > 0;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const handleEditClick = (type: string, id: string) => {
    setShowDropdown(false);
    setSearch('');
    navigate(`/admin/management?tab=${type}&edit=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      
      {/* ================= DESKTOP SIDEBAR ================= */}
      <motion.aside 
        animate={{ width: isCollapsed ? 80 : 260 }}
        className="hidden md:flex flex-col h-full glass-card rounded-none border-r border-border/50 z-50 shrink-0 transition-all duration-300"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/50 shrink-0">
          {!isCollapsed && <span className="font-bold text-xl gradient-text truncate">EduDock Admin</span>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-lg hover:bg-muted transition mx-auto">
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 space-y-2">
          <Link to="/admin/dashboard" className={`flex items-center gap-3 p-3 rounded-xl transition ${location.pathname.includes('dashboard') ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
            <LayoutDashboard size={20} className="shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>

          <div>
            <button onClick={() => { if (isCollapsed) setIsCollapsed(false); setIsManagementOpen(!isManagementOpen); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition ${location.pathname.includes('management') ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              <div className="flex items-center gap-3">
                <Settings size={20} className="shrink-0" />
                {!isCollapsed && <span>Management</span>}
              </div>
              {!isCollapsed && <ChevronDown size={16} className={`transition-transform duration-200 ${isManagementOpen ? 'rotate-180' : ''}`} />}
            </button>

            <AnimatePresence>
              {isManagementOpen && !isCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pl-11 pr-2 py-2 space-y-1">
                    {managementLinks.map((link) => (
                      <Link key={link.name} to={`/admin/management?tab=${link.tab}`} className={`flex items-center gap-3 p-2.5 rounded-lg text-sm transition ${location.search.includes(link.tab) ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                        <link.icon size={16} /> {link.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="p-4 border-t border-border/50 space-y-2">
          <Link to="/" className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted text-muted-foreground transition">
            <Home size={20} className="shrink-0" /> {!isCollapsed && <span>Back to Site</span>}
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-destructive/10 text-destructive transition">
            <LogOut size={20} className="shrink-0" /> {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* ================= MOBILE HEADER & SIDEBAR ================= */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 glass-navbar h-14 flex items-center px-4 justify-between">
        <h1 className="font-display text-lg font-bold gradient-text">Admin</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-foreground">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
          <aside className="w-64 h-full glass-card rounded-none overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="pt-16 p-4 space-y-1">
              <Link to="/admin/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted">
                <LayoutDashboard className="h-5 w-5" /> Dashboard
              </Link>
              <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mt-4">Management</div>
              {managementLinks.map((link) => (
                <Link key={link.name} to={`/admin/management?tab=${link.tab}`} onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted">
                  <link.icon className="h-5 w-5" /> {link.name}
                </Link>
              ))}
              <div className="border-t border-border/50 mt-4 pt-4">
                <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"><Home className="h-5 w-5" /> Back to Site</Link>
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full"><LogOut className="h-5 w-5" /> Logout</button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pt-14 md:pt-0">
        
        {/* DESKTOP TOP HEADER (Search) */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 border-b border-border/50 glass-card rounded-none z-40 shrink-0">
          <h2 className="font-semibold text-lg">{location.pathname.includes('management') ? 'Content Management' : 'Dashboard'}</h2>

          <div className="relative w-[450px] ml-auto" ref={dropdownRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <input
              type="text"
              placeholder="Search PDFs & Updates to edit or delete..."
              value={search}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
              className="w-full h-10 pl-10 pr-4 bg-muted/50 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />

            {/* SEARCH DROPDOWN WITH ACTIONS */}
            <AnimatePresence>
              {showDropdown && search && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 right-0 w-full glass-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                >
                  {!hasResults ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">No matches found</div>
                  ) : (
                    <div className="max-h-[450px] overflow-y-auto p-2 scrollbar-hide space-y-4">
                      {/* PDFS */}
                      {pdfResults && pdfResults.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-3 mb-2 mt-1">PDFs</p>
                          {pdfResults.map(pdf => (
                            <div key={pdf.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-xl group transition-all">
                              <img src={pdf.cover_image_url || '/pdf-placeholder.png'} className="w-10 h-12 rounded-lg object-cover bg-black/20 shrink-0" alt="" />
                              <span className="text-sm font-medium truncate flex-1">{pdf.name}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditClick('pdfs', pdf.id)} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Pencil size={14} /></button>
                                <button onClick={() => setDeleteTarget({ id: pdf.id, type: 'pdfs', name: pdf.name })} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* UPDATES */}
                      {updateResults && updateResults.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-3 mb-2">Updates</p>
                          {updateResults.map(u => (
                            <div key={u.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-xl group transition-all">
                              <img src={u.image_url || '/image-placeholder.png'} className="w-12 h-9 rounded-lg object-cover bg-black/20 shrink-0" alt="" />
                              <span className="text-sm font-medium truncate flex-1">{u.headline}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditClick('updates', u.id)} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Pencil size={14} /></button>
                                <button onClick={() => setDeleteTarget({ id: u.id, type: 'updates', name: u.headline })} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* OUTLET / PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>

      </main>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card p-6 rounded-2xl border border-border/50 max-w-sm w-full text-center shadow-2xl">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="h-8 w-8 text-destructive" /></div>
              <h3 className="text-xl font-bold mb-2">Confirm Delete</h3>
              <p className="text-muted-foreground text-sm mb-6">Are you sure you want to delete <span className="text-foreground font-semibold">"{deleteTarget.name}"</span>? This action is permanent.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={() => deleteMutation.mutate({ id: deleteTarget.id, type: deleteTarget.type })} disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}