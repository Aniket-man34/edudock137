import { supabase } from '@/integrations/supabase/client';

// Map MIME types to their canonical file extensions
const MIME_TO_EXT: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

// Temporary in-memory storage for images before compression
const temporaryStorage = new Map<string, { file: File; url: string }>();

export async function uploadFile(bucket: string, file: File, tempId?: string): Promise<string | null> {
  // Prefer the MIME-derived extension so WebP blobs compressed client-side
  // always land in storage as .webp regardless of the original filename.
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

  // Clean up temporary file if tempId provided
  if (tempId) {
    removeTemporaryFile(tempId);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * Store file temporarily in memory for compression
 */
export function storeTemporaryFile(file: File): string {
  const id = `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const url = URL.createObjectURL(file);
  temporaryStorage.set(id, { file, url });
  return id;
}

/**
 * Get temporary file by ID
 */
export function getTemporaryFile(id: string): { file: File; url: string } | undefined {
  return temporaryStorage.get(id);
}

/**
 * Update temporary file with compressed version
 */
export function updateTemporaryFile(id: string, compressedFile: File): string {
  const existing = temporaryStorage.get(id);
  if (existing) {
    URL.revokeObjectURL(existing.url); // Clean up old URL
  }

  const newUrl = URL.createObjectURL(compressedFile);
  temporaryStorage.set(id, { file: compressedFile, url: newUrl });
  return newUrl;
}

/**
 * Remove temporary file
 */
export function removeTemporaryFile(id: string): void {
  const existing = temporaryStorage.get(id);
  if (existing) {
    URL.revokeObjectURL(existing.url);
  }
  temporaryStorage.delete(id);
}

/**
 * Get all temporary file IDs (for debugging)
 */
export function getAllTemporaryFileIds(): string[] {
  return Array.from(temporaryStorage.keys());
}
