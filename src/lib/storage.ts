import { supabase } from '@/integrations/supabase/client';

export async function uploadFile(bucket: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
  
  const { error } = await supabase.storage.from(bucket).upload(fileName, file);
  if (error) {
    console.error('Upload error:', error);
    return null;
  }
  
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}
