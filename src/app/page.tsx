import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Stethoscope, Waypoints } from "lucide-react";

import { SiteHeader } from "@/components/foundation/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const foundationCards = [
  {
    title: "App Router foundation",
    description:
      "The public route and protected placeholders are in place so later phases can grow from a stable structure.",
    icon: Waypoints,
  },
  {
    title: "Beginner-friendly UI base",
    description:
      "Tailwind and shadcn-style primitives are configured for small, readable steps instead of a full rebuild.",
    icon: Stethoscope,
  },
  {
    title: "Future-safe direction",
    description:
      "The project is aligned to Next.js, TypeScript, and Supabase without starting auth, data, or approval logic yet.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
      <SiteHeader />

      <main>
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#64748B] shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                PHASE 1 foundation ready
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[#1E293B] dark:text-slate-50 sm:text-5xl lg:text-6xl">
                  GabayGamot starts here with a stable Next.js foundation.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-[#64748B] dark:text-slate-300 sm:text-lg">
                  This public route is the starting shell for the app. It keeps
                  the branding, existing assets, and route structure ready for
                  later phases without jumping into inventory, approval, AI, or
                  map behavior too early.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/login">
                    Open Login
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard">View Protected Placeholders</Link>
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="aspect-[4/3] bg-gradient-to-br from-[#EFF6FF] via-white to-[#DBEAFE] dark:from-[#111827] dark:via-[#0F172A] dark:to-[#132238]">
                <div className="flex h-full flex-col justify-between p-8">
                  <div className="flex items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-full border border-[#E2E8F0] bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
                      <Image
                        alt="GabayGamot logo"
                        className="size-8 object-contain"
                        height={32}
                        src="/assets/images/gabay-gamot-logo-sm.png"
                        width={32}
                      />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#1E293B] dark:text-slate-100">
                        GabayGamot
                      </p>
                      <p className="text-xs text-[#64748B] dark:text-slate-400">
                        Public route shell
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white/90 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                      <p className="text-sm font-medium text-[#1E293B] dark:text-slate-100">
                        Planned stack
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#64748B] dark:text-slate-400">
                        Next.js App Router, TypeScript, Tailwind, shadcn/ui, and
                        Supabase as the source of truth.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div id="overview" className="grid gap-6 lg:grid-cols-3">
            {foundationCards.map(({ title, description, icon: Icon }) => (
              <Card key={title}>
                <CardHeader>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] dark:bg-white/10 dark:text-[#60A5FA]">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            ))}
          </div>

          <section
            id="routes"
            className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]"
          >
            <h2 className="text-2xl font-semibold text-[#1E293B] dark:text-slate-100">
              Route foundation
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#64748B] dark:text-slate-400">
              Public access starts at <code>/</code> and <code>/login</code>.
              Placeholder protected routes already exist for dashboard, scan,
              inventory, dispense, AI insights, and referral suggestions.
            </p>
          </section>
        </section>
      </main>
    </div>
  );
}
