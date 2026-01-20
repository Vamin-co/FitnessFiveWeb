-- ============================================
-- LINK ROUTINES TO WORKOUTS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add workout_id column to routines table
ALTER TABLE public.routines 
ADD COLUMN IF NOT EXISTS workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL;

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_routines_workout_id ON public.routines(workout_id);

-- 3. Update RLS policy for routines to allow joining with workouts
-- (Existing policies should still work since we're just adding a column)

-- Note: After running this migration, the routine_exercises table can be 
-- deprecated since exercises will come from the linked workout instead.
-- However, we'll keep it for now for backward compatibility.
