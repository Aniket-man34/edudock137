import { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { uploadFile } from '@/lib/storage';
import { toast } from 'sonner';

interface ImageUploadProps {
  bucket: string;
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ bucket, value, onChange }: ImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>(value && !value.includes('supabase') ? 'url' : 'upload');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const url = await uploadFile(bucket, file);
    setUploading(false);
    if (url) {
      onChange(url);
      toast.success('Image uploaded!');
    } else {
      toast.error('Upload failed');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'upload' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('upload')}
          className="gap-1.5"
        >
          <Upload className="h-3.5 w-3.5" /> Upload
        </Button>
        <Button
          type="button"
          variant={mode === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('url')}
          className="gap-1.5"
        >
          <LinkIcon className="h-3.5 w-3.5" /> Paste URL
        </Button>
      </div>

      {mode === 'upload' ? (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Choose Image'}
          </Button>
        </div>
      ) : (
        <Input
          placeholder="https://example.com/image.png"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-muted/50"
        />
      )}

      {value && (
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
          <img src={value} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-border/50" />
        </div>
      )}
    </div>
  );
}
