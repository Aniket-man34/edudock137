import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import Home from "@/pages/Home";
import Tools from "@/pages/Tools";
import Pdfs from "@/pages/Pdfs";
import Updates from "@/pages/Updates";
import UpdateDetail from "@/pages/UpdateDetail";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminManagement from "@/pages/admin/AdminManagement";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Tracker component to record visitor data
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const recordVisit = async () => {
      // Ignore admin page visits to keep stats accurate
      if (location.pathname.startsWith('/admin')) return;

      try {
        // 'as any' prevents the TypeScript error while your local types update
        await (supabase.from('page_views' as any) as any).insert([
          { page_path: location.pathname }
        ]);
      } catch (error) {
        console.error("Analytics Error:", error);
      }
    };

    recordVisit();
  }, [location.pathname]);

  return null;
};

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AnalyticsTracker />
          <Routes>
            {/* Public Pages */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/pdfs" element={<Pdfs />} />
              <Route path="/pdfs/:slug" element={<Pdfs />} />
              <Route path="/updates" element={<Updates />} />
              <Route path="/updates/:slug" element={<UpdateDetail />} />
            </Route>

            {/* Admin Portal */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/management" element={<AdminManagement />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;