import Image from "next/image";
import Link from "next/link";
import { Shield, Activity, Pill } from "lucide-react";

import { login } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

const INPUT_CLS =
  "w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const message = Array.isArray(params.message)
    ? params.message[0]
    : params.message;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
      {/* ── Left branding panel (hidden on mobile) ── */}
      <div className="hidden md:flex md:w-1/2 lg:w-[45%] flex-col justify-between bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] p-10 text-white">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Image
              alt="GabayGamot logo"
              className="size-6 object-contain"
              height={24}
              src="/assets/images/gabay-gamot-logo-sm.png"
              width={24}
            />
          </span>
          <span className="text-lg font-bold tracking-tight">GabayGamot</span>
        </Link>

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
              AI-assisted medicine management for barangay health centers
            </h1>
            <p className="text-base leading-relaxed text-blue-100">
              Scan medicines, track inventory, dispense safely, and route
              referrals — all in one platform built for Barangay Health Workers.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                Icon: Pill,
                title: "Smart Medicine Scanning",
                desc: "Gemini AI reads labels and extracts details instantly.",
              },
              {
                Icon: Activity,
                title: "Live Inventory Alerts",
                desc: "Low-stock and near-expiry notifications in real time.",
              },
              {
                Icon: Shield,
                title: "Secure & Role-Based",
                desc: "Supabase RLS keeps patient data safe and private.",
              },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-blue-100">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-blue-200">
          © {new Date().getFullYear()} GabayGamot · Team Avant Heim
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 md:px-12">
        {/* Mobile-only logo */}
        <div className="mb-8 flex flex-col items-center gap-3 md:hidden">
          <span className="flex size-14 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#EFF6FF] dark:border-white/10 dark:bg-white/5">
            <Image
              alt="GabayGamot logo"
              className="size-9 object-contain"
              height={36}
              src="/assets/images/gabay-gamot-logo-sm.png"
              width={36}
            />
          </span>
          <span className="text-base font-bold text-[#1E293B] dark:text-slate-100">
            GabayGamot
          </span>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-slate-50">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">
              Log in to your GabayGamot account to continue.
            </p>
          </div>

          {message && (
            <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#1D4ED8] dark:border-[#1D4ED8]/40 dark:bg-[#1D4ED8]/10 dark:text-[#BFDBFE]">
              {message}
            </div>
          )}

          <form className="space-y-5">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-[#1E293B] dark:text-slate-100"
                htmlFor="email"
              >
                Email address
              </label>
              <input
                className={INPUT_CLS}
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-medium text-[#1E293B] dark:text-slate-100"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] dark:text-[#60A5FA] dark:hover:text-[#93C5FD] transition-colors"
                  href="#"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                className={INPUT_CLS}
                id="password"
                minLength={6}
                name="password"
                placeholder="Enter your password"
                required
                type="password"
              />
            </div>

            <Button className="w-full" formAction={login} size="lg">
              Log In
            </Button>
          </form>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 border-t border-[#E2E8F0] dark:border-white/10" />
            <span className="text-xs text-[#94A3B8]">OR</span>
            <div className="flex-1 border-t border-[#E2E8F0] dark:border-white/10" />
          </div>

          <Button asChild className="w-full" variant="outline" size="lg">
            <Link href="/signup">Create BHW Account</Link>
          </Button>

          <p className="text-center text-xs text-[#64748B] dark:text-slate-400">
            <Link
              className="font-medium text-[#2563EB] hover:text-[#1D4ED8] dark:text-[#60A5FA] dark:hover:text-[#93C5FD] transition-colors"
              href="/"
            >
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
