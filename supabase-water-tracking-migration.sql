-- ============================================
-- WATER TRACKING SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add water target to profiles (default ~1 gallon for gym users)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS water_target_oz INTEGER DEFAULT 128;

-- 2. Create water intake log table
CREATE TABLE IF NOT EXISTS public.water_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount_oz INTEGER NOT NULL,
  recorded_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS Policies
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own water intake" ON public.water_intake
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own water intake" ON public.water_intake
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own water intake" ON public.water_intake
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Indexes for fast daily lookups
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON public.water_intake(user_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_water_intake_recorded ON public.water_intake(recorded_at);
