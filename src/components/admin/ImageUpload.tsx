import { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Eye, Loader2, Minimize2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { compressImage } from '@/lib/imageOptimizer';
import { tempImageState, selectImage, replaceWithCompressed } from '@/lib/storage';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string, file?: File | null) => void;
}

/** Format bytes to human-readable string */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>(
    value && !value.includes('supabase') && !value.startsWith('blob:') ? 'url' : 'upload'
  );
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressSuccess, setCompressSuccess] = useState(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── STEP 1: Select Image (NO upload, NO compression) ───
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store locally in tempImageState — zero server calls
    selectImage(file);

    // Track original file size
    setOriginalSize(file.size);
    setCompressedSize(null);

    // Update parent form with blob preview URL and raw File
    onChange(tempImageState.previewUrl!, file);
    setCompressSuccess(false);
    toast.success('Image selected. Click "Compress 50KB" to optimize.');

    if (fileRef.current) fileRef.current.value = '';
  };

  // ─── STEP 2: Compress < 50KB (only when button clicked) ───
  const handleCompress = async () => {
    if (!tempImageState.file) {
      toast.error('No image selected');
      return;
    }

    setIsCompressing(true);
    setCompressSuccess(false);

    try {
      const compressed = await compressImage(tempImageState.file, 50);

      // Replace in storage.ts — old blob URL revoked automatically
      replaceWithCompressed(compressed);

      // Track compressed size
      setCompressedSize(compressed.size);

      // Update parent form with new compressed file
      onChange(tempImageState.previewUrl!, compressed);
      setCompressSuccess(true);

      toast.success(`✅ Image compressed to ${formatSize(compressed.size)}! Ready to publish.`);
    } catch (error) {
      console.error('Compression Error:', error);
      toast.error('Failed to compress image.');
    } finally {
      setIsCompressing(false);
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
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={isCompressing} className="w-full">
              Choose Image
            </Button>
          </div>

          {/* Preview */}
          {value && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                <img src={value} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-border/50" />
                <div className="text-sm text-muted-foreground">
                  {compressSuccess ? (
                    <>✓ Compressed — {formatSize(compressedSize!)}</>
                  ) : originalSize ? (
                    <>Original — {formatSize(originalSize)}</>
                  ) : (
                    'Ready for compression'
                  )}
                </div>
              </div>

              {/* Compress Button — shows loading state */}
              {!compressSuccess && (
                <Button
                  type="button"
                  onClick={handleCompress}
                  disabled={isCompressing}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Minimize2 className="h-4 w-4" />
                      Compress 50KB
                    </>
                  )}
                </Button>
              )}

              {/* ✅ Success — stays visible until publish */}
              {compressSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    ✅ Compressed {originalSize ? `${formatSize(originalSize)} → ${formatSize(compressedSize!)}` : `to ${formatSize(compressedSize!)}`} — Ready to publish!
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
