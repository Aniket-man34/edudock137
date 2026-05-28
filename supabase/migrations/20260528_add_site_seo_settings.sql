-- ============================================================
-- 20260528: site_seo_settings table — dynamic per-page SEO
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_seo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL UNIQUE,               -- 'home', 'updates', 'pdfs', 'tools', etc.
  meta_title TEXT,
  meta_description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'website',
  twitter_card TEXT DEFAULT 'summary_large_image',
  schema_markup TEXT,                           -- raw JSON-LD string for the page
  canonical_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_seo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seo settings"
  ON public.site_seo_settings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage seo settings"
  ON public.site_seo_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_site_seo_settings_updated_at
  BEFORE UPDATE ON public.site_seo_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index
CREATE INDEX idx_site_seo_settings_page_name ON public.site_seo_settings(page_name);