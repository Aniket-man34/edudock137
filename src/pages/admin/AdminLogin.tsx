import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/admin/dashboard');
    });
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // Determine the correct origin. 
      // This ensures that even if window.location.origin acts weird, 
      // it prioritizes the live domain when not on localhost.
      const origin = window.location.hostname === 'localhost' 
        ? window.location.origin 
        : 'https://edudock.in';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/admin/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to authenticate with Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[100px] -z-10 rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-sm p-8 shadow-2xl border border-border/50 rounded-3xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 border border-primary/20 shadow-inner p-2.5">
            <img 
              src="/favicon.svg" 
              alt="EduDock Logo" 
              className="w-full h-full object-contain drop-shadow-md" 
            />
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Admin Login</h1>
          <p className="text-muted-foreground text-sm mt-2">Secure access for authorized personnel</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 text-[15px] font-semibold rounded-xl bg-white text-black hover:bg-gray-100 border border-gray-200 shadow-sm flex items-center justify-center gap-3 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Authenticating...' : 'Sign in with Google'}
          </Button>

          {/* 🚨 TRANSPARENCY DISCLOSURE 🚨 */}
          <p className="text-[10px] text-center text-muted-foreground px-2 leading-relaxed">
            By signing in, EduDock will access your Google name and profile picture to verify admin permissions. 
            Random accounts are automatically blocked.
          </p>
        </div>
      </motion.div>
    </div>
  );
}