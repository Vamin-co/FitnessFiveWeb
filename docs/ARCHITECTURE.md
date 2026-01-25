# Architecture

This document describes the technical architecture of FitnessFive, a fitness tracking web application.

---

## Table of Contents

- [Overview](#overview)
- [Application Architecture](#application-architecture)
- [Rendering Model](#rendering-model)
- [Routing](#routing)
- [Data Flow](#data-flow)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [State Management](#state-management)
- [Component Architecture](#component-architecture)

---

## Overview

FitnessFive is built using a modern full-stack architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Next.js 16 (App Router)                    ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ││
│  │  │   Pages/     │  │  Components  │  │    Zustand   │  ││
│  │  │   Layouts    │  │              │  │    Stores    │  ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Server Actions                          │
│           (lib/actions.ts, lib/data.ts)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Supabase                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │   Database   │  │      RLS     │      │
│  │  (Supabase)  │  │  (Postgres)  │  │   Policies   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Application Architecture

### Technology Choices

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 16 (App Router) | Server-side rendering, routing, API |
| Language | TypeScript | Type safety, developer experience |
| Styling | Tailwind CSS 4 | Utility-first CSS framework |
| Animations | Framer Motion | Declarative animations |
| Backend | Supabase | PostgreSQL database + Auth |
| State | Zustand | Client-side state management |
| Charts | Recharts | Data visualization |

### Key Directories

```
src/
├── app/           # Next.js App Router pages and layouts
├── components/    # Reusable React components
├── lib/           # Core business logic (actions, data fetching)
├── store/         # Zustand state stores
├── types/         # TypeScript type definitions
└── utils/         # Utility functions and helpers
```

---

## Rendering Model

FitnessFive uses a **hybrid rendering model** leveraging Next.js 16's App Router:

### Server Components (Default)

Most pages and data-fetching components are Server Components by default:

```tsx
// src/app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
    const data = await fetchData(); // Runs on server
    return <DashboardContent data={data} />;
}
```

**Benefits:**
- Data fetching happens on the server
- No client-side JavaScript for static content
- Better SEO and initial page load

### Client Components

Interactive components use the `"use client"` directive:

```tsx
// src/app/login/page.tsx
"use client";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    // Interactive form...
}
```

**Used for:**
- Forms with client-side validation
- Interactive animations (Framer Motion)
- State management (Zustand)
- Event handlers

### Server Actions

Mutations are handled via Server Actions:

```tsx
// src/lib/actions.ts
'use server';

export async function createWorkout(formData: {...}) {
    // Runs on server, accesses database directly
    const supabase = await createClient();
    // ...
}
```

---

## Routing

### Route Structure

FitnessFive uses Next.js App Router's file-based routing:

| Route | Page | Access |
|-------|------|--------|
| `/` | Landing page | Public |
| `/login` | Login form | Public |
| `/signup` | Registration form | Public |
| `/forgot-password` | Password reset request | Public |
| `/reset-password` | Password reset completion | Public |
| `/auth/callback` | Supabase auth callback | Public |
| `/onboarding` | New user setup | Protected |
| `/dashboard` | Main dashboard | Protected |
| `/workout` | Workout list | Protected |
| `/workout/new` | Create workout | Protected |
| `/routines` | Routine list | Protected |
| `/routines/new` | Create routine | Protected |
| `/profile` | User profile | Protected |
| `/leaderboard` | Community rankings | Protected |

### Route Protection

Protected routes are guarded at the page level:

```tsx
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/login");
    }
    
    // ... render dashboard
}
```

---

## Data Flow

### Read Path (Server → Client)

```
1. User visits /dashboard
2. Server Component renders
3. Data functions called (lib/data.ts)
4. Supabase client queries database
5. Data passed as props to client components
6. Client renders with data
```

### Write Path (Client → Server → Database)

```
1. User submits form
2. Form calls Server Action (lib/actions.ts)
3. Server Action validates input
4. Supabase client updates database
5. revalidatePath() triggers revalidation
6. Page re-renders with new data
```

### Data Fetching Functions

Located in `src/lib/data.ts`:

| Function | Purpose |
|----------|---------|
| `getProfile()` | Fetch current user's profile |
| `getWorkouts()` | Fetch user's workouts with exercises |
| `getWeightHistory()` | Fetch weight entries over time |
| `getLeaderboard()` | Fetch public leaderboard |
| `getDashboardStats()` | Calculate dashboard statistics |
| `getRoutines()` | Fetch user's routines |
| `getDailyTasks()` | Fetch today's tasks |
| `getHeatmapData()` | Fetch activity data for heatmap |
| `calculateStreak()` | Calculate current streak |

### Server Actions

Located in `src/lib/actions.ts`:

| Action | Purpose |
|--------|---------|
| `createWorkout()` | Create workout with exercises |
| `deleteWorkout()` | Delete a workout |
| `completeWorkout()` | Mark workout as complete |
| `logWeight()` | Log a weight entry |
| `createRoutine()` | Create a new routine |
| `completeRoutine()` | Mark routine as completed |
| `completeDailyTask()` | Mark daily task as done |
| `addWater()` | Log water intake |
| `updateProfile()` | Update user profile |
| `signOut()` | Sign out user |

---

## Authentication

### Auth Provider

Supabase Auth handles all authentication:

- Email/password authentication
- Session management via cookies
- Password reset via email

### Auth Flow

```
1. User signs up via /signup
2. Supabase creates auth.users entry
3. Database trigger creates profiles entry
4. User redirected to /onboarding
5. User completes profile setup
6. Redirect to /dashboard
```

### Supabase Clients

Two clients are used for different contexts:

```tsx
// Server-side (src/utils/supabase/server.ts)
export async function createClient() {
    const cookieStore = await cookies();
    return createServerClient(...);
}

// Client-side (src/utils/supabase/client.ts)
export function createClient() {
    return createBrowserClient(...);
}
```

---

## Database Schema

### Entity Relationship

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   profiles  │────<│  workouts   │────<│  exercises  │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ├───────────<│  routines   │────<│ routine_    │
       │            └─────────────┘     │ exercises   │
       │                   │            └─────────────┘
       │                   │
       │            ┌──────┴──────┐
       │            │   routine_  │
       │            │ completions │
       │            └─────────────┘
       │
       ├───────────<│ daily_tasks │
       │            └─────────────┘
       │
       ├───────────<│weight_entries│
       │            └─────────────┘
       │
       └───────────<│ water_intake │
                    └─────────────┘
```

### Key Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (extends auth.users) |
| `workouts` | Workout definitions |
| `exercises` | Exercises within workouts |
| `routines` | Recurring routine schedules |
| `routine_exercises` | Exercise templates in routines |
| `daily_tasks` | Auto-generated daily tasks |
| `routine_completions` | Routine completion records |
| `weight_entries` | Weight tracking history |
| `water_intake` | Daily water intake records |

### Row Level Security (RLS)

All tables have RLS policies ensuring users can only access their own data:

```sql
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
```

---

## State Management

### Server State

Primary data comes from Supabase via Server Components. Data is fetched fresh on each page load and passed as props.

### Client State

Zustand manages client-side state for:

- UI interactions
- Form state
- Optimistic updates

### Pattern

```tsx
// Server Component fetches data
const data = await getData();

// Pass to Client Component as props
<ClientComponent initialData={data} />

// Client Component can use Zustand for local state
const { isOpen, toggle } = useModalStore();
```

---

## Component Architecture

### Component Categories

| Category | Location | Purpose |
|----------|----------|---------|
| **Pages** | `src/app/*/page.tsx` | Route entry points, data fetching |
| **Dashboard Widgets** | `src/components/dashboard/` | Bento grid cards (stats, tasks, etc.) |
| **Charts** | `src/components/charts/` | Data visualizations |
| **UI Primitives** | `src/components/ui/` | Buttons, inputs, cards (Radix-based) |
| **Layout** | `src/components/layout/` | Sidebar, navigation |

### Key Dashboard Components

```
BentoGrid
├── StatCard (streak, weight, etc.)
├── DailyAgendaCard (today's tasks)
├── UpcomingScheduleCard (next routines)
├── WaterTrackerCard (hydration)
├── LogWeightCard (weight logging)
├── WeightChart (weight history)
├── HeatmapChart (activity heatmap)
└── LeaderboardCard (rankings)
```

### Component Patterns

1. **Server Component for Data**
   ```tsx
   // Fetches data, passes to client
   export default async function Page() {
       const data = await fetchData();
       return <ClientComponent data={data} />;
   }
   ```

2. **Client Component for Interaction**
   ```tsx
   "use client";
   export function ClientComponent({ data }) {
       const [state, setState] = useState(data);
       // Handle interactions...
   }
   ```

3. **Server Action for Mutations**
   ```tsx
   // In client component
   const handleSubmit = async () => {
       await serverAction(formData);
   };
   ```
