import { supabase } from './client';

const KNOWN_BUCKETS = [
  'pdf-covers',
  'pdf-files',
  'update-images',
  'tool-images',
] as const;

type BucketName = (typeof KNOWN_BUCKETS)[number];

function extractBucketAndPath(
  url: string | null | undefined,
): { bucket: BucketName; path: string } | null {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/');
    const publicIndex = parts.indexOf('public');
    if (publicIndex === -1 || publicIndex + 2 >= parts.length) return null;
    const bucket = parts[publicIndex + 1] as BucketName;
    const path = parts.slice(publicIndex + 2).join('/');
    if (!KNOWN_BUCKETS.includes(bucket) || !path) return null;
    return { bucket, path };
  } catch {
    return null;
  }
}

async function purgeStorageUrls(urls: Array<string | null | undefined>) {
  const byBucket = new Map<BucketName, string[]>();
  for (const url of urls) {
    const extracted = extractBucketAndPath(url);
    if (!extracted) continue;
    const existing = byBucket.get(extracted.bucket) ?? [];
    existing.push(extracted.path);
    byBucket.set(extracted.bucket, existing);
  }
  await Promise.all(
    Array.from(byBucket.entries()).map(async ([bucket, paths]) => {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) {
        console.warn(`[storage purge] ${bucket}:`, error.message);
      }
    }),
  );
}

export async function deleteUpdate(updateId: string): Promise<boolean> {
  try {
    const { data: row } = await (supabase as any)
      .from('updates')
      .select('image_url')
      .eq('id', updateId)
      .maybeSingle();

    const { error } = await supabase.from('updates').delete().eq('id', updateId);
    if (error) {
      console.error('Error deleting update from database:', error);
      return false;
    }

    await purgeStorageUrls([row?.image_url]);
    return true;
  } catch (error) {
    console.error('Exception in deleteUpdate:', error);
    return false;
  }
}

export async function deletePdf(pdfId: string): Promise<boolean> {
  try {
    const { data: row } = await (supabase as any)
      .from('pdfs')
      .select('cover_image_url, file_url')
      .eq('id', pdfId)
      .maybeSingle();

    const { error } = await supabase.from('pdfs').delete().eq('id', pdfId);
    if (error) {
      console.error('Error deleting PDF from database:', error);
      return false;
    }

    await purgeStorageUrls([row?.cover_image_url, row?.file_url]);
    return true;
  } catch (error) {
    console.error('Exception in deletePdf:', error);
    return false;
  }
}

export async function deleteTool(toolId: string): Promise<boolean> {
  try {
    const { data: row } = await (supabase as any)
      .from('tools')
      .select('image_url')
      .eq('id', toolId)
      .maybeSingle();

    const { error } = await supabase.from('tools').delete().eq('id', toolId);
    if (error) {
      console.error('Error deleting tool from database:', error);
      return false;
    }

    await purgeStorageUrls([row?.image_url]);
    return true;
  } catch (error) {
    console.error('Exception in deleteTool:', error);
    return false;
  }
}
