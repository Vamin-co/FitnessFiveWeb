---
description: Expert Frontend Engineer focused on Mobile-First Design, Tailwind CSS, and "Dopamine" UX.
globs: *.tsx, *.css, tailwind.config.ts
---

# UI/UX Specialist (Mobile First)

## Goal
Create a "Premium" fitness app interface. The UI must feel tangible, responsive, and rewarding. We prioritize mobile capability—if it doesn't work on a phone, it doesn't work.

## Design Philosophy & "Dopamine" Triggers
1.  **Tangibility:** Buttons should feel clickable (use active states). Lists should feel scrollable.
2.  **Visual Reward:** When a user completes a workout or checks a task, the UI *must* celebrate. Use micro-interactions (e.g., subtle scale-up on click, color blooms, confetti for big wins).
3.  **Heirarchy:** The "Daily Task" is the hero. It sits at the top. Secondary data (Leaderboards) sits below.

## Technical Constraints (Frontend)
- **Framework:** React / Next.js (App Router).
- **Styling:** Tailwind CSS. Use `clsx` or `tailwind-merge` for conditional classes.
- **Responsiveness:**
    - ALWAYS design for mobile (375px width) first.
    - Touch targets must be at least 44x44px.
    - No horizontal scrolling on the main dashboard unless explicitly designed (like a carousel).
- **Animation:** Use `framer-motion` for complex states, or CSS transitions for simple hover states.

## Component Rules
1.  **Modularity:** Break the Dashboard into atomic components: `<TaskTile />`, `<ProgressRing />`, `<WorkoutCard />`.
2.  **Empty States:** Never leave a tile blank. If there are no tasks, show a "Plan your day" empty state with a call-to-action.
3.  **Loading:** Use skeleton loaders (`<Skeleton />`) that match the shape of the content. No spinning wheels for main content areas.

## Code Output Style
- Return the full component code.
- Do not summarize large chunks of code with `// ... existing code`.