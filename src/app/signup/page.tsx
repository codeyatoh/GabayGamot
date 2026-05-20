import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignupStepper } from "@/components/auth/signup-stepper";
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
    <div className="relative min-h-screen bg-slate-50 px-4 py-10 dark:bg-[#0F172A]">
      {/* ── Floating Back to home link (top-left of screen) ── */}
      <Link
        className="absolute top-6 left-6 md:top-8 md:left-8 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
        href="/"
      >
        ← Back to home
      </Link>

      <div className="mx-auto w-full max-w-2xl">
        {/* ── Header ── */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <span className="flex size-14 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#EFF6FF] shadow-sm dark:border-white/10 dark:bg-white/5">
              <Image
                alt="GabayGamot logo"
                className="size-9 object-contain"
                height={36}
                src="/assets/images/gabay-gamot-logo-sm.png"
                width={36}
              />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] dark:text-[#60A5FA]">
              GabayGamot
            </span>
          </Link>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-3xl">
            BHW Registration
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#64748B] dark:text-slate-400">
            Create your Barangay Health Worker account. Your role is assigned
            automatically and your account must be approved by a Super Admin
            before you can access the system.
          </p>
        </div>

        {/* ── Server message banner ── */}
        {message && (
          <div className="mb-6 rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#1D4ED8] dark:border-[#1D4ED8]/40 dark:bg-[#1D4ED8]/10 dark:text-[#BFDBFE]">
            {message}
          </div>
        )}

        {/* ── Stepper form card ── */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white px-6 py-8 shadow-xl dark:shadow-2xl dark:border-slate-700/60 dark:bg-[#101B2D] sm:px-10">
          <SignupStepper />
        </div>

        <p className="mt-6 text-center text-sm text-[#64748B] dark:text-slate-400">
          Already have an account?{" "}
          <Link
            className="font-medium text-[#2563EB] hover:text-[#1D4ED8] dark:text-[#60A5FA] dark:hover:text-[#93C5FD] transition-colors hover:underline"
            href="/login"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
