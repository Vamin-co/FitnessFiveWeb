import { createClient } from '@/utils/supabase/server';
import {
    formatDateInTimeZone,
    getDateRangeForTimeZone,
    getReadableDateLabel,
    getShortDateLabel,
} from '@/utils/quest-schedule';
import type {
    Achievement,
    GoalProgress,
    GoalStatus,
    GoalType,
    QuestDashboardData,
    QuestStatus,
    ScheduledQuest,
    TrainingPlan,
    WeekScheduleDay,
    WorkoutTemplate,
    WorkoutTemplateExercise,
} from '@/types';

const QUEST_SYNC_WINDOW_DAYS = 21;

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

interface ProfileContext {
    timezone: string;
    preferredWeightUnit: 'lbs' | 'kg';
}

interface SaveTrainingPlanInput {
    name: string;
    focusSummary?: string;
    weeklyTarget: number;
    timeZone?: string;
    assignments: Array<{
        workoutId: string;
        weekdays: number[];
    }>;
}

interface CreateGoalInput {
    goalType: GoalType;
    title: string;
    targetValue: number;
    unit: string;
    targetDate?: string;
}

function clampPercentage(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
}

async function getProfileContext(supabase: SupabaseClient, userId: string): Promise<ProfileContext> {
    const { data: profile } = await supabase
        .from('profiles')
        .select('timezone, preferred_weight_unit')
        .eq('id', userId)
        .single();

    return {
        timezone: profile?.timezone || 'UTC',
        preferredWeightUnit: profile?.preferred_weight_unit === 'kg' ? 'kg' : 'lbs',
    };
}

async function getActivePlanRecord(supabase: SupabaseClient, userId: string) {
    const { data } = await supabase
        .from('training_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .maybeSingle();

    return data;
}

function mapTrainingPlan(
    plan: Record<string, unknown>,
    templates: Array<Record<string, unknown>>,
    exercises: Array<Record<string, unknown>>,
    slots: Array<Record<string, unknown>>
): TrainingPlan {
    const exercisesByTemplate = new Map<string, WorkoutTemplateExercise[]>();
    for (const exercise of exercises) {
        const templateId = String(exercise.template_id);
        if (!exercisesByTemplate.has(templateId)) {
            exercisesByTemplate.set(templateId, []);
        }

        exercisesByTemplate.get(templateId)!.push({
            id: String(exercise.id),
            templateId,
            name: String(exercise.name),
            targetSets: Number(exercise.target_sets || 0),
            targetReps: Number(exercise.target_reps || 0),
            targetWeight: exercise.target_weight == null ? null : Number(exercise.target_weight),
            targetRpe: exercise.target_rpe == null ? null : Number(exercise.target_rpe),
            orderIndex: Number(exercise.order_index || 0),
        });
    }

    const slotsByTemplate = new Map<string, WorkoutTemplate['scheduleSlots']>();
    for (const slot of slots) {
        const templateId = String(slot.template_id);
        if (!slotsByTemplate.has(templateId)) {
            slotsByTemplate.set(templateId, []);
        }

        slotsByTemplate.get(templateId)!.push({
            id: String(slot.id),
            planId: String(slot.plan_id),
            templateId,
            weekday: Number(slot.weekday),
            label: slot.label == null ? null : String(slot.label),
            dueTime: slot.due_time == null ? null : String(slot.due_time),
            optional: Boolean(slot.optional),
            createdAt: String(slot.created_at),
        });
    }

    const mappedTemplates: WorkoutTemplate[] = templates
        .map((template) => ({
            id: String(template.id),
            userId: String(template.user_id),
            planId: String(template.plan_id),
            name: String(template.name),
            description: template.description == null ? null : String(template.description),
            focusArea: template.focus_area == null ? null : String(template.focus_area),
            isArchived: Boolean(template.is_archived),
            createdAt: String(template.created_at),
            updatedAt: String(template.updated_at),
            exercises: (exercisesByTemplate.get(String(template.id)) || []).sort((a, b) => a.orderIndex - b.orderIndex),
            scheduleSlots: (slotsByTemplate.get(String(template.id)) || []).sort((a, b) => a.weekday - b.weekday),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    return {
        id: String(plan.id),
        userId: String(plan.user_id),
        name: String(plan.name),
        focusSummary: plan.focus_summary == null ? null : String(plan.focus_summary),
        timezone: String(plan.timezone),
        startDate: String(plan.start_date),
        weeklyTarget: Number(plan.weekly_target || 0),
        active: Boolean(plan.active),
        createdAt: String(plan.created_at),
        updatedAt: String(plan.updated_at),
        templates: mappedTemplates,
    };
}

async function getScheduledQuestRows(
    supabase: SupabaseClient,
    userId: string,
    fromDate: string,
    toDate?: string
) {
    let query = supabase
        .from('scheduled_quests')
        .select('*')
        .eq('user_id', userId)
        .gte('due_date', fromDate)
        .order('due_date', { ascending: true });

    if (toDate) {
        query = query.lte('due_date', toDate);
    }

    const { data } = await query;
    return data || [];
}

async function mapScheduledQuests(
    supabase: SupabaseClient,
    questRows: Array<Record<string, unknown>>
): Promise<ScheduledQuest[]> {
    const templateIds = Array.from(new Set(questRows.map((quest) => String(quest.template_id))));
    const slotIds = Array.from(new Set(questRows.map((quest) => String(quest.schedule_slot_id))));

    const [{ data: templates }, { data: slots }, { data: templateExercises }] = await Promise.all([
        templateIds.length > 0
            ? supabase.from('workout_templates').select('id, name, focus_area').in('id', templateIds)
            : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
        slotIds.length > 0
            ? supabase.from('plan_schedule_slots').select('id, label').in('id', slotIds)
            : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
        templateIds.length > 0
            ? supabase.from('workout_template_exercises').select('template_id').in('template_id', templateIds)
            : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
    ]);

    const templateMap = new Map(
        (templates || []).map((template) => [
            String(template.id),
            {
                name: String(template.name),
                focusArea: template.focus_area == null ? null : String(template.focus_area),
            },
        ])
    );

    const slotMap = new Map(
        (slots || []).map((slot) => [String(slot.id), slot.label == null ? null : String(slot.label)])
    );

    const exerciseCountMap = new Map<string, number>();
    for (const exercise of templateExercises || []) {
        const templateId = String(exercise.template_id);
        exerciseCountMap.set(templateId, (exerciseCountMap.get(templateId) || 0) + 1);
    }

    return questRows.map((quest) => {
        const templateId = String(quest.template_id);
        const templateMeta = templateMap.get(templateId);
        const slotId = String(quest.schedule_slot_id);

        return {
            id: String(quest.id),
            userId: String(quest.user_id),
            planId: String(quest.plan_id),
            scheduleSlotId: slotId,
            templateId,
            dueDate: String(quest.due_date),
            status: String(quest.status) as QuestStatus,
            completionMode: quest.completion_mode == null ? null : String(quest.completion_mode) as ScheduledQuest['completionMode'],
            rewardXp: Number(quest.reward_xp || 0),
            streakCredit: Boolean(quest.streak_credit),
            notes: quest.notes == null ? null : String(quest.notes),
            rescheduledFrom: quest.rescheduled_from == null ? null : String(quest.rescheduled_from),
            completedAt: quest.completed_at == null ? null : String(quest.completed_at),
            createdAt: String(quest.created_at),
            updatedAt: String(quest.updated_at),
            completedSessionId: quest.completed_session_id == null ? null : String(quest.completed_session_id),
            templateName: templateMeta?.name || 'Quest',
            focusArea: templateMeta?.focusArea || null,
            scheduleLabel: slotMap.get(slotId) || null,
            exerciseCount: exerciseCountMap.get(templateId) || 0,
        };
    });
}

async function updateLegacyStreakMirror(
    supabase: SupabaseClient,
    userId: string,
    streak: number
): Promise<void> {
    await supabase
        .from('profiles')
        .update({ streak, updated_at: new Date().toISOString() })
        .eq('id', userId);
}

function isGoalAchieved(goalType: GoalType, currentValue: number, targetValue: number): boolean {
    if (goalType === 'body_weight') {
        return currentValue <= targetValue;
    }

    return currentValue >= targetValue;
}

async function getCurrentGoalMetrics(
    supabase: SupabaseClient,
    userId: string,
    timezone: string
) {
    const today = formatDateInTimeZone(new Date(), timezone);
    const weekWindow = getDateRangeForTimeZone(new Date(), 7, timezone);
    const weekStart = weekWindow[0]?.dateString || today;
    const adherenceWindow = getDateRangeForTimeZone(new Date(Date.now() - 27 * 24 * 60 * 60 * 1000), 28, timezone);
    const adherenceStart = adherenceWindow[0]?.dateString || today;

    const [{ data: latestWeight }, { count: completedThisWeek }, { data: adherenceQuests }] = await Promise.all([
        supabase
            .from('weight_entries')
            .select('weight')
            .eq('user_id', userId)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        supabase
            .from('scheduled_quests')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'completed')
            .gte('due_date', weekStart)
            .lte('due_date', today),
        supabase
            .from('scheduled_quests')
            .select('status')
            .eq('user_id', userId)
            .gte('due_date', adherenceStart)
            .lte('due_date', today),
    ]);

    const streak = await calculateQuestStreak(userId);
    const adherenceRows = adherenceQuests || [];
    const totalDue = adherenceRows.length;
    const completedDue = adherenceRows.filter((quest) => quest.status === 'completed').length;

    return {
        currentWeight: latestWeight?.weight == null ? 0 : Number(latestWeight.weight),
        streak,
        sessionsPerWeek: completedThisWeek || 0,
        adherence: totalDue > 0 ? (completedDue / totalDue) * 100 : 0,
    };
}

async function syncGoalStatusesWithMetrics(
    supabase: SupabaseClient,
    userId: string,
    timezone: string
): Promise<void> {
    const { data: goals } = await supabase
        .from('goals_v2')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'achieved']);

    if (!goals || goals.length === 0) {
        return;
    }

    const metrics = await getCurrentGoalMetrics(supabase, userId, timezone);
    const updates = goals
        .map((goal) => {
            const goalType = String(goal.goal_type) as GoalType;
            const currentValue =
                goalType === 'body_weight'
                    ? metrics.currentWeight
                    : goalType === 'streak_days'
                        ? metrics.streak
                        : goalType === 'sessions_per_week'
                            ? metrics.sessionsPerWeek
                            : metrics.adherence;
            const achieved = isGoalAchieved(goalType, currentValue, Number(goal.target_value));
            const nextStatus: GoalStatus = achieved ? 'achieved' : 'active';

            if (goal.status === nextStatus) {
                return null;
            }

            return {
                id: goal.id,
                status: nextStatus,
                updated_at: new Date().toISOString(),
            };
        })
        .filter(Boolean) as Array<{ id: string; status: GoalStatus; updated_at: string }>;

    for (const update of updates) {
        await supabase
            .from('goals_v2')
            .update({
                status: update.status,
                updated_at: update.updated_at,
            })
            .eq('id', update.id)
            .eq('user_id', userId);
    }
}

async function syncAchievementsForUser(
    supabase: SupabaseClient,
    userId: string,
    streak: number
): Promise<void> {
    const [{ data: existing }, { count: completedQuestCount }, { count: prCount }] = await Promise.all([
        supabase
            .from('user_achievements')
            .select('achievement_id')
            .eq('user_id', userId),
        supabase
            .from('scheduled_quests')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'completed'),
        supabase
            .from('progress_events')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('event_type', 'personal_record'),
    ]);

    const earnedIds = new Set((existing || []).map((row) => String(row.achievement_id)));
    const unlockedAt = new Date().toISOString();

    const unlockCandidates = [
        completedQuestCount && completedQuestCount >= 1 ? 'first-quest' : null,
        streak >= 7 ? 'streak-7' : null,
        prCount && prCount >= 1 ? 'pr-hunter' : null,
    ];
    const unlocks = unlockCandidates.filter((achievementId): achievementId is string =>
        achievementId !== null && !earnedIds.has(achievementId)
    );

    if (unlocks.length === 0) {
        return;
    }

    const rows = unlocks.map((achievementId) => ({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: unlockedAt,
        metadata: {},
    }));

    await supabase
        .from('user_achievements')
        .upsert(rows, { onConflict: 'user_id,achievement_id' });

    await supabase
        .from('progress_events')
        .insert(
            unlocks.map((achievementId) => ({
                user_id: userId,
                event_type: 'achievement_unlocked',
                points: 25,
                metadata: { achievementId },
            }))
        );
}

async function syncDerivedProgressStateInternal(
    supabase: SupabaseClient,
    userId: string
): Promise<number> {
    const { timezone } = await getProfileContext(supabase, userId);
    const streak = await calculateQuestStreak(userId);
    await updateLegacyStreakMirror(supabase, userId, streak);
    await syncGoalStatusesWithMetrics(supabase, userId, timezone);
    await syncAchievementsForUser(supabase, userId, streak);
    return streak;
}

export async function getActiveTrainingPlan(userId?: string): Promise<TrainingPlan | null> {
    const supabase = await createClient();

    if (!userId) {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return null;
        }

        userId = user.id;
    }

    const plan = await getActivePlanRecord(supabase, userId);
    if (!plan) {
        return null;
    }

    const [{ data: templates }, { data: slots }] = await Promise.all([
        supabase
            .from('workout_templates')
            .select('*')
            .eq('plan_id', String(plan.id))
            .eq('user_id', userId)
            .order('created_at', { ascending: true }),
        supabase
            .from('plan_schedule_slots')
            .select('*')
            .eq('plan_id', String(plan.id))
            .order('weekday', { ascending: true }),
    ]);

    const templateIds = (templates || []).map((template) => String(template.id));
    const { data: exercises } = templateIds.length > 0
        ? await supabase
            .from('workout_template_exercises')
            .select('*')
            .in('template_id', templateIds)
            .order('order_index', { ascending: true })
        : { data: [] as Array<Record<string, unknown>> };

    return mapTrainingPlan(
        plan as Record<string, unknown>,
        (templates || []) as Array<Record<string, unknown>>,
        (exercises || []) as Array<Record<string, unknown>>,
        (slots || []) as Array<Record<string, unknown>>
    );
}

export async function syncScheduledQuests(userId?: string): Promise<number> {
    const supabase = await createClient();

    if (!userId) {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return 0;
        }

        userId = user.id;
    }

    const plan = await getActiveTrainingPlan(userId);
    if (!plan) {
        return 0;
    }

    const today = formatDateInTimeZone(new Date(), plan.timezone);
    const range = getDateRangeForTimeZone(new Date(), QUEST_SYNC_WINDOW_DAYS, plan.timezone);
    const endDate = range[range.length - 1]?.dateString || today;
    const scheduleSlots = plan.templates.flatMap((template) =>
        template.scheduleSlots.map((slot) => ({
            id: slot.id,
            templateId: template.id,
            title: template.name,
            optional: slot.optional,
            weekday: slot.weekday,
        }))
    );

    if (scheduleSlots.length === 0) {
        return 0;
    }

    const existingRows = await getScheduledQuestRows(supabase, userId, today, endDate);
    const existingKeys = new Set(existingRows.map((quest) => `${quest.schedule_slot_id}:${quest.due_date}`));

    const rowsToInsert = range.flatMap(({ dateString, weekday }) =>
        scheduleSlots
            .filter((slot) => slot.weekday === weekday)
            .map((slot) => ({
                user_id: userId,
                plan_id: plan.id,
                schedule_slot_id: slot.id,
                template_id: slot.templateId,
                due_date: dateString,
                status: 'scheduled',
                reward_xp: slot.optional ? 60 : 100,
                streak_credit: !slot.optional,
            }))
            .filter((row) => !existingKeys.has(`${row.schedule_slot_id}:${row.due_date}`))
    );

    await supabase
        .from('scheduled_quests')
        .update({
            status: 'missed',
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .lt('due_date', today)
        .in('status', ['scheduled', 'in_progress']);

    if (rowsToInsert.length > 0) {
        await supabase
            .from('scheduled_quests')
            .upsert(rowsToInsert, { onConflict: 'user_id,schedule_slot_id,due_date' });
    }

    return rowsToInsert.length;
}

export async function calculateQuestStreak(userId?: string): Promise<number> {
    const supabase = await createClient();

    if (!userId) {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return 0;
        }

        userId = user.id;
    }

    const plan = await getActiveTrainingPlan(userId);
    if (!plan) {
        return 0;
    }

    const range = getDateRangeForTimeZone(new Date(Date.now() - 364 * 24 * 60 * 60 * 1000), 365, plan.timezone);
    const startDate = range[0]?.dateString || plan.startDate;
    const questRows = await getScheduledQuestRows(supabase, userId, startDate);
    const questsByDate = new Map<string, QuestStatus[]>();

    for (const quest of questRows) {
        const date = String(quest.due_date);
        if (!questsByDate.has(date)) {
            questsByDate.set(date, []);
        }

        questsByDate.get(date)!.push(String(quest.status) as QuestStatus);
    }

    let streak = 0;
    const reversedRange = [...range].reverse();
    for (const { dateString } of reversedRange) {
        const statuses = questsByDate.get(dateString);
        if (!statuses || statuses.length === 0) {
            continue;
        }

        const allCompleted = statuses.every((status) => status === 'completed');
        if (!allCompleted) {
            break;
        }

        streak += 1;
    }

    return streak;
}

export async function getQuestDashboardData(userId?: string): Promise<QuestDashboardData> {
    const supabase = await createClient();

    if (!userId) {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                plan: null,
                today: formatDateInTimeZone(new Date(), 'UTC'),
                timezone: 'UTC',
                todayQuests: [],
                weekSchedule: [],
                streak: 0,
            };
        }

        userId = user.id;
    }

    const { timezone } = await getProfileContext(supabase, userId);
    const plan = await getActiveTrainingPlan(userId);
    const today = formatDateInTimeZone(new Date(), plan?.timezone || timezone);

    if (!plan) {
        return {
            plan: null,
            today,
            timezone,
            todayQuests: [],
            weekSchedule: [],
            streak: 0,
        };
    }

    await syncScheduledQuests(userId);

    const range = getDateRangeForTimeZone(new Date(), 7, plan.timezone);
    const startDate = range[0]?.dateString || today;
    const endDate = range[range.length - 1]?.dateString || today;
    const weekQuestRows = await getScheduledQuestRows(supabase, userId, startDate, endDate);
    const mappedWeekQuests = await mapScheduledQuests(supabase, weekQuestRows as Array<Record<string, unknown>>);
    const todayQuests = mappedWeekQuests.filter((quest) => quest.dueDate === today);
    const questsByDate = new Map<string, ScheduledQuest[]>();

    for (const quest of mappedWeekQuests) {
        if (!questsByDate.has(quest.dueDate)) {
            questsByDate.set(quest.dueDate, []);
        }

        questsByDate.get(quest.dueDate)!.push(quest);
    }

    const weekSchedule: WeekScheduleDay[] = range.map(({ date, dateString }) => ({
        date: dateString,
        label: getReadableDateLabel(date, plan.timezone),
        shortLabel: getShortDateLabel(date, plan.timezone, today),
        isToday: dateString === today,
        quests: (questsByDate.get(dateString) || []).map((quest) => ({
            id: quest.id,
            title: quest.templateName,
            status: quest.status,
            xp: quest.rewardXp,
        })),
    }));

    const streak = await syncDerivedProgressStateInternal(supabase, userId);

    return {
        plan,
        today,
        timezone: plan.timezone,
        todayQuests,
        weekSchedule,
        streak,
    };
}

export async function getAchievements(userId?: string): Promise<Achievement[]> {
    const supabase = await createClient();

    if (!userId) {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return [];
        }

        userId = user.id;
    }

    const [{ data: definitions }, { data: unlocked }] = await Promise.all([
        supabase
            .from('achievement_definitions')
            .select('*')
            .order('title', { ascending: true }),
        supabase
            .from('user_achievements')
            .select('achievement_id, unlocked_at, metadata')
            .eq('user_id', userId),
    ]);

    const unlockedMap = new Map(
        (unlocked || []).map((entry) => [
            String(entry.achievement_id),
            {
                unlockedAt: entry.unlocked_at == null ? null : String(entry.unlocked_at),
                metadata: (entry.metadata as Record<string, unknown>) || {},
            },
        ])
    );

    return (definitions || []).map((definition) => {
        const achievementId = String(definition.id);
        const unlockedEntry = unlockedMap.get(achievementId);

        return {
            id: achievementId,
            title: String(definition.title),
            description: String(definition.description),
            threshold: Number(definition.threshold || 1),
            earned: Boolean(unlockedEntry),
            unlockedAt: unlockedEntry?.unlockedAt || null,
            metadata: unlockedEntry?.metadata || {},
        };
    });
}

export async function getGoalProgress(userId?: string): Promise<GoalProgress[]> {
    const supabase = await createClient();

    if (!userId) {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return [];
        }

        userId = user.id;
    }

    const { timezone } = await getProfileContext(supabase, userId);
    await syncGoalStatusesWithMetrics(supabase, userId, timezone);

    const { data: goals } = await supabase
        .from('goals_v2')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'achieved'])
        .order('created_at', { ascending: false });

    if (!goals || goals.length === 0) {
        return [];
    }

    const metrics = await getCurrentGoalMetrics(supabase, userId, timezone);

    return goals.map((goal) => {
        const goalType = String(goal.goal_type) as GoalType;
        const currentValue =
            goalType === 'body_weight'
                ? metrics.currentWeight
                : goalType === 'streak_days'
                    ? metrics.streak
                    : goalType === 'sessions_per_week'
                        ? metrics.sessionsPerWeek
                        : metrics.adherence;
        const achieved = isGoalAchieved(goalType, currentValue, Number(goal.target_value));
        const rawProgress =
            goalType === 'body_weight' && Number(goal.target_value) > 0
                ? (Number(goal.target_value) / Math.max(currentValue || 1, Number(goal.target_value))) * 100
                : (currentValue / Math.max(Number(goal.target_value), 1)) * 100;

        return {
            id: String(goal.id),
            userId: String(goal.user_id),
            goalType,
            title: String(goal.title),
            targetValue: Number(goal.target_value),
            unit: String(goal.unit),
            startDate: String(goal.start_date),
            targetDate: goal.target_date == null ? null : String(goal.target_date),
            status: String(goal.status) as GoalStatus,
            createdAt: String(goal.created_at),
            updatedAt: String(goal.updated_at),
            currentValue,
            progressPercent: achieved ? 100 : clampPercentage(rawProgress),
            achieved,
        };
    });
}

export async function saveTrainingPlanDraft(input: SaveTrainingPlanInput): Promise<{ planId: string }> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const cleanedAssignments = input.assignments
        .map((assignment) => ({
            workoutId: assignment.workoutId,
            weekdays: Array.from(new Set(assignment.weekdays)).sort((a, b) => a - b),
        }))
        .filter((assignment) => assignment.workoutId && assignment.weekdays.length > 0);

    if (cleanedAssignments.length === 0) {
        throw new Error('Add at least one workout with at least one scheduled day.');
    }

    const { timezone: profileTimezone } = await getProfileContext(supabase, user.id);
    const timeZone = input.timeZone || profileTimezone;
    const workoutIds = cleanedAssignments.map((assignment) => assignment.workoutId);
    const { data: workouts } = await supabase
        .from('workouts')
        .select(`
            *,
            exercises (*)
        `)
        .eq('user_id', user.id)
        .in('id', workoutIds);

    if (!workouts || workouts.length !== workoutIds.length) {
        throw new Error('One or more selected workouts could not be found.');
    }

    await supabase
        .from('profiles')
        .update({
            timezone: timeZone,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    await supabase
        .from('training_plans')
        .update({
            active: false,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('active', true);

    const today = formatDateInTimeZone(new Date(), timeZone);
    const { data: plan, error: planError } = await supabase
        .from('training_plans')
        .insert({
            user_id: user.id,
            name: input.name,
            focus_summary: input.focusSummary || null,
            timezone: timeZone,
            start_date: today,
            weekly_target: input.weeklyTarget,
            active: true,
        })
        .select()
        .single();

    if (planError || !plan) {
        throw new Error(planError?.message || 'Unable to save training plan.');
    }

    const workoutMap = new Map(workouts.map((workout) => [String(workout.id), workout]));
    for (const assignment of cleanedAssignments) {
        const workout = workoutMap.get(assignment.workoutId);
        if (!workout) {
            continue;
        }

        const { data: template, error: templateError } = await supabase
            .from('workout_templates')
            .insert({
                user_id: user.id,
                plan_id: plan.id,
                name: workout.title,
                description: workout.description,
                focus_area: workout.description,
            })
            .select()
            .single();

        if (templateError || !template) {
            throw new Error(templateError?.message || 'Unable to save workout template.');
        }

        const workoutExercises = (workout.exercises || []) as Array<Record<string, unknown>>;
        if (workoutExercises.length > 0) {
            await supabase
                .from('workout_template_exercises')
                .insert(
                    workoutExercises.map((exercise) => ({
                        template_id: template.id,
                        name: exercise.name,
                        target_sets: Number(exercise.target_sets || 0),
                        target_reps: Number(exercise.target_reps || 0),
                        target_weight: exercise.weight == null ? null : Number(exercise.weight),
                        order_index: Number(exercise.order_index || 0),
                    }))
                );
        }

        await supabase
            .from('plan_schedule_slots')
            .insert(
                assignment.weekdays.map((weekday) => ({
                    plan_id: plan.id,
                    template_id: template.id,
                    weekday,
                    label: workout.title,
                }))
            );
    }

    await syncScheduledQuests(user.id);

    return { planId: String(plan.id) };
}

export async function createGoalRecord(input: CreateGoalInput): Promise<{ goalId: string }> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const { data: goal, error } = await supabase
        .from('goals_v2')
        .insert({
            user_id: user.id,
            goal_type: input.goalType,
            title: input.title,
            target_value: input.targetValue,
            unit: input.unit,
            target_date: input.targetDate || null,
        })
        .select()
        .single();

    if (error || !goal) {
        throw new Error(error?.message || 'Unable to create goal.');
    }

    const { timezone } = await getProfileContext(supabase, user.id);
    await syncGoalStatusesWithMetrics(supabase, user.id, timezone);

    return { goalId: String(goal.id) };
}

export async function completeScheduledQuest(questId: string): Promise<{ alreadyCompleted: boolean; streak: number }> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const { data: quest, error: questError } = await supabase
        .from('scheduled_quests')
        .select('*')
        .eq('id', questId)
        .eq('user_id', user.id)
        .single();

    if (questError || !quest) {
        throw new Error('Quest not found.');
    }

    if (quest.status === 'completed') {
        const streak = await calculateQuestStreak(user.id);
        return { alreadyCompleted: true, streak };
    }

    const [{ data: template }, { data: templateExercises }, { data: existingSession }] = await Promise.all([
        supabase
            .from('workout_templates')
            .select('id, name')
            .eq('id', quest.template_id)
            .single(),
        supabase
            .from('workout_template_exercises')
            .select('*')
            .eq('template_id', quest.template_id)
            .order('order_index', { ascending: true }),
        supabase
            .from('workout_sessions')
            .select('*')
            .eq('quest_id', quest.id)
            .maybeSingle(),
    ]);

    const now = new Date().toISOString();
    const { data: session, error: sessionError } = existingSession
        ? await supabase
            .from('workout_sessions')
            .update({
                status: 'completed',
                completed_at: now,
                xp_awarded: Number(quest.reward_xp || 0),
                updated_at: now,
            })
            .eq('id', existingSession.id)
            .select()
            .single()
        : await supabase
            .from('workout_sessions')
            .insert({
                user_id: user.id,
                quest_id: quest.id,
                template_id: quest.template_id,
                title: template?.name || 'Quest Session',
                status: 'completed',
                started_at: now,
                completed_at: now,
                xp_awarded: Number(quest.reward_xp || 0),
            })
            .select()
            .single();

    if (sessionError || !session) {
        throw new Error(sessionError?.message || 'Unable to save workout session.');
    }

    const { data: existingSessionExercises } = await supabase
        .from('session_exercises')
        .select('id, template_exercise_id')
        .eq('session_id', session.id);

    let sessionExercises = existingSessionExercises || [];
    if (sessionExercises.length === 0 && templateExercises && templateExercises.length > 0) {
        const { data: insertedSessionExercises, error: sessionExercisesError } = await supabase
            .from('session_exercises')
            .insert(
                templateExercises.map((exercise) => ({
                    session_id: session.id,
                    template_exercise_id: exercise.id,
                    name: exercise.name,
                    order_index: exercise.order_index,
                }))
            )
            .select();

        if (sessionExercisesError) {
            throw new Error(sessionExercisesError.message);
        }

        sessionExercises = insertedSessionExercises || [];
    }

    const { count: existingSetCount } = await supabase
        .from('set_logs')
        .select('id', { count: 'exact', head: true })
        .in('session_exercise_id', sessionExercises.map((exercise) => exercise.id));

    if ((existingSetCount || 0) === 0 && sessionExercises.length > 0) {
        const templateExerciseMap = new Map(
            (templateExercises || []).map((exercise) => [String(exercise.id), exercise])
        );
        const setRows = sessionExercises.flatMap((sessionExercise) => {
            const templateExercise = templateExerciseMap.get(String(sessionExercise.template_exercise_id));
            const targetSets = Number(templateExercise?.target_sets || 0);

            return Array.from({ length: targetSets }, (_, setIndex) => ({
                session_exercise_id: sessionExercise.id,
                set_index: setIndex,
                reps: templateExercise?.target_reps == null ? null : Number(templateExercise.target_reps),
                weight: templateExercise?.target_weight == null ? null : Number(templateExercise.target_weight),
                rpe: templateExercise?.target_rpe == null ? null : Number(templateExercise.target_rpe),
                completed: true,
                is_personal_record: false,
            }));
        });

        if (setRows.length > 0) {
            await supabase
                .from('set_logs')
                .insert(setRows);
        }
    }

    await Promise.all([
        supabase
            .from('scheduled_quests')
            .update({
                status: 'completed',
                completion_mode: 'full',
                completed_at: now,
                completed_session_id: session.id,
                updated_at: now,
            })
            .eq('id', quest.id)
            .eq('user_id', user.id),
        supabase
            .from('progress_events')
            .insert([
                {
                    user_id: user.id,
                    event_type: 'quest_completed',
                    quest_id: quest.id,
                    session_id: session.id,
                    points: 0,
                    metadata: {
                        templateId: quest.template_id,
                    },
                },
                {
                    user_id: user.id,
                    event_type: 'session_completed',
                    quest_id: quest.id,
                    session_id: session.id,
                    points: 0,
                    metadata: {
                        templateId: quest.template_id,
                    },
                },
                {
                    user_id: user.id,
                    event_type: 'xp_awarded',
                    quest_id: quest.id,
                    session_id: session.id,
                    points: Number(quest.reward_xp || 0),
                    metadata: {
                        rewardXp: Number(quest.reward_xp || 0),
                    },
                },
            ]),
    ]);

    const streak = await syncDerivedProgressStateInternal(supabase, user.id);
    return { alreadyCompleted: false, streak };
}

export async function rescheduleScheduledQuest(questId: string): Promise<void> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const { data: quest, error } = await supabase
        .from('scheduled_quests')
        .select('*')
        .eq('id', questId)
        .eq('user_id', user.id)
        .single();

    if (error || !quest) {
        throw new Error('Quest not found.');
    }

    if (quest.status === 'completed') {
        throw new Error('Completed quests cannot be rescheduled.');
    }

    const { timezone } = await getProfileContext(supabase, user.id);
    const tomorrowRange = getDateRangeForTimeZone(new Date(Date.now() + 24 * 60 * 60 * 1000), 1, timezone);
    const targetDate = tomorrowRange[0]?.dateString || quest.due_date;
    const now = new Date().toISOString();

    await supabase
        .from('scheduled_quests')
        .update({
            status: 'skipped',
            completion_mode: 'rescheduled',
            streak_credit: false,
            updated_at: now,
        })
        .eq('id', quest.id)
        .eq('user_id', user.id);

    await supabase
        .from('scheduled_quests')
        .upsert({
            user_id: user.id,
            plan_id: quest.plan_id,
            schedule_slot_id: quest.schedule_slot_id,
            template_id: quest.template_id,
            due_date: targetDate,
            status: 'scheduled',
            reward_xp: quest.reward_xp,
            streak_credit: quest.streak_credit,
            rescheduled_from: quest.due_date,
        }, { onConflict: 'user_id,schedule_slot_id,due_date' });

    await supabase
        .from('progress_events')
        .insert({
            user_id: user.id,
            event_type: 'quest_rescheduled',
            quest_id: quest.id,
            points: 0,
            metadata: {
                from: quest.due_date,
                to: targetDate,
            },
        });
}

export async function syncDerivedProgressState(): Promise<number> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return 0;
    }

    return syncDerivedProgressStateInternal(supabase, user.id);
}
