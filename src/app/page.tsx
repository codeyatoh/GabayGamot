import type { SVGProps } from "react";
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

// ─── Tech Stack SVG Brand Logos ────────────────────────────────────────────────

function NextjsLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <mask id="nxt-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180" style={{ maskType: "alpha" }}>
        <circle cx="90" cy="90" r="90" fill="black" />
      </mask>
      <g mask="url(#nxt-mask)">
        <circle cx="90" cy="90" r="90" fill="currentColor" />
        <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="white" />
        <rect x="115" y="54" width="12" height="72" fill="white" />
      </g>
    </svg>
  );
}

function TypeScriptLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="256" height="256" rx="20" fill="#3178C6" />
      <path d="M150.518 200.475v27.62c4.492 2.302 9.805 4.028 15.938 5.179 6.133 1.151 12.597 1.726 19.393 1.726 6.622 0 12.914-.633 18.874-1.899 5.96-1.266 11.187-3.352 15.678-6.257 4.492-2.906 8.048-6.704 10.669-11.394 2.62-4.689 3.93-10.486 3.93-17.391 0-5.006-.749-9.394-2.246-13.163a30.748 30.748 0 0 0-6.479-10.055c-2.821-2.935-6.205-5.567-10.149-7.898-3.945-2.33-8.394-4.531-13.347-6.602-3.628-1.497-6.872-2.949-9.731-4.354-2.859-1.405-5.277-2.853-7.256-4.346-1.979-1.492-3.513-3.077-4.602-4.754-1.09-1.678-1.635-3.572-1.635-5.684 0-1.941.502-3.717 1.507-5.327.994-1.61 2.4-3.009 4.215-4.198 1.816-1.189 4.027-2.121 6.635-2.797 2.607-.676 5.501-1.014 8.682-1.014 2.325 0 4.71.173 7.154.518 2.444.345 4.906.937 7.388 1.776a52.432 52.432 0 0 1 7.171 3.18c2.316 1.318 4.56 2.956 6.732 4.913v-25.603c-4.089-1.563-8.493-2.726-13.214-3.489-4.72-.763-10.075-1.144-16.063-1.144-6.566 0-12.784.705-18.653 2.114-5.869 1.409-11.042 3.61-15.518 6.602-4.476 2.993-8.011 6.79-10.607 11.392-2.596 4.602-3.894 10.044-3.894 16.326 0 8.126 2.311 15.186 6.932 21.179 4.62 5.993 11.523 11.079 20.709 15.259 3.797 1.621 7.337 3.246 10.619 4.875 3.282 1.629 6.12 3.312 8.512 5.049 2.393 1.737 4.274 3.622 5.643 5.655 1.369 2.033 2.053 4.319 2.053 6.858 0 1.828-.434 3.574-1.302 5.238-.868 1.664-2.218 3.135-4.051 4.412-1.833 1.277-4.125 2.294-6.876 3.05-2.751.757-5.992 1.135-9.723 1.135-6.278 0-12.422-1.066-18.433-3.2-6.011-2.134-10.346-4.756-13.218-8.039zM132.57 111.571H98.769v103.621H70.172V111.571H36.57V88H132.57V111.571Z" fill="white" />
    </svg>
  );
}

function SupabaseLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#sb0)" />
      <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#sb1)" fillOpacity="0.2" />
      <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.04088L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="#3ECF8E" />
      <defs>
        <linearGradient id="sb0" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
          <stop stopColor="#249361" />
          <stop offset="1" stopColor="#3ECF8E" />
        </linearGradient>
        <linearGradient id="sb1" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
          <stop />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MapboxWordmark(props: SVGProps<SVGSVGElement>) {
  // Official Mapbox "M" pin mark
  return (
    <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="25" cy="25" r="25" fill="#4264FB" />
      <path
        d="M25 10a15 15 0 1 0 0 30A15 15 0 0 0 25 10zm0 23a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
        fill="white"
      />
      <circle cx="25" cy="18" r="3.5" fill="white" />
    </svg>
  );
}

function GeminiLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
      <defs>
        <linearGradient id="gem0" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="100%" stopColor="#34A853" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 2 8.5 8.5 2 12C8.5 15.5 12 22 12 22C12 22 15.5 15.5 22 12C15.5 8.5 12 2 12 2Z"
        fill="url(#gem0)"
      />
    </svg>
  );
}

function VercelLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 76 65" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
  );
}

const stackLogos = [
  { name: "Next.js",     Logo: NextjsLogo,      textClass: "text-[#0F172A] dark:text-white" },
  { name: "TypeScript",  Logo: TypeScriptLogo,  textClass: "text-[#3178C6]" },
  { name: "Supabase",    Logo: SupabaseLogo,    textClass: "text-[#3ECF8E]" },
  { name: "Mapbox",      Logo: MapboxWordmark,  textClass: "text-[#4264FB]" },
  { name: "Gemini AI",   Logo: GeminiLogo,      textClass: "text-[#4285F4]" },
  { name: "Vercel",      Logo: VercelLogo,      textClass: "text-[#0F172A] dark:text-white" },
];

// ─── Features Overview Cards ────────────────────────────────────────────────────

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

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] dark:bg-[#08111F] dark:text-slate-50">
      <SiteHeader />

      <main>
        {/* ── HERO SECTION — full viewport, everything visible at once ── */}
        <section className="relative flex h-screen min-h-[580px] w-full flex-col items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
          {/* Ambient gradient */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.14),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(37,99,235,0.12),transparent_32%),radial-gradient(circle_at_50%_95%,rgba(6,182,212,0.09),transparent_34%)]" />

          <div className="relative flex w-full max-w-3xl flex-col items-center text-center">
            {/* Badge pill */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#CBD5E1] bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1D4ED8] shadow-sm backdrop-blur dark:border-slate-600/40 dark:bg-[#101B2D]/80 dark:text-[#93C5FD]">
              <span className="size-1.5 rounded-full bg-current" />
              Consultation-first medicine flow
            </div>

            {/* Headline — tighter, fits on screen */}
            <h1 className="text-balance text-[2.4rem] font-extrabold leading-[1.12] tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-5xl md:text-[3.5rem]">
              Empowering barangay{" "}
              <span className="inline-block rounded-xl bg-[#1E293B] px-3 py-0.5 text-white dark:bg-[#E2E8F0] dark:text-[#0F172A]">
                health workers
              </span>
              {" "}&amp; patients.
            </h1>

            {/* Sub-description */}
            <p className="mt-5 max-w-xl text-balance text-center text-[0.95rem] leading-relaxed text-[#64748B] dark:text-slate-300 sm:text-base">
              Search or create a patient record, log a consultation, scan
              medicine with AI, check live stock levels, dispense securely, or
              trigger nearby barangay referrals when stock runs out.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <Button asChild size="default" className="rounded-xl px-6 font-semibold shadow-md shadow-blue-600/20">
                <Link href="/login">
                  Get Started
                  <ArrowUpRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild size="default" variant="outline" className="rounded-xl px-6 font-semibold">
                <Link href="/dashboard">Open Workspace</Link>
              </Button>
            </div>

            {/* ── Tech Stack Logos — big icon + name, like reference ── */}
            <div className="mt-12 flex w-full flex-col items-center gap-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#94A3B8]">
                Built with the GabayGamot stack
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
                {stackLogos.map(({ name, Logo, textClass }) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 opacity-60 transition-opacity duration-200 hover:opacity-100"
                    title={name}
                  >
                    <Logo className="size-8 shrink-0" />
                    <span className={`text-base font-bold ${textClass}`}>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── OVERVIEW / PLACEHOLDER SECTIONS ── */}
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
