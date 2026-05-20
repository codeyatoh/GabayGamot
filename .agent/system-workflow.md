# GabayGamot System Workflow

Build GabayGamot one phase at a time.

## Phase Order

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

## Build Rules

- Continue only the next unfinished phase.
- Do not skip phases.
- Do not work on more than one phase in one run.
- Update `.agent/progress.md` after finishing.
- Stop after the current phase.
- If previous phase has errors, fix it first.
- Preserve existing landing page and login page if present.
- Do not use Firebase, Firestore, Cloudinary, Express, or Tesseract unless explicitly requested.
- Use Next.js + Supabase as the source of truth.
- Keep changes small and beginner-friendly.
- Run checks when available.
