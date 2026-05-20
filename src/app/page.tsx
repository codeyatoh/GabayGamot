"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowUpRight, ShieldCheck, Stethoscope, Waypoints, Zap, MonitorSmartphone, Cable, Smile, ClipboardList, ScanBarcode, ArchiveRestore, ChevronRight, HelpCircle, Pill, Users, Bot, ArrowUp, Moon, Sun, Heart } from "lucide-react";
import * as Lucide from "lucide-react";
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


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

const teamMembers: { name: string; image: string | null; role: string }[] = [
  {
    name: "Pauleen Sabillo",
    image: "/assets/images/team/pauleen-sabillo.jpg",
    role: "Lead / Pitcher",
  },
  {
    name: "Angelito Halmain",
    image: "/assets/images/team/angelito-halmain.png",
    role: "Full Stack Developer",
  },
  {
    name: "Joash Elizzer",
    image: "/assets/images/team/joash-elizzer.jpg",
    role: "Data Analyst",
  },
  {
    name: "Gabriel Carpio",
    image: "/assets/images/team/gabriel-carpio.jpg",
    role: "Researcher",
  },
  {
    name: "Cedrick Tacan",
    image: "/assets/images/team/cedrick-tacan.png",
    role: "Tester",
  },
  {
    name: "Roman Jade Sol",
    image: null,
    role: "Coach",
  },
  {
    name: "Rai Beligolo",
    image: null,
    role: "Mentor",
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

        {/* ── TEAM SECTION ── */}
        <section id="team" className="mx-auto max-w-7xl px-6 py-20 md:py-32">
          <h2 className="text-balance text-center font-bold text-3xl tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-4xl md:text-[2.75rem]">
            Built by Makers
          </h2>
          <p className="mt-3 text-balance text-center text-lg text-[#64748B] dark:text-slate-300 tracking-tight md:text-xl">
            The dedicated team driving clinical accountability and community healthcare co-piloting.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:mt-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-l border-t border-[#CBD5E1] dark:border-slate-800/80">
            {teamMembers.map((member, index) => (
              <div className="-mt-px -ml-px border border-[#CBD5E1] dark:border-slate-800/80 py-8 px-4 flex flex-col items-center justify-center transition-all duration-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/10" key={index}>
                <div className="relative mx-auto aspect-square w-36 overflow-hidden rounded-full border border-[#CBD5E1] dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50">
                  {member.image ? (
                    <Image
                      alt={member.name}
                      src={member.image}
                      width={144}
                      height={144}
                      className="size-full object-cover object-center grayscale contrast-[1.05] hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] dark:from-[#172338] dark:to-[#1E3A5F]">
                      <span className="text-3xl font-bold text-[#2563EB] dark:text-[#60A5FA] select-none">
                        {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-5 text-center font-bold text-lg text-[#1E293B] dark:text-slate-100">
                  {member.name}
                </p>
                <p className="mt-1 text-center text-sm font-semibold text-[#0d9488] dark:text-[#2DD4BF]">
                  {member.role}
                </p>
                <div className="mt-5 flex items-center justify-center gap-2">
                  <span className="rounded-full border border-[#CBD5E1] bg-white px-3 py-1 text-[11px] font-semibold text-[#64748B] dark:border-slate-700 dark:bg-[#101B2D] dark:text-slate-300">
                    AI Hackathon Team
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ SECTION ── */}
        <FAQSection />

      </main>
      <Footer />
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

const faqCategories = [
  {
    category: "Getting Started",
    icon: HelpCircle,
    faqs: [
      {
        question: "What is GabayGamot?",
        answer:
          "GabayGamot is a consultation-first medicine management platform built for barangay health centers. It lets health workers log patient consultations, scan medicines with Gemini AI, track live inventory, dispense safely, and route referrals when stock runs out.",
      },
      {
        question: "Who can use GabayGamot?",
        answer:
          "GabayGamot is designed for Barangay Health Workers (BHWs) and Super Admins. BHWs manage their local health center, while Super Admins oversee all barangays in the network.",
      },
      {
        question: "How do I create an account?",
        answer:
          "Click 'Get Started' on the homepage and complete the BHW registration form. Upload your proof of employment and pin your health center on the map. A Super Admin will review and approve your account.",
      },
      {
        question: "How long does account approval take?",
        answer:
          "Approval depends on your Super Admin. Once they review your submitted documents and health center location, you will receive access to the full dashboard.",
      },
    ],
  },
  {
    category: "Medicine & Inventory",
    icon: Pill,
    faqs: [
      {
        question: "How does the AI medicine scanner work?",
        answer:
          "Point your camera at any medicine box and tap Scan. Gemini AI reads the label and automatically extracts the medicine name, dosage, quantity, and expiry date. You can review and confirm the details before saving to inventory.",
      },
      {
        question: "What happens when stock runs low?",
        answer:
          "GabayGamot automatically flags low-stock and near-expiry medicines on your dashboard. You will see critical alerts listing every affected batch so you can act before a stockout happens.",
      },
      {
        question: "Can I add medicines without scanning?",
        answer:
          "Yes. You can manually select any medicine from the master catalog and enter the quantity and expiry date directly without using the camera scanner.",
      },
      {
        question: "What is the medicine master catalog?",
        answer:
          "The master catalog is a shared list of all medicines in the GabayGamot network. Any approved health worker can look up medicines from it, while only authorized staff can add new entries.",
      },
    ],
  },
  {
    category: "Patients & Dispensing",
    icon: Users,
    faqs: [
      {
        question: "Why must I log a consultation before dispensing?",
        answer:
          "GabayGamot uses a consultation-first design. Every medicine dispense is tied to a logged patient consultation to ensure full clinical accountability and an accurate audit trail.",
      },
      {
        question: "How do referrals work when medicine is out of stock?",
        answer:
          "When your health center runs out of a medicine, GabayGamot uses the Haversine algorithm to find the nearest partner barangay with available stock and creates a referral automatically.",
      },
      {
        question: "Are patient records kept private?",
        answer:
          "Yes. Patient data is protected by Supabase Row Level Security (RLS). BHWs can only access records within their assigned health center. No patient personal information is ever sent to the AI.",
      },
      {
        question: "Can I view past dispensing history?",
        answer:
          "Yes. All dispensing transactions are logged in the audit trail. You can view, filter, and export dispensing records from the Reports section.",
      },
    ],
  },
  {
    category: "AI Insights & Security",
    icon: Bot,
    faqs: [
      {
        question: "What does the AI co-pilot actually do?",
        answer:
          "The AI co-pilot analyzes your consultation logs, inventory levels, and referral trends to surface actionable insights — such as emerging illness trends, predicted stockouts, and recommended next steps. It is decision support only, not medical advice.",
      },
      {
        question: "Does the AI diagnose patients?",
        answer:
          "No. GabayGamot AI is strictly a decision support tool. It works with operational and inventory data, never patient-level clinical data, and never replaces a licensed healthcare professional.",
      },
      {
        question: "How is my data kept secure?",
        answer:
          "All data is stored in Supabase with strict Row Level Security policies. Server-side Gemini and Supabase integrations keep API keys out of the browser. Reports and AI insight responses include no-store cache headers to prevent data leakage.",
      },
      {
        question: "Can Super Admins see data from all barangays?",
        answer:
          "Yes. Super Admins have a global view across all health centers for inventory monitoring, referral tracking, and AI insights. BHWs are restricted to their own center only.",
      },
    ],
  },
];

function FAQSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    faqCategories[0].category
  );
  const activeFaqs = faqCategories.find(
    ({ category }) => category === activeCategory
  )?.faqs;

  return (
    <section id="faqs" className="mx-auto max-w-7xl px-6 py-20 md:py-32">
      <div className="text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-4xl md:text-[2.75rem]">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-balance text-lg text-[#64748B] dark:text-slate-300 md:text-xl">
          Find answers to common questions about GabayGamot features and operations.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-4xl sm:mt-16">
        {/* Mobile FAQs (Accordion per Category) */}
        <div className="flex flex-col gap-8 sm:hidden">
          {faqCategories.map(({ category, icon: Icon, faqs }) => {
            const CurrentIcon = Icon;
            return (
              <div className="rounded-2xl border border-[#CBD5E1] p-5 dark:border-slate-800/80 bg-white/50 dark:bg-[#101b2d]/20" key={category}>
                <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800/60">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB] dark:bg-[#172338] dark:text-[#93C5FD]">
                    <CurrentIcon className="size-4.5" />
                  </div>
                  <span className="font-bold text-[#1E293B] dark:text-slate-100 text-base">{category}</span>
                </div>
                <FAQList faqs={faqs} />
              </div>
            );
          })}
        </div>

        {/* Desktop FAQs (Categorized Sidebar tabs + Active list Accordion) */}
        <div className="hidden gap-8 sm:flex">
          <div className="flex w-64 shrink-0 flex-col gap-2">
            {faqCategories.map(({ category, icon: Icon }) => {
              const CurrentIcon = Icon;
              const isActive = activeCategory === category;
              return (
                <Button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "h-12 justify-start gap-3 rounded-xl px-4 font-semibold text-sm transition-all",
                    isActive
                      ? "bg-[#2563EB] text-white shadow-md dark:bg-[#3B82F6]"
                      : "text-[#64748B] hover:text-[#1E293B] dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  )}
                >
                  <CurrentIcon className="size-5 shrink-0" />
                  {category}
                </Button>
              );
            })}
          </div>

          <div className="flex grow flex-col gap-4 rounded-2xl border border-[#CBD5E1] p-6 dark:border-slate-800/80 bg-white/50 dark:bg-[#101b2d]/20">
            <FAQList faqs={activeFaqs ?? []} />
          </div>
        </div>
      </div>
    </section>
  );
}
function FAQList({ faqs }: { faqs: typeof faqCategories[0]["faqs"] }) {
  return (
    <Accordion className="space-y-3" collapsible type="single">
      {faqs?.map((faq, index) => (
        <AccordionItem
          className="rounded-xl border border-[#CBD5E1]/40 dark:border-slate-800/40 bg-[#EFF6FF]/40 dark:bg-[#172338]/30 px-5"
          key={index}
          value={faq.question}
        >
          <AccordionTrigger className="font-semibold text-base py-4 text-[#1E293B] hover:text-[#2563EB] dark:text-slate-100 dark:hover:text-[#60A5FA] hover:no-underline">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-[#475569] dark:text-slate-350 pb-4 pt-1">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
const footerNavigation = {
  categories: [
    {
      id: "platform",
      name: "Platform",
      sections: [
        {
          id: "features",
          name: "Features",
          items: [
            { name: "Public Home", href: "/" },
            { name: "Features List", href: "/#features" },
            { name: "How It Works", href: "/#how-it-works" },
            { name: "AI Insights", href: "/#ai-command-insights" },
            { name: "Our Makers", href: "/#team" },
            { name: "FAQs Section", href: "/#faqs" },
          ],
        },
        {
          id: "workspaces",
          name: "Workspaces",
          items: [
            { name: "BHW Dashboard", href: "/dashboard" },
            { name: "Camera Scan", href: "/scan" },
            { name: "Local Stock", href: "/inventory" },
            { name: "Dispense Log", href: "/dispense" },
            { name: "Referrals Desk", href: "/referrals" },
            { name: "AI Insights App", href: "/ai-insights" },
          ],
        },
        {
          id: "admin-flows",
          name: "Super Admin",
          items: [
            { name: "Admin Panel", href: "/admin" },
            { name: "Global Stock", href: "/admin/inventory" },
            { name: "Global Referrals", href: "/admin/referrals" },
            { name: "Global Insights", href: "/admin/insights" },
            { name: "Global Reports", href: "/admin/reports" },
            { name: "Local Reports", href: "/reports" },
          ],
        },
        {
          id: "intake",
          name: "Account",
          items: [
            { name: "Login Portal", href: "/login" },
            { name: "BHW Register", href: "/signup" },
            { name: "Onboarding Flow", href: "/onboarding" },
            { name: "Pending Desk", href: "/pending-approval" },
            { name: "Sign Out", href: "/auth/signout" },
          ],
        },
        {
          id: "legal",
          name: "Security & Legal",
          items: [
            { name: "Privacy and Security FAQ", href: "/#faqs" },
            { name: "AI Safety Notes", href: "/#ai-command-insights" },
            { name: "Project Repository", href: "https://github.com/codeyatoh/GabayGamot" },
            { name: "Meet the Team", href: "/#team" },
            { name: "Login Portal", href: "/login" },
          ],
        },
      ],
    },
  ],
};

const footerSocials = [
  {
    label: "Facebook",
    href: "#",
    Icon: FaFacebook,
  },
  {
    label: "Instagram",
    href: "#",
    Icon: FaInstagram,
  },
  {
    label: "X",
    href: "#",
    Icon: FaXTwitter,
  },
  {
    label: "LinkedIn",
    href: "#",
    Icon: FaLinkedin,
  },
  {
    label: "GitHub",
    href: "#",
    Icon: FaGithub,
  },
];

const UnderlineStyle = "hover:-translate-y-1 border border-dotted border-[#CBD5E1] dark:border-slate-800 rounded-xl p-2.5 transition-all duration-200 bg-white/40 dark:bg-[#101b2d]/25 hover:bg-[#EFF6FF] dark:hover:bg-[#172338] hover:border-[#2563EB]/50 dark:hover:border-[#3B82F6]/50";

function Footer() {
  return (
    <footer className="mx-auto mt-20 flex h-full w-full flex-col items-center justify-center border-t border-[#E2E8F0]/80 dark:border-slate-800/60 bg-[#F8FAFC] dark:bg-[#08111F]">
      <div className="relative mx-auto grid max-w-7xl items-center justify-center gap-6 p-10 pb-4 md:flex">
        <Link href="/" className="flex shrink-0 justify-center">
          <span className="flex size-14 items-center justify-center rounded-full border border-[#CBD5E1] bg-[#EFF6FF] shadow-sm dark:border-slate-500/40 dark:bg-[#172338]">
            <Image
              alt="GabayGamot logo"
              className="size-9 object-contain"
              height={36}
              src="/assets/images/gabay-gamot-logo-sm.png"
              width={36}
            />
          </span>
        </Link>
        <p className="text-slate-500 dark:text-slate-400 text-center text-xs leading-relaxed md:text-left max-w-5xl">
          Welcome to GabayGamot, the intelligent consultation-first medicine logistics and co-pilot network for barangay health centers. 
          We are passionate about transforming rural healthcare workflows, helping health workers save time on administrative inventory logs, 
          preventing critical stockouts through AI-driven predictions, and enabling seamless geo-referrals. 
          Our mission is to empower local health stations with clinical accountability, smart data transparency, and secure co-piloting tools.
        </p>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="border-b border-dotted border-slate-300 dark:border-slate-800"> </div>
        <div className="py-8">
          {footerNavigation.categories.map((category) => (
            <div
              key={category.name}
              className="grid grid-cols-2 gap-8 leading-6 sm:grid-cols-3 md:flex md:justify-between"
            >
              {category.sections.map((section) => (
                <div key={section.name} className="flex flex-col">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
                    {section.name}
                  </h4>
                  <ul
                    role="list"
                    className="flex flex-col space-y-2"
                  >
                    {section.items.map((item) => (
                      <li key={item.name} className="flow-root">
                        <Link
                          href={item.href}
                          className="text-sm text-slate-500 hover:text-[#2563EB] md:text-xs dark:text-slate-400 hover:dark:text-[#60A5FA] transition-colors"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-b border-dotted border-slate-300 dark:border-slate-800"> </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 px-6 md:flex-row md:flex-wrap">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {footerSocials.map((social) => {
            const CurrentIcon = social.Icon;
            return (
              <Link
                key={social.label}
                aria-label={social.label}
                href={social.href}
                rel="noreferrer"
                target="_blank"
                className={UnderlineStyle}
              >
                <CurrentIcon className="h-5 w-5 text-slate-500 hover:text-[#2563EB] dark:text-slate-400 dark:hover:text-[#60A5FA] transition-colors" />
              </Link>
            );
          })}
        </div>
        <FooterTheme />
      </div>

      <div className="mx-auto mt-8 mb-10 flex flex-col justify-between text-center text-xs md:max-w-7xl">
        <div className="flex flex-row items-center justify-center gap-1 text-slate-500 dark:text-slate-400">
          <span> © </span>
          <span>{new Date().getFullYear()}</span>
          <span>GabayGamot. Made with</span>
          <Heart className="mx-1 h-4 w-4 animate-pulse text-red-500" />
          <span> by </span>
          <span className="font-bold text-slate-700 dark:text-slate-200">
            Team Avant Heim
          </span>
        </div>
      </div>
    </footer>
  );
}

function handleScrollTop() {
  window.scroll({
    top: 0,
    behavior: "smooth",
  });
}

function FooterTheme() {
  const [themeState, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setThemeState(isDark ? "dark" : "light");
    };
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const changeTheme = (nextTheme: "light" | "dark") => {
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("gabaygamot-theme", nextTheme);
    setThemeState(nextTheme);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center rounded-full border border-dotted border-[#CBD5E1] dark:border-slate-800 bg-white/60 dark:bg-[#101b2d]/30 px-3 py-1">
        <button
          onClick={() => changeTheme("light")}
          className={cn(
            "rounded-full p-2 transition-all cursor-pointer",
            themeState === "light"
              ? "bg-[#2563EB] text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          )}
          aria-label="Light theme"
        >
          <Sun className="h-4 w-4" />
        </button>

        <button 
          type="button" 
          onClick={handleScrollTop}
          className="mx-3 rounded-full p-2 text-slate-500 hover:text-[#2563EB] dark:text-slate-400 dark:hover:text-[#60A5FA] transition-all hover:scale-110 cursor-pointer"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>

        <button
          onClick={() => changeTheme("dark")}
          className={cn(
            "rounded-full p-2 transition-all cursor-pointer",
            themeState === "dark"
              ? "bg-[#3B82F6] text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          )}
          aria-label="Dark theme"
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
