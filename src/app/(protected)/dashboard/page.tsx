import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Boxes,
  AlertTriangle,
  Clock,
  ArrowLeftRight,
  Camera,
  Activity,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import { ProtectedShell } from "@/components/foundation/protected-shell";
import { getCurrentProfile } from "@/lib/supabase/profiles";

export default async function DashboardPage() {
  const { profile, user } = await getCurrentProfile();

  if (profile?.role === "super_admin") {
    redirect("/admin");
  }

  // Simulated metrics. These will connect to DB counts in later phases.
  const metrics = {
    totalItems: 3450,
    lowStock: 4,
    nearExpiry: 3,
    activeReferrals: 2,
  };

  const recentTransactions = [
    {
      id: "tx-1",
      type: "dispense",
      title: "Dispensed Paracetamol 500mg",
      details: "Patient Code: PAT-9831 • 15 capsules",
      time: "20 mins ago",
    },
    {
      id: "tx-2",
      type: "scan",
      title: "Scanned & Added Amoxicillin 500mg",
      details: "Batch #AMX-202 • 500 capsules • Exp: 2028-09-12",
      time: "2 hours ago",
    },
    {
      id: "tx-3",
      type: "referral_out",
      title: "Sent Referral Request to Brgy. Santa Rita",
      details: "Metformin 500mg • 100 capsules requested",
      time: "4 hours ago",
    },
    {
      id: "tx-4",
      type: "dispense",
      title: "Dispensed Amlodipine 5mg",
      details: "Patient Code: PAT-2481 • 30 capsules",
      time: "1 day ago",
    },
  ];

  return (
    <ProtectedShell title="Health Center Overview">
      <div className="space-y-6">

        {/* Quick Welcome */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#1E293B] dark:text-slate-100">
                Mabuhay, {profile?.display_name || user?.email || "Health Worker"}!
              </h1>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                Manage your barangay health center medicine inventory, scan barcodes/labels, and coordinate transfers.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5E9] px-3.5 py-1 text-xs font-bold text-[#2E7D32] dark:bg-green-950/20 dark:text-green-400">
              <span className="size-2 rounded-full bg-[#4CAF50] animate-pulse" />
              Center Sync Online
            </span>
          </div>
        </div>

        {/* BHW metrics grid */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111827]">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                <Boxes className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Total Stock</p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-[#1E293B] dark:text-slate-100">
              {metrics.totalItems} <span className="text-xs font-normal text-[#64748B] dark:text-slate-400">capsules</span>
            </p>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-amber-50/20 p-5 shadow-sm dark:border-amber-950/20 dark:bg-amber-950/5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                <AlertTriangle className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-650 dark:text-amber-400">Low Stock</p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-amber-700 dark:text-amber-300">
              {metrics.lowStock} <span className="text-xs font-normal text-amber-650 dark:text-amber-400">items</span>
            </p>
          </div>

          <div className="rounded-3xl border border-rose-100 bg-rose-50/20 p-5 shadow-sm dark:border-rose-950/20 dark:bg-rose-950/5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                <Clock className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-650 dark:text-rose-400">Expiring Soon</p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-rose-700 dark:text-rose-300">
              {metrics.nearExpiry} <span className="text-xs font-normal text-rose-650 dark:text-rose-400">batches</span>
            </p>
          </div>

          <div className="rounded-3xl border border-teal-100 bg-teal-50/20 p-5 shadow-sm dark:border-teal-950/20 dark:bg-teal-950/5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-650 dark:bg-teal-950/20 dark:text-teal-400">
                <ArrowLeftRight className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-650 dark:text-teal-400">Active Referrals</p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-teal-700 dark:text-teal-300">
              {metrics.activeReferrals} <span className="text-xs font-normal text-teal-650 dark:text-teal-400">pending</span>
            </p>
          </div>
        </div>

        {/* Quick action grid */}
        <div className="space-y-4">
          <h3 className="font-bold text-[#1E293B] dark:text-slate-200">Quick Activities</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/scan"
              className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#BFDBFE] hover:shadow-md dark:border-white/10 dark:bg-[#111827] dark:hover:border-white/20"
            >
              <div className="flex items-start justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] transition-colors group-hover:bg-[#2563EB] group-hover:text-white dark:bg-white/5 dark:text-[#60A5FA]">
                  <Camera className="size-6" />
                </span>
                <ArrowUpRight className="size-5 text-[#94A3B8] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <h4 className="mt-6 font-bold text-[#1E293B] dark:text-slate-100">Scan & Add Medicine</h4>
              <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Aim your device camera at medicine labels to automatically extract information using Gemini AI.
              </p>
            </Link>

            <Link
              href="/dispense"
              className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#BFDBFE] hover:shadow-md dark:border-white/10 dark:bg-[#111827] dark:hover:border-white/20"
            >
              <div className="flex items-start justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-650 transition-colors group-hover:bg-teal-650 group-hover:text-white dark:bg-white/5 dark:text-teal-400">
                  <Activity className="size-6" />
                </span>
                <ArrowUpRight className="size-5 text-[#94A3B8] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <h4 className="mt-6 font-bold text-[#1E293B] dark:text-slate-100">Dispense Medicine</h4>
              <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Log medicine releases to patients on-site and deduct matching inventory stocks automatically.
              </p>
            </Link>

            <Link
              href="/referrals"
              className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#BFDBFE] hover:shadow-md dark:border-white/10 dark:bg-[#111827] dark:hover:border-white/20"
            >
              <div className="flex items-start justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-650 transition-colors group-hover:bg-purple-650 group-hover:text-white dark:bg-white/5 dark:text-purple-400">
                  <ArrowLeftRight className="size-6" />
                </span>
                <ArrowUpRight className="size-5 text-[#94A3B8] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <h4 className="mt-6 font-bold text-[#1E293B] dark:text-slate-100">Coordinate Referrals</h4>
              <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                Check stock surpluses in neighboring barangays and send outgoing medicine transfer requests.
              </p>
            </Link>
          </div>
        </div>

        {/* Activity log feed */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1E293B] dark:text-slate-200">Recent Transactions</h3>
            <Link href="/inventory" className="text-xs font-bold text-[#2563EB] hover:underline dark:text-[#60A5FA]">
              View Inventory Table
            </Link>
          </div>

          <div className="divide-y divide-[#E2E8F0] dark:divide-white/5">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-4.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-[#1E293B] dark:text-slate-200">{tx.title}</p>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">{tx.details}</p>
                </div>
                <span className="text-xs text-[#94A3B8] whitespace-nowrap">{tx.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick AI Insight Promo Widget */}
        <div className="rounded-3xl border border-cyan-100 bg-cyan-50/20 p-5 dark:border-cyan-950/30 dark:bg-cyan-950/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-650 dark:bg-cyan-950/20 dark:text-cyan-400">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-cyan-800 dark:text-cyan-300">Actionable AI Insights Available</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Gemini detected 1 medicine batch at danger of expiry waste. Open AI Insights to resolve.</p>
            </div>
          </div>
          <Link
            href="/ai-insights"
            className="self-start sm:self-auto rounded-2xl bg-[#0891B2] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#06B6D4] transition"
          >
            Open Insights
          </Link>
        </div>

      </div>
    </ProtectedShell>
  );
}
