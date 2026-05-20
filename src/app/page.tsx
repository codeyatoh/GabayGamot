import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Stethoscope, Waypoints, Zap, MonitorSmartphone, Cable, Smile } from "lucide-react";
import {
  SiNextdotjs,
  SiTypescript,
  SiSupabase,
  SiMapbox,
  SiGooglegemini,
  SiVercel,
} from "react-icons/si";

import { SiteHeader } from "@/components/foundation/site-header";
import { Button } from "@/components/ui/button";


const stackLogos = [
  { name: "Next.js",    Icon: SiNextdotjs,    colorClass: "text-[#000000] dark:text-white" },
  { name: "TypeScript", Icon: SiTypescript,   colorClass: "text-[#3178C6]" },
  { name: "Supabase",   Icon: SiSupabase,     colorClass: "text-[#3ECF8E]" },
  { name: "Mapbox",     Icon: SiMapbox,       colorClass: "text-[#4264FB]" },
  { name: "Gemini",     Icon: SiGooglegemini, colorClass: "text-[#8E75B2]" },
  { name: "Vercel",     Icon: SiVercel,       colorClass: "text-[#000000] dark:text-white" },
];

const features = [
  {
    title: "Consultation-First Design",
    description:
      "Every dispense action is securely gated behind a proper patient consultation log — ensuring full clinical accountability.",
    icon: Waypoints,
  },
  {
    title: "AI-Powered Scanning",
    description:
      "Photograph any medicine box. Gemini AI instantly extracts the name, dosage, quantity, and expiry date to streamline inventory.",
    icon: Stethoscope,
  },
  {
    title: "Geo-Smart Referrals",
    description:
      "When stock runs out, our Haversine algorithm instantly finds the nearest partner barangay with available supply.",
    icon: ShieldCheck,
  },
  {
    title: "Live Stock Monitoring",
    description:
      "Track inventory levels in real-time. Automated alerts help prevent stockouts and ensure essential medicines are always available.",
    icon: Zap,
  },
  {
    title: "Mobile-Optimized Access",
    description:
      "Designed specifically for health workers in the field. Fast, responsive, and easy to use on any smartphone or tablet.",
    icon: MonitorSmartphone,
  },
  {
    title: "Secure & Compliant Data",
    description:
      "Built on Supabase with strict Row Level Security (RLS) to protect patient records and health worker credentials.",
    icon: Cable,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] dark:bg-[#08111F] dark:text-slate-50">
      <SiteHeader />

      <main>
        {/* ─── HERO ─── */}
        <section className="relative flex min-h-[100dvh] w-full flex-col items-center justify-start overflow-hidden px-4 pb-16 pt-36 sm:pt-48 sm:px-6 lg:px-8">
          {/* Subtle ambient gradient */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(20,184,166,0.13),transparent_40%),radial-gradient(ellipse_at_80%_10%,rgba(37,99,235,0.11),transparent_38%),radial-gradient(ellipse_at_50%_100%,rgba(6,182,212,0.08),transparent_38%)]" />

          <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center text-center">

            {/* Badge pill */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#CBD5E1] bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#1D4ED8] shadow-sm backdrop-blur dark:border-slate-600/40 dark:bg-[#101B2D]/80 dark:text-[#93C5FD]">
              <span className="size-1.5 animate-pulse rounded-full bg-current" />
              Consultation-first medicine flow
            </div>

            {/* Headline — completely rephrased, no ugly pill boxes, beautiful emphasis */}
            <h1 className="text-balance text-5xl font-extrabold leading-[1.12] tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-6xl md:text-7xl lg:text-[4.5rem]">
              Intelligent tech for every{" "}
              <span className="bg-gradient-to-r from-[#2563EB] to-[#06B6D4] bg-clip-text text-transparent dark:from-[#60A5FA] dark:to-[#22D3EE]">
                barangay health center.
              </span>
            </h1>

            {/* Sub-description */}
            <p className="mt-8 max-w-2xl text-balance text-lg leading-relaxed text-[#64748B] dark:text-slate-300 sm:text-xl">
              Log patient consultations, scan medicines with Gemini AI, monitor live
              stock levels, dispense securely, and instantly route referrals when
              supply runs out.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <Button
                asChild
                size="lg"
                className="min-w-[160px] rounded-xl px-8 text-base font-semibold shadow-lg shadow-blue-600/25 transition-transform hover:scale-105"
              >
                <Link href="/login">
                  Get Started
                  <ArrowUpRight className="ml-1.5 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-w-[160px] rounded-xl px-8 text-base font-semibold transition-transform hover:scale-105"
              >
                <Link href="/dashboard">Open Workspace</Link>
              </Button>
            </div>

            {/* ── Large Brand Logos (Wordmark style) ── */}
            <div className="mt-20 flex w-full flex-col items-center gap-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#94A3B8] dark:text-slate-500">
                Powered by the GabayGamot Stack
              </p>

              <div className="flex w-full max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-12">
                {stackLogos.map(({ name, Icon, colorClass }) => (
                  <div
                    key={name}
                    className="group flex cursor-default items-center gap-2.5 opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 dark:opacity-40"
                  >
                    <Icon className={`size-8 sm:size-10 transition-transform duration-300 group-hover:scale-110 ${colorClass}`} />
                    <span className="text-xl font-bold tracking-tight text-slate-800 transition-colors duration-300 dark:text-slate-100 sm:text-2xl">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES SECTION ── */}
        <section id="features" className="mx-auto flex w-full max-w-7xl flex-col px-4 py-24 sm:px-6 lg:px-8">
          <h2 className="text-pretty text-center text-3xl font-bold tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-[2.75rem]">
            Intelligent features for health workers
          </h2>
          <p className="mt-4 text-center text-lg text-[#64748B] dark:text-slate-300 sm:text-2xl">
            Spend less time on paperwork and more time caring for patients.
          </p>

          <div className="mt-16 grid grid-cols-1 bg-white dark:bg-[#101B2D] sm:grid-cols-2 lg:grid-cols-3">
            <div className="-mr-px flex h-16 items-center border border-[#CBD5E1] px-6 font-semibold text-lg text-[#1E293B] dark:border-slate-700 dark:text-slate-100 sm:col-span-2 md:col-span-1">
              <Smile className="mr-4 text-[#2563EB] dark:text-[#60A5FA]" /> Everything you need
            </div>
            <div className="-mr-px hidden h-16 border border-[#CBD5E1] bg-[repeating-linear-gradient(315deg,rgba(203,213,225,0.4)_0,rgba(203,213,225,0.4)_1px,transparent_0,transparent_50%)] bg-[length:10px_10px] bg-fixed dark:border-slate-700 dark:bg-[repeating-linear-gradient(315deg,rgba(51,65,85,0.4)_0,rgba(51,65,85,0.4)_1px,transparent_0,transparent_50%)] md:block lg:col-span-2" />
            
            {features.map((feature, index) => (
              <div
                className="-mt-px -mr-px border border-[#CBD5E1] px-6 pb-6 pt-8 dark:border-slate-700"
                key={index}
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] dark:bg-[#172338] dark:text-[#93C5FD]">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="font-semibold text-lg tracking-tight text-[#1E293B] dark:text-slate-100">
                    {feature.title}
                  </h3>
                </div>
                <p className="mt-5 text-[0.95rem] leading-relaxed text-[#475569] dark:text-slate-300">
                  {feature.description}
                </p>

                <Button asChild variant="ghost" className="mt-5 h-auto p-0 font-semibold text-[#2563EB] hover:bg-transparent hover:text-[#1D4ED8] dark:text-[#60A5FA] dark:hover:bg-transparent dark:hover:text-[#93C5FD]">
                  <Link href="/dashboard">
                    Learn more <ArrowUpRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
