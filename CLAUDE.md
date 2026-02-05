# CLAUDE.md

AI-powered learning platform built as a Turborepo monorepo with Expo (React Native + Web), Supabase, and Google Gemini. Users create personalized course programs with LLM-generated modules and projects, track progress through enrollments, and customize their experience with themes, tones, and i18n.

## Quick Reference

```bash
pnpm install           # Install all dependencies
pnpm dev               # Start all apps in dev mode
pnpm build             # Production build (all apps via Turbo)
pnpm lint              # Run ESLint (all packages via Turbo)
pnpm test              # Run tests (Vitest in shared package)
```

### App-specific commands

```bash
pnpm --filter @learn-anything/app dev       # Expo dev server
pnpm --filter @learn-anything/app web       # Expo web only
pnpm --filter @learn-anything/landing dev   # Landing page (Next.js, port 3001)
```

### Tech Stack

- **App**: Expo 54, Expo Router 6, React Native 0.81, React 19, TypeScript 5
- **Landing**: Next.js 15, React 19, Tailwind CSS 4
- **Shared**: TanStack React Query v5, Zod 4
- **Styling (app)**: NativeWind 4 (Tailwind 3.4 for React Native)
- **Backend**: Supabase (PostgreSQL, Auth, RLS, Storage)
- **LLM**: Google Gemini 2.5 Flash Lite (client-side calls)
- **Monorepo**: Turborepo 2.8, pnpm 9.15
- **Hosting**: Vercel (web export)
- **CI**: GitHub Actions (lint, test, build, migrate, deploy)

## Architecture

Turborepo monorepo with direct Supabase calls from the client:

```
Expo App ──> TanStack Query ──> Supabase (direct)
    │                               │
    └──> callGemini() ──> Gemini API (direct, user's key)
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **App (Expo)** | `apps/app/` | Screens, navigation, auth, theme, i18n, platform-specific code |
| **Landing** | `apps/landing/` | Public marketing site (Next.js) |
| **Shared** | `packages/shared/` | Hooks, constants, LLM client, schedule, validation, i18n, types |
| **Presentation** | `apps/app/src/components/` | UI components: `ui/`, `course/`, `dashboard/`, `settings/`, `learn-modal/` |
| **App Hooks** | `apps/app/src/hooks/` | App-specific hooks (`useCourseCreation`, `useLogoutFlow`) |
| **Shared Hooks** | `packages/shared/src/hooks/` | Query/mutation hooks, keys, types |
| **LLM** | `packages/shared/src/llm/` | `callGemini()` client-side caller, prompt construction |
| **Constants** | `packages/shared/src/constants/` | Error messages, validation rules, theme definitions, LLM config |
| **Platform Init** | `apps/app/app/_layout.tsx` | `setSupabaseClient()`, `setStorageAdapter()`, provider tree |

See [`docs/architecture.md`](docs/architecture.md) for the full reference.

## Key Patterns

- **Platform injection** — `setSupabaseClient()` and `setStorageAdapter()` called at app startup in `_layout.tsx`; shared hooks use `getSupabaseClient()` internally
- **Client-side LLM** — `callGemini(apiKey, request)` calls Gemini API directly from the client using the user's locally-stored key via `GeminiKeyProvider`
- **TanStack Query v5** with centralized `queryKeys` object — never use raw string arrays (`["courses"]`) for query keys or invalidation; always use `queryKeys.*`
- **Direct Supabase calls** — Mutations and queries call Supabase directly from shared hooks (no API proxy layer)
- **RLS on all tables** — defense in depth; never bypass from client code
- **Theme system** via NativeWind `vars()` + CSS custom properties (`--t-*`) mapped to `theme-*` Tailwind classes
- **i18n** — 6 locales (en, es, fr, de, it, zh); translations in `packages/shared/src/i18n/locales/`, provider in each app
- **Barrel exports** — Every directory with 2+ sibling files has an `index.ts` barrel export
- **Centralized error messages** — All user-facing error strings must be imported from `packages/shared/src/constants/errors.ts`; never hardcode error text in components
- **Shared UI primitives** — Reusable components (`Spinner`, `Button`, `Input`, `Modal`) in `apps/app/src/components/ui/`

## Database & Migrations

Migrations live in `supabase/migrations/` and are ordered by filename timestamp.

### Automatic migration deployment

Migrations are **automatically applied to production** when a PR is merged to `main`. The CI pipeline (`migrate` job in `.github/workflows/ci.yml`) runs `supabase db push` after a successful build.

This requires three GitHub repository secrets:

| Setting | Type | Where to get it |
|---------|------|-----------------|
| `SUPABASE_ACCESS_TOKEN` | Secret | [Supabase Dashboard > Account > Access Tokens](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_DB_PASSWORD` | Secret | Your project's database password (set during project creation) |
| `SUPABASE_PROJECT_REF` | Secret | The project ref from your Supabase project URL (e.g., `kxdkmywttkhwpixpvqhq`) |

Set secrets at: **GitHub repo > Settings > Secrets and variables > Actions** (or at org level)

### Manual migration push (if needed)

```bash
# Link to your Supabase project (one-time setup)
supabase link --project-ref <project-ref>

# Push migrations to the remote database
supabase db push
```

### Rules for migrations

- Migration filenames use the format `YYYYMMDDHHMMSS_description.sql`. The timestamp determines execution order.
- Make sure the timestamp on a new migration is **later** than all existing ones so it runs last.
- Never modify an already-applied migration. Create a new migration to alter existing schema.
- Test migrations locally with `supabase start` and `supabase db reset` before pushing.

### Local Supabase

```bash
supabase start       # Start local Supabase (Postgres, Auth, Studio)
supabase db reset    # Reset local DB and re-run all migrations
supabase stop        # Stop local services
```

Local services:
- API: `localhost:54321`
- Studio: `localhost:54323`
- DB: `localhost:54322`

## Environment Variables

Required in `apps/app/.env.local` (or root `.env.local`):

```
EXPO_PUBLIC_SUPABASE_URL=<supabase-project-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

Users provide their own Gemini API key via the in-app Settings UI. Keys are stored locally via `GeminiKeyProvider` (no server-side encryption needed in the Expo architecture).

## Auth Flow

1. User launches the Expo app → `AuthProvider` initializes session from Supabase
2. `(auth)` route group shows login/signup screens if no session
3. `(app)` route group shows protected screens if session exists
4. Email/password: direct `supabase.auth.signInWithPassword()`
5. Google OAuth (web): `supabase.auth.signInWithOAuth()` with redirect
6. Google OAuth (native): `expo-web-browser` opens OAuth URL, extracts tokens from callback URL, sets session via `supabase.auth.setSession()`
7. `useProfile()` hook auto-creates a `profiles` row if one doesn't exist

## Testing

**Framework**: Vitest 4 in `packages/shared/`.

| Test File | Coverage |
|-----------|----------|
| `schedule.test.ts` | Module schedule generation, status resolution, commitment validation |

```bash
pnpm test              # Run all tests once (via Turbo)
pnpm --filter @learn-anything/shared test:watch  # Watch mode
```

## Code Style

- 2-space indentation, double quotes, semicolons required
- **PascalCase** for components and types; **camelCase** for functions, hooks, variables; **UPPER_SNAKE_CASE** for constants
- No magic numbers — extract to named constants in `packages/shared/src/constants/`
- No `console.log` in production code (only `console.error` / `console.warn`)
- Import shared code as `@learn-anything/shared` (package imports, not path aliases)
- `interface` for object shapes; `type` for unions and aliases
- One component per file, default export, filename matches component name
- **Component size limit**: View components should stay under 300 lines. Extract sub-components when approaching this limit. For complex shared components, use a sub-directory with its own `index.ts` barrel (see `apps/app/src/components/learn-modal/`).

## Key Principles

- **Single Responsibility** — Each file/function does one thing. Extract hooks and helpers when a component grows.
- **DRY** — Shared logic goes in `packages/shared/`. Centralized `queryKeys`, reusable mutation patterns.
- **Separation of Concerns** — CSS variables define themes, Tailwind tokens consume them, components use utility classes.
- **Explicit Types** — All query hooks and component props are typed. Prefer `interface` for extensibility.
- **No utility duplication** — Shared utilities live in `packages/shared/src/utils/`. Check there before adding formatters, validators, or helpers to a component file.
- **No type duplication** — Shared types live in `packages/shared/src/types/` or their owning module. Never duplicate a type definition.
- **Error messages** — User-facing error strings must be imported from `packages/shared/src/constants/errors.ts`, not hardcoded. Add new keys to `ERROR_MESSAGES` when introducing new error scenarios.
- **Query key discipline** — Always use `queryKeys.*` from `packages/shared/src/hooks/keys.ts` for query keys and cache invalidation. Never pass raw string arrays like `["courses"]`.
- **Reusable UI in `ui/`** — Repeated UI patterns (spinners, badges, etc.) must be extracted to `apps/app/src/components/ui/`.
- **Barrel exports** — Every directory with 2+ sibling files must have an `index.ts` barrel export.
- **Theme-aware colors only** — Use `theme-*` Tailwind classes (e.g., `text-theme-error`, `bg-theme-surface`). Never use hardcoded color classes like `text-red-400` or `bg-red-900`.

## Key Files

| File | Purpose |
|------|---------|
| `apps/app/app/_layout.tsx` | Root layout: provider tree, platform init (`setSupabaseClient`, `setStorageAdapter`) |
| `apps/app/app/(app)/index.tsx` | Main dashboard (protected) |
| `apps/app/app/(app)/course/[id].tsx` | Course detail screen |
| `apps/app/app/(app)/courses.tsx` | All courses list |
| `apps/app/app/(auth)/login.tsx` | Login screen |
| `apps/app/app/(auth)/signup.tsx` | Signup screen |
| `apps/app/src/auth/AuthProvider.tsx` | Auth context: signIn, signUp, signInWithGoogle, signOut |
| `apps/app/src/theme/ThemeProvider.tsx` | ThemeProvider + `useTheme()` hook (NativeWind vars) |
| `apps/app/src/theme/themes.ts` | Theme color definitions (5 themes) |
| `apps/app/src/i18n/I18nProvider.tsx` | I18nProvider + `useI18n()` hook |
| `apps/app/src/components/ui/` | Reusable UI primitives (Button, Input, Modal, Spinner) |
| `apps/app/src/components/learn-modal/` | LearnModal sub-directory (types, constants, sub-components) |
| `apps/app/src/components/settings/` | Settings tab components (General, ApiKeys, Tone, Theme) |
| `apps/app/src/components/course/` | Course page components (EnrolledView, UnenrolledView, etc.) |
| `apps/app/src/components/dashboard/` | Dashboard components (CourseGrid, TipBanner, etc.) |
| `apps/app/src/hooks/` | App-specific hooks (useCourseCreation, useLogoutFlow) |
| `apps/app/src/lib/supabase.ts` | Supabase client creation (`createClient`) |
| `apps/app/global.css` | Theme CSS variables, animations |
| `apps/app/tailwind.config.js` | NativeWind + theme color mapping (`--t-*` → `theme-*`) |
| `packages/shared/src/index.ts` | Shared package barrel export |
| `packages/shared/src/hooks/` | TanStack Query hooks (queries, mutations, keys, types) |
| `packages/shared/src/constants/errors.ts` | Centralized error messages (`ERROR_MESSAGES`) |
| `packages/shared/src/constants/validation.ts` | Validation rules (password min length, username regex, etc.) |
| `packages/shared/src/llm/client.ts` | `callGemini()` client-side LLM caller |
| `packages/shared/src/llm/prompt.ts` | System/user prompt builders |
| `packages/shared/src/schedule.ts` | Module schedule generation and status resolution |
| `packages/shared/src/supabase.ts` | `setSupabaseClient()` / `getSupabaseClient()` injection |
| `packages/shared/src/storage.ts` | `setStorageAdapter()` / `getStorage()` platform abstraction |
| `packages/shared/src/i18n/` | Translations (6 locales) and i18n types |
| `apps/landing/` | Landing page (Next.js 15) |

## CI/CD Pipeline

Three jobs in `.github/workflows/ci.yml`:

1. **build** (all pushes + PRs): `pnpm install` → `pnpm lint` → `pnpm test` → `pnpm build`
2. **migrate** (push to `main` only, after build): `supabase db push`
3. **deploy-app** (after build): Expo web export → Vercel deploy (production on `main`, preview on branches/PRs with PR comment)

### Required GitHub secrets

| Secret | Purpose |
|--------|---------|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI auth |
| `SUPABASE_DB_PASSWORD` | Database access for migrations |
| `SUPABASE_PROJECT_REF` | Supabase project identifier |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase URL for production build |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for production build |
| `VERCEL_TOKEN` | Vercel deployment auth |
| `VERCEL_ORG_ID` | Vercel organization |
| `VERCEL_PROJECT_ID` | Vercel project |

## Local Verification (Required Before Every Push)

Every change **must** be verified locally before committing or pushing. This prevents broken deployments and production outages.

1. **Build**: Run `pnpm build` and confirm it completes with zero errors.
2. **Lint**: Run `pnpm lint` and confirm zero errors (warnings are acceptable only if pre-existing).
3. **Tests**: Run `pnpm test` and confirm all tests pass.
4. **Dev smoke-test**: Run `pnpm dev`, open the Expo web app, and verify:
   - Login/signup screens render correctly
   - Dashboard loads after authentication
   - Course creation flow works end-to-end
5. **No skipping**: Do not push code that fails any of the above checks, even for "quick fixes."

## Conventions

- Theme-aware UI using CSS custom properties (`--t-*`) — never hardcode colors
- All shared hooks verify auth via `supabase.auth.getUser()`
- RLS policies on all tables — never bypass RLS from client code
- Branches named `trello/{card-id}-{description}`
- All changes go through pull requests; CI must pass before merging
- 5 themes: terminal (default), space, school, gym, 90s-internet
- 6 personality tones available for LLM-generated content
- 6 locales: en (default), es, fr, de, it, zh

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — Full architecture reference, database schema, component patterns, and improvement opportunities
- [`docs/browser-test-plan.md`](docs/browser-test-plan.md) — Comprehensive browser QA test plan for Chrome MCP automation
