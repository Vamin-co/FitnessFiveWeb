import { createClient } from '@/utils/supabase/server';
import type { DashboardStats } from '@/types';

// Get the currently authenticated user's profile
export async function getProfile() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return {
        id: data.id,
        username: data.username,
        firstName: data.first_name,
        lastName: data.last_name,
        weight: data.weight,
        height: data.height,
        age: data.age,
        goals: data.goals || [],
        avatarUrl: data.avatar_url,
        streak: data.streak || 0,
        createdAt: data.created_at,
    };
}

// Get all workouts for the current user
export async function getWorkouts() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('workouts')
        .select(`
      *,
      exercises (*)
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching workouts:', error);
        return [];
    }

    return data.map((workout) => ({
        id: workout.id,
        title: workout.title,
        description: workout.description,
        completed: workout.completed,
        duration: workout.duration,
        caloriesBurned: workout.calories_burned,
        createdAt: workout.created_at,
        completedAt: workout.completed_at,
        exercises: workout.exercises?.map((ex: {
            id: string;
            name: string;
            sets: number;
            target_sets: number;
            reps: number;
            target_reps: number;
            weight: number | null;
            order_index: number;
        }) => ({
            id: ex.id,
            name: ex.name,
            sets: ex.sets,
            targetSets: ex.target_sets,
            reps: ex.reps,
            targetReps: ex.target_reps,
            weight: ex.weight,
            orderIndex: ex.order_index,
        })) || [],
    }));
}

// Get weight history for the current user
export async function getWeightHistory() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: true });

    if (error) {
        console.error('Error fetching weight history:', error);
        return [];
    }

    return data.map((entry) => ({
        date: entry.recorded_at,
        weight: Number(entry.weight),
    }));
}

// Get leaderboard (public view)
export async function getLeaderboard() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(10);

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }

    return data.map((entry) => ({
        userId: entry.user_id,
        name: entry.name || 'Anonymous',
        avatar: entry.avatar_url,
        score: entry.score || 0,
        streak: entry.streak || 0,
        rank: Number(entry.rank),
        isCurrentUser: user?.id === entry.user_id,
    }));
}

// Calculate dashboard stats
export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return {
            currentWeight: 0,
            weightChange: 0,
            streak: 0,
            workoutsThisWeek: 0,
            totalMinutesThisWeek: 0,
            caloriesBurnedThisWeek: 0,
        };
    }

    // Get weight history
    const { data: weightData } = await supabase
        .from('weight_entries')
        .select('weight, recorded_at')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: true });

    // Get workouts this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: workoutData } = await supabase
        .from('workouts')
        .select('duration, calories_burned, completed')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('created_at', weekAgo.toISOString());

    // Get profile for streak
    const { data: profile } = await supabase
        .from('profiles')
        .select('streak')
        .eq('id', user.id)
        .single();

    const weights = weightData || [];
    const workouts = workoutData || [];

    const currentWeight = weights.length > 0
        ? Number(weights[weights.length - 1].weight)
        : 0;
    const startWeight = weights.length > 0
        ? Number(weights[0].weight)
        : currentWeight;

    return {
        currentWeight,
        weightChange: startWeight - currentWeight,
        streak: profile?.streak || 0,
        workoutsThisWeek: workouts.length,
        totalMinutesThisWeek: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
        caloriesBurnedThisWeek: workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0),
    };
}

// Get weekly activity data for chart
export async function getWeeklyActivity() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data } = await supabase
        .from('workouts')
        .select('created_at, duration, calories_burned')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('created_at', weekAgo.toISOString());

    // Group by day
    const activityByDay = new Map<string, { calories: number; minutes: number; workouts: number }>();

    // Initialize all days
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        activityByDay.set(dayName, { calories: 0, minutes: 0, workouts: 0 });
    }

    // Aggregate data
    (data || []).forEach((workout) => {
        const date = new Date(workout.created_at);
        const dayName = days[date.getDay()];
        const current = activityByDay.get(dayName) || { calories: 0, minutes: 0, workouts: 0 };
        activityByDay.set(dayName, {
            calories: current.calories + (workout.calories_burned || 0),
            minutes: current.minutes + (workout.duration || 0),
            workouts: current.workouts + 1,
        });
    });

    return Array.from(activityByDay.entries()).map(([date, stats]) => ({
        date,
        calories: stats.calories,
        minutes: stats.minutes,
        workoutsCompleted: stats.workouts,
    }));
}

// ============================================
// GAMIFICATION DATA FUNCTIONS
// ============================================

import type { Routine, RoutineExercise, DailyTask, TodaysRoutine, HeatmapDay, PlayerStats } from '@/types';

// Check if a routine is due on a given date
function isRoutineDue(startDate: string, frequencyDays: number, checkDate: Date = new Date()): boolean {
    const start = new Date(startDate);
    const diffTime = checkDate.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays % frequencyDays === 0;
}

// Get all routines for the current user
export async function getRoutines(): Promise<Routine[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching routines:', error);
        return [];
    }

    return data.map((r) => ({
        id: r.id,
        userId: r.user_id,
        name: r.name,
        description: r.description,
        frequencyDays: r.frequency_days,
        startDate: r.start_date,
        isActive: r.is_active,
        createdAt: r.created_at,
        workoutId: r.workout_id || null,
    }));
}

// Get routines with their linked workouts (and workout exercises)
export async function getRoutinesWithExercises(): Promise<Routine[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('routines')
        .select(`
      *,
      routine_exercises (*),
      workouts (
        id,
        title,
        description,
        exercises (*)
      )
    `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching routines with workouts:', error);
        return [];
    }

    return data.map((r) => {
        // Map the linked workout if it exists
        const linkedWorkout = r.workouts ? {
            id: r.workouts.id,
            title: r.workouts.title,
            description: r.workouts.description,
            completed: false,
            createdAt: '',
            exercises: (r.workouts.exercises || []).map((ex: {
                id: string;
                name: string;
                sets: number;
                target_sets: number;
                reps: number;
                target_reps: number;
                weight: number | null;
                order_index: number;
            }) => ({
                id: ex.id,
                name: ex.name,
                sets: ex.sets,
                targetSets: ex.target_sets,
                reps: ex.reps,
                targetReps: ex.target_reps,
                weight: ex.weight,
                orderIndex: ex.order_index,
            })),
        } : null;

        return {
            id: r.id,
            userId: r.user_id,
            name: r.name,
            description: r.description,
            frequencyDays: r.frequency_days,
            startDate: r.start_date,
            isActive: r.is_active,
            createdAt: r.created_at,
            workoutId: r.workout_id || null,
            workout: linkedWorkout,
            // Legacy: routine_exercises (deprecated, use workout.exercises instead)
            exercises: (r.routine_exercises || []).map((e: {
                id: string;
                routine_id: string;
                name: string;
                target_sets: number;
                target_reps: number;
                weight: number | null;
                order_index: number;
            }) => ({
                id: e.id,
                routineId: e.routine_id,
                name: e.name,
                targetSets: e.target_sets,
                targetReps: e.target_reps,
                weight: e.weight,
                orderIndex: e.order_index,
            })).sort((a: RoutineExercise, b: RoutineExercise) => a.orderIndex - b.orderIndex),
        };
    });
}

// Get exercise templates for a routine
export async function getRoutineExercises(routineId: string): Promise<RoutineExercise[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('routine_exercises')
        .select('*')
        .eq('routine_id', routineId)
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching routine exercises:', error);
        return [];
    }

    return data.map((e) => ({
        id: e.id,
        routineId: e.routine_id,
        name: e.name,
        targetSets: e.target_sets,
        targetReps: e.target_reps,
        weight: e.weight,
        orderIndex: e.order_index,
    }));
}

// Auto-hydration: Generate daily tasks from routine templates
// Priority: 1. Linked workout exercises, 2. Legacy routine_exercises
export async function generateDailyTasks(): Promise<void> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Use local date instead of UTC to avoid timezone issues
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayDate = now;

    console.log('[generateDailyTasks] ====== HYDRATION START ======');
    console.log('[generateDailyTasks] Local Date:', today);
    console.log('[generateDailyTasks] UTC Date:', new Date().toISOString().split('T')[0]);
    console.log('[generateDailyTasks] User ID:', user.id);

    // Get all active routines with linked workouts AND legacy exercises
    const { data: routines, error: routinesError } = await supabase
        .from('routines')
        .select(`
      *,
      routine_exercises (*),
      workouts (
        id,
        title,
        exercises (*)
      )
    `)
        .eq('user_id', user.id)
        .eq('is_active', true);

    if (routinesError) {
        console.error('[generateDailyTasks] ERROR fetching routines:', routinesError);
        return;
    }

    if (!routines || routines.length === 0) {
        console.log('[generateDailyTasks] No active routines found');
        return;
    }

    console.log('[generateDailyTasks] Found', routines.length, 'active routines');

    // Deep diagnostic: log raw routine data
    for (const r of routines) {
        console.log('[generateDailyTasks] RAW ROUTINE:', {
            id: r.id,
            name: r.name,
            workout_id: r.workout_id,
            hasWorkoutsJoin: !!r.workouts,
            workoutsData: r.workouts,
            workoutExercisesCount: r.workouts?.exercises?.length || 0,
            legacyExercisesCount: r.routine_exercises?.length || 0,
        });
    }

    // Get existing daily tasks for today
    const { data: existingTasks } = await supabase
        .from('daily_tasks')
        .select('routine_id')
        .eq('user_id', user.id)
        .eq('task_date', today);

    const existingRoutineIds = new Set((existingTasks || []).map(t => t.routine_id));
    console.log('[generateDailyTasks] Existing tasks for', existingRoutineIds.size, 'routines');

    // For each routine that's due today and doesn't have tasks yet
    for (const routine of routines) {
        const isDue = isRoutineDue(routine.start_date, routine.frequency_days, todayDate);
        const hasExistingTasks = existingRoutineIds.has(routine.id);

        console.log('[generateDailyTasks] Checking Routine:', routine.name,
            '| Start:', routine.start_date,
            '| Frequency:', routine.frequency_days,
            '| Is Match:', isDue,
            '| Has Tasks:', hasExistingTasks,
            '| Workout:', routine.workouts?.title || 'none');

        if (!isDue || hasExistingTasks) continue;

        // Get exercises: prefer linked workout, fallback to routine_exercises
        let exercisesToInsert: {
            id: string;
            name: string;
            target_sets: number;
            target_reps: number;
            weight: number | null;
        }[] = [];

        if (routine.workouts?.exercises && routine.workouts.exercises.length > 0) {
            // Use linked workout exercises (NEW way)
            exercisesToInsert = routine.workouts.exercises;
            console.log('[generateDailyTasks] Using workout exercises:', exercisesToInsert.length);
        } else if (routine.routine_exercises && routine.routine_exercises.length > 0) {
            // Fallback to legacy routine_exercises (OLD way)
            exercisesToInsert = routine.routine_exercises;
            console.log('[generateDailyTasks] Using legacy exercises:', exercisesToInsert.length);
        }

        if (exercisesToInsert.length === 0) {
            console.log('[generateDailyTasks] No exercises found for routine:', routine.name);
            continue;
        }

        // Bulk insert exercises as daily tasks
        // NOTE: Deliberately exclude exercise_template_id to bypass FK constraint
        // that references routine_exercises (we now use workouts.exercises)
        const tasksToInsert = exercisesToInsert.map((e) => ({
            user_id: user.id,
            routine_id: routine.id,
            // exercise_template_id intentionally omitted - FK references wrong table
            name: e.name,
            target_sets: e.target_sets,
            target_reps: e.target_reps,
            weight: e.weight,
            completed: false,
            task_date: today,
        }));

        console.log('[generateDailyTasks] Inserting', tasksToInsert.length, 'tasks for', routine.name);
        console.log('[generateDailyTasks] First task sample:', tasksToInsert[0]);

        const { data: insertedData, error: insertError } = await supabase
            .from('daily_tasks')
            .insert(tasksToInsert)
            .select();

        if (insertError) {
            console.error('[generateDailyTasks] INSERT ERROR:', insertError);
        } else {
            console.log('[generateDailyTasks] Successfully inserted', insertedData?.length || 0, 'tasks');
        }
    }

    console.log('[generateDailyTasks] ====== HYDRATION COMPLETE ======');
}

// Get today's daily tasks
export async function getDailyTasks(date?: string): Promise<DailyTask[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Use local date format to match generateDailyTasks
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const taskDate = date || localDate;

    console.log('[getDailyTasks] Fetching for date:', taskDate);

    const { data, error } = await supabase
        .from('daily_tasks')
        .select(`
      *,
      routines (name)
    `)
        .eq('user_id', user.id)
        .eq('task_date', taskDate)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching daily tasks:', error);
        return [];
    }

    return data.map((t) => ({
        id: t.id,
        userId: t.user_id,
        routineId: t.routine_id,
        exerciseTemplateId: t.exercise_template_id,
        name: t.name,
        targetSets: t.target_sets,
        targetReps: t.target_reps,
        weight: t.weight,
        completed: t.completed,
        taskDate: t.task_date,
        routineName: t.routines?.name,
    }));
}

// Get today's routines with their tasks (for dashboard)
export async function getTodaysRoutines(): Promise<TodaysRoutine[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Use local date to match generateDailyTasks
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayDate = now;

    // Get routines
    const { data: routines } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

    if (!routines) return [];

    // Get today's tasks
    const { data: dailyTasks } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_date', today);

    // Group tasks by routine
    const tasksByRoutine = new Map<string, DailyTask[]>();
    for (const task of (dailyTasks || [])) {
        const routineId = task.routine_id;
        if (!tasksByRoutine.has(routineId)) {
            tasksByRoutine.set(routineId, []);
        }
        tasksByRoutine.get(routineId)!.push({
            id: task.id,
            userId: task.user_id,
            routineId: task.routine_id,
            exerciseTemplateId: task.exercise_template_id,
            name: task.name,
            targetSets: task.target_sets,
            targetReps: task.target_reps,
            weight: task.weight,
            completed: task.completed,
            taskDate: task.task_date,
        });
    }

    // Return routines that are due today with their tasks
    return routines
        .filter((r) => isRoutineDue(r.start_date, r.frequency_days, todayDate))
        .map((r) => {
            const tasks = tasksByRoutine.get(r.id) || [];
            return {
                routine: {
                    id: r.id,
                    userId: r.user_id,
                    name: r.name,
                    description: r.description,
                    frequencyDays: r.frequency_days,
                    startDate: r.start_date,
                    isActive: r.is_active,
                    createdAt: r.created_at,
                    workoutId: r.workout_id || null,
                },
                tasks,
                allCompleted: tasks.length > 0 && tasks.every(t => t.completed),
            };
        });
}

// Get heatmap data for the last N days
export async function getHeatmapData(days: number = 365): Promise<HeatmapDay[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get routines
    const { data: routines } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user.id);

    // Get completions for the period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: completions } = await supabase
        .from('routine_completions')
        .select('completed_date')
        .eq('user_id', user.id)
        .gte('completed_date', startDate.toISOString().split('T')[0]);

    const completionSet = new Set(
        (completions || []).map((c) => c.completed_date)
    );

    const heatmapData: HeatmapDay[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Check if any routine was due this day
        const wasRoutineDue = (routines || []).some((r) =>
            isRoutineDue(r.start_date, r.frequency_days, date) &&
            new Date(r.start_date) <= date
        );

        const wasCompleted = completionSet.has(dateStr);
        const isFuture = date > today;

        let status: 'completed' | 'missed' | 'rest' | 'future';
        if (isFuture) {
            status = 'future';
        } else if (wasCompleted) {
            status = 'completed';
        } else if (wasRoutineDue) {
            status = 'missed';
        } else {
            status = 'rest';
        }

        heatmapData.push({
            date: dateStr,
            status,
            count: wasCompleted ? 1 : 0,
        });
    }

    return heatmapData;
}

// Calculate current streak
export async function calculateStreak(): Promise<number> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // Get routines and completions
    const { data: routines } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

    if (!routines || routines.length === 0) return 0;

    const { data: completions } = await supabase
        .from('routine_completions')
        .select('completed_date')
        .eq('user_id', user.id)
        .order('completed_date', { ascending: false });

    const completionSet = new Set(
        (completions || []).map((c) => c.completed_date)
    );

    let streak = 0;
    const today = new Date();

    // Go backwards from today
    for (let i = 0; i < 365; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Check if any routine was due this day
        const wasRoutineDue = routines.some((r) =>
            isRoutineDue(r.start_date, r.frequency_days, date) &&
            new Date(r.start_date) <= date
        );

        if (!wasRoutineDue) {
            // Rest day - continue checking
            continue;
        }

        const wasCompleted = completionSet.has(dateStr);

        if (wasCompleted) {
            streak++;
        } else {
            // Missed a due day - streak breaks
            break;
        }
    }

    return streak;
}

// Get player stats for radar chart
export async function getPlayerStats(): Promise<PlayerStats> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { consistency: 0, volume: 0, frequency: 0, experience: 0 };
    }

    // Get profile for account age
    const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single();

    // Get completions for frequency
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: weekCompletions } = await supabase
        .from('routine_completions')
        .select('id')
        .eq('user_id', user.id)
        .gte('completed_date', weekAgo.toISOString().split('T')[0]);

    // Get total completions
    const { count: totalCompletions } = await supabase
        .from('routine_completions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

    // Calculate streak
    const streak = await calculateStreak();

    // Calculate days since account creation
    const accountCreated = profile?.created_at ? new Date(profile.created_at) : new Date();
    const daysActive = Math.floor((Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));

    // Normalize stats to 0-100 scale
    const consistency = Math.min(100, streak * 10); // 10 day streak = 100%
    const volume = Math.min(100, (totalCompletions || 0) * 2); // 50 completions = 100%
    const frequency = Math.min(100, ((weekCompletions?.length || 0) / 7) * 100); // 7 workouts/week = 100%
    const experience = Math.min(100, daysActive); // 100 days = 100%

    return { consistency, volume, frequency, experience };
}
