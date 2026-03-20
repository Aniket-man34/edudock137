import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoriesManager from '@/components/admin/CategoriesManager';
import ToolsManager from '@/components/admin/ToolsManager';
import PdfCategoriesManager from '@/components/admin/PdfCategoriesManager';
import PdfsManager from '@/components/admin/PdfsManager';
import UpdatesManager from '@/components/admin/UpdatesManager';
import AnalyticsManager from '@/components/admin/AnalyticsManager';

export default function AdminManagement() {
  const [search, setSearch] = useState('');

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-3xl font-bold">Management</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/50"
          />
        </div>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="glass-card p-1 flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="categories" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Categories</TabsTrigger>
          <TabsTrigger value="tools" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Tools</TabsTrigger>
          <TabsTrigger value="pdf-categories" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">PDF Categories</TabsTrigger>
          <TabsTrigger value="pdfs" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">PDFs</TabsTrigger>
          <TabsTrigger value="updates" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Updates</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="categories"><CategoriesManager search={search} /></TabsContent>
        <TabsContent value="tools"><ToolsManager search={search} /></TabsContent>
        <TabsContent value="pdf-categories"><PdfCategoriesManager search={search} /></TabsContent>
        <TabsContent value="pdfs"><PdfsManager search={search} /></TabsContent>
        <TabsContent value="updates"><UpdatesManager search={search} /></TabsContent>
        <TabsContent value="analytics"><AnalyticsManager search={search} /></TabsContent>
      </Tabs>
    </div>
  );
}
