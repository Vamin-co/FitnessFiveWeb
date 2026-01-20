-- Fix Foreign Key Constraint Issue for Daily Tasks
-- The daily_tasks table has a foreign key constraint on exercise_template_id 
-- that points to routine_exercises, but we now use workouts.exercises.
--
-- This migration drops the invalid constraint so tasks can be created
-- using exercises from the workouts table.

-- Drop the foreign key constraint that's blocking inserts
ALTER TABLE public.daily_tasks 
DROP CONSTRAINT IF EXISTS daily_tasks_exercise_template_id_fkey;

-- Make exercise_template_id nullable since it now references exercises from different tables
ALTER TABLE public.daily_tasks 
ALTER COLUMN exercise_template_id DROP NOT NULL;

-- Optionally, you could add a new constraint that references the exercises table instead:
-- ALTER TABLE public.daily_tasks 
-- ADD CONSTRAINT daily_tasks_exercise_template_id_fkey 
-- FOREIGN KEY (exercise_template_id) REFERENCES public.exercises(id) ON DELETE SET NULL;
--
-- But for flexibility with both legacy and new systems, leaving it unconstrained is cleaner.

-- Done! Now task generation should work for workouts.exercises
