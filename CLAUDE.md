# CLAUDE.md

Project guidelines and conventions for AI-assisted development.

## Tech Stack

- **Framework**: Next.js 16, React 19, TypeScript 5
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL 17, Auth, RLS)
- **Hosting**: Vercel
- **CI**: GitHub Actions

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
```

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

## Project Structure

```
src/
  app/
    page.tsx                    # Dashboard (main page, protected)
    login/page.tsx              # Login page
    signup/page.tsx             # Signup page
    components/                 # Shared components (LearnModal, SettingsModal)
    api/
      user/route.ts             # GET user profile
      user/settings/route.ts    # PUT user settings (API key)
      login/route.ts            # POST login
      signup/route.ts           # POST signup
      logout/route.ts           # POST logout
    auth/callback/route.ts      # OAuth callback
  lib/
    crypto.ts                   # AES-256-GCM encrypt/decrypt for API keys
    supabase/
      client.ts                 # Browser Supabase client
      server.ts                 # Server Supabase client
      middleware.ts             # Session refresh logic
  proxy.ts                     # Route protection (Next.js 16 proxy)
supabase/
  config.toml                   # Local Supabase config
  migrations/                   # Database migrations (ordered by timestamp)
```

## Auth Flow

1. User logs in via email/password or Google OAuth
2. Supabase sets session cookies
3. Proxy (`src/proxy.ts`) validates session on every request
4. Protected routes redirect to `/login` if no session
5. `/api/user` fetches profile from `profiles` table (auto-creates if missing)

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

- Terminal/CRT green theme throughout the UI
- All protected API routes verify auth via `supabase.auth.getUser()`
- RLS policies on all tables — never bypass RLS from client code
- Branches named `trello/{card-id}-{description}`
- All changes go through pull requests; CI must pass before merging
