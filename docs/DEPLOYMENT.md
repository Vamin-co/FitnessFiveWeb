# Deployment Guide

This guide covers deploying FitnessFive to Vercel and configuring the production environment.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Supabase Configuration](#supabase-configuration)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Preview Deployments](#preview-deployments)
- [Common Issues](#common-issues)
- [Rollback](#rollback)

---

## Overview

FitnessFive is deployed on [Vercel](https://vercel.com/), which provides:

- Automatic deployments from Git
- Preview deployments for pull requests
- Edge network for fast global delivery
- Zero-configuration Next.js support

**Live Production URL**: [https://fitness-five-web.vercel.app](https://fitness-five-web.vercel.app)

---

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account**: [vercel.com](https://vercel.com)
2. **Supabase Project**: With database schema applied
3. **Git Repository**: Connected to Vercel

---

## Vercel Deployment

### Initial Setup

1. **Connect Repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub/GitLab/Bitbucket repository
   - Vercel auto-detects Next.js

2. **Configure Project Settings**

   | Setting | Value |
   |---------|-------|
   | Framework Preset | Next.js (auto-detected) |
   | Build Command | `next build` (or `npm run build`) |
   | Output Directory | `.next` (auto-detected) |
   | Install Command | `npm install` |
   | Node.js Version | 18.x or 20.x |

3. **Add Environment Variables** (see [below](#environment-variables))

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Access your app at the generated URL

### Automatic Deployments

Once connected, Vercel automatically:

- **Production deploy**: On push to `main` branch
- **Preview deploy**: On pull request creation
- **Redeploy**: On environment variable changes

---

## Environment Variables

### Required Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |

### Setting Environment Variables

1. Go to **Vercel Dashboard** → Your Project → **Settings**
2. Click **Environment Variables**
3. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Environment: Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** to apply changes

### Environment-Specific Values

For different Supabase projects per environment:

| Environment | Use Case |
|-------------|----------|
| **Production** | Live app with real user data |
| **Preview** | PR previews with test data |
| **Development** | Local development via Vercel CLI |

---

## Supabase Configuration

### URL Configuration

In Supabase Dashboard → Authentication → URL Configuration:

1. **Site URL**
   ```
   https://fitness-five-web.vercel.app
   ```

2. **Redirect URLs** (add all):
   ```
   https://fitness-five-web.vercel.app/**
   https://*.vercel.app/**
   http://localhost:3000/**
   ```

   The wildcard `https://*.vercel.app/**` enables preview deployments.

### Email Templates

Update email templates to use your production URL:

- Supabase Dashboard → Authentication → Email Templates
- Update the `{{ .SiteURL }}` references if needed

### Database Migrations

Ensure all migrations are applied to your production Supabase project:

1. `supabase-migration.sql` - Core tables
2. `supabase-gamification-migration.sql` - Routines
3. `supabase-task-generation-migration.sql` - Daily tasks
4. `supabase-routine-workout-migration.sql` - Routine linking
5. `supabase-water-tracking-migration.sql` - Water tracking
6. `supabase-fix-daily-tasks-fk.sql` - FK fixes

---

## Post-Deployment Checklist

After each production deployment:

### Functional Tests

- [ ] Landing page loads correctly
- [ ] Login form works
- [ ] Signup creates new user
- [ ] Dashboard loads for authenticated users
- [ ] Tasks can be completed
- [ ] Weight can be logged
- [ ] Water intake tracking works
- [ ] Leaderboard displays

### Performance Checks

- [ ] Core Web Vitals acceptable (check Vercel Analytics)
- [ ] No console errors in browser
- [ ] Images load correctly
- [ ] Animations are smooth

### Security Checks

- [ ] Auth redirects work correctly
- [ ] Protected routes require login
- [ ] No sensitive data exposed in client

---

## Preview Deployments

Every pull request gets a preview deployment:

### Preview URL Format
```
https://fitnessfive-<hash>-<team>.vercel.app
```

### Preview Environment Variables

Preview deployments use variables marked for "Preview" environment. Use this for:

- Testing with a staging Supabase project
- Safely testing new features
- QA before merging

### Commenting on PRs

Vercel bot automatically comments with:
- Preview URL
- Build status
- Inspector link

---

## Common Issues

### 1. Build Fails: "Module not found"

**Cause**: Dependency not installed or import path wrong.

**Solutions**:
```bash
# Locally verify build works
npm ci
npm run build
```

Check import paths use `@/` alias correctly.

### 2. "Invalid Supabase URL" in Production

**Cause**: Environment variables not set in Vercel.

**Solution**:
1. Verify variables in Vercel Dashboard
2. Redeploy after adding variables
3. Check for typos in variable names

### 3. Auth Redirect Loop

**Cause**: Supabase redirect URLs not configured.

**Solution**:
- Add `https://your-domain.vercel.app/**` to Supabase redirect URLs
- Include the domain exactly as it appears in browser

### 4. Preview Deploy Works, Production Fails

**Cause**: Environment variable only set for Preview.

**Solution**:
- Check that Production environment has all variables
- Variables should be set for all environments

### 5. Slow Initial Page Load

**Cause**: Cold starts or large JavaScript bundles.

**Solutions**:
- Use dynamic imports for heavy components
- Review bundle size via `npm run build`
- Enable Incremental Static Regeneration where applicable

### 6. TypeScript Build Errors

**Cause**: Type errors that weren't caught locally.

**Solution**:
```bash
npm run lint
npx tsc --noEmit
```

Fix all errors before pushing.

---

## Rollback

If a deployment causes issues:

### Instant Rollback

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Find the last working deployment
3. Click the **...** menu → **Promote to Production**

### Git Revert

```bash
git revert HEAD
git push origin main
```

Vercel will automatically deploy the reverted commit.

---

## Build Configuration

### vercel.json (Optional)

FitnessFive doesn't require a `vercel.json` file as Vercel auto-detects Next.js settings.

If needed, create one:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
```

### Node.js Version

Set in Vercel Dashboard or `package.json`:

```json
{
  "engines": {
    "node": ">=18"
  }
}
```

---

## Monitoring

### Vercel Analytics

Enable in Vercel Dashboard → Project → Analytics for:
- Core Web Vitals
- Page view tracking
- Performance insights

### Supabase Dashboard

Monitor:
- Database connections
- Auth activity
- API request volume

---

## Domain Configuration

### Custom Domain

1. Go to Vercel Dashboard → Project → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update Supabase redirect URLs to include new domain

### SSL

Vercel automatically provisions SSL certificates for all domains.
