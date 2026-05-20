import Image from "next/image";
import Link from "next/link";

import { login } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-[#0F172A]">
      {/* ── Back to home link (outside the card) ── */}
      <div className="mb-3 w-full max-w-[400px]">
        <Link
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
          href="/"
        >
          ← Back to home
        </Link>
      </div>

      <div className="relative w-full max-w-[400px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#101B2D] px-8 py-10 shadow-xl dark:shadow-2xl">
        {/* ── Patterned Grid Overlay ── */}
        <div
          className="absolute inset-0 -top-px -left-px z-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, color-mix(in srgb, var(--card-foreground, #0f172a) 8%, transparent) 1px, transparent 1px),
              linear-gradient(to bottom, color-mix(in srgb, var(--card-foreground, #0f172a) 8%, transparent) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 0",
            maskImage: `
              repeating-linear-gradient(
                to right,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              repeating-linear-gradient(
                to bottom,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              radial-gradient(ellipse 70% 50% at 50% 0%, #000 60%, transparent 100%)
            `,
            WebkitMaskImage: `
              repeating-linear-gradient(
                to right,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              repeating-linear-gradient(
                to bottom,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              radial-gradient(ellipse 70% 50% at 50% 0%, #000 60%, transparent 100%)
            `,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />

        <div className="relative isolate flex flex-col items-center">
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

          <p className="mt-4 font-bold text-xl text-slate-900 dark:text-slate-50 tracking-tight">
            Log in to GabayGamot
          </p>
          <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px]">
            AI-assisted medicine management for barangay health centers
          </p>

          {message && (
            <div className="mt-5 w-full rounded-xl border border-blue-200 bg-[#EFF6FF] px-4 py-3 text-xs font-medium text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/15 dark:text-blue-300">
              {message}
            </div>
          )}

          <form className="mt-6 w-full space-y-4">
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold text-slate-700 dark:text-slate-200"
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
                  className="text-xs font-semibold text-slate-700 dark:text-slate-200"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 underline"
                  href="#"
                >
                  Forgot your password?
                </Link>
              </div>
              <input
                className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40"
                id="password"
                minLength={6}
                name="password"
                placeholder="Password"
                required
                type="password"
              />
            </div>

            <Button
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl mt-2 font-semibold shadow-sm"
              formAction={login}
              size="lg"
              type="submit"
            >
              Continue with Email
            </Button>
          </form>

          {/* ── Sign up text link (no outline button, no OR divider) ── */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] dark:text-[#60A5FA] dark:hover:text-[#93C5FD] underline transition-colors"
                href="/signup"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
