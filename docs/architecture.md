# Architecture

Deep reference for the Learn Anything codebase. Descriptive sections document what exists today. Aspirational sections are clearly labeled.

## System Overview

Learn Anything is an AI-powered learning platform where users describe what they want to learn, and an LLM generates a structured course program with modules and hands-on projects. Users enroll in courses, track progress through scheduled modules, and submit project completions with optional proof images.

```
┌─────────┐     ┌─────────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────┐
│ Browser  │────>│   Proxy     │────>│  React App    │────>│  API Routes  │────>│ Supabase │
│          │     │ (auth gate) │     │  + TanStack   │     │  (Next.js)   │     │ (PG+Auth │
│          │     │             │     │    Query      │     │              │     │  +Storage)│
└─────────┘     └─────────────┘     └───────────────┘     └──────┬───────┘     └──────────┘
                                                                  │
                                                                  v
                                                           ┌──────────────┐
                                                           │  Gemini LLM  │
                                                           │  (2.5 Flash  │
                                                           │     Lite)    │
                                                           └──────────────┘
```

**Request lifecycle**: Browser request hits the proxy (`src/proxy.ts`), which validates the Supabase session. Authenticated requests reach React pages that use TanStack Query hooks to call API routes. API routes verify auth again, execute business logic, and interact with Supabase or the LLM provider.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Public landing page (imports LandingClient)
│   ├── app/
│   │   └── page.tsx                      # Main dashboard (protected)
│   ├── layout.tsx                        # Root layout with providers
│   ├── providers.tsx                     # QueryClient + ThemeProvider + I18nProvider
│   ├── globals.css                       # Theme CSS variables, animations
│   ├── favicon.ico
│   ├── api/
│   │   ├── login/route.ts               # POST email/password login
│   │   ├── signup/route.ts              # POST user registration
│   │   ├── logout/route.ts             # POST logout + clear session
│   │   ├── upload/route.ts             # POST file upload for completion images
│   │   ├── courses/
│   │   │   ├── route.ts                 # GET list / POST create (LLM generation)
│   │   │   └── [id]/
│   │   │       ├── route.ts             # GET course detail with modules
│   │   │       ├── enroll/route.ts      # POST/PATCH/DELETE enrollment
│   │   │       └── projects/route.ts    # POST select / PATCH complete project
│   │   ├── projects/
│   │   │   └── upcoming/route.ts        # GET upcoming projects for dashboard
│   │   └── user/
│   │       ├── route.ts                 # GET user profile (auto-creates if missing)
│   │       ├── settings/route.ts        # PUT API key, tone, or theme
│   │       ├── profile/route.ts         # PUT full name
│   │       ├── avatar/route.ts          # POST avatar upload
│   │       ├── email/route.ts           # PUT email
│   │       ├── password/route.ts        # PUT password
│   │       └── username/route.ts        # PUT username
│   ├── auth/
│   │   └── callback/route.ts            # OAuth callback handler
│   ├── components/
│   │   ├── index.ts                     # Barrel export
│   │   ├── ActiveModuleCarousel.tsx      # Carousel of active/next modules with projects
│   │   ├── ApiKeySecurityModal.tsx       # Warning modal before API key input
│   │   ├── ApiKeyWarningDialog.tsx       # Inline API key warning
│   │   ├── CompletionModal.tsx           # Project completion modal (shared)
│   │   ├── CourseGrid.tsx               # Course card grid layout
│   │   ├── DashboardHeader.tsx          # Dashboard header with actions
│   │   ├── ErrorBoundary.tsx            # Error boundary with fallbackRender, onError, onReset
│   │   ├── HreflangTags.tsx             # SEO hreflang meta tags
│   │   ├── LanguageSwitcher.tsx          # i18n language selector dropdown
│   │   ├── LearnModal.tsx               # Re-export from learn-modal/
│   │   ├── LogoutConfirmDialog.tsx       # Logout confirmation dialog
│   │   ├── PageLoader.tsx               # Skeleton loaders for dashboard/courses
│   │   ├── ProgramCreationLoader.tsx    # Spinner during LLM generation
│   │   ├── ScrollReveal.tsx             # Intersection Observer animation wrapper
│   │   ├── SettingsModal.tsx            # Settings dialog container with tabs
│   │   ├── ThemeSync.tsx                # Apply theme from profile on load
│   │   ├── TipBanner.tsx                # Contextual tips with CTA buttons
│   │   ├── UpcomingProjectsBanner.tsx   # Upcoming projects preview card
│   │   ├── learn-modal/                 # LearnModal sub-directory
│   │   │   ├── index.ts                 # Barrel export
│   │   │   ├── LearnModal.tsx           # Multi-step course creation form
│   │   │   ├── types.ts                 # StepKey, ExpertiseLevel, LearningPlanData
│   │   │   ├── constants.ts             # EXPERTISE_LEVELS, COMMITMENT_FREQUENCIES
│   │   │   └── components/
│   │   │       ├── index.ts             # Barrel export
│   │   │       ├── ChatMessages.tsx     # Chat-style message display
│   │   │       ├── StepInput.tsx        # Step-by-step input controls
│   │   │       └── SummaryReview.tsx    # Final summary before creation
│   │   ├── settings/
│   │   │   ├── index.ts                 # Barrel export
│   │   │   ├── GeneralSettings.tsx      # General tab coordinator
│   │   │   ├── AvatarSection.tsx        # Avatar upload sub-section
│   │   │   ├── DisplayNameSection.tsx   # Display name sub-section
│   │   │   ├── EmailSection.tsx         # Email change sub-section
│   │   │   ├── PasswordSection.tsx      # Password change sub-section
│   │   │   ├── UsernameSection.tsx      # Username change sub-section
│   │   │   ├── ApiKeysSettings.tsx      # Gemini API key management
│   │   │   ├── ThemeSettings.tsx        # 5 theme options
│   │   │   └── ToneSettings.tsx         # 6+ personality tones
│   │   └── ui/                          # Reusable UI primitives
│   │       ├── index.ts                 # Barrel export
│   │       ├── Button.tsx               # Themed button component
│   │       ├── Input.tsx                # Input + Textarea components
│   │       ├── Modal.tsx                # Generic modal wrapper
│   │       └── Spinner.tsx              # Loading spinner
│   ├── course/
│   │   └── [id]/
│   │       ├── page.tsx                 # Course detail entry point (protected)
│   │       ├── CourseContext.tsx         # State, queries, mutations, computed values
│   │       ├── CourseView.tsx           # Rendering (enrolled vs unenrolled)
│   │       └── components/
│   │           ├── index.ts             # Barrel export
│   │           ├── CompletionCelebration.tsx
│   │           ├── CourseHeader.tsx
│   │           ├── EnrollmentSection.tsx
│   │           ├── HeroProjectCard.tsx
│   │           ├── ModuleTimeline.tsx
│   │           ├── PathDetailModal.tsx
│   │           ├── ProgressBar.tsx
│   │           ├── ProjectCompletionForm.tsx
│   │           ├── ProjectSelectionArea.tsx
│   │           ├── TimelineItem.tsx
│   │           ├── UnenrollDialog.tsx
│   │           └── UnenrolledModuleList.tsx
│   ├── courses/page.tsx                 # All courses list (protected)
│   ├── landing/
│   │   ├── LandingClient.tsx            # Client component with I18nProvider
│   │   ├── LandingContent.tsx           # Section composition
│   │   └── components/
│   │       ├── index.ts                 # Barrel export
│   │       ├── Navbar.tsx
│   │       ├── HeroSection.tsx
│   │       ├── HowItWorksSection.tsx
│   │       ├── ValuePropositionSection.tsx
│   │       ├── ExamplesSection.tsx
│   │       ├── TestimonialsSection.tsx
│   │       ├── PricingSection.tsx
│   │       ├── CTABanner.tsx
│   │       └── Footer.tsx
│   ├── login/page.tsx                   # Public login page
│   ├── signup/page.tsx                  # Public signup page
│   ├── privacy-policy/page.tsx          # Public privacy policy
│   └── terms-and-conditions/page.tsx    # Public terms
├── lib/
│   ├── api/
│   │   ├── index.ts                     # Barrel export (withAuth, createRateLimiter, types)
│   │   ├── withAuth.ts                  # Auth middleware (withAuth, withAuthParams)
│   │   ├── rateLimit.ts                 # In-memory rate limiter factory
│   │   └── types.ts                     # API request/response interfaces
│   ├── constants/
│   │   ├── index.ts                     # Barrel export
│   │   ├── api-key-security.ts          # API key security messaging
│   │   ├── enrollment.ts               # Enrollment-related constants
│   │   ├── errors.ts                    # Centralized error messages
│   │   ├── llm.ts                       # GEMINI_TEMPERATURE, GEMINI_API_URL, LIKELIHOOD_THRESHOLD
│   │   ├── loading-messages.ts          # Loading spinner messages
│   │   ├── themes.ts                    # Theme definitions, VALID_THEMES, ThemeKey
│   │   └── validation.ts               # Min/max lengths, regex patterns
│   ├── crypto.ts                        # AES-256-GCM encrypt/decrypt
│   ├── crypto.test.ts                   # Crypto tests
│   ├── gemini/
│   │   └── mock.ts                      # Mock Gemini provider for testing
│   ├── hooks/
│   │   ├── index.ts                     # Barrel export (all hooks, types, keys, fetch)
│   │   ├── keys.ts                      # Centralized queryKeys object
│   │   ├── fetch.ts                     # fetchJSON<T> + fetchFormData<T> helpers
│   │   ├── types.ts                     # Data types (Profile, CourseDetail, Module, etc.)
│   │   ├── queries.ts                   # Query hooks (useProfile, useCourses, etc.)
│   │   ├── mutations.ts                 # Mutation hooks
│   │   ├── useClickOutside.ts           # Outside-click detection hook
│   │   ├── useCourseCreation.ts         # Course creation flow hook
│   │   ├── useImageUpload.ts            # Image upload flow hook
│   │   ├── useLogoutFlow.ts             # Logout flow hook
│   │   └── useSettingsModal.ts          # Settings modal state hook
│   ├── i18n/
│   │   ├── index.ts                     # Re-exports
│   │   ├── context.tsx                  # I18nProvider + useI18n()
│   │   ├── detect.ts                    # Locale detection from browser
│   │   ├── types.ts                     # Locale type, SUPPORTED_LOCALES
│   │   └── locales/                     # en, es, fr, de, it, zh JSON files
│   ├── llm/
│   │   ├── index.ts                     # createLLMProvider factory, re-exports
│   │   ├── types.ts                     # LLMProvider interface, LearningRequest, LLMResponse
│   │   ├── prompt.ts                    # System/user prompt builders, DEFAULT_TONE
│   │   └── gemini.ts                    # GeminiProvider implementation
│   ├── schedule.ts                      # Module schedule generation
│   ├── schedule.test.ts                 # Schedule tests
│   ├── supabase/
│   │   ├── client.ts                    # Browser Supabase client factory
│   │   ├── server.ts                    # Server Supabase client factory
│   │   └── middleware.ts                # Auth session validation for proxy
│   ├── theme/
│   │   └── context.tsx                  # ThemeProvider + useTheme()
│   ├── tips.ts                          # Contextual tips configuration
│   ├── tips.test.ts                     # Tips tests
│   ├── types/
│   │   ├── index.ts                     # Barrel export
│   │   └── feedback.ts                  # FeedbackMessage type
│   ├── username.ts                      # Username generation with collision avoidance
│   ├── username.test.ts                 # Username tests
│   ├── utils/
│   │   ├── index.ts                     # Barrel export
│   │   └── date.ts                      # formatDate, getDueStatus helpers
│   └── validation/
│       ├── index.ts                     # Barrel export
│       └── schemas.ts                   # Zod validation schemas
├── instrumentation.ts                   # Monitoring/observability setup
└── proxy.ts                             # Route protection middleware

supabase/
├── config.toml                          # Local Supabase config (PG 17, ports, auth)
└── migrations/                          # Ordered SQL migration files
```

## Authentication & Authorization

### Auth Methods

- **Email/password** — Standard Supabase Auth with encrypted password storage
- **Google OAuth** — Redirect flow via `/auth/callback`

### Session Management

Supabase SSR (`@supabase/ssr`) manages session cookies. The server client in `src/lib/supabase/server.ts` reads/writes cookies from the request/response.

### Middleware (Proxy)

`src/proxy.ts` runs on every request and classifies paths into three categories:

| Category | Paths | Behavior |
|----------|-------|----------|
| **Public** | `/` (landing), `/login`, `/signup`, `/privacy-policy`, `/terms-and-conditions`, `/api/login`, `/api/signup`, `/api/logout`, `/auth/callback` | No auth required |
| **Public content** | `/course/[id]`, `/api/courses/[id]` | Readable without auth |
| **Auth pages** | `/login`, `/signup` | Redirect to `/app` if already logged in |
| **Legacy** | `/landing` | Permanent redirect to `/` |
| **Protected** | Everything else | Redirect to `/login` if no session |

### API Route Auth Verification

Protected API routes use the `withAuth` wrapper from `src/lib/api/withAuth.ts`, which handles auth verification, Supabase client creation, and try/catch. The handler receives the authenticated `user` and `supabase` client:

```typescript
export const GET = withAuth(async (request, { user, supabase }) => {
  // `user` is guaranteed authenticated here
});
```

### Profile Auto-Creation

`GET /api/user` auto-creates a `profiles` row if one doesn't exist for the authenticated user, pulling `full_name`, `email`, and `avatar_url` from the auth metadata.

### Row-Level Security

All tables have RLS policies. Users can only read/write their own data. Course content is readable by anyone (for public course pages). The client never bypasses RLS.

## LLM Provider Architecture

### Provider Interface

```typescript
interface LLMProvider {
  generateCourse(request: LearningRequest): Promise<LLMResponse>;
}
```

### Factory Pattern

`createLLMProvider(provider: LLMProviderType, apiKey: string)` returns an `LLMProvider` instance. Currently supports `"gemini"` as the provider type. This follows the Open/Closed Principle — adding a new provider (e.g., OpenAI, Anthropic) requires only a new class and a factory case, without modifying any consuming code.

```typescript
type LLMProviderType = "gemini";

function createLLMProvider(provider: LLMProviderType, apiKey: string): LLMProvider {
  switch (provider) {
    case "gemini":
      return new GeminiProvider(apiKey);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}
```

### GeminiProvider

- **Model**: Gemini 2.5 Flash Lite
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`
- **Temperature**: 0.7
- **Response format**: JSON (`application/json` MIME type)
- **Error handling**: 400/403 (invalid key), 429 (rate limit), generic errors

### Prompt Construction

- `buildSystemPrompt(tone?)` — Constructs the system prompt with the user's chosen personality tone (default: fun/supportive/motivational)
- `buildUserPrompt(request)` — Formats the learning goal, details, expertise level, and module count into a structured prompt
- `DEFAULT_TONE` — Fallback tone when user hasn't set a preference

### Likelihood Threshold

`LIKELIHOOD_THRESHOLD = 30` (defined in `src/lib/constants/llm.ts`, re-exported from `src/lib/llm/index.ts`) — Courses with an LLM-estimated likelihood of learning below 30% show a warning and won't be saved.

### Course Generation Output

The LLM generates:
- `normalized_title` — Clean course title
- `expected_skill_level` — "No clue" | "Beginner" | "Intermediate" | "Advanced" | "Expert"
- `likelihood_of_learning` — 0-100 score
- `program[]` — Array of modules, each with exactly 3 projects containing title, instructions, and objective

## State Management

### QueryClient Configuration

Set up in `src/app/providers.tsx` with TanStack React Query v5. Default staleTime and gcTime are framework defaults.

### Hooks Architecture

The hooks layer in `src/lib/hooks/` is split into focused modules:

| File | Responsibility |
|------|----------------|
| `keys.ts` | Centralized `queryKeys` object |
| `fetch.ts` | `fetchJSON<T>` and `fetchFormData<T>` helpers |
| `types.ts` | Data types (Profile, CourseDetail, Module, etc.) |
| `queries.ts` | Query hooks |
| `mutations.ts` | Mutation hooks |
| `useClickOutside.ts` | Outside-click detection |
| `useCourseCreation.ts` | Course creation flow state |
| `useImageUpload.ts` | Image upload flow state |
| `useLogoutFlow.ts` | Logout flow state |
| `useSettingsModal.ts` | Settings modal state |
| `index.ts` | Barrel export (all hooks, types, keys, fetch) |

### Centralized Query Keys

All cache keys defined in `queryKeys` object in `src/lib/hooks/keys.ts`:

```typescript
const queryKeys = {
  profile: ["profile"] as const,
  coursesAll: ["courses"] as const,
  courses: (status: string) => ["courses", status] as const,
  course: (id: string) => ["course", id] as const,
  upcomingProjects: ["upcomingProjects"] as const,
};
```

### Fetch Helpers

Defined in `src/lib/hooks/fetch.ts`:

- `fetchJSON<T>(url, init?)` — Typed fetch wrapper that throws on non-OK responses, parsing error bodies as JSON when possible.
- `fetchFormData<T>(url, formData)` — Typed wrapper for `FormData` uploads (avatars, completion images). Throws on non-OK responses.

All API calls in mutations use one of these helpers — never raw `fetch()`.

### Query Hooks

| Hook | Data |
|------|------|
| `useProfile()` | User profile (name, email, avatar, settings) |
| `useCourses(status)` | Course list filtered by status |
| `useCourseDetail(id)` | Single course with modules and projects |
| `useUpcomingProjects()` | Upcoming projects for dashboard banner |

### Mutation Hooks

| Hook | Action |
|------|--------|
| `useCreateCourse()` | Create course via LLM generation |
| `useEnrollCourse()` | Enroll in a course |
| `useUnenrollCourse()` | Unenroll from a course |
| `useSaveSettings()` | Save API key |
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

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useCourseCreation()` | Course creation flow state (extracted from `page.tsx`) |
| `useSettingsModal()` | Settings modal open/close and active tab state |
| `useLogoutFlow()` | Logout confirmation and execution |
| `useImageUpload()` | Image file selection, preview, and upload |
| `useClickOutside()` | Detect clicks outside a ref element |

### Cache Invalidation

Mutations invalidate related query keys on success. For example, `useSaveTheme` invalidates the profile query, `useEnrollCourse` invalidates both the course list and course detail queries.

### Type Organization

Data types are split across purpose-specific files:

- **Hook data types** (`src/lib/hooks/types.ts`) — `Profile`, `CourseListItem`, `CourseDetail`, `Module`, `Project`, `SelectedProject`, `ModuleSchedule`, `UpcomingProject`, `CourseDetailResponse`
- **API types** (`src/lib/api/types.ts`) — Request/response interfaces for all API routes (e.g., `LoginRequest`, `CreateCourseResponse`, `EnrollRequest`)
- **Shared types** (`src/lib/types/`) — Cross-cutting types like `FeedbackMessage`
- **Theme types** (`src/lib/constants/themes.ts`) — `ThemeKey` type and `VALID_THEMES`

## Theme System

### CSS Custom Properties

Defined in `src/app/globals.css` under `[data-theme="<name>"]` selectors:

| Variable | Purpose |
|----------|---------|
| `--t-primary` | Primary accent color |
| `--t-primary-hover` | Hover state |
| `--t-primary-dim` | Dimmed primary |
| `--t-secondary` | Secondary accent |
| `--t-muted` | Muted text |
| `--t-bg` | Page background |
| `--t-surface` | Card/surface background |
| `--t-surface-hover` | Hover surface |
| `--t-border` | Border color |
| `--t-border-strong` | Emphasized border |
| `--t-accent` | Accent highlights |
| `--t-glow` | Phosphor glow overlay |
| `--t-text-on-accent` | Text on accent backgrounds |
| `--t-primary-faint` | Very faint primary |

### Tailwind Token Mapping

Tailwind CSS 4 `@theme` block maps CSS variables to utility classes (e.g., `bg-surface`, `text-primary`, `border-border`).

### ThemeProvider

`src/lib/theme/context.tsx` provides `useTheme()` hook:
- Reads theme from profile data (server) or localStorage (fallback)
- Sets `data-theme` attribute on `<html>` element
- Syncs across tabs via `storage` events
- Persists to localStorage under key `learn-anything-theme`

### ThemeSync Component

`src/app/components/ThemeSync.tsx` reads the user's theme preference from their profile (via `useProfile()`) and applies it on mount, ensuring server-stored preferences take precedence.

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

6 locales with JSON translation files in `src/lib/i18n/locales/`:

| Code | Language |
|------|----------|
| `en` | English (default) |
| `es` | Spanish |
| `fr` | French |
| `de` | German |
| `it` | Italian |
| `zh` | Chinese |

### Provider & Hook

`I18nProvider` in `src/lib/i18n/context.tsx` provides `useI18n()` hook returning `{ t, locale, setLocale }`.

### Detection Priority

`detectLocale()` in `src/lib/i18n/detect.ts`:
1. `localStorage` key `preferred_lang`
2. `navigator.languages` / `navigator.language`
3. Falls back to `en`

### SEO

`HreflangTags` component generates `<link rel="alternate" hrefLang="...">` tags for all supported locales.

## API Security

### AES-256-GCM Encryption

User Gemini API keys are encrypted at rest in the database.

**Format**: `iv:authTag:ciphertext` (all base64-encoded)

- **Algorithm**: AES-256-GCM
- **IV**: 12 bytes (96 bits), randomly generated per encryption
- **Auth tag**: 16 bytes (128 bits)
- **Key**: Derived from `GEMINI_KEY_ENCRYPTION_SECRET` env var (64-char hex = 32 bytes)

**Functions** in `src/lib/crypto.ts`:
- `encrypt(plaintext)` — Returns `iv:authTag:ciphertext`
- `decrypt(ciphertext)` — Reverses the format
- `validateEncryptionConfig()` — Validates env var presence, length, and hex format
- `extractLast4(key)` — Returns last 4 characters for display (e.g., "...xY9z")

### Defense in Depth

Three layers of auth verification:
1. **Proxy** (`src/proxy.ts`) — Blocks unauthenticated requests to protected routes
2. **API route** — `withAuth` wrapper calls `supabase.auth.getUser()` before every handler
3. **RLS** — Database policies restrict rows to the owning user

## Database Schema

### Tables

**profiles**
- `id` (uuid, FK → auth.users) — Primary key
- `full_name`, `email`, `avatar_url` — Basic profile
- `encrypted_gemini_api_key`, `api_key_last4` — Encrypted API key storage
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
- `total_modules`, `status` — Course metadata
- Cascade deletes to modules, enrollments

**modules**
- `id` (uuid) — Primary key
- `course_id` (FK → courses) — Parent course
- `module_index`, `title`, `description` — Module info
- Cascade deletes to projects, schedules

**projects**
- `id` (uuid) — Primary key
- `module_id` (FK → modules) — Parent module
- `project_title`, `instructions`, `objective` — Project details

**enrollments**
- `user_id` + `course_id` (composite PK) — User-course join
- `commitment_interval_days` — Scheduling preference
- `enrolled_at` — Timestamp

**module_schedules**
- `enrollment_id` + `module_id` — Composite key
- `unlock_date`, `due_date` — Scheduling

**user_module_projects**
- `user_id` + `module_id` — Composite key
- `selected_project_id` (FK → projects)
- `status` — pending / in_progress / completed
- `comment`, `completion_image_url` — Completion proof

### Storage Buckets

- **completion-images** — Project completion proof images
- **profile-avatars** — User avatar images

### Migration Conventions

- Filename format: `YYYYMMDDHHMMSS_description.sql`
- Timestamp determines execution order
- Never modify applied migrations — create new ones
- Test locally with `supabase start` + `supabase db reset`
- Migrations are cumulative; new ones are added as the schema evolves

## API Route Patterns

### Auth Middleware (`withAuth` / `withAuthParams`)

Protected API routes use the `withAuth` wrapper from `src/lib/api/withAuth.ts`, which handles Supabase client creation, auth verification, and try/catch with a consistent error format. Routes with dynamic params use `withAuthParams`.

```typescript
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/withAuth";

export const GET = withAuth(async (request, { user, supabase }) => {
  const { data, error } = await supabase
    .from("table")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
});
```

For routes with dynamic params (e.g., `courses/[id]/enroll/route.ts`):

```typescript
import { withAuthParams } from "@/lib/api/withAuth";

export const POST = withAuthParams<{ id: string }>(
  async (request, { user, supabase, params }) => {
    const courseId = params.id;
    // ...
  }
);
```

### Rate Limiting

`createRateLimiter(maxRequests, windowMs)` from `src/lib/api/rateLimit.ts` creates an in-memory rate limiter. Used on LLM generation endpoints:

```typescript
const courseCreationLimiter = createRateLimiter(10, 3_600_000); // 10 req/user/hour
```

### Validation

Routes use Zod schemas from `src/lib/validation/` for request body validation:

```typescript
const result = displayNameSchema.safeParse(trimmedName);
if (!result.success) {
  return NextResponse.json(
    { success: false, error: result.error.issues[0].message },
    { status: 400 }
  );
}
```

**Key conventions**:
- Named exports matching HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)
- `withAuth` / `withAuthParams` wrappers handle auth and error boundary
- Consistent `{ success: boolean, ...data | error }` response shape on all routes
- Zod schemas for input validation
- Error messages imported from `src/lib/constants/errors.ts`
- Supabase client created per-request by the auth wrapper

## Component Patterns

### Organization

Components live in `src/app/components/` with three organizational levels:

1. **Top-level components** — Shared components used across pages (barrel `index.ts`)
2. **Subdirectories** — Complex components or domain-specific groups:
   - `ui/` — Reusable primitives (`Button`, `Input`, `Textarea`, `Modal`, `Spinner`)
   - `learn-modal/` — Multi-step course creation form with dedicated types, constants, and sub-components
   - `settings/` — Settings tab components with sub-sections for the General tab
3. **Page-level components** — Colocated with their page in dedicated `components/` directories (e.g., `course/[id]/components/`, `landing/components/`)

### Barrel Exports

Every directory with 2+ sibling files has an `index.ts` barrel export. Consumers import from the barrel:

```typescript
import { Button, Modal, Spinner } from "@/app/components/ui";
import { CourseHeader, EnrollmentSection } from "./components";
```

### View/Context/Components Pattern

Complex pages with 10+ state variables and multiple modals use a three-file pattern:

- **`page.tsx`** — Entry point, minimal code
- **`CourseContext.tsx`** — React Context with all state, queries, mutations, and computed values
- **`CourseView.tsx`** — Rendering logic consuming the context
- **`components/`** — Sub-components, each focused on one section

Used in `src/app/course/[id]/` and informed the landing page structure (`src/app/landing/`).

### UI Primitives

`src/app/components/ui/` provides theme-aware reusable components:
- `Button` — Styled button with variant support
- `Input` / `Textarea` — Form inputs with consistent styling
- `Modal` — Generic modal wrapper with backdrop and close handling
- `Spinner` — Loading spinner

### LearnModal Subdirectory

`src/app/components/learn-modal/` demonstrates the pattern for complex shared components:
- `LearnModal.tsx` — Main component
- `types.ts` — `StepKey`, `ExpertiseLevel`, `CommitmentFrequency`, `LearningPlanData`
- `constants.ts` — `EXPERTISE_LEVELS`, `COMMITMENT_FREQUENCIES`, `TYPING_INDICATOR_DELAY_MS`
- `components/` — `ChatMessages`, `StepInput`, `SummaryReview`

The top-level `src/app/components/LearnModal.tsx` re-exports from this subdirectory for backwards compatibility.

### Settings Tabs

`SettingsModal` renders tab buttons and switches between:
- `GeneralSettings` — Coordinator for 5 sub-sections: `AvatarSection`, `DisplayNameSection`, `EmailSection`, `PasswordSection`, `UsernameSection`
- `ApiKeysSettings` — Gemini API key CRUD
- `ThemeSettings` — Theme picker (5 themes)
- `ToneSettings` — Tone picker (6+ personalities)

Each tab component manages its own form state and calls the relevant mutation hook on submit.

### Error Boundary

`ErrorBoundary` component wraps major sections with `fallbackRender`, `onError`, and `onReset` props. Prevents runtime errors from crashing the entire page.

### Modal Pattern

Modals (`LearnModal`, `SettingsModal`, `ApiKeySecurityModal`, `CompletionModal`) use:
- Boolean state in parent for visibility (`showLearnModal`, etc.)
- Callback props for close/submit actions
- Backdrop click and escape key to dismiss
- Animated transitions via Tailwind classes

### Data Fetching in Components

Components call TanStack Query hooks directly. Loading and error states are handled inline. No separate data-fetching layer between components and hooks.

## Testing Architecture

### Current State

**Framework**: Vitest 4 with TypeScript support.

**Test files** (co-located with source in `src/lib/`):

| File | Tests |
|------|-------|
| `crypto.test.ts` | Config validation, encrypt/decrypt round-trips, error cases, `extractLast4` |
| `schedule.test.ts` | Schedule generation, module status resolution, commitment validation |
| `tips.test.ts` | Tip selection, sessionStorage mocking |
| `username.test.ts` | Normalization, hex suffix, collision retries |

**Commands**:
```bash
npm run test         # vitest run (once)
npm run test:watch   # vitest (watch mode)
```

### Aspirational

These testing improvements are not yet implemented:

- **API route integration tests** — Test route handlers with mocked Supabase client
- **Component tests** — React Testing Library for interactive components (LearnModal, SettingsModal)
- **E2E tests** — Playwright for critical user flows (signup, create course, enroll, complete project)
- **CI test step** — Add `npm run test` to the GitHub Actions build job

## CI/CD Pipeline

### GitHub Actions (`.github/workflows/ci.yml`)

**Triggers**: Pull requests to `main` and pushes to `main`.

**Jobs**:

1. **build** (all triggers)
   - Checkout → Setup Node 20 → `npm ci` → `npm run build`
   - No test or lint steps in CI (enforced locally per verification checklist)

2. **migrate** (push to `main` only, after build passes)
   - Checkout → Setup Supabase CLI → Link project → `supabase db push`
   - Deploys all new migrations to production automatically

**Required secrets**:
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_REF`

## Clean Code Principles

How SOLID and clean code principles map to this project:

### Single Responsibility Principle (SRP)

- Each API route handles one resource/action
- `crypto.ts` only handles encryption; `schedule.ts` only handles scheduling
- Settings tabs are separate components, each owning one domain
- `page.tsx` delegates to custom hooks (`useCourseCreation`, `useSettingsModal`, `useLogoutFlow`) and sub-components (`DashboardHeader`, `CourseGrid`, `CompletionModal`)
- Complex pages use the View/Context/Components pattern to separate state, rendering, and sub-components

### Open/Closed Principle (OCP)

- `LLMProvider` interface + `createLLMProvider` factory — Adding OpenAI support means creating `OpenAIProvider` class and updating the factory switch, without touching `GeminiProvider` or any route handler.
- Theme system — Adding a new theme requires only a new `[data-theme]` block in CSS and a new entry in `VALID_THEMES`.

### Dependency Inversion Principle (DIP)

- API routes depend on the `LLMProvider` interface, not on `GeminiProvider` directly
- Components depend on `useTheme()` and `useI18n()` hooks, not on localStorage or DOM manipulation directly

### DRY (Don't Repeat Yourself)

- Centralized `queryKeys` (in `keys.ts`) prevents key string duplication across hooks
- `fetchJSON<T>` and `fetchFormData<T>` helpers used by all query/mutation hooks
- `withAuth` / `withAuthParams` wrappers eliminate repeated auth boilerplate across all API routes
- Shared Zod validation schemas used by both client and server
- Centralized error messages in `src/lib/constants/errors.ts`

### Separation of Concerns

- CSS custom properties define the design tokens
- Tailwind `@theme` maps them to utility classes
- Components use utility classes without knowing about color values
- Business logic (`src/lib/`) has zero UI dependencies
- Hooks layer splits cleanly: keys, fetch helpers, types, queries, and mutations in separate files

## Improvement Opportunities

Honest assessment of remaining technical debt:

1. **Form validation duplication** — While Zod schemas exist in `src/lib/validation/`, not all forms use them on the client side yet. Some client-side validation is still independent of the shared schemas.

2. **Some magic numbers remain** — Various pixel values and timing constants in components could be extracted to named constants. The main LLM constants (`GEMINI_TEMPERATURE`, `LIKELIHOOD_THRESHOLD`, `GEMINI_API_URL`) are now in `src/lib/constants/llm.ts`.

3. **CI pipeline lacks lint and test steps** — Only `npm run build` runs in CI. Add `npm run lint` and `npm run test` to the build job for automated quality gates.

4. **Incomplete i18n coverage** — Not all user-facing strings use the `t()` translation function. Some hardcoded English strings remain in components.

5. **API rate limiting is partial** — `createRateLimiter` exists and is used on the course creation endpoint, but not all sensitive endpoints have rate limiting applied.

### Recently Resolved

These items were identified as improvement opportunities in earlier versions and have since been addressed:

- **`page.tsx` complexity** — Decomposed via custom hooks (`useCourseCreation`, `useSettingsModal`, `useLogoutFlow`) and extracted sub-components (`DashboardHeader`, `CourseGrid`, `CompletionModal`).
- **No shared UI primitives** — `src/app/components/ui/` now provides `Button`, `Input`, `Textarea`, `Modal`, `Spinner`.
- **No error boundaries** — `ErrorBoundary` component added with `fallbackRender`, `onError`, and `onReset` props.
- **No typed API interfaces** — `src/lib/api/types.ts` defines request/response interfaces covering all routes.
- **`queries.ts` monolith** — Split into `keys.ts`, `fetch.ts`, `types.ts`, `queries.ts`, and `mutations.ts`, plus 5 custom hooks.
