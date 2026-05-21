import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Camera,
} from "lucide-react";

import { Badge } from "@/components/reui/badge";
import { ProtectedShell } from "@/components/foundation/protected-shell";
import { Button } from "@/components/ui/button";
import {
  getInventoryBatches,
  type MedicineBatchWithDetails,
} from "@/lib/supabase/inventory";
import { getCurrentProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { DashboardOverviewClient } from "./dashboard-overview-client";

export default async function DashboardPage() {
  const { profile, user } = await getCurrentProfile();

  if (profile?.role === "super_admin") {
    redirect("/admin");
  }

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
      startOfDay.setHours(0, 0, 0, 0);
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
        .or(
          `referring_center_id.eq.${centerData.id},receiving_center_id.eq.${centerData.id}`
        );

      if (count) activeReferralsCount = count;
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date(todayStr);

  let totalItems = 0;
  let lowStockCount = 0;
  let nearExpiryCount = 0;
  let expiredCount = 0;

  const criticalBatches: {
    name: string;
    batchNumber: string;
    expiryDate: string;
    daysLeft: number;
    isExpired: boolean;
  }[] = [];

  batches.forEach((item) => {
    totalItems += item.quantity;

    const expDate = new Date(item.expiry_date);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      expiredCount++;
      criticalBatches.push({
        name: item.medicine_master?.generic_name || "Medicine",
        batchNumber: item.batch_number,
        expiryDate: item.expiry_date,
        daysLeft: diffDays,
        isExpired: true,
      });
    } else if (diffDays <= 180) {
      nearExpiryCount++;
      criticalBatches.push({
        name: item.medicine_master?.generic_name || "Medicine",
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
  const stableBatchCount = Math.max(
    batches.length - lowStockCount - nearExpiryCount - expiredCount,
    0
  );

  const aiInsightCards = [
    {
      title:
        criticalBatches.length > 0
          ? "Expiry risk needs action"
          : "Expiry risk is under control",
      description:
        criticalBatches.length > 0
          ? `${criticalBatches.length} batch${
              criticalBatches.length === 1 ? "" : "es"
            } need review because they are expired or near expiry.`
          : "No critical expiry batch is blocking service right now.",
      variant: criticalBatches.length > 0 ? "warning-light" : "success-light",
    },
    {
      title:
        metrics.lowStock > 0
          ? "Low stock may slow patient service"
          : "Stock coverage looks stable",
      description:
        metrics.lowStock > 0
          ? `${metrics.lowStock} inventory item${
              metrics.lowStock === 1 ? "" : "s"
            } are now low and may need restock or transfer planning.`
          : "No low-stock item is flagged in the current batch list.",
      variant: metrics.lowStock > 0 ? "warning-light" : "success-light",
    },
    {
      title:
        totalConsultationsToday > 0
          ? "Consultation demand is active today"
          : "No consultation trend yet today",
      description:
        totalConsultationsToday > 0
          ? `${totalConsultationsToday} consultation case${
              totalConsultationsToday === 1 ? "" : "s"
            } have been logged today, so medicine demand should be watched closely.`
          : "Start recording consultations to unlock stronger daily insight signals.",
      variant: totalConsultationsToday > 0 ? "info-light" : "outline",
    },
  ] as const;

  const actionCards = [
    {
      title:
        activeReferralsCount > 0
          ? `${activeReferralsCount} referral request${
              activeReferralsCount === 1 ? "" : "s"
            } need follow-up`
          : "No pending referral right now",
      description:
        activeReferralsCount > 0
          ? "Review sending and receiving centers so medicine releases are not delayed."
          : "Your center has no pending referral request at the moment.",
      variant: activeReferralsCount > 0 ? "warning-light" : "success-light",
    },
    {
      title:
        metrics.lowStock > 0
          ? "Prepare referral backup for low-stock items"
          : "Referral backup is ready if stock changes",
      description:
        metrics.lowStock > 0
          ? "Low-stock items may need nearby barangay support if demand rises before restock."
          : "Keep nearby center options ready, even while stock is still stable.",
      variant: metrics.lowStock > 0 ? "info-light" : "outline",
    },
    {
      title:
        totalConsultationsToday > 0
          ? "Dispense flow should stay ready today"
          : "Dispense workspace is ready for the next patient",
      description:
        totalConsultationsToday > 0
          ? "Consultation activity is already moving, so dispensing and patient handoff should be kept responsive."
          : "No consultation queue is active yet, but the dispense and patient workspaces are available when demand starts.",
      variant: totalConsultationsToday > 0 ? "success-light" : "outline",
    },
  ] as const;

  const stockStatusData = [
    { name: "Stable", value: stableBatchCount, fill: "#16A34A" },
    { name: "Low stock", value: lowStockCount, fill: "#F59E0B" },
    { name: "Near expiry", value: nearExpiryCount, fill: "#F97316" },
    { name: "Expired", value: expiredCount, fill: "#DC2626" },
  ];

  const operationsData = [
    { name: "Consultations", value: totalConsultationsToday, fill: "#2563EB" },
    { name: "Referrals", value: activeReferralsCount, fill: "#0D9488" },
    { name: "Low stock", value: lowStockCount, fill: "#F59E0B" },
    { name: "Expiry alerts", value: nearExpiryCount + expiredCount, fill: "#DC2626" },
  ];

  return (
    <ProtectedShell title="Health Center Overview">
      <div className="flex flex-1 flex-col gap-5">
        <div className="grid auto-rows-min gap-4 xl:grid-cols-3">
          <section className="min-h-[188px] rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
            <Badge variant="info-light" size="sm">
              Daily overview
            </Badge>
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-[#1E293B] dark:text-slate-100">
              Welcome back, {profile?.display_name || user?.email || "Health Worker"}.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#64748B] dark:text-slate-400">
              Review consultations, stock pressure, and referral work before
              scanning or dispensing.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Button asChild className="w-full justify-center">
                <Link href="/scan">
                  <Camera className="size-4" />
                  Open Scan
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-center">
                <Link href="/dispense">
                  <Activity className="size-4" />
                  Open Dispense
                </Link>
              </Button>
            </div>
          </section>

          <section className="min-h-[188px] rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#2563EB] dark:text-[#93C5FD]">
                  Center status
                </p>
                <h3 className="mt-4 text-lg font-semibold text-[#1E293B] dark:text-slate-100">
                  Keep service moving
                </h3>
              </div>
              <Badge variant="success-light" size="sm">
                Live data
              </Badge>
            </div>
            <div className="mt-5 grid gap-2 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 dark:border-white/10 dark:bg-[#0F172A]">
                <span className="text-[#64748B] dark:text-slate-400">Consultations</span>
                <span className="font-semibold text-[#1E293B] dark:text-slate-100">
                  {totalConsultationsToday}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 dark:border-white/10 dark:bg-[#0F172A]">
                <span className="text-[#64748B] dark:text-slate-400">Pending referrals</span>
                <span className="font-semibold text-[#1E293B] dark:text-slate-100">
                  {activeReferralsCount}
                </span>
              </div>
            </div>
          </section>

          <section className="min-h-[188px] rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#2563EB] dark:text-[#93C5FD]">
              Stock watch
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 dark:border-white/10 dark:bg-[#0F172A]">
                <p className="text-3xl font-semibold text-[#1E293B] dark:text-slate-100">{totalItems}</p>
                <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">units</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-900/30 dark:bg-amber-950/20">
                <p className="text-3xl font-semibold text-amber-700 dark:text-amber-300">
                  {metrics.lowStock}
                </p>
                <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/80">low</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 dark:border-rose-900/30 dark:bg-rose-950/20">
                <p className="text-3xl font-semibold text-rose-700 dark:text-rose-300">
                  {metrics.nearExpiry}
                </p>
                <p className="mt-1 text-xs text-rose-700/80 dark:text-rose-300/80">expiry</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-[#64748B] dark:text-slate-400">
              Watch low-stock and expiry pressure here before it affects consultations and local dispensing.
            </p>
          </section>
        </div>

        {criticalBatches.length > 0 ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50/80 p-5 dark:border-rose-900/30 dark:bg-rose-950/20">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                <AlertTriangle className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                  Critical expiry alerts need attention
                </h3>
                <p className="mt-1 text-sm text-rose-700/90 dark:text-rose-300/90">
                  {expiredCount} expired and {nearExpiryCount} near-expiry batch
                  {nearExpiryCount === 1 ? "" : "es"} may affect patient service.
                </p>
              </div>
              <Button asChild size="sm">
                <Link href="/inventory">Review</Link>
              </Button>
            </div>
          </section>
        ) : null}

        <DashboardOverviewClient
          insightCards={aiInsightCards}
          actionCards={actionCards}
          stockStatusData={stockStatusData}
          operationsData={operationsData}
        />
      </div>
    </ProtectedShell>
  );
}
