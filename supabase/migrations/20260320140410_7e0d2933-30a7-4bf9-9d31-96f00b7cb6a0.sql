
-- Create PDF categories table
CREATE TABLE public.pdf_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pdf_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pdf_categories" ON public.pdf_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage pdf_categories" ON public.pdf_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add category reference to pdfs table
ALTER TABLE public.pdfs ADD COLUMN pdf_category_id UUID REFERENCES public.pdf_categories(id) ON DELETE SET NULL;
