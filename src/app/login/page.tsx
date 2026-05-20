import Image from "next/image";
import Link from "next/link";

import { login } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordInput } from "@/components/auth/password-input";

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
    <section className="relative flex min-h-screen w-full flex-col items-center justify-between bg-slate-50 px-4 py-8 dark:bg-[#0F172A]">
      {/* ── Background Grid Pattern ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 left-1/2 h-full w-[1200px] -translate-x-1/2">
          <svg
            className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(black,transparent),radial-gradient(black,transparent)] [mask-composite:intersect] text-slate-200 dark:text-slate-800/40"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="grid-pattern"
                x="-1"
                y="-1"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect fill="url(#grid-pattern)" width="100%" height="100%" />
          </svg>
        </div>
      </div>

      {/* ── Floating Back to home link ── */}
      <Link
        className="absolute top-6 left-6 md:top-8 md:left-8 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
        href="/"
      >
        ← Back to home
      </Link>

      {/* ── Center Login Box ── */}
      <div className="relative z-10 my-auto flex w-full max-w-[400px] flex-col items-center">
        {/* ── GabayGamot Logo ── */}
        <span className="flex size-14 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#EFF6FF] shadow-sm dark:border-white/10 dark:bg-white/5">
          <Image
            alt="GabayGamot logo"
            className="size-9 object-contain"
            height={36}
            src="/assets/images/gabay-gamot-logo-sm.png"
            width={36}
          />
        </span>

        <h3 className="mt-5 text-center text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          Log in to GabayGamot
        </h3>
        <p className="mt-1 text-center text-xs text-[#64748B] dark:text-slate-400 max-w-[280px]">
          AI-assisted medicine management for barangay health centers
        </p>

        {message && (
          <div className="mt-5 w-full rounded-xl border border-blue-200 bg-[#EFF6FF] px-4 py-3 text-xs font-medium text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/15 dark:text-blue-300">
            {message}
          </div>
        )}

        <div className="mt-8 w-full space-y-5">
          {/* ── Primary: Google Login ── */}
          <GoogleButton />

          {/* ── Divider ── */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              or
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* ── Secondary: Email + Password Form ── */}
          <form className="space-y-4">
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold text-[#1E293B] dark:text-slate-200"
                htmlFor="email"
              >
                Email address
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="text-xs font-semibold text-[#1E293B] dark:text-slate-200"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] dark:text-[#60A5FA] dark:hover:text-[#93C5FD] transition-colors hover:underline"
                  href="#"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40"
                id="password"
                minLength={6}
                name="password"
                placeholder="Password"
                required
              />
            </div>

            <Button
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold shadow-sm"
              formAction={login}
              size="lg"
              type="submit"
            >
              Log in with email
            </Button>
          </form>
        </div>

        {/* ── Sign up Link ── */}
        <p className="mt-6 text-center text-sm text-[#64748B] dark:text-slate-400">
          New to GabayGamot?{" "}
          <Link
            className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] dark:text-[#60A5FA] dark:hover:text-[#93C5FD] transition-colors hover:underline"
            href="/signup"
          >
            Create a BHW account
          </Link>
        </p>
      </div>

      {/* ── Footer / T&C ── */}
      <div className="mt-8">
        <p className="text-center text-xs text-[#64748B] dark:text-slate-400 leading-relaxed max-w-[280px]">
          By continuing, you agree to GabayGamot&apos;s{" "}
          <a href="#" className="font-semibold hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="font-semibold hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </section>
  );
}

