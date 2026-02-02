# CLAUDE.md

AI-powered learning platform built with Next.js 16, React 19, Supabase, and Google Gemini. Users create personalized course programs with LLM-generated modules and projects, track progress through enrollments, and customize their experience with themes, tones, and i18n.

## Quick Reference

```bash
npm install            # Install dependencies
npm run dev            # Start dev server (http://localhost:3000)
npm run build          # Production build
npm run lint           # Run ESLint
npm run test           # Run tests (Vitest, once)
npm run test:watch     # Run tests in watch mode
```

### Tech Stack

- **Framework**: Next.js 16, React 19, TypeScript 5
- **Styling**: Tailwind CSS 4
- **State**: TanStack React Query v5
- **Backend**: Supabase (PostgreSQL 17, Auth, RLS, Storage)
- **LLM**: Google Gemini 2.5 Flash Lite
- **Hosting**: Vercel
- **CI**: GitHub Actions

## Architecture

Layered architecture with clear separation of concerns:

```
Browser ──> Proxy (auth gate) ──> React App ──> TanStack Query ──> API Routes ──> Supabase / LLM
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Presentation** | `src/app/`, `src/app/components/`, `src/app/components/ui/` | Pages, layouts, UI components, reusable primitives |
| **API** | `src/app/api/` | Route handlers with auth verification and consistent response format |
| **Business Logic** | `src/lib/` | Pure functions: crypto, schedule generation, LLM prompts, tips |
| **Data Access** | `src/lib/supabase/`, `src/lib/hooks/` | Supabase clients, TanStack Query hooks, shared custom hooks |
| **LLM Integration** | `src/lib/llm/` | Provider abstraction, factory pattern, prompt construction |
| **Shared Types** | `src/lib/types/` | Shared type definitions (e.g., `FeedbackMessage`) |
| **Shared Utilities** | `src/lib/utils/` | Shared utility functions (e.g., `formatDate`, `getDueStatus`) |
| **Constants** | `src/lib/constants/` | Centralized constants, error messages, validation rules |
| **Cross-cutting** | `src/lib/theme/`, `src/lib/i18n/`, `src/proxy.ts` | Theme system, internationalization, route protection |

See [`docs/architecture.md`](docs/architecture.md) for the full reference.

## Key Patterns

- **View/Context/Components pattern** — Complex pages (10+ state variables, multiple modals) use a dedicated Context file for state, a View file for rendering, and a `components/` directory for sub-components (see `src/app/course/[id]/`)
- **LLM provider factory** (`createLLMProvider`) — Open/Closed Principle; add providers without modifying consumers
- **TanStack Query v5** with centralized `queryKeys` object — never use raw string arrays (`["courses"]`) for query keys or invalidation; always use `queryKeys.*`
- **Consistent API response format** — `{ success: boolean, ...data | error }` across all routes
- **AES-256-GCM encryption** for user API keys — `iv:authTag:ciphertext` format (base64)
- **RLS on all tables** — defense in depth; never bypass from client code
- **Theme system** via CSS custom properties (`--t-*`) mapped to Tailwind tokens
- **i18n** — 6 locales (en, es, fr, de, it, zh) with client-side detection and persistence
- **Barrel exports** — Every directory with 2+ sibling files has an `index.ts` barrel export
- **Centralized error messages** — All user-facing error strings must be imported from `src/lib/constants/errors.ts`; never hardcode error text in components
- **Consistent fetch helpers** — Use `fetchJSON<T>` for JSON API calls and `fetchFormData<T>` for file uploads; never use raw `fetch()` in mutations
- **Shared UI primitives** — Reusable components (`Spinner`, `Button`, `Input`, `Modal`) in `src/app/components/ui/`

## Database & Migrations

Migrations live in `supabase/migrations/` and are ordered by filename timestamp.

### Automatic migration deployment

Migrations are **automatically applied to production** when a PR is merged to `main`. The CI pipeline (`migrate` job in `.github/workflows/ci.yml`) runs `supabase db push` after a successful build.

This requires three GitHub repository settings:

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

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
GEMINI_KEY_ENCRYPTION_SECRET=<64-char-hex-string>
```

Generate the encryption secret with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Auth Flow

1. User logs in via email/password or Google OAuth
2. Supabase sets session cookies
3. Proxy (`src/proxy.ts`) validates session on every request
4. Protected routes (e.g., `/app`, `/courses`) redirect to `/login` if no session
5. Authenticated users on auth pages (`/login`, `/signup`) redirect to `/app`
5. `/api/user` fetches profile from `profiles` table (auto-creates if missing)

## Testing

**Framework**: Vitest 4 with co-located test files in `src/lib/`.

| Test File | Coverage |
|-----------|----------|
| `crypto.test.ts` | AES-256-GCM encrypt/decrypt, config validation, `extractLast4` |
| `schedule.test.ts` | Module schedule generation, status resolution, commitment validation |
| `tips.test.ts` | Tip selection logic, sessionStorage behavior |
| `username.test.ts` | Username normalization, hex suffix generation, collision retries |

```bash
npm run test           # Run all tests once
npm run test:watch     # Watch mode
```

## Code Style

- 2-space indentation, double quotes, semicolons required
- **PascalCase** for components and types; **camelCase** for functions, hooks, variables; **UPPER_SNAKE_CASE** for constants
- No magic numbers — extract to named constants
- No `console.log` in production code (only `console.error` / `console.warn`)
- Use `@/` path alias for all `src/` imports
- `interface` for object shapes; `type` for unions and aliases
- One component per file, default export, filename matches component name
- API routes: named exports (`GET`, `POST`, etc.), always `try/catch`, always verify auth first
- **Component size limit**: View components should stay under 300 lines. Extract sub-components when approaching this limit. For complex shared components (not just pages), use a sub-directory with its own `index.ts` barrel (see `src/app/components/learn-modal/`).

## Key Principles

- **Single Responsibility** — Each file/function does one thing. Extract hooks and helpers when a component grows.
- **DRY** — Shared logic goes in `src/lib/`. Centralized `queryKeys`, shared `fetchJSON<T>` / `fetchFormData<T>` helpers, reusable mutation patterns.
- **Open/Closed** — LLM provider factory (`createLLMProvider`) allows adding providers without modifying consumers.
- **Separation of Concerns** — CSS variables define themes, Tailwind tokens consume them, components use utility classes.
- **Explicit Types** — All API responses, query hooks, and component props are typed. Prefer `interface` for extensibility.
- **No utility duplication** — Shared utilities live in `src/lib/utils/`. Check there before adding formatters, validators, or helpers to a component file.
- **No type duplication** — Shared types live in `src/lib/types/` or their owning module. Never duplicate a type definition.
- **Error messages** — User-facing error strings must be imported from `src/lib/constants/errors.ts`, not hardcoded. Add new keys to `ERROR_MESSAGES` when introducing new error scenarios.
- **Fetch consistency** — All API calls in mutations must use `fetchJSON<T>` (JSON) or `fetchFormData<T>` (file uploads) from `src/lib/hooks/fetch.ts`. Never use raw `fetch()`.
- **Query key discipline** — Always use `queryKeys.*` from `src/lib/hooks/keys.ts` for query keys and cache invalidation. Never pass raw string arrays like `["courses"]`.
- **Reusable UI in `ui/`** — Repeated UI patterns (spinners, badges, etc.) must be extracted to `src/app/components/ui/`.
- **Barrel exports** — Every directory with 2+ sibling files must have an `index.ts` barrel export.
- **View/Context/Components** — Complex pages (10+ state variables, multiple modals) must use the View/Context/Components pattern with a dedicated Context file.

## Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Public landing page (imports LandingClient) |
| `src/app/app/page.tsx` | Main dashboard (protected) |
| `src/app/layout.tsx` | Root layout with providers |
| `src/app/providers.tsx` | QueryClient + ThemeProvider + I18nProvider setup |
| `src/proxy.ts` | Route protection middleware (public/protected/auth paths) |
| `src/app/course/[id]/page.tsx` | Course detail page entry (View/Context/Components pattern) |
| `src/app/course/[id]/CourseContext.tsx` | Course page state, queries, mutations, computed values |
| `src/app/course/[id]/CourseView.tsx` | Course page rendering (enrolled vs unenrolled) |
| `src/app/course/[id]/components/` | Course page sub-components |
| `src/app/landing/LandingClient.tsx` | Landing page client component with I18nProvider |
| `src/app/landing/LandingContent.tsx` | Landing page section composition |
| `src/app/landing/components/` | Landing page sections |
| `src/app/components/ui/` | Reusable UI primitives (Button, Input, Modal, Spinner) |
| `src/app/components/learn-modal/` | LearnModal sub-directory (types, constants, sub-components) |
| `src/app/components/settings/` | Settings tab components (General with sub-sections, ApiKeys, Tone, Theme) |
| `src/app/components/CompletionModal.tsx` | Project completion modal (shared) |
| `src/app/components/ErrorBoundary.tsx` | Error boundary with fallbackRender, onError, onReset |
| `src/lib/hooks/` | TanStack Query hooks, custom hooks (useImageUpload, useSettingsModal, etc.) |
| `src/lib/types/` | Shared type definitions (FeedbackMessage) |
| `src/lib/utils/` | Shared utility functions (formatDate, getDueStatus) |
| `src/lib/constants/` | Centralized constants (errors, validation, enrollment, themes, llm) |
| `src/lib/llm/` | LLM provider factory, Gemini implementation, prompts |
| `src/lib/crypto.ts` | AES-256-GCM encrypt/decrypt for API keys |
| `src/lib/schedule.ts` | Module schedule generation |
| `src/lib/theme/context.tsx` | ThemeProvider + `useTheme()` hook |
| `src/lib/i18n/context.tsx` | I18nProvider + `useI18n()` hook |
| `src/lib/supabase/server.ts` | Server-side Supabase client factory |
| `src/lib/supabase/client.ts` | Browser-side Supabase client factory |
| `src/app/globals.css` | Theme CSS variables, animations, CRT effects |

## Local Verification (Required Before Every Push)

Every change **must** be verified locally before committing or pushing. This prevents broken deployments and production outages.

1. **Build**: Run `npm run build` and confirm it completes with zero errors and no deprecation warnings.
2. **Lint**: Run `npm run lint` and confirm zero errors (warnings are acceptable only if pre-existing).
3. **Tests**: Run `npm run test` and confirm all tests pass.
4. **Dev smoke-test**: Run `npm run dev`, open `http://localhost:3000`, and verify:
   - The home page loads without errors
   - Login/signup pages render correctly
   - API routes return expected responses (not 500)
5. **No skipping**: Do not push code that fails any of the above checks, even for "quick fixes."

## Conventions

- Theme-aware UI using CSS custom properties (`--t-*`) — never hardcode colors
- All protected API routes verify auth via `supabase.auth.getUser()`
- RLS policies on all tables — never bypass RLS from client code
- Branches named `trello/{card-id}-{description}`
- All changes go through pull requests; CI must pass before merging
- 5 themes: terminal (default), space, school, gym, 90s-internet
- 6 personality tones available for LLM-generated content
- 6 locales: en (default), es, fr, de, it, zh

## Browser QA Testing (Chrome MCP)

After every new feature is added or significant change is merged, **if Chrome MCP is available**, run the comprehensive browser test plan at [`docs/browser-test-plan.md`](docs/browser-test-plan.md).

### When to run
- After implementing a new user-facing feature
- After modifying UI components, pages, or API routes
- After theme or i18n changes
- Before creating a PR for any significant change

### How to run
1. Ensure `npm run dev` is running on `http://localhost:3000`
2. Ensure Chrome MCP extension is connected
3. Follow the test plan sections relevant to the changes (or run the full plan for major changes)
4. Log in with the test account credentials listed in the test plan
5. Capture screenshots and console/network errors for any failures

### Test credentials
- See `docs/browser-test-plan.md` for login details and API key

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — Full architecture reference, database schema, component patterns, and improvement opportunities
- [`docs/browser-test-plan.md`](docs/browser-test-plan.md) — Comprehensive browser QA test plan for Chrome MCP automation
