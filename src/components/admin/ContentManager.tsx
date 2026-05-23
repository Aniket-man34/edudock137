import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { deleteUpdate, deletePdf, deleteTool } from '@/integrations/supabase/deletion';
import { FileText, Wrench, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { ContentSection, SectionSkeleton } from './ContentSection';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

export default function ContentManager() {
    const queryClient = useQueryClient();
    const [confirmDelete, setConfirmDelete] = useState<{ type: 'update' | 'pdf' | 'tool', id: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch all data
    const { data: updates, isLoading: updatesLoading } = useQuery({
        queryKey: ['admin-updates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('updates')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
    });

    const { data: pdfs, isLoading: pdfsLoading } = useQuery({
        queryKey: ['admin-pdfs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pdfs')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
    });

    const { data: tools, isLoading: toolsLoading } = useQuery({
        queryKey: ['admin-tools'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tools')
                .select('*')
                .order('title', { ascending: true });
            if (error) throw error;
            return data || [];
        },
    });

    const handleDelete = async () => {
        if (!confirmDelete) return;

        setIsDeleting(true);

        try {
            let success = false;

            switch (confirmDelete.type) {
                case 'update':
                    success = await deleteUpdate(confirmDelete.id);
                    break;
                case 'pdf':
                    success = await deletePdf(confirmDelete.id);
                    break;
                case 'tool':
                    success = await deleteTool(confirmDelete.id);
                    break;
            }

            if (success) {
                toast.success(`${confirmDelete.type.charAt(0).toUpperCase() + confirmDelete.type.slice(1)} deleted successfully`);

                // Invalidate queries to refresh data
                queryClient.invalidateQueries({ queryKey: ['admin-updates'] });
                queryClient.invalidateQueries({ queryKey: ['admin-pdfs'] });
                queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
                queryClient.invalidateQueries({ queryKey: ['updates'] });
                queryClient.invalidateQueries({ queryKey: ['pdfs'] });
                queryClient.invalidateQueries({ queryKey: ['tools'] });
                
                // Reset confirmation state
                setConfirmDelete(null);
            } else {
                toast.error(`Failed to delete ${confirmDelete.type}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('An error occurred while deleting');
        } finally {
            setIsDeleting(false);
        }
    };

    const isLoading = updatesLoading || pdfsLoading || toolsLoading;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Content Manager</h1>
                <p className="text-muted-foreground">Manage all content (Updates, PDFs, Tools) and delete with associated files</p>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                itemName={confirmDelete?.name || ''}
                itemType={confirmDelete?.type || 'update'}
            />

            {isLoading ? (
                <div className="flex flex-wrap gap-6 items-stretch justify-start [&>*]:flex-[1_1_320px]">
                    <SectionSkeleton />
                    <SectionSkeleton />
                    <SectionSkeleton />
                </div>
            ) : (
                <div className="flex flex-wrap gap-6 items-stretch justify-start [&>*]:flex-[1_1_320px]">
                    {/* Updates Section */}
                    <ContentSection
                        title="Updates"
                        icon={Bell}
                        items={updates || []}
                        isLoading={updatesLoading}
                        colorClass="bg-primary/10 text-primary"
                        getItemName={(item) => item.title}
                        getItemSubtitle={(item) => new Date(item.created_at).toLocaleDateString()}
                        onDelete={(item) => setConfirmDelete({
                            type: 'update',
                            id: item.id,
                            name: item.title
                        })}
                    />

                    {/* PDFs Section */}
                    <ContentSection
                        title="PDFs"
                        icon={FileText}
                        items={pdfs || []}
                        isLoading={pdfsLoading}
                        colorClass="bg-green-500/10 text-green-500"
                        getItemName={(item) => item.title}
                        getItemSubtitle={(item) => item.category_id || 'Uncategorized'}
                        onDelete={(item) => setConfirmDelete({
                            type: 'pdf',
                            id: item.id,
                            name: item.title
                        })}
                    />

                    {/* Tools Section */}
                    <ContentSection
                        title="Tools"
                        icon={Wrench}
                        items={tools || []}
                        isLoading={toolsLoading}
                        colorClass="bg-amber-500/10 text-amber-500"
                        getItemName={(item) => item.title}
                        getItemSubtitle={(item) => item.category_id || 'General'}
                        onDelete={(item) => setConfirmDelete({
                            type: 'tool',
                            id: item.id,
                            name: item.title
                        })}
                    />
                </div>
            )}

            <div className="mt-8 p-6 bg-muted/20 rounded-lg border border-border">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium">Important Notes</h4>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>Deletion is permanent and cannot be undone</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>Associated files are automatically removed from Supabase Storage via Edge Functions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>Database records will be permanently deleted</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>This action affects all users immediately</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}