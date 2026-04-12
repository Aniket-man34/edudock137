import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load all page components
const Home = lazy(() => import("@/pages/Home"));
const Tools = lazy(() => import("@/pages/Tools"));
const Pdfs = lazy(() => import("@/pages/Pdfs"));
const Updates = lazy(() => import("@/pages/Updates"));
const UpdateDetail = lazy(() => import("@/pages/UpdateDetail"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminManagement = lazy(() => import("@/pages/admin/AdminManagement"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-primary/10"></div>
        </div>
      </div>
      <p className="text-muted-foreground animate-pulse">Loading content...</p>
    </div>
  </div>
);

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
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Pages */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/pdfs" element={<Pdfs />} />
                <Route path="/pdfs/:slug" element={<Pdfs />} />
                <Route path="/updates" element={<Updates />} />
                <Route path="/updates/:slug" element={<UpdateDetail />} />
                {/* 🚨 REQUIRED FOR GOOGLE VERIFICATION 🚨 */}
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;