-- supabase_schema.sql
-- Run this in your Supabase SQL Editor to set up the database

-- ── TABLE: soil_predictions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS soil_predictions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ph            DECIMAL(5,2) NOT NULL,
  nitrogen      DECIMAL(8,2) NOT NULL,
  phosphorus    DECIMAL(8,2) NOT NULL,
  potassium     DECIMAL(8,2) NOT NULL,
  moisture      DECIMAL(5,2) NOT NULL,
  temperature   DECIMAL(5,2) NOT NULL,
  fertility_result VARCHAR(20) NOT NULL CHECK (fertility_result IN ('High','Medium','Low')),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── TABLE: disease_predictions ─────────────────────────────────
CREATE TABLE IF NOT EXISTS disease_predictions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url   TEXT,
  prediction  VARCHAR(100) NOT NULL,
  confidence  DECIMAL(5,2),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── ROW LEVEL SECURITY (RLS) ───────────────────────────────────
-- Enable RLS so users can only see their own data

ALTER TABLE soil_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_predictions ENABLE ROW LEVEL SECURITY;

-- Soil Predictions Policies
CREATE POLICY "Users can view own soil predictions"
  ON soil_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own soil predictions"
  ON soil_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Disease Predictions Policies
CREATE POLICY "Users can view own disease predictions"
  ON disease_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own disease predictions"
  ON disease_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── STORAGE BUCKET ─────────────────────────────────────────────
-- Run this in Supabase Dashboard → Storage → Create bucket
-- Bucket name: crop-images
-- Set to Public: YES (for public image URLs)

-- Or run via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('crop-images', 'crop-images', true)
ON CONFLICT DO NOTHING;

-- Storage policy: users can upload to their own folder
CREATE POLICY "Users can upload crop images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view crop images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'crop-images');

-- ── VERIFY SETUP ───────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('soil_predictions','disease_predictions');
