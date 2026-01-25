# Development Guide

This guide covers local development workflow, conventions, and best practices for contributing to FitnessFive.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Development Workflow](#development-workflow)
- [Available Scripts](#available-scripts)
- [Code Style & Conventions](#code-style--conventions)
- [Testing](#testing)
- [Project Conventions](#project-conventions)
- [Common Development Tasks](#common-development-tasks)
- [Debugging](#debugging)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start development server
npm run dev

# 4. Open browser
open http://localhost:3000
```

---

## Development Workflow

### Branch Strategy

1. **Create feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** with clear, atomic commits

3. **Test locally**:
   ```bash
   npm run lint
   npm run test:run
   npm run build
   ```

4. **Push and create PR**

### Hot Reload

Next.js automatically reloads when you save files:
- React components: Instant HMR (Hot Module Replacement)
- Server components: Full page refresh
- CSS changes: Instant updates

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint on codebase |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run tests once (CI mode) |

### Development Server

```bash
npm run dev
```

- Runs on [http://localhost:3000](http://localhost:3000)
- Turbopack enabled for fast refresh
- API routes available at `/api/*`

### Production Build

```bash
npm run build
npm run start
```

Build output goes to `.next/` directory.

---

## Code Style & Conventions

### TypeScript

- **Strict mode enabled** (`strict: true` in tsconfig)
- Use explicit types for function parameters and return values
- Prefer `interface` over `type` for object shapes
- Use `type` for unions and computed types

```typescript
// Good
interface UserProfile {
    id: string;
    name: string;
}

// Good
type Status = 'active' | 'inactive';

// Avoid
const user: any = {...};
```

### ESLint Configuration

ESLint is configured with:
- `eslint-config-next/core-web-vitals` - Next.js recommended rules
- `eslint-config-next/typescript` - TypeScript rules

Run linting:
```bash
npm run lint
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | `kebab-case.tsx` | `daily-agenda-card.tsx` |
| Pages | `page.tsx` | `app/dashboard/page.tsx` |
| Utilities | `kebab-case.ts` | `streak-logic.ts` |
| Types | `index.ts` | `types/index.ts` |
| Tests | `*.test.ts(x)` | `streak-logic.test.ts` |

### Component Conventions

```tsx
// Use "use client" only when necessary
"use client";

import { useState } from "react";
// Third-party imports
import { motion } from "framer-motion";
// Local imports
import { Button } from "@/components/ui/button";

interface Props {
    title: string;
    onSubmit: () => void;
}

export function MyComponent({ title, onSubmit }: Props) {
    const [state, setState] = useState(false);
    
    return (
        <div>
            {/* Component content */}
        </div>
    );
}
```

### Import Order

1. React imports
2. Third-party libraries
3. Local imports (using `@/` alias)

```tsx
// React
import { useState, useEffect } from "react";

// Third-party
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Local
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import type { Profile } from "@/types";
```

---

## Testing

### Test Framework

FitnessFive uses [Vitest](https://vitest.dev/) with React Testing Library.

### Running Tests

```bash
# Watch mode (development)
npm run test

# Single run (CI)
npm run test:run
```

### Test Location

Tests are located alongside the code they test:
```
src/utils/
├── streak-logic.ts
├── __tests__/
│   └── streak-logic.test.ts
```

### Writing Tests

```typescript
// src/utils/__tests__/streak-logic.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCurrentStreak } from '../streak-logic';

describe('calculateCurrentStreak', () => {
    it('returns 0 when no completions', () => {
        const result = calculateCurrentStreak([]);
        expect(result).toBe(0);
    });
    
    it('calculates streak from consecutive days', () => {
        const completions = ['2026-01-24', '2026-01-23', '2026-01-22'];
        const result = calculateCurrentStreak(completions);
        expect(result).toBe(3);
    });
});
```

### Test Coverage Areas

Current test coverage focuses on:
- `streak-logic.ts` - Streak calculation
- `hydration-logic.ts` - Water intake calculations
- `interval-logic.ts` - Routine scheduling

---

## Project Conventions

### Server vs Client Components

**Server Components (default):**
- Data fetching pages
- Static content
- No useState/useEffect

**Client Components (`"use client"`):**
- Forms with state
- Event handlers
- Browser APIs
- Animations (Framer Motion)

### Server Actions

Server actions are defined in `src/lib/actions.ts`:

```typescript
'use server';

export async function createWorkout(formData: {...}) {
    const supabase = await createClient();
    // Validate, insert, revalidate
    revalidatePath('/dashboard');
    return { success: true };
}
```

**Conventions:**
- Always validate input
- Return typed responses: `{ success: boolean; error?: string }`
- Call `revalidatePath()` after mutations
- Handle errors gracefully

### Data Fetching

Data functions in `src/lib/data.ts`:

```typescript
export async function getProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    return data;
}
```

### Type Definitions

All types are centralized in `src/types/index.ts`:

```typescript
export interface Profile {
    id: string;
    username: string | null;
    firstName: string | null;
    // ...
}
```

---

## Common Development Tasks

### Adding a New Page

1. Create directory in `src/app/`:
   ```
   src/app/new-page/
   └── page.tsx
   ```

2. Add page component:
   ```tsx
   export default function NewPage() {
       return <div>New Page</div>;
   }
   ```

3. For protected pages, add auth check:
   ```tsx
   import { redirect } from "next/navigation";
   import { createClient } from "@/utils/supabase/server";

   export default async function NewPage() {
       const supabase = await createClient();
       const { data: { user } } = await supabase.auth.getUser();
       
       if (!user) redirect("/login");
       
       return <div>Protected Content</div>;
   }
   ```

### Adding a New Server Action

1. Add to `src/lib/actions.ts`:
   ```typescript
   export async function myNewAction(data: InputType): Promise<Result> {
       const supabase = await createClient();
       const { data: { user } } = await supabase.auth.getUser();
       
       if (!user) {
           return { success: false, error: 'Not authenticated' };
       }
       
       // Your logic here
       
       revalidatePath('/relevant-path');
       return { success: true };
   }
   ```

### Adding a New Component

1. Create in appropriate directory:
   ```
   src/components/dashboard/my-new-card.tsx
   ```

2. Export and import where needed

### Adding a Database Table

1. Write SQL migration in new file:
   ```sql
   -- supabase-my-feature-migration.sql
   CREATE TABLE public.my_table (...);
   ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;
   CREATE POLICY ...;
   ```

2. Run in Supabase SQL Editor

3. Add TypeScript types in `src/types/index.ts`

---

## Debugging

### Common Issues

**"Not authenticated" errors:**
- Check that Supabase cookies are being set
- Verify `.env.local` has correct values
- Clear browser cookies and try again

**Data not updating:**
- Ensure `revalidatePath()` is called after mutations
- Check that the path matches the page being updated

**Type errors:**
- Run `npm run lint` to see all issues
- Check that types in `src/types/index.ts` match database schema

### Logging

For server-side debugging:
```typescript
console.log('Debug:', { someData });
```

Logs appear in the terminal running `npm run dev`.

### Supabase Dashboard

Use the Supabase Dashboard to:
- View database tables and data
- Check authentication logs
- Test SQL queries
- Monitor API usage

---

## Environment-Specific Behavior

| Behavior | Development | Production |
|----------|-------------|------------|
| Hot Reload | Enabled | N/A |
| Error Display | Detailed stack traces | Generic error page |
| Build Output | Not generated | `.next/` directory |
| Source Maps | Enabled | Disabled by default |
