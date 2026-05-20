import { redirect } from "next/navigation";
import { AlertTriangle, Boxes, Landmark } from "lucide-react";

import { ProtectedShell } from "@/components/foundation/protected-shell";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/supabase/profiles";

type HealthCenterRow = {
  id: string;
  profile_id: string | null;
  center_name: string | null;
  barangay_name: string;
  municipality: string;
  province: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  email: string | null;
};

type BatchRow = {
  health_center_id: string;
  quantity: number;
  expiry_date: string;
  updated_at: string;
  status: string;
};

const LOW_STOCK_THRESHOLD = 50;
const NEAR_EXPIRY_DAYS = 180;

function formatRelativeTime(timestamp: string | null) {
  if (!timestamp) {
    return "No stock yet";
  }

  const diffMs = Date.now() - new Date(timestamp).getTime();

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return "Recently updated";
  }

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export default async function AdminInventoryPage() {
  const { profile } = await getCurrentProfile();

  if (profile?.role !== "super_admin") {
    redirect("/dashboard?message=Unauthorized. Only super admins can view global inventory.");
  }

  const admin = createAdminClient();
  const today = new Date();

  const [{ data: healthCenters }, { data: profiles }, { data: batches }] = await Promise.all([
    admin.from("health_centers").select("id,profile_id,center_name,barangay_name,municipality,province"),
    admin.from("profiles").select("id,display_name,email").eq("role", "bhw").eq("approval_status", "approved"),
    admin
      .from("medicine_batches")
      .select("health_center_id,quantity,expiry_date,updated_at,status")
      .order("updated_at", { ascending: false }),
  ]);

  const healthCenterRows = (healthCenters || []) as HealthCenterRow[];
  const profileRows = (profiles || []) as ProfileRow[];
  const batchRows = ((batches || []) as BatchRow[]).filter((batch) => batch.status === "active");

  const batchesByCenter = new Map<string, BatchRow[]>();
  for (const batch of batchRows) {
    const current = batchesByCenter.get(batch.health_center_id) || [];
    current.push(batch);
    batchesByCenter.set(batch.health_center_id, current);
  }

  const globalInventoryData = healthCenterRows.map((healthCenter) => {
    const assignedBhw = profileRows.find((entry) => entry.id === healthCenter.profile_id);
    const centerBatches = batchesByCenter.get(healthCenter.id) || [];

    let totalUnits = 0;
    let lowStockBatches = 0;
    let nearExpiryBatches = 0;
    let expiredBatches = 0;
    let latestUpdatedAt: string | null = null;

    for (const batch of centerBatches) {
      const expiryDate = new Date(batch.expiry_date);
      const dayDiff = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (batch.quantity > 0 && dayDiff >= 0) {
        totalUnits += batch.quantity;
      }

      if (dayDiff < 0) {
        expiredBatches += 1;
        continue;
      }

      if (batch.quantity > 0 && dayDiff <= NEAR_EXPIRY_DAYS) {
        nearExpiryBatches += 1;
      }

      if (batch.quantity > 0 && batch.quantity <= LOW_STOCK_THRESHOLD) {
        lowStockBatches += 1;
      }

      if (!latestUpdatedAt || new Date(batch.updated_at) > new Date(latestUpdatedAt)) {
        latestUpdatedAt = batch.updated_at;
      }
    }

    return {
      id: healthCenter.id,
      centerName: healthCenter.center_name || `${healthCenter.barangay_name} Health Center`,
      barangay: healthCenter.barangay_name,
      municipality: healthCenter.municipality,
      province: healthCenter.province,
      bhwName: assignedBhw?.display_name || "Unassigned",
      bhwEmail: assignedBhw?.email || "No approved BHW yet",
      totalUnits,
      lowStockBatches,
      nearExpiryBatches,
      expiredBatches,
      lastSync: formatRelativeTime(latestUpdatedAt),
    };
  });

  const totals = globalInventoryData.reduce(
    (accumulator, current) => {
      accumulator.units += current.totalUnits;
      accumulator.low += current.lowStockBatches;
      accumulator.expiring += current.nearExpiryBatches;
      accumulator.expired += current.expiredBatches;
      return accumulator;
    },
    { units: 0, low: 0, expiring: 0, expired: 0 }
  );

  return (
    <ProtectedShell title="Barangay Inventories">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111827]">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                <Boxes className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                Global Stock
              </p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-[#1E293B] dark:text-slate-100">
              {totals.units} <span className="text-xs font-normal text-[#64748B] dark:text-slate-400">units</span>
            </p>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-amber-50/20 p-5 shadow-sm dark:border-amber-950/20 dark:bg-amber-950/5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                <AlertTriangle className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Low Stock Alert
              </p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-amber-700 dark:text-amber-300">
              {totals.low} <span className="text-xs font-normal text-amber-600 dark:text-amber-400">batches</span>
            </p>
          </div>

          <div className="rounded-3xl border border-rose-100 bg-rose-50/20 p-5 shadow-sm dark:border-rose-950/20 dark:bg-rose-950/5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                <AlertTriangle className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Near Expiry
              </p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-rose-700 dark:text-rose-300">
              {totals.expiring} <span className="text-xs font-normal text-rose-600 dark:text-rose-400">batches</span>
            </p>
          </div>

          <div className="rounded-3xl border border-red-200 bg-red-100/10 p-5 shadow-sm dark:border-red-950/30 dark:bg-red-950/15">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                <AlertTriangle className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                Expired Batches
              </p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-red-700 dark:text-red-400">
              {totals.expired} <span className="text-xs font-normal text-red-600 dark:text-red-400">batches</span>
            </p>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">Barangay Inventory Overview</h2>
              <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                Live batch totals, expiry alerts, and latest sync activity across approved health centers.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] font-semibold text-[#64748B] dark:border-white/5 dark:text-slate-400">
                  <th className="pb-3 pr-4 font-bold">Health Center</th>
                  <th className="px-4 pb-3 font-bold">Location</th>
                  <th className="px-4 pb-3 font-bold">Assigned BHW</th>
                  <th className="px-4 pb-3 text-center font-bold">Active Stock</th>
                  <th className="px-4 pb-3 text-center font-bold">Alerts</th>
                  <th className="pb-3 pl-4 text-right font-bold">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-white/5">
                {globalInventoryData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#64748B] dark:text-slate-500">
                      No active health center inventories found. Make sure BHW accounts are approved.
                    </td>
                  </tr>
                ) : (
                  globalInventoryData.map((entry) => (
                    <tr key={entry.id} className="transition-colors hover:bg-[#F8FAFC]/50 dark:hover:bg-white/5">
                      <td className="py-4 pr-4 font-bold text-[#1E293B] dark:text-slate-200">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-8 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                            <Landmark className="size-4" />
                          </span>
                          <span>{entry.centerName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-[#64748B] dark:text-slate-400">
                        {entry.barangay}, {entry.municipality}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs">
                          <p className="font-semibold text-[#1E293B] dark:text-slate-200">{entry.bhwName}</p>
                          <p className="mt-0.5 text-[#64748B] dark:text-slate-400">{entry.bhwEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex rounded-xl bg-[#EFF6FF] px-2.5 py-1 text-xs font-bold text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                          {entry.totalUnits} units
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-1.5">
                          {entry.lowStockBatches > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                              {entry.lowStockBatches} Low
                            </span>
                          )}
                          {entry.nearExpiryBatches > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
                              {entry.nearExpiryBatches} Expiring
                            </span>
                          )}
                          {entry.expiredBatches > 0 && (
                            <span className="inline-flex animate-pulse items-center gap-1 rounded-xl bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/30 dark:text-red-400">
                              {entry.expiredBatches} Expired
                            </span>
                          )}
                          {entry.lowStockBatches === 0 &&
                            entry.nearExpiryBatches === 0 &&
                            entry.expiredBatches === 0 && (
                              <span className="text-xs text-[#64748B] dark:text-slate-500">Normal</span>
                            )}
                        </div>
                      </td>
                      <td className="py-4 pl-4 text-right text-xs text-[#64748B] dark:text-slate-400">
                        {entry.lastSync}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedShell>
  );
}
