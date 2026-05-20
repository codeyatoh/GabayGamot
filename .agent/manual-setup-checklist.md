# GabayGamot Manual Setup Checklist

## Before Running Automation

- [ ] Fresh Next.js project created
- [ ] TypeScript enabled
- [ ] Tailwind CSS installed
- [ ] shadcn/ui initialized
- [ ] Supabase project created
- [ ] `.env.local` created
- [ ] `.env.example` exists
- [ ] Mapbox token ready
- [ ] Gemini API key ready
- [ ] Address API selected
- [ ] `.agent` folder added
- [ ] `project-scaffold-reference.md` added
- [ ] `system-workflow.md` added
- [ ] `progress.md` added
- [ ] `setup-guide.md` added
- [ ] `manual-setup-checklist.md` added

## Safety Checks

- [ ] `.env.local` is ignored
- [ ] No secret keys are committed
- [ ] Gemini API key is server-only
- [ ] Supabase service role key is server-only
- [ ] Mapbox public token is okay for frontend
- [ ] Landing page and login page are preserved if already present
- [ ] Supabase confirm-signup email template points to `/auth/confirm`
- [ ] Supabase confirm-signup email template points to `/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/pending-approval`
- [ ] Supabase Storage bucket for BHW proof documents exists after migrations are applied
- [ ] `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is set if future map UI work needs it
- [ ] `ADDRESS_API_BASE_URL` matches the chosen PSGC endpoint

## First Codex Prompt

Use the setup preparation prompt from the cheatsheet first.

Do not ask Codex to build the whole system.
