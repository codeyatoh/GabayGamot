import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { registerBhw } from "@/app/signup/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentProfile, isProfileComplete } from "@/lib/supabase/profiles";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const message = Array.isArray(params.message)
    ? params.message[0]
    : params.message;
  const { user, profile } = await getCurrentProfile();

  if (user) {
    if (!isProfileComplete(profile)) {
      redirect("/onboarding");
    }

    if (profile?.approval_status === "approved") {
      redirect("/dashboard");
    }

    redirect("/pending-approval");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-10 dark:bg-[#0F172A]">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#EFF6FF] dark:border-white/10 dark:bg-white/5">
              <Image
                alt="GabayGamot logo"
                className="size-7 object-contain"
                height={28}
                src="/assets/images/gabay-gamot-logo-sm.png"
                width={28}
              />
            </span>
            <div>
              <CardTitle>BHW Registration</CardTitle>
              <CardDescription>
                Register as a barangay health worker. Your role is assigned
                automatically and your account stays pending until review.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {message ? (
            <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#1D4ED8] dark:border-[#1D4ED8]/40 dark:bg-[#1D4ED8]/10 dark:text-[#BFDBFE]">
              {message}
            </div>
          ) : null}

          <form action={registerBhw} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="email">
                  Email
                </label>
                <input
                  className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40"
                  id="email"
                  name="email"
                  required
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="password">
                  Password
                </label>
                <input
                  className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40"
                  id="password"
                  minLength={6}
                  name="password"
                  required
                  type="password"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="displayName">
                  Full Name
                </label>
                <input className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40" id="displayName" name="displayName" required type="text" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="contactNumber">
                  Contact Number
                </label>
                <input className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40" id="contactNumber" name="contactNumber" required type="text" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="province">
                  Province
                </label>
                <input className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40" id="province" name="province" required type="text" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="municipality">
                  Municipality / City
                </label>
                <input className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40" id="municipality" name="municipality" required type="text" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100" htmlFor="barangayName">
                Barangay Health Center Barangay
              </label>
              <input className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40" id="barangayName" name="barangayName" required type="text" />
              <p className="text-xs leading-6 text-[#64748B] dark:text-slate-400">
                Map pinning belongs to the next phase, so this step uses manual
                location text for now.
              </p>
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
              <p className="text-xs leading-6 text-[#64748B] dark:text-slate-400">
                Upload one supporting file such as a valid ID, BHW accreditation,
                or health center endorsement. PDF, JPG, or PNG only, up to 5MB.
              </p>
            </div>

            <div className="space-y-3">
              <Button className="w-full" type="submit">
                Submit Registration
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
