-- ============================================================
-- EDUDOCK137 - FULL SCHEMA RESET
-- This script DROPS all old tables and recreates the complete
-- schema from scratch. Use with caution on production!
-- ============================================================

-- ============================================================
-- STEP 1: DROP ALL EXISTING TABLES (CASCADE)
-- ============================================================
DROP TABLE IF EXISTS public.analytics CASCADE;
DROP TABLE IF EXISTS public.page_views CASCADE;
DROP TABLE IF EXISTS public.updates CASCADE;
DROP TABLE IF EXISTS public.pdfs CASCADE;
DROP TABLE IF EXISTS public.tools CASCADE;
DROP TABLE IF EXISTS public.pdf_categories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- Drop the old trigger function too
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- ============================================================
-- STEP 2: CREATE ALL TABLES (FRESH SCHEMA)
-- ============================================================

-- ----------------------------------------------------------
-- 2.1 CATEGORIES TABLE (unified for tools, pdfs, updates)
-- ----------------------------------------------------------
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'tool',  -- 'tool', 'pdf', or 'update'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, entity_type)
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------
-- 2.2 TOOLS TABLE
-- ----------------------------------------------------------
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  image_url TEXT,
  favicon_url TEXT,
  image_type TEXT,
  url TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  schema_markup JSONB,
  slug TEXT,
  author_name TEXT,
  author_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tools"
  ON public.tools FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage tools"
  ON public.tools FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------
-- 2.3 PDFS TABLE
-- ----------------------------------------------------------
CREATE TABLE public.pdfs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  drive_link TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  clicks INTEGER NOT NULL DEFAULT 0,
  slug TEXT,
  author_name TEXT,
  author_avatar TEXT,
  meta_title TEXT,
  meta_description TEXT,
  schema_markup JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pdfs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pdfs"
  ON public.pdfs FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage pdfs"
  ON public.pdfs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------
-- 2.4 UPDATES TABLE
-- ----------------------------------------------------------
CREATE TABLE public.updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  external_url TEXT,
  clicks INTEGER NOT NULL DEFAULT 0,
  slug TEXT,
  author_name TEXT,
  author_avatar TEXT,
  meta_title TEXT,
  meta_description TEXT,
  schema_markup JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view updates"
  ON public.updates FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage updates"
  ON public.updates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------
-- 2.5 ANALYTICS TABLE
-- ----------------------------------------------------------
CREATE TABLE public.analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  visitor_count INTEGER NOT NULL DEFAULT 0,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view analytics"
  ON public.analytics FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage analytics"
  ON public.analytics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------
-- 2.6 PAGE_VIEWS TABLE (NEW)
-- ----------------------------------------------------------
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view page_views"
  ON public.page_views FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage page_views"
  ON public.page_views FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------
-- 2.7 PDF_CATEGORIES TABLE (legacy, kept for backward compat)
-- ----------------------------------------------------------
CREATE TABLE public.pdf_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pdf_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pdf_categories"
  ON public.pdf_categories FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage pdf_categories"
  ON public.pdf_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- STEP 3: CREATE TRIGGER FUNCTION & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pdfs_updated_at
  BEFORE UPDATE ON public.pdfs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_updates_updated_at
  BEFORE UPDATE ON public.updates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================================

-- Categories indexes
CREATE INDEX idx_categories_entity_type ON public.categories(entity_type);
CREATE INDEX idx_categories_name ON public.categories(name);

-- Tools indexes
CREATE INDEX idx_tools_category_id ON public.tools(category_id);
CREATE INDEX idx_tools_clicks ON public.tools(clicks DESC);
CREATE INDEX idx_tools_title ON public.tools(title);
CREATE INDEX idx_tools_slug ON public.tools(slug);
CREATE INDEX idx_tools_created_at ON public.tools(created_at DESC);

-- PDFs indexes
CREATE INDEX idx_pdfs_category_id ON public.pdfs(category_id);
CREATE INDEX idx_pdfs_clicks ON public.pdfs(clicks DESC);
CREATE INDEX idx_pdfs_slug ON public.pdfs(slug);
CREATE INDEX idx_pdfs_title ON public.pdfs(title);
CREATE INDEX idx_pdfs_created_at ON public.pdfs(created_at DESC);

-- Updates indexes
CREATE INDEX idx_updates_category_id ON public.updates(category_id);
CREATE INDEX idx_updates_clicks ON public.updates(clicks DESC);
CREATE INDEX idx_updates_slug ON public.updates(slug);
CREATE INDEX idx_updates_created_at ON public.updates(created_at DESC);

-- Analytics indexes
CREATE INDEX idx_analytics_page ON public.analytics(page);
CREATE INDEX idx_analytics_month_year ON public.analytics(month, year);

-- Page views indexes
CREATE INDEX idx_page_views_path ON public.page_views(path);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);

-- ============================================================
-- STEP 5: STORAGE BUCKET FOR IMAGES
-- ============================================================

-- Create the 'images' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view images
CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH (bucket_id = 'images');

-- Allow authenticated users to update images
CREATE POLICY "Authenticated users can update images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'images');

-- ============================================================
-- DONE! Schema is now fully set up.
-- ============================================================
