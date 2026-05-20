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

// ─── Accurate Brand SVG Logos ──────────────────────────────────────────────────

/** Next.js — official monochrome circle mark */
function NextjsLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <mask id="nxt" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180"
        style={{ maskType: "alpha" }}>
        <circle cx="90" cy="90" r="90" fill="black" />
      </mask>
      <g mask="url(#nxt)">
        <circle cx="90" cy="90" r="90" fill="currentColor" />
        <path
          d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
          fill="white"
        />
        <rect x="115" y="54" width="12" height="72" fill="white" />
      </g>
    </svg>
  );
}

/** TypeScript — official blue square with TS */
function TypeScriptLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="256" height="256" rx="20" fill="#3178C6" />
      <path
        d="M150.518 200.475v27.62c4.492 2.302 9.805 4.028 15.938 5.179 6.133 1.151 12.597 1.726 19.393 1.726 6.622 0 12.914-.633 18.874-1.899 5.96-1.266 11.187-3.352 15.678-6.257 4.492-2.906 8.048-6.704 10.669-11.394 2.62-4.689 3.93-10.486 3.93-17.391 0-5.006-.749-9.394-2.246-13.163a30.748 30.748 0 0 0-6.479-10.055c-2.821-2.935-6.205-5.567-10.149-7.898-3.945-2.33-8.394-4.531-13.347-6.602-3.628-1.497-6.872-2.949-9.731-4.354-2.859-1.405-5.277-2.853-7.256-4.346-1.979-1.492-3.513-3.077-4.602-4.754-1.09-1.678-1.635-3.572-1.635-5.684 0-1.941.502-3.717 1.507-5.327.994-1.61 2.4-3.009 4.215-4.198 1.816-1.189 4.027-2.121 6.635-2.797 2.607-.676 5.501-1.014 8.682-1.014 2.325 0 4.71.173 7.154.518 2.444.345 4.906.937 7.388 1.776a52.432 52.432 0 0 1 7.171 3.18c2.316 1.318 4.56 2.956 6.732 4.913v-25.603c-4.089-1.563-8.493-2.726-13.214-3.489-4.72-.763-10.075-1.144-16.063-1.144-6.566 0-12.784.705-18.653 2.114-5.869 1.409-11.042 3.61-15.518 6.602-4.476 2.993-8.011 6.79-10.607 11.392-2.596 4.602-3.894 10.044-3.894 16.326 0 8.126 2.311 15.186 6.932 21.179 4.62 5.993 11.523 11.079 20.709 15.259 3.797 1.621 7.337 3.246 10.619 4.875 3.282 1.629 6.12 3.312 8.512 5.049 2.393 1.737 4.274 3.622 5.643 5.655 1.369 2.033 2.053 4.319 2.053 6.858 0 1.828-.434 3.574-1.302 5.238-.868 1.664-2.218 3.135-4.051 4.412-1.833 1.277-4.125 2.294-6.876 3.05-2.751.757-5.992 1.135-9.723 1.135-6.278 0-12.422-1.066-18.433-3.2-6.011-2.134-10.346-4.756-13.218-8.039zm-17.948-88.904H98.769v103.621H70.172V111.571H36.57V88H132.57v23.571z"
        fill="white"
      />
    </svg>
  );
}

/** Supabase — official two-parallelogram bolt */
function SupabaseLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M63.708 110.284c-2.86 3.601-8.657 1.628-8.726-2.97L54.006 40.063H99.19c8.19 0 12.759 9.46 7.666 15.875L63.708 110.284z"
        fill="url(#sbA)"
      />
      <path
        d="M63.708 110.284c-2.86 3.601-8.657 1.628-8.726-2.97L54.006 40.063H99.19c8.19 0 12.759 9.46 7.666 15.875L63.708 110.284z"
        fill="url(#sbB)"
        fillOpacity="0.2"
      />
      <path
        d="M45.317 2.071c2.86-3.601 8.657-1.629 8.726 2.97l.441 67.251H9.831c-8.19 0-12.758-9.46-7.665-15.875L45.317 2.071z"
        fill="#3ECF8E"
      />
      <defs>
        <linearGradient id="sbA" x1="53.974" y1="54.974" x2="94.163" y2="71.83" gradientUnits="userSpaceOnUse">
          <stop stopColor="#249361" />
          <stop offset="1" stopColor="#3ECF8E" />
        </linearGradient>
        <linearGradient id="sbB" x1="36.156" y1="30.578" x2="54.484" y2="65.081" gradientUnits="userSpaceOnUse">
          <stop />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Mapbox — official location-pin brand mark */
function MapboxLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="100" cy="100" r="100" fill="#4264FB" />
      {/* Outer ring */}
      <circle cx="100" cy="100" r="58" stroke="white" strokeWidth="14" fill="none" />
      {/* Inner dot */}
      <circle cx="100" cy="100" r="20" fill="white" />
      {/* Top marker cap */}
      <rect x="87" y="30" width="26" height="26" rx="13" fill="white" />
    </svg>
  );
}

/** Gemini AI — official four-pointed star mark with gradient */
function GeminiLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="gemG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#9B72CB" />
          <stop offset="100%" stopColor="#D96570" />
        </linearGradient>
      </defs>
      {/* Four-pointed star — the official Gemini mark */}
      <path
        d="M14 2C14 2 11 9.333 2 14C11 18.667 14 26 14 26C14 26 17 18.667 26 14C17 9.333 14 2 14 2Z"
        fill="url(#gemG)"
      />
    </svg>
  );
}

/** Vercel — official black/white upward triangle */
function VercelLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 76 66" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
  );
}

const stackLogos = [
  { name: "Next.js",    Logo: NextjsLogo,     cls: "text-[#000000] dark:text-white" },
  { name: "TypeScript", Logo: TypeScriptLogo, cls: "" },          // colors embedded
  { name: "Supabase",   Logo: SupabaseLogo,   cls: "" },          // colors embedded
  { name: "Mapbox",     Logo: MapboxLogo,     cls: "" },          // colors embedded
  { name: "Gemini AI",  Logo: GeminiLogo,     cls: "" },          // colors embedded
  { name: "Vercel",     Logo: VercelLogo,     cls: "text-[#000000] dark:text-white" },
];

// ─── Placeholder section cards ─────────────────────────────────────────────────

const overviewCards = [
  {
    title: "Consultation-first design",
    description:
      "Every dispense action is gated behind a proper patient consultation log — no guesswork, full clinical accountability.",
    icon: Waypoints,
  },
  {
    title: "AI-powered scanning",
    description:
      "Photograph any medicine box or prescription. Gemini AI extracts name, dosage, quantity, and expiry instantly.",
    icon: Stethoscope,
  },
  {
    title: "Geo-smart referrals",
    description:
      "When stock runs out, the Haversine formula finds the nearest partner barangay with available supply — in seconds.",
    icon: ShieldCheck,
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] dark:bg-[#08111F] dark:text-slate-50">
      <SiteHeader />

      <main>
        {/* ─── HERO — full viewport, everything fits without scrolling ─── */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-10 pt-24 sm:px-6 lg:px-8">
          {/* Subtle ambient gradient */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(20,184,166,0.13),transparent_40%),radial-gradient(ellipse_at_80%_10%,rgba(37,99,235,0.11),transparent_38%),radial-gradient(ellipse_at_50%_100%,rgba(6,182,212,0.08),transparent_38%)]" />

          <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center text-center">

            {/* Badge pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#CBD5E1] bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1D4ED8] shadow-sm backdrop-blur dark:border-slate-600/40 dark:bg-[#101B2D]/80 dark:text-[#93C5FD]">
              <span className="size-1.5 animate-pulse rounded-full bg-current" />
              Consultation-first medicine flow
            </div>

            {/* Headline — sized to fit one viewport */}
            <h1 className="text-balance text-[2.1rem] font-extrabold leading-[1.1] tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-5xl md:text-[3.2rem]">
              Managing{" "}
              <span className="inline-block rounded-xl bg-[#1E293B] px-3 py-0.5 text-white shadow-md dark:bg-[#EFF6FF] dark:text-[#0F172A]">
                patients,
              </span>{" "}
              medicine &amp; referrals —{" "}
              <span className="text-[#2563EB] dark:text-[#60A5FA]">
                all in one place.
              </span>
            </h1>

            {/* Sub-description */}
            <p className="mt-5 max-w-xl text-balance text-[0.93rem] leading-relaxed text-[#64748B] dark:text-slate-300 sm:text-base">
              Log consultations, scan medicines with Gemini AI, monitor live
              stock levels, dispense securely, and instantly route referrals to
              the nearest barangay health center — built for every Filipino BHW.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Button
                asChild
                size="default"
                className="min-w-[140px] rounded-xl px-7 font-semibold shadow-md shadow-blue-600/20"
              >
                <Link href="/login">
                  Get Started
                  <ArrowUpRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="default"
                variant="outline"
                className="min-w-[140px] rounded-xl px-7 font-semibold"
              >
                <Link href="/dashboard">Open Workspace</Link>
              </Button>
            </div>

            {/* ── Tech Stack Brand Logos ── */}
            <div className="mt-10 flex w-full flex-col items-center gap-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#94A3B8]">
                Built with the GabayGamot stack
              </p>

              {/* 3-col grid on mobile → single flex row on sm+ */}
              <div className="grid w-full max-w-sm grid-cols-3 gap-x-4 gap-y-4 sm:flex sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-3">
                {stackLogos.map(({ name, Logo, cls }) => (
                  <div
                    key={name}
                    className="flex flex-col items-center gap-1.5 opacity-55 transition-opacity duration-200 hover:opacity-100 sm:flex-row sm:gap-2"
                  >
                    <Logo className={`size-9 shrink-0 sm:size-8 ${cls}`} />
                    <span className="text-[11px] font-bold text-[#475569] dark:text-slate-400 sm:text-sm">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── OVERVIEW placeholder — next sections built here ── */}
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div id="overview" className="grid gap-6 lg:grid-cols-3">
            {overviewCards.map(({ title, description, icon: Icon }) => (
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
        </section>
      </main>
    </div>
  );
}
