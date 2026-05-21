import { redirect } from "next/navigation";

import { completeBhwRegistration } from "@/app/signup/actions";
import { MapLocationPicker } from "@/components/foundation/map-location-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SuffixDropdown } from "@/components/auth/suffix-dropdown";
import { ContactNumberInput } from "@/components/auth/contact-input";
import { getCurrentProfile, isProfileComplete } from "@/lib/supabase/profiles";

function parseDisplayNameDefaults(displayName: string | null | undefined) {
  const tokens = (displayName ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const knownSuffixes = new Set(["jr", "sr", "ii", "iii", "iv", "v"]);

  let suffix = "";
  if (
    tokens.length > 1 &&
    knownSuffixes.has(tokens[tokens.length - 1].toLowerCase().replace(".", ""))
  ) {
    suffix = tokens.pop() ?? "";
  }

  if (tokens.length === 0) {
    return { firstName: "", middleName: "", lastName: "", suffix };
  }

  if (tokens.length === 1) {
    return { firstName: tokens[0], middleName: "", lastName: "", suffix };
  }

  return {
    firstName: tokens[0] ?? "",
    middleName: tokens.slice(1, -1).join(" "),
    lastName: tokens[tokens.length - 1] ?? "",
    suffix,
  };
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const message = Array.isArray(params.message)
    ? params.message[0]
    : params.message;
  const { user, profile } = await getCurrentProfile();

  if (!user) {
    redirect("/login?message=Please log in to complete your registration.");
  }

  if (isProfileComplete(profile)) {
    if (profile?.approval_status === "approved") {
      redirect("/dashboard");
    }

    redirect("/pending-approval");
  }

  const googleFullName = user?.user_metadata?.full_name || user?.user_metadata?.name || "";
  const defaultNames = parseDisplayNameDefaults(profile?.display_name || googleFullName);

  if (!defaultNames.firstName && user?.user_metadata?.given_name) {
    defaultNames.firstName = user.user_metadata.given_name;
  }
  if (!defaultNames.lastName && user?.user_metadata?.family_name) {
    defaultNames.lastName = user.user_metadata.family_name;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-10 dark:bg-[#0F172A]">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complete BHW Registration</CardTitle>
          <CardDescription>
            Your account already exists. Finish the required profile details so
            your registration can move into pending review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message ? (
            <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#1D4ED8] dark:border-[#1D4ED8]/40 dark:bg-[#1D4ED8]/10 dark:text-[#BFDBFE]">
              {message}
            </div>
          ) : null}

          <form action={completeBhwRegistration} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="firstName">
                  First Name
                </label>
                <input className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40" defaultValue={defaultNames.firstName} id="firstName" name="firstName" required type="text" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="lastName">
                  Last Name
                </label>
                <input className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40" defaultValue={defaultNames.lastName} id="lastName" name="lastName" required type="text" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="middleName">
                  Middle Name <span className="text-[#64748B] dark:text-slate-400">(optional)</span>
                </label>
                <input className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40" defaultValue={defaultNames.middleName} id="middleName" name="middleName" type="text" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="suffix">
                  Suffix <span className="text-[#64748B] dark:text-slate-400">(optional)</span>
                </label>
                <SuffixDropdown
                  value={defaultNames.suffix}
                  onChange={() => {}}
                  defaultValue={defaultNames.suffix}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="contactNumber">
                Contact Number
              </label>
              <ContactNumberInput
                defaultValue={profile?.contact_number ?? ""}
              />
            </div>

            <MapLocationPicker
              defaultProvince={profile?.province ?? ""}
              defaultMunicipality={profile?.municipality ?? ""}
              defaultBarangay={profile?.barangay_name ?? ""}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="proofDocument">
                Proof Document
              </label>
              <div className="relative overflow-hidden rounded-2xl border border-[#DBEAFE] bg-[#F8FAFC] shadow-sm transition hover:border-[#93C5FD] dark:border-slate-700 dark:bg-white/5 dark:hover:border-[#60A5FA]">
                <input
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  id="proofDocument"
                  name="proofDocument"
                  required
                  type="file"
                />
                <div className="flex items-center gap-3 px-4 py-4">
                  <span className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm dark:bg-[#3B82F6]">
                    Select File
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1E293B] dark:text-slate-100">
                      Choose your proof document
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-slate-400">
                      Tap anywhere in this box to open your files.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs leading-6 text-[#64748B] dark:text-slate-400">
                PDF, DOC, or DOCX only, up to 5MB.
              </p>
            </div>

            <Button className="w-full" type="submit">
              Save Registration Details
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
