-- Add schema_markup column to the updates table for JSON-LD structured data
-- This stores pre-built schema.org JSON-LD markup for Google Search rich results

ALTER TABLE public.updates
ADD COLUMN IF NOT EXISTS schema_markup TEXT;