import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Stethoscope, Waypoints } from "lucide-react";

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

const techStackLogos = [
  { name: "Next.js", mark: "N" },
  { name: "TypeScript", mark: "TS" },
  { name: "Supabase", mark: "S" },
  { name: "Mapbox", mark: "M" },
  { name: "Gemini", mark: "AI" },
  { name: "Vercel", mark: "V" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] dark:bg-[#08111F] dark:text-slate-50">
      <SiteHeader />

      <main>
        <section className="relative flex min-h-screen w-full items-center overflow-hidden px-4 pb-12 pt-28 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_80%_12%,rgba(37,99,235,0.16),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(6,182,212,0.12),transparent_34%)]" />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
            <div className="mb-7 inline-flex items-center rounded-full border border-[#CBD5E1] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1D4ED8] shadow-sm backdrop-blur dark:border-slate-600/40 dark:bg-[#101B2D]/80 dark:text-[#93C5FD]">
              Consultation-first medicine flow
            </div>

            <h1 className="text-balance text-4xl font-semibold leading-[1.16] tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-5xl md:text-6xl lg:text-7xl">
              Helping barangay health workers manage{" "}
              <span className="inline-block rounded-xl bg-[#2563EB] px-2.5 py-1 text-white shadow-sm shadow-blue-600/20 sm:px-4">
                patients,
              </span>{" "}
              medicine, and stock in one place.
            </h1>

            <p className="mt-6 max-w-4xl text-balance text-center text-lg leading-8 tracking-[-0.01em] text-[#475569] dark:text-slate-200 sm:text-xl md:text-2xl md:leading-normal">
              Search or create a patient record, log a consultation, scan
              medicine, check stock, dispense when available, or refer when
              stock is not enough.
            </p>

            <div className="mx-auto mt-10 flex w-full max-w-sm flex-col items-center justify-center gap-4 sm:max-w-none sm:flex-row">
              <Button asChild className="w-full sm:w-auto" size="lg">
                <Link href="/login">
                  Open Login
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <Button asChild className="w-full sm:w-auto" size="lg" variant="outline">
                <Link href="/dashboard">Open Protected Workspace</Link>
              </Button>
            </div>

            <div className="mt-24 flex w-full flex-col items-center gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#64748B] dark:text-slate-300">
                Built with the current GabayGamot stack
              </p>
              <div className="mx-auto mt-4 grid w-full max-w-5xl grid-cols-2 place-items-center gap-4 text-[#334155] sm:grid-cols-3 sm:gap-x-8 sm:gap-y-6 md:grid-cols-6 dark:text-slate-200">
                {techStackLogos.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#CBD5E1] bg-white/78 px-4 py-3 text-sm font-semibold shadow-sm backdrop-blur dark:border-slate-600/40 dark:bg-[#101B2D]/78"
                  >
                    <span className="flex size-8 items-center justify-center rounded-xl bg-[#EFF6FF] text-xs font-bold text-[#1D4ED8] dark:bg-[#172338] dark:text-[#93C5FD]">
                      {tech.mark}
                    </span>
                    <span>{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div id="overview" className="grid gap-6 lg:grid-cols-3">
            {foundationCards.map(({ title, description, icon: Icon }) => (
              <Card key={title}>
                <CardHeader>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] dark:bg-[#172338] dark:text-[#93C5FD]">
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
            className="rounded-3xl border border-[#CBD5E1] bg-white p-6 shadow-sm dark:border-slate-600/40 dark:bg-[#101B2D]"
          >
            <h2 className="text-2xl font-semibold text-[#1E293B] dark:text-slate-100">
              Route foundation
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475569] dark:text-slate-300">
              Public access starts at <code>/</code> and <code>/login</code>.
              Protected workspaces now cover dashboard, patients,
              consultations, scan, inventory, dispense, referrals, AI insights,
              and reports.
            </p>
          </section>

          <section
            id="stack"
            className="rounded-3xl border border-[#CBD5E1] bg-white p-6 shadow-sm dark:border-slate-600/40 dark:bg-[#101B2D]"
          >
            <h2 className="text-2xl font-semibold text-[#1E293B] dark:text-slate-100">
              Current Stack
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#475569] dark:text-slate-300">
              GabayGamot runs on Next.js App Router, TypeScript, Tailwind CSS,
              shadcn-style UI primitives, Supabase Auth and PostgreSQL, Mapbox
              and PSGC lookup services, secure Gemini route handlers, and a
              lightweight PWA-ready install manifest.
            </p>
          </section>
        </section>
      </main>
    </div>
  );
}
