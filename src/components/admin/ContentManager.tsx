import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { deleteUpdate, deletePdf, deleteTool } from '@/integrations/supabase/deletion';
import { Trash2, AlertTriangle, Check, X, Loader2, FileText, Wrench, Bell } from 'lucide-react';
import { toast } from 'sonner';

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
            } else {
                toast.error(`Failed to delete ${confirmDelete.type}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('An error occurred while deleting');
        } finally {
            setIsDeleting(false);
            setConfirmDelete(null);
        }
    };

    const isLoading = updatesLoading || pdfsLoading || toolsLoading;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Content Manager</h1>
                <p className="text-muted-foreground">Manage all content (Updates, PDFs, Tools) and delete with associated files</p>
            </div>

            {confirmDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background rounded-xl p-6 max-w-md w-full border border-red-500/30 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete <span className="font-semibold text-foreground">{confirmDelete.name}</span>?
                            This will permanently remove the database record. Associated files will be automatically deleted from storage.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
                            >
                                <X className="w-4 h-4 inline mr-2" />
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 inline mr-2" />
                                        Delete Permanently
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Updates Section */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <Bell className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-semibold">Updates</h2>
                            <span className="ml-auto bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                                {updates?.length || 0}
                            </span>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {updates?.map((update) => (
                                <div key={update.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm truncate">{update.title}</h4>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {new Date(update.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setConfirmDelete({
                                            type: 'update',
                                            id: update.id,
                                            name: update.title
                                        })}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {(!updates || updates.length === 0) && (
                                <div className="text-center py-6 text-muted-foreground">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No updates found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PDFs Section */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-semibold">PDFs</h2>
                            <span className="ml-auto bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                                {pdfs?.length || 0}
                            </span>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {pdfs?.map((pdf) => (
                                <div key={pdf.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm truncate">{pdf.title}</h4>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {pdf.category_id || 'Uncategorized'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setConfirmDelete({
                                            type: 'pdf',
                                            id: pdf.id,
                                            name: pdf.title
                                        })}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {(!pdfs || pdfs.length === 0) && (
                                <div className="text-center py-6 text-muted-foreground">
                                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No PDFs found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tools Section */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                <Wrench className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-semibold">Tools</h2>
                            <span className="ml-auto bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                                {tools?.length || 0}
                            </span>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {tools?.map((tool) => (
                                <div key={tool.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm truncate">{tool.title}</h4>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {tool.category_id || 'General'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setConfirmDelete({
                                            type: 'tool',
                                            id: tool.id,
                                            name: tool.title
                                        })}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {(!tools || tools.length === 0) && (
                                <div className="text-center py-6 text-muted-foreground">
                                    <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No tools found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 p-4 bg-muted/20 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-medium mb-1">Important Notes</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Deletion is permanent and cannot be undone</li>
                            <li>• Associated files are automatically removed from Supabase Storage via Edge Functions</li>
                            <li>• Database records will be permanently deleted</li>
                            <li>• This action affects all users immediately</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}