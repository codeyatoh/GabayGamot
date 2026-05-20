"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ShieldCheck,
  Stethoscope,
  Waypoints,
  Moon,
  Sun,
  Menu,
  X,
  Scan,
  MapPin,
  ClipboardList,
  ShieldAlert,
  ChevronDown,
  Mail,
  Phone
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BorderGlow } from "@/components/ui/border-glow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const techStackLogos = [
  { name: "Next.js", mark: "N" },
  { name: "TypeScript", mark: "TS" },
  { name: "Supabase", mark: "S" },
  { name: "Mapbox", mark: "M" },
  { name: "Gemini AI", mark: "AI" },
  { name: "Vercel", mark: "V" },
];

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

const featuresList = [
  {
    title: "AI Prescription Scanning",
    description: "Capture prescriptions or medicine packaging. Secure Gemini AI extracts medicine names, dosages, and active expiration dates instantly.",
    icon: Scan,
    badge: "Gemini Pro"
  },
  {
    title: "GPS Barangay Referrals",
    description: "Low on stock? Search adjacent health centers. Built-in Haversine distance mapping shows the closest partners with available stocks.",
    icon: MapPin,
    badge: "Mapbox + PSGC"
  },
  {
    title: "Clinical Consultation Logs",
    description: "Encourage checked dispensing. Track symptoms, patient medical histories, and dispense logs in one unified portal.",
    icon: ClipboardList,
    badge: "Consultation-First"
  },
  {
    title: "Illness Outbreak Alerts",
    description: "Monitor community disease patterns. Track spikes in common seasonal illnesses to forecast inventory requirements dynamically.",
    icon: ShieldAlert,
    badge: "Public Health"
  }
];

const faqs = [
  {
    question: "Paano kung mahina o nawalan ng internet sa aming Barangay Health Center?",
    answer: "Ang GabayGamot ay binuo bilang isang Progressive Web App (PWA). Gagana ito nang maayos sa mahinang signal. Kung tuluyang offline, maaari mong piktyuran ang reseta o gamot at i-upload sa system kapag may maayos nang koneksyon."
  },
  {
    question: "Ligtas ba ang medical records ng mga pasyente?",
    answer: "Opo. Ang platform ay gumagamit ng enterprise-grade Supabase Row Level Security (RLS). Ang lahat ng data ay naka-encrypt at maaari lamang ma-access ng mga awtorisadong Barangay Health Workers (BHW) sa inyong partikular na unit."
  },
  {
    question: "Paano tinutukoy ng referral system ang pinakamalapit na health center?",
    answer: "Gamit ang real coordinates ng mga health center at ang mathematical Haversine Formula, awtomatikong kinakalkula ng system ang eksaktong distansya (sa kilometro) upang mahanap ang pinakamalapit na Barangay Health Center na may sapat na supply ng inyong hinahanap na gamot."
  },
  {
    question: "Pwede ko ba itong i-install bilang Mobile App sa aking smartphone?",
    answer: "Opo! Ang GabayGamot ay PWA-ready. Pwede mo itong i-install nang direkta sa iyong home screen mula sa Safari (iOS) o Chrome (Android) nang hindi na kailangang dumaan sa App Store o Google Play Store."
  }
];

const THEME_STORAGE_KEY = "gabaygamot-theme";
type ThemeMode = "light" | "dark";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<ThemeMode>("light");
  const [mounted, setMounted] = React.useState(false);
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

  // Sync theme
  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : prefersDark
          ? "dark"
          : "light";

    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    queueMicrotask(() => {
      setTheme(initialTheme);
      setMounted(true);
    });
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] dark:bg-[#08111F] dark:text-slate-50 transition-colors duration-300">
      
      {/* 1. HERO SECTION (Redesigned as full view glassmorphism panel with custom BorderGlow) */}
      <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-8 md:p-12 lg:p-16">
        {/* Soft, beautiful multi-color edge gradient blobs matching the image */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.15),transparent_40%),radial-gradient(circle_at_0%_50%,rgba(219,70,239,0.15),transparent_40%),radial-gradient(circle_at_100%_50%,rgba(16,185,129,0.15),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.18),transparent_40%)]" />
        
        {/* Glass Card Container wrapping the BorderGlow */}
        <div className="relative z-20 w-full max-w-7xl h-[calc(100vh-80px)] min-h-[640px] md:h-[760px] rounded-2xl shadow-[0_0_8px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.05),inset_1px_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_0_12px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-3xl transition-all">
          <BorderGlow className="w-full h-full" height="100%">
            
            {/* Header inside the glassmorphism card */}
            <header className="relative z-30 flex items-center justify-between p-5 md:px-8 md:py-6 border-b border-slate-200/30 dark:border-slate-800/30">
              <Link className="flex items-center gap-3" href="/">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200/50 bg-[#EFF6FF] shadow-sm dark:border-slate-700/50 dark:bg-[#172338]">
                  <Image
                    alt="GabayGamot logo"
                    className="size-6 object-contain"
                    height={24}
                    src="/assets/images/gabay-gamot-logo-sm.png"
                    width={24}
                  />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-bold tracking-tight text-[#0F172A] dark:text-slate-50">
                    GabayGamot
                  </span>
                  <span className="block text-[10px] uppercase tracking-wider text-[#475569] dark:text-slate-300">
                    Barangay Portal
                  </span>
                </span>
              </Link>

              {/* Navigation links center */}
              <nav className="hidden lg:flex items-center gap-1.5">
                {[
                  { href: "#overview", label: "Overview" },
                  { href: "#features", label: "Features" },
                  { href: "#how-it-works", label: "How It Works" },
                  { href: "#ai-insights", label: "AI Insights" },
                  { href: "#team", label: "Team" },
                  { href: "#faq", label: "FAQ" },
                ].map((item) => (
                  <a
                    key={item.href}
                    className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-blue-50 hover:text-[#1D4ED8] dark:text-slate-200 dark:hover:bg-slate-800/60 dark:hover:text-[#93C5FD]"
                    href={item.href}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Header Right Actions */}
              <div className="flex items-center gap-3">
                {/* Theme toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
                  className="relative inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[#172338]/80 dark:text-slate-100 dark:hover:bg-[#22314A]"
                >
                  <Moon
                    className={`absolute size-4 text-[#2563EB] transition-all duration-300 ${
                      mounted && theme === "dark" ? "scale-0 rotate-180 opacity-0" : "scale-100 rotate-0 opacity-100"
                    }`}
                  />
                  <Sun
                    className={`absolute size-4 text-[#F59E0B] transition-all duration-300 ${
                      mounted && theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-180 opacity-0"
                    }`}
                  />
                </button>

                {/* Login Button */}
                <Button asChild className="hidden sm:inline-flex h-9 rounded-full px-5 text-xs font-semibold">
                  <Link href="/login">Login</Link>
                </Button>

                {/* Mobile Menu Button */}
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="lg:hidden flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-800 shadow-sm dark:border-slate-700 dark:bg-[#172338]/80 dark:text-slate-100"
                >
                  {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                </button>
              </div>
            </header>

            {/* Mobile Navigation Dropdown */}
            {menuOpen && (
              <div className="absolute top-20 left-4 right-4 z-40 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0B1524]/95 lg:hidden">
                <nav className="flex flex-col gap-2">
                  {[
                    { href: "#overview", label: "Overview" },
                    { href: "#features", label: "Features" },
                    { href: "#how-it-works", label: "How It Works" },
                    { href: "#ai-insights", label: "AI Insights" },
                    { href: "#team", label: "Team" },
                    { href: "#faq", label: "FAQ" },
                  ].map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-blue-50 dark:text-slate-200 dark:hover:bg-slate-800/50"
                    >
                      {item.label}
                    </a>
                  ))}
                  <Button asChild className="w-full mt-2 rounded-xl">
                    <Link href="/login" onClick={() => setMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                </nav>
              </div>
            )}

            {/* Main content aligned at bottom left, identical to layout in the provided image */}
            <div className="relative flex-1 flex flex-col justify-end p-6 md:p-12 lg:p-16">
              <div className="max-w-2xl text-left">
                
                {/* Pill Notification */}
                <div className="bg-[#EFF6FF] dark:bg-[#172338] border border-blue-200/50 dark:border-blue-800/40 relative mb-5 inline-flex items-center rounded-full px-4 py-1.5 shadow-sm">
                  <div className="absolute top-0 right-1 left-1 h-px rounded-full bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
                  <span className="relative z-10 text-xs font-semibold text-[#1D4ED8] dark:text-[#93C5FD]">
                    ✨ Consultation-first medicine flow
                  </span>
                </div>

                {/* Heading with elegant Google Font 'Instrument Serif' */}
                <h1 className="mb-6 text-4xl leading-[1.12] tracking-tight md:text-5xl lg:text-6xl text-[#0F172A] dark:text-slate-50">
                  <span className="instrument italic text-[#2563EB] dark:text-[#3B82F6]">Empowering</span> barangay
                  <br />
                  <span className="font-extrabold tracking-tight">
                    health workers & patients.
                  </span>
                </h1>

                {/* Subtitle / Description */}
                <p className="text-[#475569] dark:text-slate-200 mb-8 text-sm md:text-base leading-relaxed max-w-xl font-medium">
                  Search or create patient records, log consultations, scan medicines with AI, 
                  verify live inventory stocks, dispense securely, or trigger nearby barangay referrals when stock runs out.
                </p>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4">
                  <Button asChild size="lg" className="rounded-full px-7 shadow-lg shadow-blue-500/10 hover:scale-[1.02] transition-transform">
                    <Link href="/login">
                      Open Login
                      <ArrowUpRight className="ml-1.5 size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-7 hover:scale-[1.02] transition-transform">
                    <Link href="/dashboard">Open Workspace</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Subtle Tech Stack Badges row in the card's very bottom right */}
            <div className="hidden md:flex absolute bottom-8 right-8 items-center gap-3 bg-white/40 dark:bg-slate-900/40 rounded-full px-4 py-2 border border-slate-200/35 dark:border-slate-800/35 backdrop-blur-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Stack:
              </span>
              <div className="flex items-center gap-2">
                {techStackLogos.map((tech) => (
                  <span
                    key={tech.name}
                    title={tech.name}
                    className="flex size-6 items-center justify-center rounded-full bg-[#2563EB]/10 text-[9px] font-bold text-[#1D4ED8] dark:bg-[#3B82F6]/10 dark:text-[#93C5FD]"
                  >
                    {tech.mark}
                  </span>
                ))}
              </div>
            </div>
            
          </BorderGlow>
        </div>
      </section>

      {/* 2. BASELINE OVERVIEW CARDS */}
      <main className="relative z-20 space-y-24 py-16 md:py-28">
        
        {/* Overview cards */}
        <section id="overview" className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-[#0F172A] dark:text-slate-50">
              Designed for Public Health Success
            </h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-300">
              Built systematically to transition local health units from messy paper records to highly intelligent digitized operations.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {foundationCards.map(({ title, description, icon: Icon }) => (
              <Card key={title} className="rounded-2xl border border-[#CBD5E1]/70 bg-white/70 dark:border-slate-800 dark:bg-[#101B2D]/70 hover:shadow-md transition-shadow">
                <CardHeader className="p-6">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] dark:bg-[#172338] dark:text-[#93C5FD] mb-4">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg font-bold mb-2">{title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed text-[#475569] dark:text-slate-300">{description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            ))}
          </div>
        </section>

        {/* 3. DETAILED FEATURES GRID */}
        <section id="features" className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-block rounded-full bg-[#14B8A6]/10 px-3.5 py-1 text-xs font-bold text-[#0D9488] dark:bg-[#14B8A6]/15 dark:text-[#2DD4BF]">
              Powerful Capabilities
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-[#0F172A] dark:text-slate-50">
              What GabayGamot Offers
            </h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-300">
              A comprehensive toolset developed custom for local health clinics and municipal environments.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuresList.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#101B2D] hover:-translate-y-1 transition-transform">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] dark:bg-slate-800 dark:text-[#93C5FD]">
                        <Icon className="size-5" />
                      </div>
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {feat.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">{feat.title}</h3>
                    <p className="text-xs leading-relaxed text-[#475569] dark:text-slate-300">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-block rounded-full bg-blue-100 text-[#1D4ED8] px-3.5 py-1 text-xs font-bold dark:bg-blue-900/30 dark:text-[#93C5FD]">
              Simple Implementation
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-[#0F172A] dark:text-slate-50">
              The Consultation-First Workflow
            </h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-300">
              How health workers log clinical data and distribute medicine in four simple stages.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4 relative">
            {[
              {
                step: "01",
                title: "Log Patient Profile",
                desc: "Search for the patient or register a new one. Enter basic information and secure address records."
              },
              {
                step: "02",
                title: "Register Symptoms",
                desc: "Log the symptoms of common illnesses (e.g. fever, cough, high blood pressure) to build diagnostic files."
              },
              {
                step: "03",
                title: "Verify & Scan Stocks",
                desc: "Scan prescription medicine using a smartphone camera. The system auto-deduces active inventory batches."
              },
              {
                step: "04",
                title: "Secure Dispense or Refer",
                desc: "Dispense medicine immediately. If out of stock, use GPS referrals to locate nearest barangay partner supplies."
              }
            ].map((item) => (
              <div key={item.step} className="relative group p-6 rounded-2xl bg-white border border-slate-200/80 dark:bg-[#101B2D] dark:border-slate-800">
                <div className="absolute top-4 right-4 text-4xl font-black text-slate-100 group-hover:text-blue-100/50 dark:text-slate-800 dark:group-hover:text-slate-700/50 transition-colors select-none">
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-4 mb-2">{item.title}</h3>
                <p className="text-xs leading-relaxed text-[#475569] dark:text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. FUTURISTIC GEMINI AI INSIGHTS PREVIEW */}
        <section id="ai-insights" className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            
            {/* Left text column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-block rounded-full bg-purple-100 text-[#8B5CF6] px-3.5 py-1 text-xs font-bold dark:bg-purple-900/30 dark:text-[#D946EF]">
                Gemini Health Analytics
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-[#0F172A] dark:text-slate-50">
                Smart Diagnostics & Forecasting
              </h2>
              <p className="text-sm text-[#475569] dark:text-slate-300 leading-relaxed">
                GabayGamot uses advanced Gemini AI routes to analyze local health units. It identifies seasonal illness spikes, monitors inventory expiration curves, and provides suggestions for stock replenishment.
              </p>
              
              <ul className="space-y-3.5">
                {[
                  "Automatic illness trend warnings",
                  "Expiration and depletion anomalies",
                  "Barangay-wide emergency supply routing suggestions"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right mockup column (High Contrast Glassmorphism Command Center UI) */}
            <div className="lg:col-span-7 bg-[#090D16] border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              {/* Futuristic grid mesh background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
              
              {/* Simulated browser window bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 relative z-10">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#EF4444]/80" />
                  <span className="size-2.5 rounded-full bg-[#F59E0B]/80" />
                  <span className="size-2.5 rounded-full bg-[#10B981]/80" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">
                  gabaygamot-ai-insights.bash
                </span>
              </div>

              {/* Simulated chat widget content */}
              <div className="space-y-4 relative z-10">
                <div className="flex gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white font-black text-[10px]">
                    AI
                  </div>
                  <div className="space-y-2 max-w-[85%]">
                    <div className="rounded-2xl rounded-tl-sm bg-slate-900 p-4 text-xs border border-slate-800 text-slate-300 leading-relaxed">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="size-2 rounded-full bg-purple-500 animate-ping" />
                        <span className="font-bold text-slate-100">Live Municipal Outbreak Alert</span>
                      </div>
                      Dengue cases in **Barangay Central** increased by **32%** over the past 14 days. Active Paracetamol stock is forecast to deplete in 4 days.
                      <br /><br />
                      **Recommended Action:**
                      Route **150 units** of Paracetamol 500mg from **Barangay San Jose** (1.4 km away), which currently holds an excess buffer of **400 units** expiring in late 2026.
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <div className="rounded-2xl rounded-tr-sm bg-purple-600/10 p-3 text-xs border border-purple-500/20 text-purple-200">
                    Auto-route request initiated to Barangay San Jose.
                  </div>
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-[10px]">
                    BHW
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 6. TEAM SECTION */}
        <section id="team" className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-block rounded-full bg-emerald-100 text-[#0D9488] px-3.5 py-1 text-xs font-bold dark:bg-emerald-950/30 dark:text-[#2DD4BF]">
              Our Organization
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-[#0F172A] dark:text-slate-50">
              The GabayGamot Pioneers
            </h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-300">
              A diverse team combining technical expertise, public medical guidelines, and design.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Dr. Elena Ramos, MD, MPH",
                role: "Public Health Consultant",
                sub: "Oversees consultation and dispensing compliance standards.",
                color: "bg-blue-500"
              },
              {
                name: "Jayvee Almodovar",
                role: "Lead Fullstack Architect",
                sub: "Engineered the Next.js routes, Supabase RLS, and Mapbox formulas.",
                color: "bg-purple-500"
              },
              {
                name: "Katarina Santos",
                role: "Senior BHW UX Designer",
                sub: "Optimized mobile layout accessibility for BHWs working in clinics.",
                color: "bg-teal-500"
              },
              {
                name: "Leo Tolentino",
                role: "AI Prompt Specialist",
                sub: "Maintains Gemini medical extraction prompts and security guardrails.",
                color: "bg-pink-500"
              }
            ].map((member) => (
              <div key={member.name} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-slate-200/80 dark:bg-[#101B2D] dark:border-slate-800">
                <div className={`size-16 rounded-full ${member.color} flex items-center justify-center text-white text-lg font-black mb-4 shadow-inner`}>
                  {member.name.split(' ').slice(-2, -1)[0]?.[0] || member.name[0]}
                </div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{member.name}</h3>
                <span className="text-[11px] font-bold text-[#1D4ED8] dark:text-[#93C5FD] uppercase tracking-wider block mt-1 mb-3">
                  {member.role}
                </span>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-300">
                  {member.sub}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. FREQUENTLY ASKED QUESTIONS SECTION */}
        <section id="faq" className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 sm:px-6 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-[#0F172A] dark:text-slate-50">
              Mga Kadalasang Tanong (FAQ)
            </h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-300">
              Alamin ang mga kasagutan tungkol sa paggamit, seguridad, at operasyon ng GabayGamot.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 bg-white/70 overflow-hidden dark:border-slate-800 dark:bg-[#101B2D]/70 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-bold text-sm md:text-base text-slate-800 dark:text-slate-100"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`size-4 text-slate-500 transition-transform duration-300 shrink-0 ml-3 ${
                      activeFaq === idx ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    activeFaq === idx ? "max-h-52 border-t border-slate-100 dark:border-slate-800" : "max-h-0"
                  }`}
                >
                  <div className="p-5 text-xs md:text-sm leading-relaxed text-[#475569] dark:text-slate-300">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 8. PREMIUM FOOTER SECTION */}
      <footer className="relative z-20 bg-[#0B1524] text-slate-300 border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 md:grid-cols-12">
            
            {/* Col 1: Logo & Brand Info */}
            <div className="md:col-span-5 space-y-4">
              <Link className="flex items-center gap-3" href="/">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#172338]">
                  <Image
                    alt="GabayGamot logo"
                    className="size-5 object-contain"
                    height={20}
                    src="/assets/images/gabay-gamot-logo-sm.png"
                    width={20}
                  />
                </span>
                <span className="text-base font-bold text-white tracking-tight">
                  GabayGamot
                </span>
              </Link>
              <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
                Isang consultation-first healthcare portal na binuo upang mapalakas ang kakayahan ng ating mga Barangay Health Workers sa pamamagitan ng matalinong inventory scanning, GPS barangay referrals, at automated Gemini AI insights.
              </p>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Mabilisang Links</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#overview" className="hover:text-white transition-colors">Overview</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features & Capabilities</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a></li>
                <li><a href="#ai-insights" className="hover:text-white transition-colors">AI Insights</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>

            {/* Col 3: Support Contact */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Suporta at Pakikipag-ugnayan</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <Phone className="size-3.5 text-blue-400" />
                  <span>Technical Support Hotline: (02) 8876-1234</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="size-3.5 text-blue-400" />
                  <span>Email: support@gabaygamot.gov.ph</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="size-3.5 text-blue-400" />
                  <span>Central Municipal Health Department Office, Capitol</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Divider & Copyright with Important Medical Disclaimer */}
          <div className="mt-12 pt-8 border-t border-slate-800 space-y-4 text-center md:text-left">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] leading-relaxed text-slate-500 max-w-5xl mx-auto md:mx-0">
              <strong className="text-slate-400 block mb-1">PANAWAGAN / MEDICAL DISCLAIMER:</strong>
              Ang mga impormasyon, pagsusuri, at rekomendasyon (kabilang ang Gemini AI insights at diagnostic alerts) sa loob ng GabayGamot ay nilikha bilang gabay at suporta lamang sa pamamahala ng inventory at illness monitoring. Ang pinal na diagnosis at desisyon sa pag-dispense ng anumang gamot ay nananatiling responsibilidad at nasa ilalim ng pagpapasya ng mga lisensyadong doktor at healthcare professionals.
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
              <span>
                Copyright &copy; 2026 GabayGamot Project. All rights reserved.
              </span>
              <div className="flex gap-4">
                <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
