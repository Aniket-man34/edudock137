import { Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ContentSectionProps<T> {
    title: string;
    icon: React.ElementType;
    items: T[];
    isLoading: boolean;
    colorClass: string;
    getItemName: (item: T) => string;
    getItemSubtitle: (item: T) => string;
    onDelete: (item: T) => void;
}

export function ContentSection<T extends { id: string }>({
    title,
    icon: Icon,
    items,
    isLoading,
    colorClass,
    getItemName,
    getItemSubtitle,
    onDelete
}: ContentSectionProps<T>) {
    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-lg ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                <span className="ml-auto bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                    {items?.length || 0}
                </span>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-24rem)] md:max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border/50 animate-pulse">
                            <div className="space-y-2 flex-1">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                            <div className="w-8 h-8 bg-muted rounded-lg"></div>
                        </div>
                    ))
                ) : items?.length > 0 ? (
                    items.map((item) => (
                        <div 
                            key={item.id} 
                            className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors group"
                        >
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate group-hover:text-foreground transition-colors">
                                    {getItemName(item)}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate">
                                    {getItemSubtitle(item)}
                                </p>
                            </div>
                            <button
                                onClick={() => onDelete(item)}
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:ring-offset-2"
                                title={`Delete ${title.toLowerCase()}`}
                                aria-label={`Delete ${getItemName(item)}`}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Icon className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No {title.toLowerCase()} found</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export function SectionSkeleton() {
    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="ml-auto h-6 w-10 rounded-full" />
            </div>
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="w-8 h-8 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );
}