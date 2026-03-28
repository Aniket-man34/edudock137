import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Users, Wrench, BookOpen, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const { data: toolCount } = useQuery({
    queryKey: ['admin-tool-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('tools').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: pdfCount } = useQuery({
    queryKey: ['admin-pdf-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('pdfs').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: updateCount } = useQuery({
    queryKey: ['admin-update-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('updates').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch actual page views from the database!
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics-realtime'],
    queryFn: async () => {
      // Requesting data from the 'page_views' table
      const { data, error } = await (supabase.from('page_views' as any) as any).select('created_at').order('created_at');
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate total unique visits
  const totalVisitors = analytics?.length || 0;

  // Process data for the chart (Group by day)
  const processChartData = () => {
    if (!analytics || analytics.length === 0) return [];

    const dailyCounts: Record<string, number> = {};
    
    analytics.forEach((view: any) => {
      const date = new Date(view.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    return Object.entries(dailyCounts).map(([name, visitors]) => ({
      name,
      visitors
    }));
  };

  const chartData = processChartData();

  const stats = [
    { label: 'Total Visitors', value: totalVisitors, icon: Users, color: 'text-primary' },
    { label: 'Tools', value: toolCount ?? 0, icon: Wrench, color: 'text-emerald-500' },
    { label: 'PDFs', value: pdfCount ?? 0, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Updates', value: updateCount ?? 0, icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-8">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 border border-border/50 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="text-muted-foreground text-sm font-medium">{stat.label}</span>
            </div>
            <p className="font-display text-3xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 border border-border/50"
      >
        <h2 className="font-display text-xl font-semibold mb-6">Visitor Analytics (Real-Time)</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/0.2)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-10 w-10 mb-3 opacity-20" />
            <p>Waiting for your first visitor...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}