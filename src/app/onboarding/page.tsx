import { redirect } from "next/navigation";

import { completeBhwRegistration } from "@/app/signup/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile, isProfileComplete } from "@/lib/supabase/profiles";

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
                <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="displayName">
                  Full Name
                </label>
                <input className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40" defaultValue={profile?.display_name ?? ""} id="displayName" name="displayName" required type="text" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="contactNumber">
                  Contact Number
                </label>
                <input className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40" defaultValue={profile?.contact_number ?? ""} id="contactNumber" name="contactNumber" required type="text" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="province">
                  Province
                </label>
                <input className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40" defaultValue={profile?.province ?? ""} id="province" name="province" required type="text" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="municipality">
                  Municipality / City
                </label>
                <input className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40" defaultValue={profile?.municipality ?? ""} id="municipality" name="municipality" required type="text" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="barangayName">
                Barangay Health Center Barangay
              </label>
              <input className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40" defaultValue={profile?.barangay_name ?? ""} id="barangayName" name="barangayName" required type="text" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="proofDocument">
                Proof Document
              </label>
              <input
                accept=".pdf,image/png,image/jpeg"
                className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] file:mr-4 file:rounded-xl file:border-0 file:bg-[#2563EB] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#1D4ED8] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:file:bg-[#2563EB]"
                id="proofDocument"
                name="proofDocument"
                required
                type="file"
              />
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
