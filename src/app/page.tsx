import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Stethoscope, Waypoints, Zap, MonitorSmartphone, Cable, Smile, ClipboardList, ScanBarcode, ArchiveRestore, ChevronRight } from "lucide-react";
import * as Lucide from "lucide-react";
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
import { ShineBorder } from "@/components/ui/shine-border";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";


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

        {/* ── HOW IT WORKS SECTION ── */}
        <section id="how-it-works" className="bg-slate-50 py-16 dark:bg-transparent md:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-5xl lg:text-5xl">
                How GabayGamot Works
              </h2>
              <p className="mt-4 text-lg text-[#64748B] dark:text-slate-300">
                A simple, three-step process ensuring clinical accountability and accurate inventory.
              </p>
            </div>

            <Card className="mx-auto mt-8 grid max-w-sm divide-y overflow-hidden border-[#CBD5E1] shadow-sm dark:border-slate-800 md:mt-16 md:max-w-full md:grid-cols-3 md:divide-x md:divide-y-0">
              
              <div className="group text-center">
                <CardHeader className="pb-3">
                  <CardDecorator>
                    <ClipboardList className="size-6 text-[#2563EB] dark:text-[#60A5FA]" aria-hidden />
                  </CardDecorator>
                  <h3 className="mt-6 text-lg font-semibold text-[#1E293B] dark:text-slate-100">
                    1. Log Consultation
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-[0.95rem] text-[#64748B] dark:text-slate-400">
                    Verify the patient&apos;s health record and securely log their consultation details before proceeding.
                  </p>
                </CardContent>
              </div>

              <div className="group text-center">
                <CardHeader className="pb-3">
                  <CardDecorator>
                    <ScanBarcode className="size-6 text-[#06B6D4] dark:text-[#22D3EE]" aria-hidden />
                  </CardDecorator>
                  <h3 className="mt-6 text-lg font-semibold text-[#1E293B] dark:text-slate-100">
                    2. Scan or Select
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-[0.95rem] text-[#64748B] dark:text-slate-400">
                    Use our AI camera to quickly scan medicine boxes or manually select from the live inventory.
                  </p>
                </CardContent>
              </div>

              <div className="group text-center">
                <CardHeader className="pb-3">
                  <CardDecorator>
                    <ArchiveRestore className="size-6 text-[#14B8A6] dark:text-[#2DD4BF]" aria-hidden />
                  </CardDecorator>
                  <h3 className="mt-6 text-lg font-semibold text-[#1E293B] dark:text-slate-100">
                    3. Dispense & Update
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-[0.95rem] text-[#64748B] dark:text-slate-400">
                    Finalize the transaction. The system instantly updates your stock levels and logs the history.
                  </p>
                </CardContent>
              </div>

            </Card>
          </div>
        </section>

        {/* ── AI COMMAND INSIGHTS SECTION ── */}
        <section id="ai-command-insights" className="relative flex w-full flex-col items-center justify-center p-6 py-20 md:p-10 md:py-32">
          {/* Subtle ambient light */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06),transparent_60%)]" />

          <ShineBorder
            borderRadius={24}
            borderWidth={2}
            className="mx-auto w-full max-w-2xl"
          >
            <div className="p-6 sm:p-10 md:p-12 relative z-10 flex flex-col items-center">
              <h2 className="mb-8 text-center text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-slate-50 md:text-4xl">
                AI Command Insights
              </h2>
              
              <Timeline />

              <div className="z-10 mt-12 flex flex-col items-center text-center">
                <h3 className="text-xl font-bold md:text-2xl text-[#1E293B] dark:text-slate-100">
                  Intelligent Healthcare Co-Pilot
                </h3>
                <p className="mt-2 text-sm text-[#64748B] dark:text-slate-400 max-w-md">
                  Decision support engine analyzing local disease trends and proximity logistics to ensure zero stockouts.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Link
                    href="/login"
                    className={cn(
                      "group inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-transform hover:scale-105 dark:bg-[#3B82F6]"
                    )}
                  >
                    Get AI Insights
                    <ChevronRight className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="#features"
                    className={cn(
                      "group inline-flex items-center justify-center rounded-xl border border-[#CBD5E1] bg-white px-6 py-3 text-sm font-semibold text-[#1E293B] transition-transform hover:scale-105 dark:border-slate-700 dark:bg-[#172338] dark:text-slate-100"
                    )}
                  >
                    Explore Features
                    <ChevronRight className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </ShineBorder>
        </section>
      </main>
    </div>
  );
}

const CardDecorator = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mx-auto size-36 duration-200 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_60%)] [--color-border:rgba(30,41,59,0.1)] group-hover:[--color-border:rgba(30,41,59,0.2)] dark:[--color-border:rgba(255,255,255,0.15)] dark:group-hover:[--color-border:rgba(255,255,255,0.25)]">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
    />
    <div className="absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t border-[var(--color-border)] bg-white dark:bg-[#101B2D]">
      {children}
    </div>
  </div>
);

// ── AI TIMELINE HELPERS ──

interface TimelineEventProps {
  label: string;
  message: string;
  icon: {
    name: keyof typeof Lucide;
    textColor: string;
    borderColor: string;
  };
  isLast?: boolean;
}

const TimelineContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto flex w-full max-w-lg flex-col justify-center gap-6">
    {children}
  </div>
);

const TimelineEvent = ({
  label,
  message,
  icon,
  isLast = false,
}: TimelineEventProps) => {
  const Icon = Lucide[icon.name as keyof typeof Lucide] as Lucide.LucideIcon;

  return (
    <div className="group/event relative flex gap-4 p-2 transition-all duration-200">
      <div className="relative flex flex-col items-center">
        <div
          className={cn(
            "bg-white dark:bg-[#101B2D] rounded-full border p-2 z-10 transition-transform duration-200 group-hover/event:scale-110 shadow-sm",
            icon.borderColor
          )}
        >
          {Icon && <Icon className={cn("size-4", icon.textColor)} />}
        </div>
        {!isLast && (
          <div className="bg-[#CBD5E1]/60 dark:bg-slate-800/80 absolute top-9 bottom-[-24px] w-[2px] z-0" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <p className="text-base font-semibold text-[#1E293B] dark:text-slate-100">{label}</p>
        </div>
        <p className="text-[#64748B] dark:text-slate-400 text-xs sm:text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

const Timeline = () => (
  <TimelineContainer>
    {timelineData.map((event, i) => (
      <TimelineEvent
        key={event.label}
        isLast={i === timelineData.length - 1}
        {...event}
      />
    ))}
  </TimelineContainer>
);

interface TimelineEventData {
  label: string;
  message: string;
  icon: {
    name: keyof typeof Lucide;
    textColor: string;
    borderColor: string;
  };
}

const timelineData: TimelineEventData[] = [
  {
    label: "Aggregate Inventory & Logs",
    message: "The platform automatically consolidates daily consultation logs and batch stock levels from each health center.",
    icon: {
      name: "Database",
      textColor: "text-[#2563EB]",
      borderColor: "border-[#2563EB]/40",
    },
  },
  {
    label: "AI Pattern Extraction",
    message: "Gemini Flash runs OCR on medicine labels and analyzes historical trends to detect impending stockouts or disease patterns.",
    icon: {
      name: "Sparkles",
      textColor: "text-[#06B6D4]",
      borderColor: "border-[#06B6D4]/40",
    },
  },
  {
    label: "Cross-Barangay Referrals",
    message: "If supply runs low in your center, the co-pilot automatically flags nearby barangay stock options within geo-proximity.",
    icon: {
      name: "Waypoints",
      textColor: "text-[#0D9488]",
      borderColor: "border-[#0D9488]/40",
    },
  },
  {
    label: "Actionable Operational Alerts",
    message: "Super Admins and health workers receive deep insights detailing what is happening, why it matters, and direct next steps.",
    icon: {
      name: "TrendingUp",
      textColor: "text-[#10B981]",
      borderColor: "border-[#10B981]/40",
    },
  },
];
