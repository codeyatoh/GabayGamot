# GabayGamot Project Scaffold Reference

## Project Name

GabayGamot

## Tech Stack

- Next.js
- TypeScript
- shadcn/ui
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Mapbox / Address API
- Gemini API
- Vercel

## Main Idea

GabayGamot is an AI-assisted medicine inventory, monitoring, dispensing, and referral system for barangay health centers.

It helps barangay health workers:
- scan medicine labels using a mobile camera
- save medicine details by batch and expiry date
- monitor low stock, out-of-stock, near-expiry, and expired medicines
- dispense medicine to on-site patients
- refer patients to the nearest barangay with available stock
- use actionable AI insights to prevent medicine waste and improve stock planning

## Main Users

### Super Admin

- verifies BHW accounts
- checks uploaded proof documents
- checks health center map location
- approves or rejects accounts
- monitors all barangay inventories
- views referral activity
- views AI insights

### Barangay Health Worker

- signs up without role selection
- uploads proof documents
- pins barangay health center location
- waits for Super Admin approval
- scans medicine
- reviews AI extracted data
- manually enters quantity
- saves medicine stock by batch
- dispenses medicine
- logs illness category
- generates referral if medicine is unavailable

### Patient / Resident

- no login
- visits barangay health center on-site
- requests medicine
- receives medicine or referral

## Core Flow

Register → Verify → Scan → Save Stock → Monitor → Dispense → Refer if Out of Stock → AI Gives Actionable Insights

## Important Rules

- No role dropdown in BHW signup.
- BHW role is automatically assigned.
- New BHW account status is pending.
- Super Admin must approve account before access.
- Map pin is for barangay health center location, not home address.
- All map controls must be inside the map container.
- Use camera-first scan, not upload-first UX.
- Gemini extracts and suggests only.
- BHW reviews and confirms before saving.
- Quantity is manually entered by BHW.
- Use batch-based inventory.
- Expired medicine cannot be dispensed or referred.
- Stock is deducted only after dispensing or completed referral release.
- AI Insights must include Observation, Reason, Risk, and Recommended Action.

## UI Theme

Use a clean healthcare SaaS style:
- Primary Blue: #2563EB
- Deep Navy: #0F172A
- Teal: #0D9488
- Soft Blue Background: #EFF6FF
- Page Background: #F8FAFC
- Card: #FFFFFF
- Success Green: #16A34A
- Warning Amber: #F59E0B
- Danger Red: #DC2626
- Info Cyan: #0891B2
- Text Slate: #1E293B
- Muted Text: #64748B
- Border: #E2E8F0
