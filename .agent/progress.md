# GabayGamot - Project Progress Tracker

## Current Status

PHASE 5 - BHW Sign-up and Pending Approval Flow completed for `D:\Clients Project\Codex.GabayGamot`.

The project now has a working Supabase auth foundation plus the first real BHW registration flow. Users can register through a dedicated signup page, complete missing registration details through onboarding, upload one proof document, and stay blocked in a pending-approval route until a later approval phase exists. The landing page remains intact, and the app still has not started approval decision logic, inventory logic, Mapbox behavior, or Gemini feature work.

## Completed Phases

- [x] PHASE 0 - Project Analysis
- [x] PHASE 1 - Project Foundation Setup
- [x] PHASE 2 - Environment and Documentation Setup
- [x] PHASE 3 - Supabase Schema and Security Foundation
- [x] PHASE 4 - Authentication and Profile Foundation
- [x] PHASE 5 - BHW Sign-up and Pending Approval Flow
- [ ] PHASE 6 - Mapbox Location Picker and Address API
- [ ] PHASE 7 - Super Admin Approval Workflow
- [ ] PHASE 8 - Dashboard Layouts and Navigation
- [ ] PHASE 9 - Medicine Master and Batch Inventory
- [ ] PHASE 10 - Camera Scan and Gemini Extraction
- [ ] PHASE 11 - Scan Review, Database Matching, and Manual Quantity
- [ ] PHASE 12 - Inventory Monitoring and Alerts
- [ ] PHASE 13 - Dispensing Logs and Stock Deduction
- [ ] PHASE 14 - Common Illness Logging
- [ ] PHASE 15 - Nearby Barangay Medicine Referral
- [ ] PHASE 16 - Actionable Gemini AI Insights
- [ ] PHASE 17 - Reports, Audit Trail, and Export Basics
- [ ] PHASE 18 - Security Hardening and RLS Review
- [ ] PHASE 19 - Responsive QA, PWA Readiness, and Final Testing

## Cleanup Summary

- Status: completed
- Scope:
  - inspected the whole project structure before deleting anything
  - verified landing page, login page, and shared UI files were still referenced
  - removed only generated caches, duplicate asset storage, and unused starter public files
- Safe removals completed:
  - `.next/`
  - `.playwright-mcp/`
  - `tsconfig.tsbuildinfo`
  - root `assets/` duplicate folder
  - unused default public starter files:
    - `public/file.svg`
    - `public/globe.svg`
    - `public/next.svg`
    - `public/vercel.svg`
    - `public/window.svg`
- Kept intentionally:
  - `src/app/page.tsx` landing page
  - `src/app/login/page.tsx` login page
  - all protected placeholder routes
  - `src/components/` UI and foundation components
  - `public/assets/` active image and video assets
  - `.agent/` documentation and tracking files
  - `.env.example`
  - `README.md`, `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `components.json`
- Duplicate or redundant items found:
  - root `assets/` duplicated `public/assets/` and was unused by the app
  - default starter SVG files in `public/` were not referenced anywhere
- Needs manual review:
  - `AGENTS.md` because it contains local agent instructions
  - `CLAUDE.md` because it intentionally points back to `AGENTS.md`
  - `AI_AGENT_WORKFLOW_CHEATSHEET_GABAYGAMOT_NEXT_SUPABASE.md` because it is documentation, not app code
- `.gitignore` updates:
  - added `*.tmp`
  - added `*.temp`
  - added `/tmp`
- added `/temp`

## Phase 3 Summary

- Status: completed
- Added the local Supabase project scaffold with:
  - `supabase/config.toml`
  - `supabase/migrations/`
  - `supabase/seed.sql`
- Created the first migration:
  - `20260520120521_phase_3_schema_security_foundation.sql`
- Added database foundation for:
  - `public.profiles`
  - `public.health_centers`
  - `public.app_role` enum
  - `public.approval_status` enum
- Added security-first SQL:
  - row level security enabled on all new public tables
  - authenticated policies limited to the owner row
  - trigger protection for privileged profile fields
  - service-role-safe access retained for future server operations
- Added typed Supabase helpers:
  - browser client
  - server client
  - admin client
  - typed database contract
- Kept scope intentionally limited:
  - no login implementation
  - no signup flow
  - no approval workflow
  - no inventory schema yet
- no Mapbox or Gemini behavior

## Phase 5 Summary

- Status: completed
- Added the first real BHW intake flow:
  - `/signup` for new BHW account registration
  - `/onboarding` for authenticated accounts with incomplete registration details
  - `/pending-approval` for accounts waiting on future review handling
- Added proof-document foundation:
  - private Supabase Storage bucket migration for `bhw-proof-documents`
  - file validation for PDF, JPG, and PNG uploads up to 5MB
  - server-side upload and profile update helpers
- Tightened protected route access:
  - unauthenticated users still redirect to `/login`
  - incomplete profiles redirect to `/onboarding`
  - non-approved accounts redirect to `/pending-approval`
- Fixed a critical bootstrap bug:
  - profile bootstrapping no longer resets previously reviewed accounts back to `pending` on later sign-ins
- Kept scope intentionally limited:
  - no map pinning yet
  - no approval decision UI or admin workflow yet
  - no inventory, dispensing, or Gemini features yet

## Phase 4 Summary

- Status: completed
- Added authentication foundation for:
  - email/password login
  - email/password signup
  - server-side signout
  - SSR email confirmation route
  - cookie refresh using Next.js `proxy.ts`
- Added protected route guarding for:
  - `/dashboard`
  - `/scan`
  - `/inventory`
  - `/dispense`
  - `/ai-insights`
  - `/referrals`
- Added profile foundation behavior:
  - automatically creates or updates a `profiles` row for a newly authenticated user
  - keeps new accounts on the default `bhw` role and `pending` approval status
  - shows authenticated account context in the protected shell
- Kept scope intentionally limited:
  - no approval decision flow yet
  - no BHW extended signup form yet
  - no proof document upload yet
  - no map location capture yet
  - no inventory or dispensing features yet

## Files / Areas Created or Updated

- Supabase project structure:
  - `supabase/config.toml`
  - `supabase/seed.sql`
  - `supabase/migrations/20260520120521_phase_3_schema_security_foundation.sql`
  - `supabase/migrations/20260520125747_phase_5_bhw_signup_pending_flow.sql`
- Supabase application helpers:
  - `src/lib/env/public.ts`
  - `src/lib/env/server.ts`
  - `src/lib/supabase/client.ts`
  - `src/lib/supabase/server.ts`
  - `src/lib/supabase/admin.ts`
  - `src/lib/supabase/profiles.ts`
  - `src/lib/supabase/proxy.ts`
  - `src/types/database.ts`
- Auth routes and pages:
  - `src/proxy.ts`
  - `src/app/login/page.tsx`
  - `src/app/login/actions.ts`
  - `src/app/signup/page.tsx`
  - `src/app/signup/actions.ts`
  - `src/app/onboarding/page.tsx`
  - `src/app/pending-approval/page.tsx`
  - `src/app/auth/confirm/route.ts`
  - `src/app/auth/signout/route.ts`
- Protected route updates:
  - `src/app/(protected)/layout.tsx`
  - `src/components/foundation/protected-shell.tsx`
  - `src/lib/supabase/proxy.ts`
- Environment and docs:
  - `.env.example`
  - `README.md`
  - `.agent/setup-guide.md`
  - `.agent/manual-setup-checklist.md`
  - `.agent/progress.md`
- Package setup:
  - `package.json`
  - `package-lock.json`

## Phase 2 Summary

- Status: completed
- Added `.env.example` with safe placeholders for:
  - app URL and app name
  - Supabase public and server keys
  - Gemini server key
  - Mapbox public and secret tokens
  - address API values
  - super admin seed placeholders
  - demo mode flag
- Replaced the default Create Next App README with GabayGamot-specific setup and workflow guidance
- Kept the current landing shell and login placeholder intact
- Kept all protected placeholder routes intact
- Fixed the build to work in the restricted environment by removing `next/font/google` dependency on remote font fetching

## Files / Areas Created or Updated

- Environment and docs:
  - `.env.example`
  - `README.md`
  - `.agent/progress.md`
- Build compatibility:
  - `src/app/layout.tsx`
  - `src/app/globals.css`

## Dependencies Added

- Runtime:
  - `@supabase/supabase-js`
  - `@supabase/ssr`
  - `server-only`
- Development:
  - `supabase`

## Commands Run

- Read `.agent/system-workflow.md`
- Read `.agent/project-scaffold-reference.md`
- Read `.agent/progress.md`
- Read `.agent/setup-guide.md`
- Read `.agent/manual-setup-checklist.md`
- `rg --files`
- `rg -n "assets/|public/assets|AGENTS\.md|CLAUDE\.md|AI_AGENT_WORKFLOW_CHEATSHEET" .`
- `rg -n "next\.svg|vercel\.svg|window\.svg|globe\.svg|file\.svg|favicon\.ico|protected-shell|route-placeholder|site-header" src public README.md .agent`
- `rg -n "firebase|firestore|cloudinary|express|tesseract|vite|supabase" .`
- inspected `AGENTS.md`, `CLAUDE.md`, `package.json`, landing page, login page, `.gitignore`, and project tree
- removed generated caches, duplicate root assets, and unused starter public files
- `cmd /c npm run lint`
- `cmd /c npm run typecheck`
- `cmd /c npm run build`
- `cmd /c npm install @supabase/supabase-js @supabase/ssr server-only supabase --save-dev`
- `cmd /c npm install`
- `cmd /c npx supabase init`
- `cmd /c npx supabase migration new phase_3_schema_security_foundation`
- inspected relevant Next.js docs for `proxy`, `form`, `redirect`, and async `searchParams`
- inspected current auth-related routes and Supabase helper files
- `cmd /c npx supabase migration new phase_5_bhw_signup_pending_flow`
- `cmd /c npm run lint`
- `cmd /c npm run typecheck`
- `cmd /c npm run build`
- browser check on `/login`
- browser redirect check from `/dashboard` to `/login`
- browser check on `/signup`

## Errors Fixed

- Replaced the default generic README with project-specific setup instructions
- Added the missing `.env.example` expected by the setup docs
- Fixed build failure caused by blocked Google Fonts fetches from `next/font/google`
- Switched the foundation to system/local font variables so lint, typecheck, and build pass reliably offline
- Corrected the project so Supabase runtime packages are available for Next.js helper files
- Worked around local CLI write restrictions by running Supabase initialization and migration creation with elevated permissions
- Replaced the login placeholder with a real Supabase-backed login/signup page
- Added a Next.js 16 `proxy.ts` file to refresh auth cookies and redirect unauthenticated users away from protected routes
- Added initial profile bootstrapping so authenticated users get a `profiles` row without starting the full BHW signup flow
- Split BHW registration out of `/login` into dedicated signup and onboarding pages
- Added pending-approval gating so incomplete or non-approved BHW accounts stay out of protected routes
- Added proof document validation and upload support for the BHW intake flow
- Fixed the profile bootstrap behavior so existing approval status is not overwritten during later sign-ins

## Manual Setup Needed

- Create `.env.local` from `.env.example`
- Fill in real Supabase URL plus either a publishable key or the legacy anon key
- Fill in `SUPABASE_SERVICE_ROLE_KEY` only in the server environment
- Fill in real Mapbox values later
- Fill in real Gemini key later
- Keep `ADDRESS_API_BASE_URL` aligned with the current PSGC endpoint in `.env.local`
- Apply the new Phase 5 migration so the `bhw-proof-documents` bucket exists in Supabase Storage
- If confirm-email is enabled in Supabase, update the Confirm Signup email template to use `/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/pending-approval`
- Install Docker Desktop or another supported container runtime before running `npm run supabase:start`
- Run the migration locally with `npm run supabase:db:reset` or deploy it later with `npm run supabase:db:push`

## Recommended Next Phase

PHASE 6 - Mapbox Location Picker and Address API

Focus for the next run:

- add a location picker for the BHW health center record
- connect the address flow to the selected PSGC endpoint
- keep approval decisions, inventory logic, and Gemini feature work out of scope

## Notes

- Stop after one phase per run.
- Update this file after every Codex run.
- Keep Next.js App Router as the source of truth.
- Keep server-only secrets out of `NEXT_PUBLIC_` variables.
