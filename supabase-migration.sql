-- ============================================
-- FitnessFive Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable Row Level Security on all tables
-- Note: RLS is enabled by default in Supabase

-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  weight NUMERIC(5,1), -- current weight in lbs
  height NUMERIC(4,1), -- height in inches
  age INTEGER,
  goals TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. WEIGHT ENTRIES TABLE (for tracking weight over time)
-- ============================================
CREATE TABLE public.weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  weight NUMERIC(5,1) NOT NULL,
  recorded_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for weight_entries
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weight entries" ON public.weight_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight entries" ON public.weight_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight entries" ON public.weight_entries
  FOR DELETE USING (auth.uid() = user_id);

-- 3. WORKOUTS TABLE
-- ============================================
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  duration INTEGER, -- minutes
  calories_burned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- RLS Policies for workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workouts" ON public.workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON public.workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON public.workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON public.workouts
  FOR DELETE USING (auth.uid() = user_id);

-- 4. EXERCISES TABLE (linked to workouts)
-- ============================================
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sets INTEGER DEFAULT 0,
  target_sets INTEGER DEFAULT 3,
  reps INTEGER DEFAULT 0,
  target_reps INTEGER DEFAULT 12,
  weight NUMERIC(5,1), -- lbs
  order_index INTEGER DEFAULT 0
);

-- RLS Policies for exercises (inherit from workout)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exercises" ON public.exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workouts w 
      WHERE w.id = workout_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercises" ON public.exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts w 
      WHERE w.id = workout_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercises" ON public.exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workouts w 
      WHERE w.id = workout_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercises" ON public.exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workouts w 
      WHERE w.id = workout_id AND w.user_id = auth.uid()
    )
  );

-- 5. LEADERBOARD VIEW (computed from workouts)
-- ============================================
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.id AS user_id,
  COALESCE(p.first_name, 'Anonymous') || ' ' || LEFT(COALESCE(p.last_name, ''), 1) || '.' AS name,
  p.avatar_url,
  p.streak,
  COALESCE(SUM(w.calories_burned), 0)::INTEGER AS score,
  RANK() OVER (ORDER BY COALESCE(SUM(w.calories_burned), 0) DESC) AS rank
FROM public.profiles p
LEFT JOIN public.workouts w ON w.user_id = p.id AND w.completed = TRUE
GROUP BY p.id, p.first_name, p.last_name, p.avatar_url, p.streak
ORDER BY score DESC
LIMIT 50;

-- Grant access to the view
GRANT SELECT ON public.leaderboard TO authenticated;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX idx_workouts_created_at ON public.workouts(created_at DESC);
CREATE INDEX idx_exercises_workout_id ON public.exercises(workout_id);
CREATE INDEX idx_weight_entries_user_id ON public.weight_entries(user_id);
CREATE INDEX idx_weight_entries_recorded_at ON public.weight_entries(recorded_at DESC);
