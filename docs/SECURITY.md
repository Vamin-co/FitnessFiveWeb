# Security

This document covers security considerations and best practices for FitnessFive.

---

## Table of Contents

- [Overview](#overview)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [Database Security](#database-security)
- [Client-Side Security](#client-side-security)
- [Logging](#logging)
- [Security Checklist](#security-checklist)

---

## Overview

FitnessFive handles user fitness data including weight, workout history, and activity patterns. While not containing highly sensitive data like financial information, protecting user privacy and data integrity is essential.

### Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│  • NEXT_PUBLIC_* env vars only                          │
│  • No direct database access                            │
│  • Authentication via Supabase client                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Next.js Server                         │
│  • Server Actions validate auth                         │
│  • Server Components fetch data                         │
│  • No secrets exposed to client                         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     Supabase                            │
│  • Row Level Security (RLS) enforced                    │
│  • Auth via auth.uid()                                  │
│  • Anon key has limited permissions                     │
└─────────────────────────────────────────────────────────┘
```

---

## Environment Variables

### Variable Types

FitnessFive uses only **public** environment variables:

| Variable | Exposed to Client | Purpose |
|----------|-------------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase API endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Anonymous/public API key |

### Why These Are Safe to Expose

The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is designed to be public:

1. **Row Level Security (RLS)** prevents unauthorized data access
2. **Auth policies** restrict operations to authenticated users
3. **Rate limiting** on Supabase prevents abuse
4. **The anon key** cannot bypass RLS policies

### What NOT to Expose

Never expose:
- `SUPABASE_SERVICE_ROLE_KEY` - Bypasses RLS (admin only)
- Database connection strings
- Third-party API secret keys

If you add server-side secrets in the future, use non-prefixed environment variables (without `NEXT_PUBLIC_`).

### Local Environment Files

```bash
# .env.local (git-ignored)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**Never commit `.env.local`** to version control. The `.gitignore` already excludes it:

```
.env*
```

---

## Authentication

### Auth Provider

Supabase Auth handles all authentication:

- Email/password authentication
- JWT-based session management
- Secure cookie storage

### Session Management

Sessions are managed via HTTP-only cookies:

```typescript
// Server-side session access
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Route Protection

Protected routes verify authentication at the page level:

```typescript
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/login");
    }
    // ... render protected content
}
```

### Server Action Authentication

All server actions verify authentication:

```typescript
// src/lib/actions.ts
export async function createWorkout(formData: {...}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { error: 'Not authenticated' };
    }
    // ... proceed with authenticated operation
}
```

### Password Security

- Passwords are hashed by Supabase (bcrypt)
- Password reset via email link
- No password stored in application code

---

## Database Security

### Row Level Security (RLS)

All tables have RLS enabled. Users can only access their own data:

```sql
-- Example policy on profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Table-Level Policies

| Table | Select | Insert | Update | Delete |
|-------|--------|--------|--------|--------|
| profiles | Own only | Own only | Own only | N/A |
| workouts | Own only | Own only | Own only | Own only |
| exercises | Via workout owner | Via workout owner | Via workout owner | Via workout owner |
| weight_entries | Own only | Own only | N/A | Own only |
| routines | Own only | Own only | Own only | Own only |
| daily_tasks | Own only | Own only | Own only | N/A |

### Leaderboard Exception

The leaderboard view is readable by all authenticated users:

```sql
GRANT SELECT ON public.leaderboard TO authenticated;
```

This is intentional—it shows aggregated, public-facing data (names, streaks, scores).

---

## Client-Side Security

### No Sensitive Data in Client

- Server Components fetch data server-side
- Client Components receive only necessary props
- Sensitive operations happen via Server Actions

### Input Validation

Forms use client-side validation for UX, but **all inputs are re-validated server-side**:

```typescript
// Client-side (for UX)
if (!email.trim()) {
    setError("Email is required");
    return;
}

// Server-side (for security)
export async function signUp(email: string, password: string) {
    // Supabase validates email format
    // Supabase enforces password requirements
}
```

### XSS Prevention

React's JSX escapes values by default, preventing XSS:

```tsx
// Safe - value is escaped
<p>{userInput}</p>

// Dangerous - avoid unless absolutely necessary
<div dangerouslySetInnerHTML={{ __html: content }} />
```

FitnessFive does not use `dangerouslySetInnerHTML`.

---

## Logging

### What Is Logged

**Server-side** (visible in Vercel logs):
- Authentication errors
- Database operation errors
- Server action failures

**Example safe logging:**
```typescript
console.error('Error inserting routine completion:', error.message);
```

### What Is NOT Logged

- Passwords or credentials
- Full user profiles
- Session tokens
- Personal health data

### Safe Logging Pattern

```typescript
// Good - logs error without sensitive data
if (error) {
    console.error('Failed to update profile:', error.code);
    return { error: error.message };
}

// Bad - might expose sensitive data
console.log('User data:', userData);
```

### Production Log Access

Logs are accessible via:
- **Vercel Dashboard** → Project → Logs
- **Supabase Dashboard** → Auth → Logs

---

## Security Checklist

### Before Deployment

- [ ] All environment variables are set in Vercel
- [ ] `.env.local` is not committed to git
- [ ] No hardcoded credentials in code
- [ ] RLS policies are enabled on all tables

### Code Review

- [ ] Server actions check authentication
- [ ] No `dangerouslySetInnerHTML` with user content
- [ ] No console.log of sensitive data
- [ ] Inputs are validated server-side

### Supabase Configuration

- [ ] RLS enabled on all tables
- [ ] Redirect URLs configured correctly
- [ ] Email templates don't expose sensitive info
- [ ] Service role key NOT used in frontend

### Ongoing

- [ ] Dependencies updated regularly (`npm audit`)
- [ ] Supabase auth settings reviewed
- [ ] Access logs monitored for anomalies

---

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not** open a public GitHub issue
2. Contact the project maintainer directly
3. Provide details of the vulnerability
4. Allow time for a fix before public disclosure
