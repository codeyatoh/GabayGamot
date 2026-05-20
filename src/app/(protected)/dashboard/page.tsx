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
  Stethoscope,
} from "lucide-react";

import { ProtectedShell } from "@/components/foundation/protected-shell";
import { getCurrentProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { getInventoryBatches, MedicineBatchWithDetails } from "@/lib/supabase/inventory";

export default async function DashboardPage() {
  const { profile, user } = await getCurrentProfile();

  if (profile?.role === "super_admin") {
    redirect("/admin");
  }

  // Load user's health center & active inventory batches
  let batches: MedicineBatchWithDetails[] = [];
  
  if (user && profile && profile.approval_status === "approved") {
    const supabase = await createClient();
    const { data: centerData } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (centerData) {
      batches = await getInventoryBatches(centerData.id);
    }
  }

  // Illness Logs aggregation
  let totalConsultationsToday = 0;
  
  if (user && profile && profile.approval_status === "approved") {
    const supabase = await createClient();
    const { data: centerData } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (centerData) {
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      const { count } = await supabase
        .from("illness_logs")
        .select("*", { count: "exact", head: true })
        .eq("health_center_id", centerData.id)
        .gte("created_at", startOfDay.toISOString());
      
      if (count) {
        totalConsultationsToday = count;
      }
    }
  }

  // Active referrals aggregation
  let activeReferralsCount = 0;

  if (user && profile && profile.approval_status === "approved") {
    const supabase = await createClient();
    const { data: centerData } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (centerData) {
      const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .or(`referring_center_id.eq.${centerData.id},receiving_center_id.eq.${centerData.id}`);

      if (count) activeReferralsCount = count;
    }
  }

  // Real database metrics aggregation
  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date(todayStr);

  let totalItems = 0;
  let lowStockCount = 0;
  let nearExpiryCount = 0;
  let expiredCount = 0;

  const criticalBatches: { name: string; batchNumber: string; expiryDate: string; daysLeft: number; isExpired: boolean }[] = [];

  batches.forEach((item) => {
    totalItems += item.quantity;

    const expDate = new Date(item.expiry_date);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      expiredCount++;
      criticalBatches.push({
        name: item.medicine_master?.generic_name || "Gamot",
        batchNumber: item.batch_number,
        expiryDate: item.expiry_date,
        daysLeft: diffDays,
        isExpired: true,
      });
    } else if (diffDays <= 180) {
      nearExpiryCount++;
      criticalBatches.push({
        name: item.medicine_master?.generic_name || "Gamot",
        batchNumber: item.batch_number,
        expiryDate: item.expiry_date,
        daysLeft: diffDays,
        isExpired: false,
      });
    } else if (item.quantity > 0 && item.quantity <= 50) {
      lowStockCount++;
    }
  });

  const metrics = {
    totalItems,
    lowStock: lowStockCount,
    nearExpiry: nearExpiryCount + expiredCount,
    activeReferrals: activeReferralsCount,
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

        {/* Critical Alerts Banner */}
        {criticalBatches.length > 0 && (
          <div className="rounded-3xl border border-rose-100 bg-rose-50/15 p-5 dark:border-rose-950/20 dark:bg-rose-950/5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 animate-pulse">
                <AlertTriangle className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-rose-800 dark:text-rose-300">Attention: May mga critical expiry alerts!</h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                  Mayroong {expiredCount} expired at {nearExpiryCount} malapit nang ma-expire na mga gamot sa cabinet.
                </p>
              </div>
            </div>
            
            <div className="grid gap-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
              {criticalBatches.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs rounded-xl bg-white/40 dark:bg-white/5 border border-rose-100/50 dark:border-rose-950/10 px-3.5 py-2">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.name} <span className="font-mono text-[10px] text-[#64748B]">({item.batchNumber})</span>
                  </div>
                  {item.isExpired ? (
                    <span className="rounded bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 px-2 py-0.5 text-[10px] font-bold">
                      EXPIRED na ({item.expiryDate})
                    </span>
                  ) : (
                    <span className="rounded bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                      {item.daysLeft} araw na lang ({item.expiryDate})
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end pt-1">
              <Link
                href="/inventory"
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm transition"
              >
                I-manage sa Inventory
              </Link>
            </div>
          </div>
        )}

        {/* BHW metrics grid */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111827]">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                <Stethoscope className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Consultations Today</p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-[#1E293B] dark:text-slate-100">
              {totalConsultationsToday} <span className="text-xs font-normal text-[#64748B] dark:text-slate-400">cases</span>
            </p>
          </div>

          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111827]">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                <Boxes className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Total Stock</p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-[#1E293B] dark:text-slate-100">
              {metrics.totalItems} <span className="text-xs font-normal text-[#64748B] dark:text-slate-400">units</span>
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
