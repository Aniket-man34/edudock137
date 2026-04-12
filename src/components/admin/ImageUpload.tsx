import { useState, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, Eye, Loader2, Minimize2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { compressImage } from '@/lib/imageOptimizer';
import { storeTemporaryFile, getTemporaryFile, updateTemporaryFile, removeTemporaryFile } from '@/lib/storage';
import { toast } from 'sonner';

interface ImageUploadProps {
  bucket?: string;
  value: string;
  onChange: (url: string, file?: File | null) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>(
    value && !value.includes('supabase') && !value.startsWith('blob:') ? 'url' : 'upload'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [tempFileId, setTempFileId] = useState<string | null>(null);
  const [isCompressed, setIsCompressed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Clean up temporary file on unmount
  useEffect(() => {
    return () => {
      if (tempFileId) {
        removeTemporaryFile(tempFileId);
      }
    };
  }, [tempFileId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusText('Storing image...');
    setIsCompressed(false);
    setShowSuccess(false);

    try {
      // Store file temporarily
      const tempId = storeTemporaryFile(file);
      setTempFileId(tempId);

      const tempFile = getTemporaryFile(tempId);
      if (!tempFile) throw new Error('Failed to store file');

      // Show preview from temporary storage
      onChange(tempFile.url, file);
      toast.success('Image stored locally. Click "Compress 50KB" to optimize.');
    } catch (error) {
      console.error('Storage Error:', error);
      toast.error('Failed to store image.');
    } finally {
      setIsProcessing(false);
      setStatusText('');
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleCompress = async () => {
    if (!tempFileId) {
      toast.error('No image selected');
      return;
    }

    setIsProcessing(true);
    setStatusText('Compressing to 50KB...');

    try {
      const tempFile = getTemporaryFile(tempFileId);
      if (!tempFile) throw new Error('Temporary file not found');

      const optimizedFile = await compressImage(tempFile.file, 50);
      const finalSizeKB = (optimizedFile.size / 1024).toFixed(1);

      // Update temporary storage with compressed file
      const newUrl = updateTemporaryFile(tempFileId, optimizedFile);

      onChange(newUrl, optimizedFile);
      setIsCompressed(true);
      setShowSuccess(true);

      toast.success(`Image compressed to ${finalSizeKB}KB! Ready to publish.`);

      // Hide success tick after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Compression Error:', error);
      toast.error('Failed to compress image.');
    } finally {
      setIsProcessing(false);
      setStatusText('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button type="button" variant={mode === 'upload' ? 'default' : 'outline'} size="sm" onClick={() => setMode('upload')} className="gap-1.5">
          <Upload className="h-3.5 w-3.5" /> Upload
        </Button>
        <Button type="button" variant={mode === 'url' ? 'default' : 'outline'} size="sm" onClick={() => setMode('url')} className="gap-1.5">
          <LinkIcon className="h-3.5 w-3.5" /> Paste URL
        </Button>
      </div>

      {mode === 'upload' ? (
        <div className="space-y-3">
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={isProcessing} className="w-full">
              {isProcessing ? (
                <span className="flex items-center gap-2 text-purple-600 font-medium">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {statusText}
                </span>
              ) : 'Choose Image'}
            </Button>
          </div>

          {value && !isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                <img src={value} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-border/50" />
                <div className="text-sm text-muted-foreground">
                  {isCompressed ? '✓ Compressed to 50KB' : 'Ready for compression'}
                </div>
              </div>

              {!isCompressed && (
                <Button
                  type="button"
                  onClick={handleCompress}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
                >
                  <Minimize2 className="h-4 w-4" />
                  Compress 50KB
                </Button>
              )}

              {showSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Compression complete! Image is ready to publish.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <Input placeholder="https://example.com/image.png" value={value} onChange={(e) => onChange(e.target.value)} className="bg-muted/50" />
      )}

      {mode === 'url' && value && (
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
          <img src={value} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-border/50" />
        </div>
      )}
    </div>
  );
}
