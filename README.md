# FitnessFive

A beautifully designed fitness tracking web application that helps users build consistent workout habits through daily task management, streak tracking, and community leaderboards.

**Live Demo**: [fitness-five-web.vercel.app](https://fitness-five-web.vercel.app)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [References](#references)

---

## Overview

FitnessFive is a web-based fitness tracking application designed to make building healthy habits simple and motivating. Users can:

- Create custom workout routines with exercises
- Track daily fitness tasks generated from routines
- Monitor weight and hydration over time
- Build and maintain workout streaks
- Compete with others on a community leaderboard

The application uses a modern bento-grid dashboard design with smooth animations and a dark theme optimized for the fitness audience.

---

## Features

| Feature | Description |
|---------|-------------|
| **Smart Dashboard** | Bento-grid layout showing daily tasks, upcoming routines, stats, and streaks |
| **Routine Management** | Create recurring workout routines with customizable frequency |
| **Daily Task Generation** | Automatic task creation from routines based on schedule |
| **Workout Tracking** | Define workouts with exercises, sets, reps, and weights |
| **Weight Tracking** | Log and visualize weight changes over time |
| **Water Intake Tracker** | Track daily hydration with visual progress indicators |
| **Streak System** | Gamified streak counter to encourage consistency |
| **Activity Heatmap** | GitHub-style visualization of workout activity |
| **Leaderboard** | Community rankings based on activity and streaks |
| **Onboarding Flow** | Guided setup for new users with username selection |
| **Secure Authentication** | Email/password auth with password reset via Supabase |

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16.1.3](https://nextjs.org/) (App Router) |
| **Language** | TypeScript |
| **UI Library** | React 19.2.3 |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Backend/Auth** | [Supabase](https://supabase.com/) (PostgreSQL + Auth) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Component Library** | Radix UI Primitives |
| **Testing** | [Vitest](https://vitest.dev/) + React Testing Library |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## Getting Started

### Prerequisites

- **Node.js**: v18.x or higher (v20+ recommended)
- **npm**: v9.x or higher (comes with Node.js)
- **Supabase Account**: Required for backend services

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/FitnessFiveWeb.git
cd FitnessFiveWeb

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key for client-side auth | Supabase Dashboard → Settings → API → Project API keys → `anon` `public` |

> **Note**: These are `NEXT_PUBLIC_` prefixed variables, meaning they are exposed to the browser. This is intentional for Supabase's client-side authentication. Never expose service role keys in frontend code.

### Database Setup

Run the SQL migrations in your Supabase SQL Editor in the following order:

1. `supabase-migration.sql` - Core tables (profiles, workouts, exercises, etc.)
2. `supabase-gamification-migration.sql` - Routines and gamification features
3. `supabase-task-generation-migration.sql` - Daily task generation
4. `supabase-routine-workout-migration.sql` - Routine-workout linking
5. `supabase-water-tracking-migration.sql` - Water intake tracking
6. `supabase-fix-daily-tasks-fk.sql` - Foreign key fixes

### Running Locally

```bash
# Start the development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
FitnessFiveWeb/
├── public/                     # Static assets
│   └── images/                 # Image assets (dashboard preview, etc.)
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/               # Auth callback handler
│   │   ├── dashboard/          # Main dashboard (protected)
│   │   ├── forgot-password/    # Password reset request
│   │   ├── leaderboard/        # Community rankings
│   │   ├── login/              # Login page
│   │   ├── onboarding/         # New user setup
│   │   ├── profile/            # User profile
│   │   ├── reset-password/     # Password reset completion
│   │   ├── routines/           # Routine management
│   │   ├── signup/             # Registration
│   │   ├── workout/            # Workout management
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── charts/             # Chart components (heatmap, weight)
│   │   ├── dashboard/          # Dashboard widgets (bento grid)
│   │   ├── layout/             # Layout components (sidebar, nav)
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   ├── actions.ts          # Server actions (mutations)
│   │   ├── data.ts             # Data fetching functions
│   │   └── utils.ts            # Utility functions
│   ├── store/                  # Zustand state stores
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # Core types and interfaces
│   └── utils/
│       ├── supabase/           # Supabase client utilities
│       │   ├── client.ts       # Browser client
│       │   └── server.ts       # Server client
│       ├── hydration-logic.ts  # Hydration calculation utilities
│       ├── interval-logic.ts   # Scheduling interval logic
│       └── streak-logic.ts     # Streak calculation utilities
├── .env.local                  # Environment variables (git-ignored)
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind CSS configuration (v4)
├── tsconfig.json               # TypeScript configuration
├── vitest.config.ts            # Vitest test configuration
└── supabase-*.sql              # Database migration files
```

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **dev** | `npm run dev` | Start development server with hot reload |
| **build** | `npm run build` | Create production build |
| **start** | `npm run start` | Start production server |
| **lint** | `npm run lint` | Run ESLint checks |
| **test** | `npm run test` | Run tests in watch mode |
| **test:run** | `npm run test:run` | Run tests once |

---

## Deployment

FitnessFive is deployed on [Vercel](https://vercel.com/). To deploy your own instance:

### 1. Connect Repository

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel will auto-detect Next.js

### 2. Configure Environment Variables

In your Vercel project settings (Settings → Environment Variables), add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Ensure these are available for **Production**, **Preview**, and **Development** environments.

### 3. Deploy Settings

Vercel auto-detects these, but verify:

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` (or `next build`) |
| Output Directory | `.next` (auto-detected) |
| Install Command | `npm install` |
| Node.js Version | 18.x or 20.x |

### 4. Supabase Configuration

Ensure your Supabase project allows requests from your Vercel deployment domain:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel domain to **Site URL** (e.g., `https://fitness-five-web.vercel.app`)
3. Add to **Redirect URLs**: `https://your-domain.vercel.app/**`

---

## Troubleshooting

### 1. "Error: Invalid Supabase URL or Anon Key"

**Cause**: Environment variables not set or incorrect.

**Solution**:
- Verify `.env.local` exists with correct values
- Restart the dev server after adding/changing env vars
- Check Supabase Dashboard → Settings → API for correct values

### 2. Dashboard shows "Tasks not yet generated"

**Cause**: No routines exist, or routines aren't linked to workouts with exercises.

**Solution**:
1. Create a workout with at least one exercise
2. Create a routine and link it to the workout
3. Tasks auto-generate when you visit the dashboard

### 3. Supabase Auth Redirect Issues

**Cause**: Redirect URLs not configured in Supabase.

**Solution**:
- Add `http://localhost:3000/**` for local development
- Add your production URL pattern to Supabase Auth settings

### 4. Build Error: "Module not found"

**Cause**: Dependencies not installed or path alias issues.

**Solution**:
```bash
rm -rf node_modules .next
npm install
npm run build
```

### 5. Styles Not Loading

**Cause**: Tailwind CSS purge removing classes, or PostCSS issues.

**Solution**:
- Ensure `globals.css` is imported in the root layout
- Check that `postcss.config.mjs` exists and is correctly configured

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes with clear messages
4. **Push** to your fork: `git push origin feature/your-feature`
5. **Open** a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing code patterns and naming conventions
- Run `npm run lint` before committing
- Add tests for new functionality

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## License

No license has been specified for this project. All rights reserved by the project owner.

---

## References

### Official Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Recharts Documentation](https://recharts.org/en-US/guide)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Vercel Deployment Documentation](https://vercel.com/docs)

### Supabase Guides

- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Migrations](https://supabase.com/docs/guides/database/overview)

### Next.js Guides

- [App Router](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Deploying to Vercel](https://nextjs.org/docs/app/building-your-application/deploying)
