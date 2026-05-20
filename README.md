# GabayGamot

GabayGamot is a Next.js App Router project for a barangay medicine coordination system. This repository is currently in the early setup phases, so the focus is on a stable app shell, environment preparation, and documentation before business logic is added.

## Current Foundation

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI foundation
- Supabase folder, migration, and typed client foundation
- Supabase auth foundation with login, signout, confirm routes, and BHW registration pages
- Public routes:
  - `/`
  - `/login`
  - `/signup`
  - `/onboarding`
  - `/pending-approval`
- Auth routes:
  - `/auth/confirm`
  - `/auth/signout`
- Protected placeholder routes:
  - `/dashboard`
  - `/scan`
  - `/inventory`
  - `/dispense`
  - `/ai-insights`
  - `/referrals`

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Environment Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in only the values you already have.
3. Keep server-only secrets out of any `NEXT_PUBLIC_` variable.

Environment placeholders currently prepared:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `MAPBOX_SECRET_TOKEN`
- `ADDRESS_API_BASE_URL`
- `ADDRESS_API_KEY`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_TEMP_PASSWORD`
- `SUPER_ADMIN_DISPLAY_NAME`
- `NEXT_PUBLIC_ENABLE_DEMO_MODE`

## Rules For This Repo

- Use Next.js + TypeScript + Supabase as the source of truth.
- Do not introduce Firebase, Firestore, Cloudinary, Express, Tesseract, or React Vite.
- Do not start inventory, approval, Gemini, or Mapbox logic before their proper phases.
- Keep landing and login routes stable while the foundation grows.

## Project Workflow

Before each phase, read:

- `.agent/system-workflow.md`
- `.agent/project-scaffold-reference.md`
- `.agent/progress.md`
- `.agent/setup-guide.md`
- `.agent/manual-setup-checklist.md`

The current project status and next recommended phase are tracked in `.agent/progress.md`.

## Supabase Foundation

PHASE 3 adds the smallest safe Supabase foundation without starting feature logic:

- `supabase/config.toml`
- `supabase/migrations/`
- `supabase/seed.sql`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`
- `src/types/database.ts`

Useful local Supabase scripts:

```bash
npm run supabase:start
npm run supabase:stop
npm run supabase:status
npm run supabase:db:reset
npm run supabase:db:push
```

## Auth Foundation

PHASE 4 adds the smallest authentication loop without starting approval or business features:

- `/login` now supports email/password login
- `/auth/confirm` verifies SSR email confirmation links
- `/auth/signout` clears the Supabase session from the server
- `src/proxy.ts` refreshes auth cookies and redirects unauthenticated users away from protected routes
- protected routes now require a valid authenticated Supabase user

## BHW Registration Foundation

PHASE 5 extends the auth shell into the first real BHW intake flow without starting map behavior or approval decisions:

- `/signup` collects the first BHW registration details
- `/onboarding` lets already-authenticated accounts complete missing profile fields
- `/pending-approval` holds incomplete or pending accounts outside the protected app
- BHW accounts keep the default `bhw` role and `pending` approval status
- proof documents upload into a private Supabase Storage bucket
- protected routes now require:
  - an authenticated user
  - a complete BHW profile
  - an `approved` profile status
