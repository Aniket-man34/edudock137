import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import CategoriesManager from '@/components/admin/CategoriesManager';
import ToolsManager from '@/components/admin/ToolsManager';
import PdfCategoriesManager from '@/components/admin/PdfCategoriesManager';
import PdfsManager from '@/components/admin/PdfsManager';
import UpdatesManager from '@/components/admin/UpdatesManager';
import AnalyticsManager from '@/components/admin/AnalyticsManager';

export default function AdminManagement() {
  const [searchParams] = useSearchParams();
  
  // Get the active tab from the URL (set by the Sidebar in AdminLayout)
  const activeTab = searchParams.get('tab') || 'categories';

  return (
    <div className="w-full">
      <Tabs value={activeTab} className="w-full">
        {/* We removed the TabsList (the horizontal buttons) because the new Sidebar handles that now! */}
        
        <TabsContent value="categories" className="mt-0"><CategoriesManager search="" /></TabsContent>
        <TabsContent value="tools" className="mt-0"><ToolsManager search="" /></TabsContent>
        <TabsContent value="pdf-categories" className="mt-0"><PdfCategoriesManager search="" /></TabsContent>
        <TabsContent value="pdfs" className="mt-0"><PdfsManager search="" /></TabsContent>
        <TabsContent value="updates" className="mt-0"><UpdatesManager search="" /></TabsContent>
        <TabsContent value="analytics" className="mt-0"><AnalyticsManager search="" /></TabsContent>
      </Tabs>
    </div>
  );
}