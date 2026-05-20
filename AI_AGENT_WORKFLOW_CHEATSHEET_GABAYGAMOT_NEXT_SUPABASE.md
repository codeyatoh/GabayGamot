# AI Agent Workflow Cheatsheet for GabayGamot

For Codex / Cursor Agent / Antigravity Agent / AI Coding Automation

Use this guide every time you continue GabayGamot from scratch using:

- Next.js
- TypeScript
- shadcn/ui
- Tailwind CSS
- Supabase
- Mapbox / Address API
- Gemini API
- Vercel

---

## 1. Main Rule

Do not ask the coding agent:

```text
Build the whole GabayGamot system.
```

Always ask:

```text
Continue only the next unfinished phase.
Do not skip phases.
Do not work on more than one phase.
Update .agent/progress.md after finishing.
Stop after the current phase.
```

This keeps the project clean, easier to debug, and safer for beginner workflow.

---

## 2. Important Tech Stack Decision

Use Next.js as the main app.

Do not create a separate React Vite app unless specifically needed.

Reason:

```text
Next.js already uses React.
Next.js gives routing, pages, layouts, API routes, and server-side logic.
This is better for keeping Gemini API keys and Supabase service logic secure.
```

Final stack:

```text
Frontend: Next.js + React + TypeScript
UI: shadcn/ui + Tailwind CSS
Database: Supabase PostgreSQL
Auth: Supabase Auth
Storage: Supabase Storage
AI: Gemini API
Map: Mapbox API
Address: Address API / Geocoding
Deployment: Vercel
```

---

## 3. Required Project Files

Create this folder in the project root:

```text
.agent/
  project-scaffold-reference.md
  system-workflow.md
  progress.md
  setup-guide.md
  manual-setup-checklist.md
```

Meaning:

```text
project-scaffold-reference.md = full system reference
system-workflow.md = phase-by-phase build order
progress.md = current phase tracker
setup-guide.md = environment, dependencies, API setup guide
manual-setup-checklist.md = manual setup checklist before automation
```

---

## 4. GabayGamot System Summary

GabayGamot is an AI-assisted medicine inventory, monitoring, dispensing, and referral system for barangay health centers.

Goal:

```text
Help barangay health centers reduce medicine waste, prevent expired stock, monitor medicine availability, and refer patients to nearby barangays when a medicine is out of stock.
```

Simple system story:

```text
Register
→ Verify
→ Scan Medicine
→ Save Stock
→ Monitor Expiry and Stock
→ Dispense Medicine
→ Refer if Out of Stock
→ Generate AI Insights
```

---

## 5. Main Users

### Super Admin / System Owner

Main actions:

```text
Log in
Review pending BHW registrations
Verify proof documents
Verify health center map location
Approve or reject accounts
Monitor barangay inventories
View low-stock, near-expiry, expired, and out-of-stock alerts
View referral activities
View AI insights
```

### Barangay Health Worker / Barangay Health Center Staff

Main actions:

```text
Sign up
Upload proof
Pin health center location
Wait for approval
Log in after approval
Scan medicine label using mobile camera
Review Gemini AI extracted medicine details
Manually input quantity
Save medicine batch
Monitor inventory
Dispense medicine
Log illness category
Generate referral if medicine is out of stock
View AI insights
```

### Patient / Resident

No login account.

```text
Patient requests medicine on-site.
If available, BHW dispenses medicine.
If out of stock, BHW generates referral to nearest barangay with available stock.
```

---

## 6. Current Important Rules

### Sign-up rule

```text
No role dropdown.
No role input box.
The sign-up page is only for Barangay Health Workers.
System automatically sets:
role = "bhw"
account_status = "pending"
```

### Approval rule

```text
BHW cannot use the system immediately after sign-up.
Super Admin must approve the account first.
```

### Map rule

```text
The map is for barangay health center location, not the BHW home address.
```

Map must include:

```text
Address search
Street view toggle
Satellite view toggle
Detect location button
Draggable pin
Latitude display
Longitude display
Selected address preview
Confirm location button
```

Important UI rule:

```text
All map-related controls must be inside the map container.
Do not place map buttons outside the map.
```

### Scan rule

```text
Barangay side must use camera scan, not upload-first experience.
```

### Gemini rule

```text
Gemini extracts and suggests.
BHW reviews and confirms.
Gemini must not auto-save final medicine records.
```

### Quantity rule

```text
Quantity must be manually entered by the BHW.
Do not rely on AI for quantity.
```

### Inventory rule

```text
Use batch-based inventory.
Same medicine with different expiry dates must be saved as separate batches.
```

### Referral rule

```text
Generate referral ≠ deduct stock.
Stock should be deducted only when the receiving barangay releases the medicine.
```

### AI Insight rule

```text
AI Insights must be actionable, not just reports.
Each insight should explain:
Observation
Reason
Risk
Recommended Action
```

---

## 7. Recommended Folder Structure

```text
gabaygamot/
├── app/
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── pending/page.tsx
│   ├── rejected/page.tsx
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── approvals/page.tsx
│   │   ├── health-centers/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── referrals/page.tsx
│   │   └── insights/page.tsx
│   ├── bhw/
│   │   ├── dashboard/page.tsx
│   │   ├── scan/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── dispense/page.tsx
│   │   ├── referrals/page.tsx
│   │   └── insights/page.tsx
│   ├── api/
│   │   ├── gemini/scan/route.ts
│   │   ├── gemini/insights/route.ts
│   │   ├── referrals/route.ts
│   │   └── address/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── auth/
│   ├── dashboard/
│   ├── forms/
│   ├── map/LocationPicker.tsx
│   ├── scan/CameraScanner.tsx
│   ├── scan/ScanReviewForm.tsx
│   ├── inventory/
│   ├── referrals/
│   └── insights/
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── supabase/middleware.ts
│   ├── gemini.ts
│   ├── mapbox.ts
│   ├── validations.ts
│   └── utils.ts
├── types/
│   ├── database.ts
│   └── index.ts
├── supabase/
│   ├── migrations/
│   └── seed.sql
└── .agent/
```

---

## 8. Database Tables

Use Supabase PostgreSQL.

Recommended tables:

```text
profiles
barangay_health_centers
verification_documents
medicine_master
medicine_batches
dispensing_logs
illness_categories
referrals
ai_insights
scan_history
```

### profiles

```text
id
auth_user_id
full_name
email
contact_number
role
account_status
approved_by
approved_at
rejection_reason
created_at
```

### barangay_health_centers

```text
id
profile_id
health_center_name
barangay
city_municipality
province
full_address
latitude
longitude
location_verified
created_at
```

### verification_documents

```text
id
profile_id
document_type
file_url
status
reviewed_by
reviewed_at
created_at
```

### medicine_master

```text
id
generic_name
brand_name
strength
dosage_form
category
description
prescription_required
created_at
```

### medicine_batches

```text
id
medicine_id
health_center_id
batch_number
quantity
unit
expiry_date
status
created_by
created_at
```

### dispensing_logs

```text
id
medicine_batch_id
health_center_id
dispensed_by
patient_code
illness_id
quantity_dispensed
dispensed_at
notes
```

### illness_categories

```text
id
illness_name
category
requires_referral
notes
```

### referrals

```text
id
requesting_health_center_id
receiving_health_center_id
medicine_id
requested_by
released_by
patient_code
quantity_requested
status
reason
created_at
completed_at
```

### ai_insights

```text
id
health_center_id
generated_for
insight_type
severity
observation
reason
risk
recommended_action
related_medicine_id
created_at
```

### scan_history

```text
id
health_center_id
scanned_by
medicine_id
extracted_data_json
confidence_level
status
created_at
```

---

## 9. Environment Variable Rules

Create `.env.example`.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=GabayGamot

# Gemini
GEMINI_API_KEY=

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
MAPBOX_SECRET_TOKEN=

# Address API / Geocoding
ADDRESS_API_BASE_URL=
ADDRESS_API_KEY=

# Super Admin Seed
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_TEMP_PASSWORD=
SUPER_ADMIN_DISPLAY_NAME=

# Optional
NEXT_PUBLIC_ENABLE_DEMO_MODE=false
```

Rules:

```text
Do not commit .env or .env.local.
Do not print secret values.
Do not put SUPABASE_SERVICE_ROLE_KEY in frontend.
Do not put GEMINI_API_KEY in frontend.
Do not put server-only tokens in NEXT_PUBLIC variables.
Only public browser-safe keys can use NEXT_PUBLIC.
```

---

## 10. UI Color Palette

```text
Primary / Main Blue: #2563EB
Primary Dark / Sidebar: #0F172A
Secondary Teal: #0D9488
Soft Medical Background: #EFF6FF
Page Background: #F8FAFC
Card Background: #FFFFFF
Success / Available Stock: #16A34A
Warning / Near Expiry: #F59E0B
Danger / Expired: #DC2626
Info / AI Insight: #0891B2
Main Text: #1E293B
Muted Text: #64748B
Border: #E2E8F0
```

---

## 11. Recommended Phase Pattern

```text
PHASE 0  - Project Analysis
PHASE 1  - Project Foundation Setup
PHASE 2  - Environment and Documentation Setup
PHASE 3  - Supabase Schema and Security Foundation
PHASE 4  - Authentication and Profile Foundation
PHASE 5  - BHW Sign-up and Pending Approval Flow
PHASE 6  - Mapbox Location Picker and Address API
PHASE 7  - Super Admin Approval Workflow
PHASE 8  - Dashboard Layouts and Navigation
PHASE 9  - Medicine Master and Batch Inventory
PHASE 10 - Camera Scan and Gemini Extraction
PHASE 11 - Scan Review, Database Matching, and Manual Quantity
PHASE 12 - Inventory Monitoring and Alerts
PHASE 13 - Dispensing Logs and Stock Deduction
PHASE 14 - Common Illness Logging
PHASE 15 - Nearby Barangay Medicine Referral
PHASE 16 - Actionable Gemini AI Insights
PHASE 17 - Reports, Audit Trail, and Export Basics
PHASE 18 - Security Hardening and RLS Review
PHASE 19 - Responsive QA, PWA Readiness, and Final Testing
```

Important:

```text
Do not add AI Insights before real inventory, dispensing, illness, and referral data exist.
Do not build referral before inventory and health center location are working.
Do not build dispensing before medicine batches are working.
Do not polish UI heavily before core features are stable.
```

---

## 12. Setup Preparation Prompt

```text
Act as a senior full-stack setup engineer.

Read these files first:
.agent/system-workflow.md
.agent/project-scaffold-reference.md
.agent/progress.md

Your task is NOT to build app features yet.

Prepare the GabayGamot project setup for a Next.js + Supabase + shadcn/ui + Mapbox + Gemini API stack.

Rules:
1. Do not implement app features yet.
2. Do not add real API keys.
3. Do not guess secret values.
4. Do not expose secrets in frontend code.
5. Create templates and guides only.
6. Preserve the current folder structure.
7. Do not create duplicate config files.
8. Do not use Firebase, Firestore, Cloudinary, Tesseract.js, or Express unless I explicitly request it.
9. Update .agent/progress.md after finishing.

Tasks:
1. Inspect package.json, configs, .gitignore, env files, and project structure.
2. Confirm whether this is a Next.js TypeScript project.
3. Create or update `.env.example`.
4. Create or update `.gitignore`.
5. Create or update `.agent/setup-guide.md`.
6. Create or update `.agent/manual-setup-checklist.md`.
7. List all Supabase, Mapbox, Address API, Gemini, and Super Admin seed values I need to provide manually.
8. Tell me where each value should be placed.
9. Check if shadcn/ui and Tailwind are properly configured.
10. Run safe checks if available, such as npm run lint, npm run typecheck, or npm run build.
11. Update `.agent/progress.md`.

Stop after setup preparation.

At the end, summarize:
- Phase completed
- Files changed
- Commands run
- Manual setup needed
- Next recommended phase
```

---

## 13. Phase 0 Prompt

```text
Read these files first:
.agent/system-workflow.md
.agent/project-scaffold-reference.md
.agent/progress.md

Start PHASE 0 only: PROJECT ANALYSIS.

Do not code yet.
Do not create features yet.
Do not install dependencies unless needed only for inspection.

Only inspect:
- project structure
- package files
- dependencies
- routes
- app directory
- components
- hooks
- lib directory
- Supabase setup
- shadcn/ui setup
- Tailwind setup
- Mapbox setup
- Gemini setup
- environment files
- docs folder
- .agent folder

Important:
- This project should use Next.js + TypeScript + Supabase.
- Do not introduce Firebase, Firestore, Cloudinary, Express, or Tesseract.js.
- Do not rebuild existing landing page or login page if they already exist.

After analysis, update .agent/progress.md with:
- Current project status
- Existing folder structure
- Installed dependencies
- Missing dependencies
- Existing routes/pages/components/hooks
- API setup status
- Supabase setup status
- shadcn/ui setup status
- Mapbox setup status
- Gemini setup status
- Errors found
- Recommended next phase

Stop after PHASE 0.

At the end, summarize:
- Phase completed
- Files inspected
- Files changed
- Commands run
- Manual setup needed
- Next recommended phase
```

---

## 14. Phase 1 Prompt

```text
Read these files first:
.agent/system-workflow.md
.agent/project-scaffold-reference.md
.agent/progress.md
.agent/setup-guide.md
.agent/manual-setup-checklist.md

Continue to PHASE 1 only: PROJECT FOUNDATION SETUP.

Rules:
1. Do not implement real business features yet.
2. Do not start database logic yet.
3. Do not start approval logic yet.
4. Do not start inventory logic yet.
5. Do not start Gemini AI features yet.
6. Do not start Mapbox behavior yet.
7. Create only the smallest stable app foundation.
8. Preserve the existing landing page and login page if present.
9. Use Next.js App Router.
10. Use TypeScript.
11. Use shadcn/ui and Tailwind for UI foundation.
12. Update .agent/progress.md after finishing.

Tasks:
1. Ensure the Next.js app runs.
2. Ensure app layout is stable.
3. Ensure package scripts are clear.
4. Ensure Tailwind and shadcn/ui are configured.
5. Ensure basic route structure exists.
6. Create placeholder protected route groups if needed.
7. Ensure .gitignore ignores env files, build output, node_modules, caches, and logs.
8. Run safe checks if available.
9. Update .agent/progress.md.

Stop after PHASE 1.

At the end, summarize:
- Phase completed
- Files changed
- Dependencies installed
- Commands run
- Errors fixed
- Manual setup needed
- Next recommended phase
```

---

## 15. Automatic Continue Prompt

```text
Read these files first:
.agent/system-workflow.md
.agent/project-scaffold-reference.md
.agent/progress.md
.agent/setup-guide.md
.agent/manual-setup-checklist.md

Automatically continue the next unfinished phase of the GabayGamot project.

Rules:
1. Always check .agent/progress.md first.
2. Detect the current completed phase.
3. Continue only the next unfinished phase.
4. Do not skip phases.
5. Do not work on more than one phase in one run.
6. If the previous phase has errors, fix the errors first instead of starting a new phase.
7. Analyze the codebase before editing.
8. Follow the existing folder structure.
9. Keep changes small and stable.
10. Do not create duplicate config files.
11. Do not print secret values from env files.
12. Do not expose server-only secrets to the browser.
13. Preserve responsive and PWA-friendly rules.
14. Update matching docs when behavior changes.
15. Run checks if available, such as npm run build, npm run lint, or npm run typecheck.
16. If missing environment variables, credentials, API keys, Supabase policies, or manual setup is needed, stop and clearly list what I need to do.
17. After finishing, update .agent/progress.md.

Important project rules:
- Use Next.js + Supabase, not Firebase.
- Use Gemini API only through secure server-side route handlers.
- Use Mapbox/Address API for health center location and nearby referral.
- Keep BHW sign-up role automatic.
- Keep patient as on-site actor only, no patient login.
- Keep AI Insights actionable: Observation, Reason, Risk, Recommended Action.

At the end, summarize:
- Phase completed
- Files changed
- Commands run
- Errors fixed
- Manual setup needed
- Next phase

Stop after one phase only.
```

---

## 16. Cleanup Prompt

```text
Analyze the project root and clean duplicate or generated setup files safely.

Rules:
1. Do not delete source code.
2. Do not delete .agent files.
3. Do not delete docs.
4. Do not delete .env, .env.local, or .env.example.
5. Do not print secret values.
6. Keep TypeScript config files as the source of truth.
7. If two config files exist with the same purpose, compare them first before deleting.
8. Only remove duplicate/generated files if safe.
9. Update .gitignore so generated files do not appear again.
10. Update .agent/progress.md after cleanup.

Check:
- duplicate config files
- duplicate app directories
- duplicate components
- duplicate Supabase clients
- duplicate middleware files
- build cache files
- .next/
- node_modules/
- temporary files
- logs
- duplicated docs

Expected cleanup:
- Keep source code.
- Keep .agent files.
- Keep env examples.
- Remove generated cache files if safe.
- Make sure node_modules, .next, env files, logs, and build files are ignored.

Run checks if available.

At the end, summarize:
- Files kept
- Files removed
- .gitignore updates
- Commands run
- Any errors found
```

---

## 17. UI Improvement Prompt

```text
Improve the UI only for the completed phase.

Rules:
1. Do not add new business features.
2. Do not start the next phase.
3. Do not change database logic.
4. Do not modify authentication logic.
5. Do not change calculations.
6. Keep existing functionality working.
7. Use the existing Next.js + shadcn/ui + Tailwind stack.
8. Follow the GabayGamot healthcare theme.
9. Preserve responsive and PWA-friendly rules.
10. Make sure build still passes.
11. Update .agent/progress.md with UI improvements made.
12. Update matching docs if visible UI behavior changed.

GabayGamot healthcare theme:
- medical blue
- teal
- soft sky background
- white cards
- slate text
- green for available stock
- amber for near-expiry
- red for expired/critical
- cyan for AI insights

Focus only on:
[PAGE OR COMPONENT NAME]
```

---

## 18. Mapbox Location Picker Prompt

```text
Continue only the current Mapbox Location Picker phase.

Rules:
1. Do not work on inventory.
2. Do not work on Gemini scanning.
3. Do not work on referral logic yet.
4. Do not change unrelated pages.
5. Preserve the existing sign-up design.
6. All map-related controls must be inside the map container.
7. Update .agent/progress.md after finishing.

Build a Mapbox-powered health center location picker for the BHW sign-up page.

Required map features:
- Address search inside the map
- Street view button inside the map
- Satellite view button inside the map
- Detect Location button inside the map
- Draggable marker/pin
- Selected address preview inside the map
- Latitude display inside the map
- Longitude display inside the map
- Confirm Location button inside the map

Behavior:
- Detect Location asks browser permission.
- After detecting location, move the map to the detected coordinates.
- Place marker on detected coordinates.
- User can still drag the marker manually.
- Every marker movement updates latitude and longitude.
- Confirm Location saves full_address, latitude, longitude, barangay, city_municipality, and province to the sign-up form state.
- The pinned location should represent the barangay health center, not the BHW home address.

Stop after the Mapbox location picker is completed.

At the end, summarize:
- Phase completed
- Files changed
- Commands run
- Manual setup needed
- Next recommended phase
```

---

## 19. Gemini Camera Scan Prompt

```text
Continue only the current Camera Scan and Gemini Extraction phase.

Rules:
1. Do not work on AI Insights yet.
2. Do not work on referral flow yet.
3. Do not change authentication logic.
4. Do not expose Gemini API key to frontend.
5. Use a secure Next.js route handler for Gemini calls.
6. Camera scan must feel like a mobile camera app.
7. Do not make upload-first UX.
8. Update .agent/progress.md after finishing.

Build the medicine scan flow.

Required flow:
1. BHW opens /bhw/scan.
2. Camera opens.
3. BHW points camera to medicine label.
4. BHW taps Scan Medicine.
5. The app captures an image frame.
6. The image is sent to a secure Next.js API route.
7. Gemini extracts medicine details.
8. The system returns structured JSON fields.
9. The app shows a scan review page/form.
10. The BHW can edit extracted fields.
11. Quantity must be manually entered by the BHW.
12. Do not auto-save without review.

Gemini should extract:
- medicine_name
- generic_name
- brand_name
- strength
- dosage_form
- category
- expiry_date
- batch_number
- manufacturer
- confidence_level

Expected structured output:
{
  "medicine_name": "",
  "generic_name": "",
  "brand_name": "",
  "strength": "",
  "dosage_form": "",
  "category": "",
  "expiry_date": "",
  "batch_number": "",
  "manufacturer": "",
  "confidence_level": "high | medium | low",
  "warnings": []
}

Stop after scan extraction and review flow are working.

At the end, summarize:
- Phase completed
- Files changed
- Commands run
- Manual setup needed
- Next recommended phase
```

---

## 20. Gemini Database Matching Prompt

```text
Continue only the current Scan Review, Database Matching, and Manual Quantity phase.

Rules:
1. Do not build AI Insights yet.
2. Do not build referral logic yet.
3. Do not change camera capture unless required.
4. Do not auto-save AI results without BHW review.
5. Quantity must remain manual.
6. Update .agent/progress.md after finishing.

Build medicine database matching after Gemini extraction.

Required flow:
1. Gemini extracts medicine details.
2. System searches medicine_master using generic_name, brand_name, strength, and dosage_form.
3. If same medicine exists, load existing medicine_master data.
4. If same medicine has same expiry and batch in medicine_batches, suggest adding quantity to existing batch.
5. If same medicine has different expiry date, create a new batch after confirmation.
6. If no medicine exists, allow BHW to create new medicine_master record after reviewing AI-extracted details.
7. Always save actual stock in medicine_batches.
8. Do not merge different expiry dates into one stock record.

Cases:
- Existing medicine + same batch = add quantity
- Existing medicine + different expiry = create new batch
- New medicine = create medicine_master + first medicine_batch

Stop after database matching and manual quantity save are working.

At the end, summarize:
- Phase completed
- Files changed
- Commands run
- Manual setup needed
- Next recommended phase
```

---

## 21. Referral Workflow Prompt

```text
Continue only the current Nearby Barangay Medicine Referral phase.

Rules:
1. Do not build AI Insights yet unless the phase explicitly includes a basic explanation card.
2. Do not change scan logic.
3. Do not change authentication logic.
4. Stock must not be deducted when referral is generated.
5. Stock is deducted only when the receiving barangay releases the medicine.
6. Update .agent/progress.md after finishing.

Build the out-of-stock referral workflow.

Required flow:
1. Patient requests medicine on-site.
2. BHW searches medicine.
3. If medicine is available, continue normal dispensing.
4. If medicine is out of stock, show Find Nearby Barangay button.
5. System checks medicine_batches across approved barangay health centers.
6. Exclude expired stock.
7. Include only valid available stock.
8. Use Mapbox coordinates to rank nearest barangay health centers.
9. Show suggested barangays with:
   - health center name
   - barangay
   - distance
   - available quantity
   - expiry status
10. BHW selects receiving barangay.
11. System generates referral.
12. Referral status starts as Pending.
13. Receiving barangay can mark as Completed or Declined.
14. If Completed, deduct stock from receiving barangay.
15. If Declined, do not deduct stock.

Referral statuses for MVP:
- pending
- completed
- declined

Stop after referral workflow is working.

At the end, summarize:
- Phase completed
- Files changed
- Commands run
- Manual setup needed
- Next recommended phase
```

---

## 22. Actionable AI Insights Prompt

Use this only after inventory, dispensing, illness logging, and referrals have real data.

```text
Continue only the current Actionable Gemini AI Insights phase.

Rules:
1. Do not create generic dashboard summaries only.
2. AI Insights must explain why the data matters.
3. AI must not diagnose patients.
4. AI must not prescribe medicine.
5. AI must not automatically perform actions.
6. Health workers and Super Admin make final decisions.
7. Use Gemini through secure server-side route handlers only.
8. Update .agent/progress.md after finishing.

Build actionable AI Insights for GabayGamot.

Each insight must follow this structure:
- title
- severity: low | medium | high
- observation
- reason
- risk
- recommended_action
- related_medicine
- related_barangay
- generated_at

AI should analyze:
- medicine stock levels
- low stock
- out-of-stock medicines
- near-expiry medicines
- expired medicines
- dispensing logs
- common illness logs
- referral patterns
- overstock risk
- shortage risk

Insight types:
1. Shortage Risk Insight
2. Expiry Waste Risk Insight
3. Overstock Insight
4. Referral Pattern Insight
5. Common Illness Demand Insight
6. Procurement Planning Insight
7. Barangay Stock Imbalance Insight

Example:
Title: Paracetamol Shortage Risk
Observation: Paracetamol stock is low.
Reason: Fever-related cases increased this week and dispensing records show higher usage than usual.
Risk: The barangay may run out of Paracetamol within 7 days.
Recommended Action: Request restock or check nearby barangays with available stock.

Stop after AI insights are generated, stored, and displayed in the dashboard.

At the end, summarize:
- Phase completed
- Files changed
- Commands run
- Manual setup needed
- Next recommended phase
```

---

## 23. Responsive QA Prompt

```text
Perform responsive and PWA-friendly UI QA only.

Rules:
1. Do not add new features.
2. Do not change business logic.
3. Do not change database logic.
4. Do not change auth logic.
5. Fix only layout, spacing, overflow, touch target, and responsive issues.
6. Preserve the current design direction.
7. Update .agent/progress.md.
8. Update docs if responsive behavior changed.

Check these widths:
- 320px mobile
- 390px mobile
- 768px tablet
- 1024px desktop
- 1440px large desktop
- 2560px ultra-wide

Check:
- no accidental horizontal scroll
- touch targets at least 44px
- dialogs fit mobile
- tables have responsive behavior
- forms are usable on mobile
- safe-area padding works
- auth screens keep centered card structure
- sidebar works on mobile
- camera scan page works on mobile
- map controls stay inside the map container
- dashboard cards do not overflow
- console has no layout-related errors

Run build checks if available.

Stop after responsive QA.
```

---

## 24. MCP / Tool Usage Prompt

```text
Use available MCP tools when they improve accuracy or verification.

Use Context7 for:
- Next.js App Router
- Route Handlers
- Supabase Auth
- Supabase SSR
- Supabase Storage
- Supabase Row Level Security
- shadcn/ui
- Tailwind CSS
- Radix UI
- Mapbox GL JS
- Gemini API
- Zod
- React Hook Form

Use Playwright for:
- auth routes
- sign-up form
- map behavior
- dashboard layout
- camera scan page
- referral flow
- responsive checks
- screenshots
- console error checks

Do not blindly copy examples.
Apply documentation to the current GabayGamot project structure.

Update docs when code, UI, database, API, Supabase, workflow, MCP, or system behavior changes.
```

---

## 25. Intelligence Settings

```text
Setup preparation: Medium or High
Phase 0 analysis: High
Phase 1 foundation: Medium or High
Supabase schema/RLS: High
Authentication: High
Mapbox phase: High
Gemini scan phase: High
Referral workflow: High
AI Insights: High
UI polish only: Medium
Responsive QA: Medium or High
Security/database/auth debugging: High
```

---

## 26. Best Workflow

1. Create fresh Next.js project.
2. Add shadcn/ui.
3. Create Supabase project.
4. Add `.agent` folder.
5. Add `project-scaffold-reference.md`.
6. Add `system-workflow.md`.
7. Add `progress.md`.
8. Add `setup-guide.md`.
9. Add `manual-setup-checklist.md`.
10. Run setup preparation prompt.
11. Run Phase 0 prompt.
12. Run Phase 1 manually.
13. Test the app.
14. Continue one phase at a time.
15. Review each phase.
16. Polish UI later.
17. Add animations only after stable core features.

---

## 27. Golden Rule

Never tell Codex:

```text
Build the whole system.
```

Always tell Codex:

```text
Continue only the next unfinished phase.
Do not skip phases.
Do not work on more than one phase.
Update .agent/progress.md after finishing.
Stop after the current phase.
```

---

## 28. First Prompt to Create the .agent Files

Use this in Codex after you create the fresh Next.js project.

```text
Act as a senior full-stack project scaffold planner.

Create the `.agent` folder and the required project workflow files for GabayGamot.

Tech stack:
- Next.js
- TypeScript
- shadcn/ui
- Tailwind CSS
- Supabase
- Mapbox / Address API
- Gemini API
- Vercel

Create these files:
.agent/project-scaffold-reference.md
.agent/system-workflow.md
.agent/progress.md
.agent/setup-guide.md
.agent/manual-setup-checklist.md

Rules:
1. Do not build app features yet.
2. Do not install dependencies unless missing and necessary.
3. Do not add real API keys.
4. Do not expose secrets.
5. Do not create Firebase, Firestore, Cloudinary, Express, or Tesseract setup.
6. Use Next.js + Supabase as the source of truth.
7. Preserve the current landing page and login page if they already exist.
8. Keep the workflow beginner-friendly.
9. Make the project phase-based.
10. Update .agent/progress.md after creating the files.

The system is GabayGamot:
An AI-assisted medicine inventory, monitoring, dispensing, and referral system for barangay health centers.

Main flow:
BHW signs up without choosing a role.
System automatically sets role as BHW and account status as Pending.
BHW uploads valid ID and BHW accreditation or health center endorsement.
BHW pins barangay health center location using Mapbox with street/satellite view, detect location, draggable pin, latitude, and longitude.
Super Admin approves or rejects the account.
Approved BHW logs in.
BHW scans medicine label using mobile camera.
Gemini extracts medicine details.
System checks if medicine already exists in database.
BHW reviews details and manually enters quantity.
System saves stock by batch and expiry date.
System monitors stock and expiry.
Patient requests medicine on-site.
If available, BHW dispenses medicine and stock is deducted.
If out of stock, Mapbox suggests nearest barangay with available stock.
BHW generates referral.
Receiving barangay releases medicine.
Gemini generates actionable AI insights using Observation, Reason, Risk, and Recommended Action.

At the end, summarize:
- Files created
- Phase workflow created
- Manual setup needed
- Next recommended prompt to run
```
