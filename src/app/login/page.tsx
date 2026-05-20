import Image from "next/image";
import Link from "next/link";

import { login } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-10 dark:bg-[#0F172A]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#EFF6FF] dark:border-white/10 dark:bg-white/5">
              <Image
                alt="GabayGamot logo"
                className="size-7 object-contain"
                height={28}
                src="/assets/images/gabay-gamot-logo-sm.png"
                width={28}
              />
            </span>
            <div>
              <CardTitle>Login to GabayGamot</CardTitle>
              <CardDescription>
                Use your Supabase email and password to access the protected
                app foundation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {message ? (
            <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#1D4ED8] dark:border-[#1D4ED8]/40 dark:bg-[#1D4ED8]/10 dark:text-[#BFDBFE]">
              {message}
            </div>
          ) : null}

          <form className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-[#1E293B] dark:text-slate-100"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-[#1E293B] dark:text-slate-100"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40"
                id="password"
                minLength={6}
                name="password"
                placeholder="Enter your password"
                required
                type="password"
              />
            </div>

            <div className="space-y-3">
              <Button className="w-full" formAction={login}>
                Log In
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/signup">Create BHW Account</Link>
              </Button>
            </div>
          </form>

          <p className="text-sm leading-7 text-[#64748B] dark:text-slate-400">
            New BHW accounts go through a separate registration form and stay
            pending until a Super Admin reviews them in a later phase.
          </p>

          <div className="pt-2">
            <Link
              className="text-sm font-medium text-[#2563EB] transition hover:text-[#1D4ED8] dark:text-[#60A5FA] dark:hover:text-[#93C5FD]"
              href="/"
            >
              Back to landing page
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
