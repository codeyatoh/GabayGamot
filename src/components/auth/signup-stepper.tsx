"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  Building2,
  MapPin,
  FileText,
  ClipboardList,
  AlertCircle,
  Info,
  LoaderCircle,
} from "lucide-react";
import { MapLocationPicker } from "@/components/foundation/map-location-picker";
import { registerBhw } from "@/app/signup/actions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";
import { SuffixDropdown } from "@/components/auth/suffix-dropdown";
import { ContactNumberInput } from "@/components/auth/contact-input";
import {
  Stepper,
  StepperNav,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperSeparator,
  StepperPanel,
  StepperContent,
  StepperBadge,
} from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

// ── Step definitions ──────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 1,
    title: "Personal Info",
    icon: <User className="size-4" />,
  },
  {
    id: 2,
    title: "Work Info",
    icon: <Briefcase className="size-4" />,
  },
  {
    id: 3,
    title: "Health Center",
    icon: <Building2 className="size-4" />,
  },
  {
    id: 4,
    title: "Location",
    icon: <MapPin className="size-4" />,
  },
  {
    id: 5,
    title: "Documents",
    icon: <FileText className="size-4" />,
  },
  {
    id: 6,
    title: "Review",
    icon: <ClipboardList className="size-4" />,
  },
];

// ── Shared input/label styles ─────────────────────────────────────────────────

const INPUT_CLS =
  "w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40 disabled:opacity-50";

const LABEL_CLS = "text-sm font-medium text-[#1E293B] dark:text-slate-100";

const OPT = (
  <span className="ml-1 text-xs font-normal text-[#64748B] dark:text-slate-400">
    (optional)
  </span>
);

// ── Main component ────────────────────────────────────────────────────────────

export function SignupStepper() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Controlled state for review summary + validation
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const [position, setPosition] = useState("");
  const [bhwAccreditationNumber, setBhwAccreditationNumber] = useState("");
  const [yearsOfService, setYearsOfService] = useState("");

  const [healthCenterName, setHealthCenterName] = useState("");
  const [proofDocumentName, setProofDocumentName] = useState<string | null>(null);
  const [locationData, setLocationData] = useState({
    province: "",
    municipality: "",
    barangayName: "",
    latitude: "",
    longitude: "",
    mapboxPlaceName: "",
  });

  // ── Validation per step ──────────────────────────────────────────────────
  const passwordChecks = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Number", met: /\d/.test(password) },
    { label: "Capital letter", met: /[A-Z]/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];


  const validateCurrentStep = useCallback(() => {
    if (step === 1) {
      if (!firstName.trim()) return "First name is required.";
      if (!lastName.trim()) return "Last name is required.";
      if (!email.trim()) return "Email is required.";
      if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email address.";
      if (!password.trim()) return "Password is required.";
      if (password.length < 8) return "Password must be at least 8 characters.";
      if (!contactNumber.trim()) return "Contact number is required.";
    }
    if (step === 5) {
      if (!proofDocumentName) return "Please upload a PDF or Word proof document.";
    }
    if (step === 4) {
      if (!locationData.province || !locationData.municipality || !locationData.barangayName) {
        return "Please select the province, city or municipality, and barangay.";
      }
      if (!locationData.latitude || !locationData.longitude) {
        return "Please drop the exact health center pin on the map.";
      }
    }
    return null;
  }, [step, firstName, lastName, email, password, contactNumber, proofDocumentName, locationData]);

  const handleNext = useCallback(() => {
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [validateCurrentStep]);

  const handleBack = useCallback(() => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <form ref={formRef} action={registerBhw}>
      <input type="hidden" name="province" value={locationData.province} />
      <input type="hidden" name="municipality" value={locationData.municipality} />
      <input type="hidden" name="barangayName" value={locationData.barangayName} />
      <input type="hidden" name="latitude" value={locationData.latitude} />
      <input type="hidden" name="longitude" value={locationData.longitude} />
      <input type="hidden" name="mapboxPlaceName" value={locationData.mapboxPlaceName} />
      <Stepper
        value={step}
        onValueChange={(v) => {
          // Only allow going back via stepper clicks
          if (v < step) {
            setError(null);
            setStep(v);
          }
        }}
        indicators={{
          completed: <Check className="size-3.5" />,
          loading: <LoaderCircle className="size-3.5 animate-spin" />,
        }}
        className="w-full space-y-8"
      >
        {/* ── Progress Nav ── */}
        <StepperNav className="gap-0">
          {STEPS.map((s, index) => (
            <StepperItem
              key={s.id}
              step={s.id}
              className="relative flex-1 items-start"
            >
              <StepperTrigger
                className="flex w-full grow flex-col items-start justify-start gap-2"
                onClick={() => {
                  if (s.id < step) {
                    setError(null);
                    setStep(s.id);
                  }
                }}
              >
                <StepperIndicator
                  className={cn(
                    "size-8 border-2 text-sm font-bold",
                    // active
                    step === s.id &&
                      "border-[#2563EB] bg-[#2563EB] text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40",
                    // completed
                    step > s.id &&
                      "border-[#16A34A] bg-[#16A34A] text-white",
                    // inactive
                    step < s.id &&
                      "border-[#CBD5E1] bg-white text-[#94A3B8] dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-500"
                  )}
                >
                  {s.icon}
                </StepperIndicator>

                <div className="flex flex-col items-start gap-1">
                  <div className="text-[#94A3B8] text-[10px] font-semibold uppercase dark:text-slate-500">
                    Step {s.id}
                  </div>
                  <StepperTitle
                    className={cn(
                      "hidden text-start text-xs font-semibold sm:block",
                      step === s.id
                        ? "text-[#0F172A] dark:text-slate-50"
                        : step > s.id
                          ? "text-[#16A34A]"
                          : "text-[#94A3B8] dark:text-slate-500"
                    )}
                  >
                    {s.title}
                  </StepperTitle>
                  <div className="hidden sm:block">
                    {step === s.id && (
                      <StepperBadge variant="primary-light">In Progress</StepperBadge>
                    )}
                    {step > s.id && (
                      <StepperBadge variant="success-light">Completed</StepperBadge>
                    )}
                    {step < s.id && (
                      <StepperBadge variant="secondary">Pending</StepperBadge>
                    )}
                  </div>
                </div>
              </StepperTrigger>

              {/* Separator line between steps */}
              {index < STEPS.length - 1 && (
                <StepperSeparator
                  className={cn(
                    "absolute inset-x-0 start-9 top-4 m-0 w-[calc(100%-2rem)]",
                    step > s.id ? "bg-[#16A34A]" : "bg-[#E2E8F0] dark:bg-slate-700"
                  )}
                />
              )}
            </StepperItem>
          ))}
        </StepperNav>

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626] dark:border-[#DC2626]/30 dark:bg-[#DC2626]/10 dark:text-[#FCA5A5]">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── Step Content Panel ── */}
        <StepperPanel>
          {/* STEP 1 — Personal Information */}
          <StepperContent value={1} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className={LABEL_CLS} htmlFor="firstName">First Name</label>
                <input className={INPUT_CLS} id="firstName" name="firstName" placeholder="e.g. Maria" required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className={LABEL_CLS} htmlFor="lastName">Last Name</label>
                <input className={INPUT_CLS} id="lastName" name="lastName" placeholder="e.g. Santos" required type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className={LABEL_CLS} htmlFor="middleName">Middle Name{OPT}</label>
                <input className={INPUT_CLS} id="middleName" name="middleName" placeholder="e.g. Dela Cruz" type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className={LABEL_CLS} htmlFor="suffix">Suffix{OPT}</label>
                <SuffixDropdown
                  value={suffix}
                  onChange={setSuffix}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={LABEL_CLS} htmlFor="email">Email Address</label>
              <input className={INPUT_CLS} id="email" name="email" placeholder="you@example.com" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <p className="text-xs text-[#64748B] dark:text-slate-400">You will use this email to log in after your account is approved.</p>
            </div>
            <div className="space-y-2">
              <label className={LABEL_CLS} htmlFor="password">Password</label>
              <PasswordInput
                className={INPUT_CLS}
                id="password"
                name="password"
                minLength={8}
                placeholder="At least 8 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                {passwordChecks.map((c) => (
                  <span
                    key={c.label}
                    className={c.met ? "text-green-600 dark:text-green-400 font-medium" : "text-slate-400 dark:text-slate-500"}
                  >
                    {c.met ? "✓ " : "• "}{c.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className={LABEL_CLS} htmlFor="contactNumber">Contact Number</label>
              <ContactNumberInput
                defaultValue={contactNumber}
                onChange={setContactNumber}
              />
            </div>
          </StepperContent>

          {/* STEP 2 — Work Information */}
          <StepperContent value={2} className="space-y-5">
            <div className="space-y-2">
              <label className={LABEL_CLS} htmlFor="position">Position / Designation{OPT}</label>
              <input className={INPUT_CLS} id="position" name="position" placeholder="e.g. Barangay Health Worker" type="text" value={position} onChange={(e) => setPosition(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className={LABEL_CLS} htmlFor="bhwAccreditationNumber">BHW Accreditation Number{OPT}</label>
              <input className={INPUT_CLS} id="bhwAccreditationNumber" name="bhwAccreditationNumber" placeholder="e.g. BHW-2024-001234" type="text" value={bhwAccreditationNumber} onChange={(e) => setBhwAccreditationNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className={LABEL_CLS} htmlFor="yearsOfService">Years of Service{OPT}</label>
              <input className={INPUT_CLS} id="yearsOfService" name="yearsOfService" min={0} max={50} placeholder="e.g. 3" type="number" value={yearsOfService} onChange={(e) => setYearsOfService(e.target.value)} />
            </div>
          </StepperContent>

          {/* STEP 3 — Health Center Details */}
          <StepperContent value={3} className="space-y-5">
            <div className="space-y-2">
              <label className={LABEL_CLS} htmlFor="healthCenterName">Health Center Name{OPT}</label>
              <input className={INPUT_CLS} id="healthCenterName" name="healthCenterName" placeholder="e.g. Barangay Health Center San Jose" type="text" value={healthCenterName} onChange={(e) => setHealthCenterName(e.target.value)} />
            </div>
            <div className="rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3 text-xs leading-relaxed text-[#1D4ED8] dark:border-[#1D4ED8]/40 dark:bg-[#1D4ED8]/10 dark:text-[#BFDBFE]">
              Use the next step to select the province, city or municipality, and barangay from the PSGC address list, then drop the map pin for the exact health center location.
            </div>
          </StepperContent>

          {/* STEP 4 — Location */}
          <StepperContent value={4} className="space-y-5">
            <MapLocationPicker
              showHiddenInputs={false}
              onLocationDataChange={setLocationData}
            />
          </StepperContent>

          {/* STEP 5 — Verification Documents */}
          <StepperContent value={5} className="space-y-5">
            <div className="rounded-2xl border border-[#FEF3C7] bg-[#FFFBEB] px-4 py-3 dark:border-[#F59E0B]/30 dark:bg-[#F59E0B]/10">
              <div className="flex items-start gap-2 text-sm text-[#92400E] dark:text-[#FCD34D]">
                <Info className="mt-0.5 size-4 shrink-0" />
                <p>Upload one clear and readable proof document. Accepted formats: PDF, DOC, or DOCX. Maximum 5 MB.</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className={LABEL_CLS} htmlFor="proofDocument">Proof Document</label>
              <div className="relative overflow-hidden rounded-2xl border border-[#DBEAFE] bg-[#F8FAFC] shadow-sm transition hover:border-[#93C5FD] dark:border-slate-700 dark:bg-white/5 dark:hover:border-[#60A5FA]">
                <input
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  id="proofDocument"
                  name="proofDocument"
                  required
                  type="file"
                  onChange={(e) => setProofDocumentName(e.target.files?.[0]?.name ?? null)}
                />
                <div className="flex items-center gap-3 px-4 py-4">
                  <span className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm dark:bg-[#3B82F6]">
                    Select File
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1E293B] dark:text-slate-100">
                      {proofDocumentName || "No file selected yet"}
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-slate-400">
                      Tap anywhere in this box to open your files.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                PDF, DOC, or DOCX only. Maximum 5 MB.
              </p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Upload your BHW accreditation, endorsement letter, or other official proof document.</p>
            </div>
          </StepperContent>

          {/* STEP 6 — Review & Submit */}
          <StepperContent value={6} className="space-y-5">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white dark:border-slate-700 dark:bg-[#101B2D] overflow-hidden">
              <div className="border-b border-[#E2E8F0] bg-[#EFF6FF] px-5 py-3 dark:border-slate-700 dark:bg-[#172338]">
                <p className="text-sm font-bold text-[#1E293B] dark:text-slate-100">Registration Summary</p>
              </div>
              <div className="divide-y divide-[#E2E8F0] dark:divide-slate-700">
                {[
                  {
                    section: "Personal Information",
                    rows: [
                      { label: "Full Name", value: [firstName, middleName, lastName, suffix].filter(Boolean).join(" ") || "—" },
                      { label: "Email", value: email || "—" },
                      { label: "Contact Number", value: contactNumber || "—" },
                    ],
                  },
                  {
                    section: "Work Information",
                    rows: [
                      { label: "Position", value: position || "—" },
                      { label: "Accreditation No.", value: bhwAccreditationNumber || "—" },
                      { label: "Years of Service", value: yearsOfService || "—" },
                    ],
                  },
                  {
                    section: "Health Center",
                    rows: [
                      { label: "Health Center Name", value: healthCenterName || "—" },
                      {
                        label: "Selected Address",
                        value:
                          [locationData.barangayName, locationData.municipality, locationData.province]
                            .filter(Boolean)
                            .join(", ") || "â€”",
                      },
                    ],
                  },
                  {
                    section: "Documents",
                    rows: [
                      { label: "Proof Document", value: proofDocumentName || "Not uploaded" },
                    ],
                  },
                ].map(({ section, rows }) => (
                  <div key={section} className="px-5 py-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#60A5FA]">
                      {section}
                    </p>
                    <div className="space-y-1.5">
                      {rows.map(({ label, value }) => (
                        <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
                          <span className="text-[#64748B] dark:text-slate-400 shrink-0">{label}</span>
                          <span className="font-medium text-[#1E293B] dark:text-slate-100 text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] px-5 py-4 dark:border-[#1D4ED8]/40 dark:bg-[#1D4ED8]/10">
              <Info className="mt-0.5 size-5 shrink-0 text-[#2563EB] dark:text-[#60A5FA]" />
              <p className="text-sm leading-relaxed text-[#1D4ED8] dark:text-[#BFDBFE]">
                <strong>Your account will be reviewed by the Super Admin before you can access the system.</strong>{" "}
                You will be notified once your account is approved.
              </p>
            </div>
          </StepperContent>
        </StepperPanel>

        {/* ── Navigation buttons ── */}
        <div className="flex items-center justify-between gap-4 border-t border-[#E2E8F0] pt-6 dark:border-slate-700">
          {step > 1 ? (
            <Button key="back-button" type="button" variant="outline" onClick={handleBack} className="flex items-center gap-2">
              <ChevronLeft className="size-4" /> Back
            </Button>
          ) : (
            <Button key="back-link" asChild variant="ghost" className="text-[#64748B]">
              <Link href="/login">← Back to Login</Link>
            </Button>
          )}

          {step < STEPS.length ? (
            <Button
              key={`next-step-${step}`}
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8]"
            >
              Next <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              key="submit-registration"
              type="submit"
              className="flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D]"
            >
              <Check className="size-4" /> Submit Registration
            </Button>
          )}
        </div>
      </Stepper>
    </form>
  );
}
