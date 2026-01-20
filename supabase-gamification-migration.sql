-- ============================================
-- GAMIFICATION SCHEMA UPDATE
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add username to profiles (with unique constraint)
-- First check if column exists and add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'username') THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
  END IF;
END $$;

-- 2. Create routines table
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  frequency_days INTEGER NOT NULL DEFAULT 1, -- Every N days
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for routines
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own routines" ON public.routines
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own routines" ON public.routines
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own routines" ON public.routines
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own routines" ON public.routines
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create routine_completions table
CREATE TABLE IF NOT EXISTS public.routine_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(routine_id, completed_date) -- Only one completion per routine per day
);

-- RLS for routine_completions
ALTER TABLE public.routine_completions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own completions" ON public.routine_completions
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own completions" ON public.routine_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own completions" ON public.routine_completions
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Update leaderboard view to use username
DROP VIEW IF EXISTS public.leaderboard;
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.id AS user_id,
  COALESCE(p.username, 'Anonymous') AS name,
  p.avatar_url,
  p.streak,
  COUNT(DISTINCT rc.completed_date)::INTEGER AS total_completions,
  RANK() OVER (ORDER BY p.streak DESC, COUNT(DISTINCT rc.completed_date) DESC)::INTEGER AS rank
FROM public.profiles p
LEFT JOIN public.routine_completions rc ON rc.user_id = p.id
WHERE p.username IS NOT NULL
GROUP BY p.id, p.username, p.avatar_url, p.streak
ORDER BY rank
LIMIT 50;

-- Grant access to the view
GRANT SELECT ON public.leaderboard TO authenticated;

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON public.routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_active ON public.routines(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_routine_completions_user_id ON public.routine_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_completions_date ON public.routine_completions(completed_date);
CREATE INDEX IF NOT EXISTS idx_routine_completions_routine ON public.routine_completions(routine_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;

-- 6. Function to check if routine is due today
CREATE OR REPLACE FUNCTION public.is_routine_due(
  p_start_date DATE,
  p_frequency_days INTEGER,
  p_check_date DATE DEFAULT CURRENT_DATE
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN (p_check_date - p_start_date) % p_frequency_days = 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
