# GabayGamot Setup Guide

## Stack

- Next.js
- TypeScript
- shadcn/ui
- Tailwind CSS
- Supabase
- Mapbox
- Gemini API
- Vercel

## Environment Variables

Create `.env.local` from `.env.example`.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=GabayGamot

GEMINI_API_KEY=

NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
MAPBOX_SECRET_TOKEN=

ADDRESS_API_BASE_URL=https://psgc.cloud/api
ADDRESS_API_KEY=

SUPER_ADMIN_EMAIL=
SUPER_ADMIN_TEMP_PASSWORD=
SUPER_ADMIN_DISPLAY_NAME=

NEXT_PUBLIC_ENABLE_DEMO_MODE=false
```

## Secret Rules

- Do not commit `.env` or `.env.local`.
- Do not print secret values.
- Do not put `SUPABASE_SERVICE_ROLE_KEY` in frontend.
- Do not put `GEMINI_API_KEY` in frontend.
- Do not put server-only tokens in `NEXT_PUBLIC_`.
- Use secure Next.js route handlers for Gemini and sensitive server logic.

## Manual Setup Needed

1. Create Supabase project.
2. Copy Supabase URL and anon key.
3. Copy the Supabase publishable key for browser-safe access. The legacy anon key can remain as a fallback.
4. Store service role key only in server environment.
5. Create Mapbox public token.
6. Create Gemini API key.
7. Confirm Address API / geocoding service.
8. Add super admin seed credentials.
9. Configure Supabase Storage for proof documents.
10. Configure Supabase RLS policies.
11. Deploy to Vercel after local build passes.
12. Apply the latest Phase 16 migration for patient, consultation, and consultation medicine request support before testing the consultation-first flow.
13. Apply the Phase 17 migration for `audit_events` before expecting persisted audit trail records.

## Current Integration Notes

- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is the current required Mapbox value.
- `MAPBOX_SECRET_TOKEN` can stay blank until a later phase actually needs server-side Mapbox requests.
- `ADDRESS_API_BASE_URL` currently uses `https://psgc.cloud/api` for development-friendly PSGC lookups.
- `ADDRESS_API_KEY` can stay blank while `psgc.cloud` is in use.

## Supabase Auth Template Note

If email confirmation is enabled in your hosted Supabase project, update the Confirm Signup email template so SSR confirmation links reach the app route handler:

```txt
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/pending-approval
```

This matches the PHASE 5 BHW registration flow in the Next.js app.
