-- ============================================
-- TEMPLATE VS INSTANCE TASK GENERATION
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create routine_exercises table (TEMPLATE)
CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_sets INTEGER DEFAULT 3,
  target_reps INTEGER DEFAULT 10,
  weight NUMERIC,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;

-- Get user_id through the routine
CREATE POLICY "Users can view exercises of own routines" ON public.routine_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.routines r 
      WHERE r.id = routine_exercises.routine_id 
      AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert exercises to own routines" ON public.routine_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.routines r 
      WHERE r.id = routine_exercises.routine_id 
      AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update exercises of own routines" ON public.routine_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.routines r 
      WHERE r.id = routine_exercises.routine_id 
      AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete exercises of own routines" ON public.routine_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.routines r 
      WHERE r.id = routine_exercises.routine_id 
      AND r.user_id = auth.uid()
    )
  );

-- 2. Create daily_tasks table (INSTANCE)
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  exercise_template_id UUID REFERENCES public.routine_exercises(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_sets INTEGER,
  target_reps INTEGER,
  weight NUMERIC,
  completed BOOLEAN DEFAULT FALSE,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exercise_template_id, task_date)
);

ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily tasks" ON public.daily_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily tasks" ON public.daily_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily tasks" ON public.daily_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily tasks" ON public.daily_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_id ON public.routine_exercises(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_exercises_order ON public.routine_exercises(routine_id, order_index);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON public.daily_tasks(user_id, task_date);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_routine ON public.daily_tasks(routine_id, task_date);
