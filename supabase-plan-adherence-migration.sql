-- ============================================
-- FitnessFive Plan Adherence Migration
-- Run after supabase-migration.sql
-- ============================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS preferred_weight_unit TEXT NOT NULL DEFAULT 'lbs' CHECK (preferred_weight_unit IN ('lbs', 'kg')),
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  focus_summary TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weekly_target INTEGER NOT NULL DEFAULT 4 CHECK (weekly_target BETWEEN 1 AND 14),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_training_plans_active_per_user
  ON public.training_plans(user_id)
  WHERE active = TRUE;

CREATE TABLE IF NOT EXISTS public.workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.training_plans(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  focus_area TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_sets INTEGER NOT NULL DEFAULT 3 CHECK (target_sets BETWEEN 1 AND 20),
  target_reps INTEGER NOT NULL DEFAULT 8 CHECK (target_reps BETWEEN 1 AND 100),
  target_weight NUMERIC(6,1),
  target_rpe NUMERIC(3,1),
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.plan_schedule_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.training_plans(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE NOT NULL,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  label TEXT,
  due_time TIME,
  optional BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plan_id, template_id, weekday)
);

CREATE TABLE IF NOT EXISTS public.scheduled_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.training_plans(id) ON DELETE CASCADE NOT NULL,
  schedule_slot_id UUID REFERENCES public.plan_schedule_slots(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'skipped', 'missed')),
  completion_mode TEXT CHECK (completion_mode IN ('full', 'partial', 'rescheduled', 'skipped')),
  reward_xp INTEGER NOT NULL DEFAULT 100 CHECK (reward_xp >= 0),
  streak_credit BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  rescheduled_from DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, schedule_slot_id, due_date)
);

CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quest_id UUID UNIQUE REFERENCES public.scheduled_quests(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.workout_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes BETWEEN 1 AND 600),
  notes TEXT,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.scheduled_quests
  ADD COLUMN IF NOT EXISTS completed_session_id UUID UNIQUE REFERENCES public.workout_sessions(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.session_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
  template_exercise_id UUID REFERENCES public.workout_template_exercises(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_exercise_id UUID REFERENCES public.session_exercises(id) ON DELETE CASCADE NOT NULL,
  set_index INTEGER NOT NULL CHECK (set_index >= 0),
  reps INTEGER CHECK (reps IS NULL OR reps BETWEEN 0 AND 200),
  weight NUMERIC(6,1),
  rpe NUMERIC(3,1),
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  is_personal_record BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_exercise_id, set_index)
);

CREATE TABLE IF NOT EXISTS public.goals_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('body_weight', 'adherence', 'streak_days', 'sessions_per_week')),
  title TEXT NOT NULL,
  target_value NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'paused', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.progress_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'quest_completed',
      'quest_skipped',
      'quest_rescheduled',
      'session_completed',
      'xp_awarded',
      'personal_record',
      'achievement_unlocked',
      'goal_progressed'
    )
  ),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  quest_id UUID REFERENCES public.scheduled_quests(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
  points INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  threshold INTEGER NOT NULL DEFAULT 1
);

INSERT INTO public.achievement_definitions (id, title, description, threshold)
VALUES
  ('first-quest', 'First Quest', 'Complete your first scheduled quest.', 1),
  ('streak-7', '7-Day Streak', 'Complete a streak of 7 training days.', 7),
  ('pr-hunter', 'PR Hunter', 'Set your first personal record.', 1),
  ('league-starter', 'League Starter', 'Join your first private league.', 1)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    threshold = EXCLUDED.threshold;

CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT REFERENCES public.achievement_definitions(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.competition_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.group_memberships (
  group_id UUID REFERENCES public.competition_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.competition_groups(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('quest_points', 'completed_quests', 'streak_days', 'pr_count')),
  starts_at DATE NOT NULL,
  ends_at DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, starts_at, ends_at)
);

CREATE INDEX IF NOT EXISTS idx_workout_templates_plan_id ON public.workout_templates(plan_id);
CREATE INDEX IF NOT EXISTS idx_schedule_slots_plan_weekday ON public.plan_schedule_slots(plan_id, weekday);
CREATE INDEX IF NOT EXISTS idx_scheduled_quests_user_due_date ON public.scheduled_quests(user_id, due_date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_completed_at ON public.workout_sessions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_events_user_occurred_at ON public.progress_events(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_v2_user_status ON public.goals_v2(user_id, status);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON public.group_memberships(user_id);

ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_schedule_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own training plans" ON public.training_plans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own workout templates" ON public.workout_templates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage exercises on own templates" ON public.workout_template_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM public.workout_templates wt
      WHERE wt.id = template_id AND wt.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.workout_templates wt
      WHERE wt.id = template_id AND wt.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage schedule slots on own plans" ON public.plan_schedule_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM public.training_plans tp
      WHERE tp.id = plan_id AND tp.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.training_plans tp
      WHERE tp.id = plan_id AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own scheduled quests" ON public.scheduled_quests
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own workout sessions" ON public.workout_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage session exercises on own sessions" ON public.session_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM public.workout_sessions ws
      WHERE ws.id = session_id AND ws.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.workout_sessions ws
      WHERE ws.id = session_id AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage set logs on own sessions" ON public.set_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM public.session_exercises se
      JOIN public.workout_sessions ws ON ws.id = se.session_id
      WHERE se.id = session_exercise_id AND ws.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.session_exercises se
      JOIN public.workout_sessions ws ON ws.id = se.session_id
      WHERE se.id = session_exercise_id AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own goals" ON public.goals_v2
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own progress events" ON public.progress_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress events" ON public.progress_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Achievement definitions are readable" ON public.achievement_definitions
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can view their groups" ON public.competition_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.group_memberships gm
      WHERE gm.group_id = id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups they own" ON public.competition_groups
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own groups" ON public.competition_groups
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Members can view memberships in their groups" ON public.group_memberships
  FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1
      FROM public.group_memberships gm
      WHERE gm.group_id = group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups themselves" ON public.group_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can manage memberships" ON public.group_memberships
  FOR DELETE USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1
      FROM public.competition_groups cg
      WHERE cg.id = group_id AND cg.owner_id = auth.uid()
    )
  );

CREATE POLICY "Members can view challenges in their groups" ON public.weekly_challenges
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.group_memberships gm
      WHERE gm.group_id = weekly_challenges.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can create challenges in their groups" ON public.weekly_challenges
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.competition_groups cg
      WHERE cg.id = weekly_challenges.group_id AND cg.owner_id = auth.uid()
    )
  );

CREATE OR REPLACE TRIGGER set_training_plans_updated_at
  BEFORE UPDATE ON public.training_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_workout_templates_updated_at
  BEFORE UPDATE ON public.workout_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_scheduled_quests_updated_at
  BEFORE UPDATE ON public.scheduled_quests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_workout_sessions_updated_at
  BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_goals_v2_updated_at
  BEFORE UPDATE ON public.goals_v2
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_competition_groups_updated_at
  BEFORE UPDATE ON public.competition_groups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
