'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Create a new workout with exercises
export async function createWorkout(formData: {
    title: string;
    description?: string;
    exercises: {
        name: string;
        targetSets: number;
        targetReps: number;
        weight?: number;
    }[];
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Insert workout
    const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description,
        })
        .select()
        .single();

    if (workoutError) {
        return { error: workoutError.message };
    }

    // Insert exercises
    if (formData.exercises.length > 0) {
        const exercisesToInsert = formData.exercises.map((ex, index) => ({
            workout_id: workout.id,
            name: ex.name,
            target_sets: ex.targetSets,
            target_reps: ex.targetReps,
            weight: ex.weight,
            order_index: index,
        }));

        const { error: exerciseError } = await supabase
            .from('exercises')
            .insert(exercisesToInsert);

        if (exerciseError) {
            return { error: exerciseError.message };
        }
    }

    revalidatePath('/workout');
    revalidatePath('/dashboard');

    return { success: true, workoutId: workout.id };
}

// Delete a workout
export async function deleteWorkout(workoutId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/workout');
    revalidatePath('/dashboard');

    return { success: true };
}

// Complete a workout
export async function completeWorkout(workoutId: string, duration: number, caloriesBurned: number) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('workouts')
        .update({
            completed: true,
            completed_at: new Date().toISOString(),
            duration,
            calories_burned: caloriesBurned,
        })
        .eq('id', workoutId)
        .eq('user_id', user.id);

    if (error) {
        return { error: error.message };
    }

    // Update streak (would need an RPC function defined in Supabase)
    // For now, just increment streak manually
    const { data: profile } = await supabase
        .from('profiles')
        .select('streak')
        .eq('id', user.id)
        .single();

    if (profile) {
        await supabase
            .from('profiles')
            .update({ streak: (profile.streak || 0) + 1 })
            .eq('id', user.id);
    }

    revalidatePath('/workout');
    revalidatePath('/dashboard');
    revalidatePath('/leaderboard');

    return { success: true };
}

// Log weight
export async function logWeight(weight: number) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('weight_entries')
        .insert({
            user_id: user.id,
            weight,
        });

    if (error) {
        return { error: error.message };
    }

    // Also update current weight in profile
    await supabase
        .from('profiles')
        .update({ weight })
        .eq('id', user.id);

    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return { success: true };
}

// Update profile
export async function updateProfile(formData: {
    firstName?: string;
    lastName?: string;
    height?: number;
    age?: number;
    goals?: string[];
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    const updateData: Record<string, unknown> = {};
    if (formData.firstName !== undefined) updateData.first_name = formData.firstName;
    if (formData.lastName !== undefined) updateData.last_name = formData.lastName;
    if (formData.height !== undefined) updateData.height = formData.height;
    if (formData.age !== undefined) updateData.age = formData.age;
    if (formData.goals !== undefined) updateData.goals = formData.goals;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return { success: true };
}

// Sign out
export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
}

// ============================================
// GAMIFICATION SERVER ACTIONS
// ============================================

// Check if username is available
export async function checkUsernameAvailable(username: string): Promise<{ available: boolean; error?: string }> {
    const supabase = await createClient();

    // Validate username format
    if (!username || username.length < 3) {
        return { available: false, error: 'Username must be at least 3 characters' };
    }

    if (username.length > 20) {
        return { available: false, error: 'Username must be less than 20 characters' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { available: false, error: 'Username can only contain letters, numbers, and underscores' };
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .maybeSingle();

    if (error) {
        return { available: false, error: error.message };
    }

    return { available: !data };
}

// Complete onboarding - set username, height, weight
export async function completeOnboarding(formData: {
    username: string;
    height: number;
    weight: number;
    firstName?: string;
    lastName?: string;
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Check username availability first
    const { available, error: usernameError } = await checkUsernameAvailable(formData.username);
    if (!available) {
        return { success: false, error: usernameError || 'Username is taken' };
    }

    // Update profile
    const { error } = await supabase
        .from('profiles')
        .update({
            username: formData.username.toLowerCase(),
            height: formData.height,
            weight: formData.weight,
            first_name: formData.firstName,
            last_name: formData.lastName,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        // Check if it's a unique constraint violation
        if (error.code === '23505') {
            return { success: false, error: 'Username is already taken' };
        }
        return { success: false, error: error.message };
    }

    // Also log initial weight
    await supabase
        .from('weight_entries')
        .insert({
            user_id: user.id,
            weight: formData.weight,
        });

    revalidatePath('/dashboard');
    revalidatePath('/profile');
    revalidatePath('/onboarding');

    return { success: true };
}

// Create a new routine
export async function createRoutine(formData: {
    name: string;
    description?: string;
    frequencyDays: number;
    startDate?: string;
    workoutId?: string; // Link to existing workout
}): Promise<{ success: boolean; routineId?: string; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
        .from('routines')
        .insert({
            user_id: user.id,
            name: formData.name,
            description: formData.description,
            frequency_days: formData.frequencyDays,
            start_date: formData.startDate || new Date().toISOString().split('T')[0],
            workout_id: formData.workoutId || null,
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/routines');
    revalidatePath('/dashboard');

    return { success: true, routineId: data.id };
}

// Delete a routine
export async function deleteRoutine(routineId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', routineId)
        .eq('user_id', user.id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/routines');
    revalidatePath('/dashboard');

    return { success: true };
}

// Complete a routine for today
export async function completeRoutine(routineId: string, notes?: string, durationMinutes?: number): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
        .from('routine_completions')
        .insert({
            routine_id: routineId,
            user_id: user.id,
            completed_date: today,
            notes,
            duration_minutes: durationMinutes,
        });

    if (error) {
        // Check if already completed today
        if (error.code === '23505') {
            return { success: false, error: 'Already completed today' };
        }
        return { success: false, error: error.message };
    }

    // Update streak in profile
    const { calculateStreak } = await import('./data');
    const newStreak = await calculateStreak();

    await supabase
        .from('profiles')
        .update({ streak: newStreak })
        .eq('id', user.id);

    revalidatePath('/routines');
    revalidatePath('/dashboard');
    revalidatePath('/leaderboard');

    return { success: true };
}

// Uncomplete a routine (undo completion)
export async function uncompleteRoutine(completionId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('routine_completions')
        .delete()
        .eq('id', completionId)
        .eq('user_id', user.id);

    if (error) {
        return { success: false, error: error.message };
    }

    // Update streak
    const { calculateStreak } = await import('./data');
    const newStreak = await calculateStreak();

    await supabase
        .from('profiles')
        .update({ streak: newStreak })
        .eq('id', user.id);

    revalidatePath('/routines');
    revalidatePath('/dashboard');

    return { success: true };
}

// ============================================
// EXERCISE TEMPLATE ACTIONS
// ============================================

// Add exercise to a routine (template)
export async function addExerciseToRoutine(formData: {
    routineId: string;
    name: string;
    targetSets?: number;
    targetReps?: number;
    weight?: number;
}): Promise<{ success: boolean; exerciseId?: string; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get the current max order_index
    const { data: existing } = await supabase
        .from('routine_exercises')
        .select('order_index')
        .eq('routine_id', formData.routineId)
        .order('order_index', { ascending: false })
        .limit(1);

    const nextIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

    const { data, error } = await supabase
        .from('routine_exercises')
        .insert({
            routine_id: formData.routineId,
            name: formData.name,
            target_sets: formData.targetSets || 3,
            target_reps: formData.targetReps || 10,
            weight: formData.weight,
            order_index: nextIndex,
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/routines');
    revalidatePath('/dashboard');

    return { success: true, exerciseId: data.id };
}

// Remove exercise from routine
export async function removeExerciseFromRoutine(exerciseId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('routine_exercises')
        .delete()
        .eq('id', exerciseId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/routines');
    revalidatePath('/dashboard');

    return { success: true };
}

// Update exercise in routine
export async function updateExercise(
    exerciseId: string,
    updates: {
        name?: string;
        targetSets?: number;
        targetReps?: number;
        weight?: number;
    }
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.targetSets !== undefined) updateData.target_sets = updates.targetSets;
    if (updates.targetReps !== undefined) updateData.target_reps = updates.targetReps;
    if (updates.weight !== undefined) updateData.weight = updates.weight;

    const { error } = await supabase
        .from('routine_exercises')
        .update(updateData)
        .eq('id', exerciseId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/routines');

    return { success: true };
}

// ============================================
// DAILY TASK ACTIONS
// ============================================

// Complete a daily task (one-way - cannot be unchecked)
export async function completeDailyTask(taskId: string): Promise<{ success: boolean; completed?: boolean; alreadyCompleted?: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get current state
    const { data: task } = await supabase
        .from('daily_tasks')
        .select('completed, routine_id')
        .eq('id', taskId)
        .eq('user_id', user.id)
        .single();

    if (!task) {
        return { success: false, error: 'Task not found' };
    }

    // If already completed, don't do anything (one-way)
    if (task.completed) {
        return { success: true, completed: true, alreadyCompleted: true };
    }

    // Update the task to completed
    const { error } = await supabase
        .from('daily_tasks')
        .update({ completed: true })
        .eq('id', taskId)
        .eq('user_id', user.id);

    if (error) {
        return { success: false, error: error.message };
    }

    // Check if all tasks for this routine are now complete
    const today = new Date().toISOString().split('T')[0];
    const { data: allTasks } = await supabase
        .from('daily_tasks')
        .select('completed')
        .eq('user_id', user.id)
        .eq('routine_id', task.routine_id)
        .eq('task_date', today);

    const allComplete = allTasks && allTasks.every(t => t.completed);

    // If all tasks complete, update streak
    if (allComplete) {
        const { calculateStreak } = await import('./data');
        const newStreak = await calculateStreak();

        await supabase
            .from('profiles')
            .update({ streak: newStreak })
            .eq('id', user.id);
    }

    revalidatePath('/dashboard');
    revalidatePath('/routines');
    revalidatePath('/leaderboard');

    return { success: true, completed: true };
}

// Legacy alias for backwards compatibility - now just completes the task
export async function toggleDailyTask(taskId: string): Promise<{ success: boolean; completed?: boolean; error?: string }> {
    return completeDailyTask(taskId);
}

// Manually trigger task generation (for debug/recovery)
export async function triggerTaskGeneration(): Promise<{ success: boolean; tasksCreated: number; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, tasksCreated: 0, error: 'Not authenticated' };
    }

    // Import and run generateDailyTasks
    const { generateDailyTasks } = await import('./data');
    await generateDailyTasks();

    // Get count of tasks for today
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
        .from('daily_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('task_date', today);

    revalidatePath('/dashboard');
    revalidatePath('/routines');

    return { success: true, tasksCreated: count || 0 };
}

// ============================================
// WATER TRACKING ACTIONS
// ============================================

// Add water intake
export async function addWater(amountOz: number): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
        .from('water_intake')
        .insert({
            user_id: user.id,
            amount_oz: amountOz,
            recorded_at: today,
        });

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');

    return { success: true };
}

// Get today's water intake total
export async function getTodayWaterIntake(): Promise<{ total: number; target: number }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { total: 0, target: 128 };
    }

    const today = new Date().toISOString().split('T')[0];

    // Get today's intake
    const { data: intakeData } = await supabase
        .from('water_intake')
        .select('amount_oz')
        .eq('user_id', user.id)
        .eq('recorded_at', today);

    const total = intakeData?.reduce((sum, entry) => sum + entry.amount_oz, 0) || 0;

    // Get user's target
    const { data: profile } = await supabase
        .from('profiles')
        .select('water_target_oz')
        .eq('id', user.id)
        .single();

    const target = profile?.water_target_oz || 128;

    return { total, target };
}

// Update water target
export async function updateWaterTarget(targetOz: number): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('profiles')
        .update({ water_target_oz: targetOz })
        .eq('id', user.id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/profile');

    return { success: true };
}
