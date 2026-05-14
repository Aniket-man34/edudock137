import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    itemName: string;
    itemType: 'update' | 'pdf' | 'tool';
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    itemName,
    itemType
}: DeleteConfirmationModalProps) {
    const [confirmText, setConfirmText] = useState('');
    const deleteButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen && deleteButtonRef.current) {
            deleteButtonRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (confirmText.toLowerCase() === 'delete') {
            onConfirm();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
        >
            <div 
                className="bg-background rounded-xl p-6 max-w-md w-full border border-destructive/30 shadow-xl"
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        onClose();
                    }
                }}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 id="delete-modal-title" className="text-lg font-semibold">Confirm Deletion</h3>
                </div>

                <p id="delete-modal-description" className="text-muted-foreground mb-4">
                    Are you sure you want to delete <span className="font-semibold text-foreground">{itemName}</span>?
                    This will permanently remove the database record. Associated files will be automatically deleted from storage.
                </p>

                <div className="mb-6">
                    <label htmlFor="confirm-delete" className="block text-sm font-medium mb-2">
                        Type <span className="font-mono text-destructive">"delete"</span> to confirm
                    </label>
                    <Input
                        id="confirm-delete"
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder='Type "delete" to confirm'
                        className="w-full"
                        autoFocus
                        aria-describedby="confirm-hint"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && confirmText.toLowerCase() === 'delete') {
                                handleConfirm();
                            }
                        }}
                    />
                    <p id="confirm-hint" className="text-xs text-muted-foreground mt-1">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={onClose}
                        disabled={isDeleting}
                        variant="outline"
                        className="flex-1"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        ref={deleteButtonRef}
                        onClick={handleConfirm}
                        disabled={isDeleting || confirmText.toLowerCase() !== 'delete'}
                        variant="destructive"
                        className="flex-1"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Permanently
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}