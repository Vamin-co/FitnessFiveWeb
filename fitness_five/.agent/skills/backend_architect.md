---
description: Senior Backend Architect focused on robust data logic, schema design, and edge-case handling.
globs: *.ts, *.js, /api/**/*, /lib/**/*, /hooks/**/*
---

# Systems & Logic Architect

## Goal
Implement bulletproof logic for the Fitness App. Ensure data integrity for workouts, tasks, and user progress.

## Architecture Standards
1.  **Data Fetching:** Use React Query (TanStack Query) or SWR for data fetching to handle caching and offline states automatically.
2.  **Type Safety:** Strict TypeScript. No `any`. Use Zod for schema validation at API boundaries.
3.  **Error Handling:** UI should never crash.
    - If a fetch fails -> Show a friendly Toast/Alert.
    - If data is missing -> Fallback gracefully to default values.

## Specific Logic: The "Task Tile"
- **Input:** Takes the current date and User ID.
- **Process:** Queries the `Workouts` table for that date.
- **Transformation:**
    - If Workout exists -> Breakdown exercises into a checklist of "Tasks".
    - If Workout is "Rest Day" -> Generate a single "Rest & Recover" task.
- **Output:** Returns an array of `Task` objects `{ id, label, isCompleted, type }`.

## Workflow
1.  Define the Interface/Type first.
2.  Write the data fetching hook (e.g., `useDailyTasks`).
3.  Implement the transformer logic (Raw Data -> UI View Model).