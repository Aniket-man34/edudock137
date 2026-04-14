import { supabase } from '@/integrations/supabase/client';

// Map MIME types to their canonical file extensions
const MIME_TO_EXT: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

// ─── TEMP IMAGE STATE (local only, never uploaded until publish) ───
export interface TempImageState {
  file: File | null;
  previewUrl: string | null;
  isCompressed: boolean;
}

export const tempImageState: TempImageState = {
  file: null,
  previewUrl: null,
  isCompressed: false,
};

/** Store a file locally — NO upload, NO server call */
export function selectImage(file: File): void {
  // Revoke previous preview URL to avoid memory leaks
  if (tempImageState.previewUrl) {
    URL.revokeObjectURL(tempImageState.previewUrl);
  }
  tempImageState.file = file;
  tempImageState.previewUrl = URL.createObjectURL(file);
  tempImageState.isCompressed = false;
}

/** Replace temp image with compressed version */
export function replaceWithCompressed(compressedFile: File): void {
  if (tempImageState.previewUrl) {
    URL.revokeObjectURL(tempImageState.previewUrl);
  }
  tempImageState.file = compressedFile;
  tempImageState.previewUrl = URL.createObjectURL(compressedFile);
  tempImageState.isCompressed = true;
}

/** Clear temp state after publish or cancel */
export function clearTempImage(): void {
  if (tempImageState.previewUrl) {
    URL.revokeObjectURL(tempImageState.previewUrl);
  }
  tempImageState.file = null;
  tempImageState.previewUrl = null;
  tempImageState.isCompressed = false;
}

// ─── UPLOAD TO SUPABASE (called ONLY on publish) ───
export async function uploadFile(bucket: string, file: File): Promise<string | null> {
  const ext = MIME_TO_EXT[file.type] ?? file.name.split('.').pop() ?? 'bin';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}
