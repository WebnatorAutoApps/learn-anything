# Architecture

Deep reference for the Learn Anything codebase. Descriptive sections document what exists today. Aspirational sections are clearly labeled.

## System Overview

Learn Anything is an AI-powered learning platform where users describe what they want to learn, and an LLM generates a structured course program with modules and hands-on projects. Users enroll in courses, track progress through scheduled modules, and submit project completions with optional proof images.

The system is a **Turborepo monorepo** with an Expo app (React Native + Web), a Next.js landing page, and a shared package. The app communicates directly with Supabase (no API proxy) and calls the Gemini LLM client-side using the user's own API key.

```
┌─────────────┐           ┌──────────────┐
│  Expo App   │──────────>│   Supabase   │
│ (RN + Web)  │  direct   │ (PG + Auth   │
│             │  queries  │  + Storage)  │
└──────┬──────┘           └──────────────┘
       │
       │ callGemini()
       v
┌──────────────┐
│  Gemini LLM  │
│ (2.5 Flash   │
│    Lite)     │
└──────────────┘
```

**Request lifecycle**: User interacts with the Expo app → React components use TanStack Query hooks → Hooks call `getSupabaseClient()` to query Supabase directly → RLS policies enforce authorization at the database level. For course generation, `callGemini()` sends the user's API key directly to the Gemini API from the client.

## Project Structure

```
learn-anything/
├── apps/
│   ├── app/                           # Main Expo app (React Native + Web)
│   │   ├── app/                       # Expo Router file-based routing
│   │   │   ├── _layout.tsx            # Root layout (provider tree, platform init)
│   │   │   ├── (auth)/               # Auth route group (login, signup)
│   │   │   │   ├── login.tsx
│   │   │   │   └── signup.tsx
│   │   │   └── (app)/                # Protected route group
│   │   │       ├── index.tsx          # Dashboard
│   │   │       ├── courses.tsx        # All courses list
│   │   │       └── course/
│   │   │           └── [id].tsx       # Course detail
│   │   ├── src/
│   │   │   ├── auth/                  # AuthProvider (signIn, signUp, OAuth)
│   │   │   ├── components/            # App components
│   │   │   │   ├── ui/               # Reusable primitives (Button, Input, Modal, Spinner)
│   │   │   │   ├── course/           # Course page components
│   │   │   │   ├── dashboard/        # Dashboard components
│   │   │   │   ├── settings/         # Settings tab components
│   │   │   │   └── learn-modal/      # Multi-step course creation form
│   │   │   ├── hooks/                # App-specific hooks
│   │   │   ├── i18n/                 # I18nProvider
│   │   │   ├── lib/                  # Supabase client, platform utilities
│   │   │   ├── notifications/        # Notification system
│   │   │   └── theme/                # ThemeProvider + theme definitions
│   │   ├── global.css                # Theme CSS variables, animations
│   │   ├── tailwind.config.js        # NativeWind + theme color mapping
│   │   ├── metro.config.js           # Metro bundler config
│   │   └── app.json                  # Expo/EAS configuration
│   │
│   └── landing/                       # Landing page (Next.js 15)
│       ├── src/                       # Landing page source
│       ├── next.config.ts
│       └── package.json
│
├── packages/
│   └── shared/                        # Shared library (@learn-anything/shared)
│       └── src/
│           ├── constants/             # Error messages, validation, themes, LLM config
│           │   ├── errors.ts          # ERROR_MESSAGES centralized object
│           │   ├── validation.ts      # PASSWORD_MIN_LENGTH, USERNAME_REGEX, etc.
│           │   ├── themes.ts          # ThemeKey, VALID_THEMES
│           │   ├── llm.ts            # GEMINI_API_URL, LIKELIHOOD_THRESHOLD
│           │   ├── enrollment.ts      # Enrollment constants
│           │   ├── loading-messages.ts # Loading spinner messages
│           │   └── index.ts           # Barrel export
│           ├── hooks/                 # TanStack Query hooks
│           │   ├── keys.ts           # Centralized queryKeys object
│           │   ├── types.ts          # Profile, CourseListItem, etc.
│           │   ├── queries.ts        # useProfile, useCourses, useCourseDetail, useUpcomingProjects
│           │   ├── mutations.ts      # useCreateCourse, useEnrollCourse, useSaveTone, etc.
│           │   └── index.ts          # Barrel export
│           ├── i18n/                  # Translations and i18n utilities
│           │   └── locales/          # en, es, fr, de, it, zh JSON files
│           ├── llm/                   # LLM integration
│           │   ├── client.ts         # callGemini() — direct API caller
│           │   ├── prompt.ts         # System/user prompt builders
│           │   ├── types.ts          # LearningRequest, LLMResponse
│           │   └── index.ts          # Barrel export
│           ├── types/                 # Shared TypeScript types
│           ├── utils/                 # Shared utilities (formatDate, getDueStatus, username)
│           ├── validation/            # Zod validation schemas
│           ├── schedule.ts            # Module schedule generation
│           ├── schedule.test.ts       # Vitest tests
│           ├── supabase.ts           # setSupabaseClient() / getSupabaseClient()
│           ├── storage.ts            # setStorageAdapter() / getStorage()
│           └── index.ts              # Package barrel export
│
├── supabase/
│   ├── config.toml                    # Local Supabase config
│   └── migrations/                    # Ordered SQL migration files
│
├── src/                               # Legacy Next.js monolith (to be removed)
│
├── turbo.json                         # Turbo task configuration
├── pnpm-workspace.yaml                # pnpm workspace definition
├── package.json                       # Root workspace manifest
└── .github/workflows/ci.yml           # CI/CD pipeline
```

> **Note**: The root `src/` directory contains the legacy Next.js monolith. All active development targets `apps/app/` and `packages/shared/`. The legacy code will be removed once the migration is complete.

## Authentication

### AuthProvider

`apps/app/src/auth/AuthProvider.tsx` provides the `useAuth()` hook with:

- `signIn(email, password)` — `supabase.auth.signInWithPassword()`
- `signUp(email, password, fullName?)` — `supabase.auth.signUp()` with optional metadata
- `signInWithGoogle()` — Platform-specific OAuth flow
- `signOut()` — `supabase.auth.signOut()`
- `session`, `user`, `loading` state

### OAuth Flow (Platform-Specific)

**Web**: Standard `signInWithOAuth()` redirect flow via `window.location.origin`.

**Native**: Uses `expo-web-browser`:
1. `signInWithOAuth({ skipBrowserRedirect: true })` to get the OAuth URL
2. `WebBrowser.openAuthSessionAsync(url, redirectTo)` opens the browser
3. On callback, extracts `access_token` + `refresh_token` from URL fragment (implicit flow) or `code` from query params (PKCE flow)
4. Sets session via `supabase.auth.setSession()` or `supabase.auth.exchangeCodeForSession()`

### Route Protection

Expo Router route groups handle protection:

| Group | Screens | Access |
|-------|---------|--------|
| `(auth)` | `login.tsx`, `signup.tsx` | Unauthenticated only (redirects to `(app)` if session exists) |
| `(app)` | `index.tsx`, `courses.tsx`, `course/[id].tsx` | Authenticated only (redirects to `(auth)` if no session) |

### Profile Auto-Creation

`useProfile()` in `packages/shared/src/hooks/queries.ts` auto-creates a `profiles` row if one doesn't exist, pulling `full_name`, `email`, and `avatar_url` from the auth metadata.

### Row-Level Security

All tables have RLS policies. Users can only read/write their own data. The client never bypasses RLS.

## LLM Integration

### Client-Side Architecture

Unlike the legacy Next.js app (which used server-side API routes), the Expo app calls the Gemini API **directly from the client**. The user's API key is stored locally via `GeminiKeyProvider` (using platform-specific secure storage).

### callGemini()

`packages/shared/src/llm/client.ts` exports `callGemini(apiKey, request, signal?)`:

1. Builds system and user prompts via `buildSystemPrompt()` / `buildUserPrompt()`
2. Calls `GEMINI_API_URL` with JSON response mode
3. Validates response structure (normalized_title, program array, likelihood_of_learning)
4. Returns typed `LLMResponse`

Error handling: 400/403 → invalid key, 429 → rate limited, empty response, invalid structure.

### GeminiKeyProvider

`packages/shared/src/llm/GeminiKeyProvider.tsx` provides `useGeminiKey()`:
- `apiKey` — current key (from storage)
- `hasKey` — boolean for UI gating
- `saveKey(key)` / `clearKey()` — persist to platform storage

### Prompt Construction

- `buildSystemPrompt(tone?)` — System prompt with user's personality tone
- `buildUserPrompt(request)` — Structured learning goal, expertise, module count
- `DEFAULT_TONE` — Fallback when no preference set

### Likelihood Threshold

`LIKELIHOOD_THRESHOLD = 30` — Courses below 30% likelihood show a warning and aren't saved.

### Course Generation Output

The LLM generates:
- `normalized_title` — Clean course title
- `expected_skill_level` — "No clue" | "Beginner" | "Intermediate" | "Advanced" | "Expert"
- `likelihood_of_learning` — 0-100 score
- `program[]` — Array of modules, each with exactly 3 projects containing title, instructions, and objective

## State Management

### Provider Tree

Set up in `apps/app/app/_layout.tsx`:

```
SafeAreaProvider
  └─ QueryClientProvider
      └─ AuthProvider
          └─ GeminiKeyProvider
              └─ ThemeProvider
                  └─ I18nProvider
                      └─ ThemedContainer
                          └─ Slot (Expo Router)
```

### Platform Initialization

Before the provider tree renders, `_layout.tsx` calls:
- `setSupabaseClient(supabase)` — injects the Supabase client into shared hooks
- `setStorageAdapter(adapter)` — injects platform-specific storage (web: `localStorage`, native: `expo-secure-store`)

### Hooks Architecture

Hooks are split between the shared package and the app:

**Shared (`packages/shared/src/hooks/`)**:

| File | Responsibility |
|------|----------------|
| `keys.ts` | Centralized `queryKeys` object |
| `types.ts` | Data types (Profile, CourseDetail, Module, etc.) |
| `queries.ts` | Query hooks (useProfile, useCourses, useCourseDetail, useUpcomingProjects) |
| `mutations.ts` | Mutation hooks (useCreateCourse, useEnrollCourse, useSaveTone, etc.) |
| `index.ts` | Barrel export |

**App-specific (`apps/app/src/hooks/`)**:

| Hook | Purpose |
|------|---------|
| `useCourseCreation` | Course creation flow state (API key check, LLM call, navigation) |
| `useLogoutFlow` | Logout confirmation dialog state |

### Centralized Query Keys

```typescript
const queryKeys = {
  profile: ["profile"] as const,
  coursesAll: ["courses"] as const,
  courses: (status: string) => ["courses", status] as const,
  course: (id: string) => ["course", id] as const,
  upcomingProjects: ["upcomingProjects"] as const,
};
```

### Query Hooks

| Hook | Data |
|------|------|
| `useProfile()` | User profile (name, email, avatar, settings) |
| `useCourses(status)` | Course list filtered by status |
| `useCourseDetail(id)` | Single course with modules, projects, schedule, selections |
| `useUpcomingProjects()` | Upcoming projects for dashboard banner |

### Mutation Hooks

| Hook | Action |
|------|--------|
| `useCreateCourse()` | Create course via LLM + insert into Supabase |
| `useEnrollCourse()` | Enroll (owner PATCH or non-owner POST) + generate schedule |
| `useUnenrollCourse()` | Unenroll + clean up schedules |
| `useSaveTone()` | Save personality tone |
| `useSaveTheme()` | Save theme preference |
| `useSelectProject()` | Select a project within a module |
| `useCompleteProject()` | Mark project as complete |
| `useUploadCompletionImage()` | Upload project proof image |
| `useUpdateProfile()` | Update full name |
| `useUploadAvatar()` | Upload avatar image |
| `useUpdateEmail()` | Change email |
| `useUpdatePassword()` | Change password |
| `useUpdateUsername()` | Change username |

### Cache Invalidation

Mutations invalidate related query keys on success. For example, `useSaveTheme` invalidates the profile query, `useEnrollCourse` invalidates both the course list and course detail queries.

## Theme System

### NativeWind + CSS Custom Properties

The theme system bridges CSS variables with React Native via NativeWind's `vars()` function:

1. **Theme definitions** (`apps/app/src/theme/themes.ts`) — JS objects mapping `--t-*` variable names to color values for each theme
2. **ThemeProvider** (`apps/app/src/theme/ThemeProvider.tsx`) — Stores active theme, generates `vars()` style object, passes to `ThemedContainer`
3. **Tailwind config** (`apps/app/tailwind.config.js`) — Maps `--t-*` variables to `theme-*` utility classes:
   ```
   --t-primary → theme-primary
   --t-error → theme-error
   --t-success → theme-success
   --t-warning → theme-warning
   ```
4. **Components** use `className="text-theme-primary bg-theme-surface"` etc.

### Semantic Color Tokens

| Variable | Tailwind Class | Purpose |
|----------|---------------|---------|
| `--t-success` | `theme-success` | Success states, completion indicators |
| `--t-error` | `theme-error` | Error messages, destructive actions |
| `--t-warning` | `theme-warning` | Warning states, attention needed |

### Available Themes

| Theme | Accent Color | Character |
|-------|-------------|-----------|
| **terminal** (default) | Green `#4ade80` | CRT/hacker aesthetic |
| **space** | Purple `#a78bfa` | Cosmic/space exploration |
| **school** | Amber `#f59e0b` | Warm/educational |
| **gym** | Rose `#f43f5e` | Energetic/athletic |
| **90s-internet** | Cyan `#06b6d4` | Retro cyber/dial-up |

## Internationalization

### Supported Locales

6 locales with JSON translation files in `packages/shared/src/i18n/locales/`:

| Code | Language |
|------|----------|
| `en` | English (default) |
| `es` | Spanish |
| `fr` | French |
| `de` | German |
| `it` | Italian |
| `zh` | Chinese |

### Provider & Hook

`I18nProvider` in `apps/app/src/i18n/I18nProvider.tsx` provides `useI18n()` hook returning `{ t, locale, setLocale }`.

### Detection Priority

1. Persisted locale from storage
2. Device/browser language
3. Falls back to `en`

## Component Patterns

### Organization

Components in `apps/app/src/components/` are organized by domain:

| Directory | Contents |
|-----------|----------|
| `ui/` | Reusable primitives: `Button`, `Input`, `Modal`, `Spinner`, `GoogleIcon` |
| `course/` | Course page: `EnrolledView`, `UnenrolledView`, `ModuleTimeline`, etc. |
| `dashboard/` | Dashboard: `CourseGrid`, `DashboardHeader`, `TipBanner`, `ApiKeyBanner`, etc. |
| `settings/` | Settings tabs: `GeneralSettings`, `ApiKeysSettings`, `ThemeSettings`, `ToneSettings` |
| `learn-modal/` | Multi-step course creation: `LearnModal`, `ChatMessages`, `StepInput`, `SummaryReview` |

### Barrel Exports

Every directory with 2+ sibling files has an `index.ts` barrel export. Consumers import from the barrel:

```typescript
import { Button, Modal, Spinner } from "../components/ui";
import { EnrolledView, UnenrolledView } from "../components/course";
```

### Data Fetching in Components

Components call TanStack Query hooks directly via `@learn-anything/shared`. Loading and error states are handled inline. No separate data-fetching layer between components and hooks.

## CI/CD Pipeline

### GitHub Actions (`.github/workflows/ci.yml`)

**Triggers**: All pushes and pull requests to `main`.

**Jobs**:

1. **build** (all triggers)
   - Checkout → pnpm setup → Node 20 → `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm test` → `pnpm build`

2. **migrate** (push to `main` only, after build passes)
   - Setup Supabase CLI → Link project → `supabase db push`

3. **deploy-app** (after build passes)
   - Build `@learn-anything/app` with production env vars
   - Prepare Vercel static output from Expo web export
   - Deploy to Vercel (production on `main`, preview on branches/PRs)
   - Comment preview URL on PRs

**Required secrets**: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

## Database Schema

### Tables

**profiles**
- `id` (uuid, FK → auth.users) — Primary key
- `full_name`, `email`, `avatar_url` — Basic profile
- `username` (citext, unique) — Case-insensitive username
- `tone` — LLM personality preference
- `theme` — UI theme preference (terminal, space, school, gym, 90s-internet)
- Auto-created via trigger on auth signup

**courses**
- `id` (uuid) — Primary key
- `user_id` (FK → profiles) — Creator
- `normalized_title`, `learning_goal`, `learning_goal_details` — Course info
- `expertise_level`, `expertise_details`, `expected_skill_level` — Skill assessment
- `likelihood_of_learning` (integer 0-100) — LLM confidence score
- `total_modules`, `status` (`created` | `started`), `commitment_interval_days` — Course metadata
- Cascade deletes to modules, enrollments

**modules**
- `id` (uuid) — Primary key
- `course_id` (FK → courses) — Parent course
- `module_index`, `title`, `description` — Module info
- Cascade deletes to projects, schedules

**projects**
- `id` (uuid) — Primary key
- `module_id` (FK → modules) — Parent module
- `project_index`, `title`, `instructions`, `objective` — Project details

**enrollments**
- `user_id` + `course_id` (composite PK) — User-course join
- `commitment_interval_days` — Scheduling preference
- `enrolled_at` — Timestamp

**module_schedules**
- `enrollment_id` + `module_id` — Composite key
- `unlock_date`, `due_date` — Scheduling

**owner_module_schedules**
- `course_id` + `user_id` + `module_id` — For owner's own enrollment
- `unlock_date`, `due_date` — Scheduling

**user_module_projects**
- `user_id` + `module_id` — Composite key
- `project_id` (FK → projects)
- `completed`, `completed_at`, `comment`, `image_url` — Completion tracking

### Storage Buckets

- **completion-images** — Project completion proof images
- **profile-avatars** — User avatar images

### Migration Conventions

- Filename format: `YYYYMMDDHHMMSS_description.sql`
- Timestamp determines execution order
- Never modify applied migrations — create new ones
- Test locally with `supabase start` + `supabase db reset`

## Testing Architecture

**Framework**: Vitest 4 in `packages/shared/`.

**Test files** (co-located in `packages/shared/src/`):

| File | Tests |
|------|-------|
| `schedule.test.ts` | Schedule generation, module status resolution, commitment validation |

**Commands**:
```bash
pnpm test                                          # All tests via Turbo
pnpm --filter @learn-anything/shared test:watch    # Watch mode
```

### Aspirational

These testing improvements are not yet implemented:

- **Component tests** — React Native Testing Library for interactive components
- **E2E tests** — Maestro or Detox for critical user flows
- **More unit tests** — Extend coverage to LLM client, username generation, etc.

## Clean Code Principles

### Single Responsibility Principle (SRP)

- `schedule.ts` only handles scheduling; `supabase.ts` only handles client injection
- Settings tabs are separate components, each owning one domain
- Dashboard delegates to custom hooks (`useCourseCreation`, `useSettingsModal`, `useLogoutFlow`) and sub-components

### DRY (Don't Repeat Yourself)

- Centralized `queryKeys` (in `keys.ts`) prevents key string duplication across hooks
- `ERROR_MESSAGES` object eliminates hardcoded error strings
- Shared hooks and constants in `packages/shared/` used by all apps

### Separation of Concerns

- CSS custom properties define the design tokens
- NativeWind `vars()` bridges them to React Native
- Tailwind config maps them to utility classes
- Components use utility classes without knowing about color values

## Improvement Opportunities

Honest assessment of remaining technical debt:

1. **Legacy `src/` directory** — The root `src/` directory contains the old Next.js monolith code. It should be removed once the Expo migration is fully validated.

2. **LearnModal is 369 lines** — Approaching the 300-line component limit. Consider extracting step logic into sub-components.

3. **Incomplete i18n coverage** — Not all user-facing strings use the `t()` translation function. Some hardcoded English strings remain as fallbacks in components.

4. **No component tests** — Only schedule logic has unit tests. Interactive components (LearnModal, SettingsModal) lack testing coverage.
