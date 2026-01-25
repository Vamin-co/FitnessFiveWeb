# Contributing to FitnessFive

Thank you for your interest in contributing to FitnessFive! This document provides guidelines and instructions for contributing.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Commit Messages](#commit-messages)

---

## Code of Conduct

Be respectful, inclusive, and constructive. We're building something together.

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git
- A Supabase account (for testing)

### Fork & Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR-USERNAME/FitnessFiveWeb.git
cd FitnessFiveWeb
npm install
```

### Set Up Environment

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Open a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (browser, OS)

### Suggesting Features

1. Open an issue with the "enhancement" label
2. Describe the feature and its use case
3. Explain why it would benefit users

### Submitting Code

1. Find or create an issue for your change
2. Fork the repository
3. Create a feature branch
4. Make your changes
5. Submit a pull request

---

## Development Setup

See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for detailed setup instructions.

### Quick Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run lint` | Check code style |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run build` | Build for production |

---

## Pull Request Process

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### 2. Make Your Changes

- Write clean, readable code
- Add tests for new functionality
- Update documentation if needed

### 3. Verify Your Changes

```bash
npm run lint      # No linting errors
npm run test:run  # All tests pass
npm run build     # Builds successfully
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add water intake chart"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub with:
- Clear description of changes
- Link to related issue (if any)
- Screenshots for UI changes

### 6. Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged

---

## Code Standards

### TypeScript

- Use explicit types for function parameters and return values
- Prefer `interface` for object shapes
- Avoid `any` type

### React/Next.js

- Use Server Components by default
- Add `"use client"` only when necessary
- Keep components focused and reusable

### File Structure

```
src/
├── app/           # Pages and layouts
├── components/    # Reusable components
├── lib/           # Business logic
├── types/         # TypeScript types
└── utils/         # Utility functions
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | `kebab-case.tsx` | `user-profile.tsx` |
| Utilities | `kebab-case.ts` | `date-utils.ts` |
| Types | PascalCase | `UserProfile` |
| Functions | camelCase | `getUserProfile` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no feature or fix |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Examples

```
feat: add water intake tracking to dashboard
fix: resolve streak calculation for timezone edge cases
docs: update README with deployment instructions
refactor: extract form validation into reusable hook
```

---

## Questions?

If you have questions about contributing, open an issue or reach out to the maintainers.

Thank you for contributing! 🎉
