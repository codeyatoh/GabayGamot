import { redirect } from "next/navigation";
import { Boxes, Landmark, AlertTriangle } from "lucide-react";

import { ProtectedShell } from "@/components/foundation/protected-shell";
import { getCurrentProfile } from "@/lib/supabase/profiles";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminInventoryPage() {
  const { profile } = await getCurrentProfile();

  if (profile?.role !== "super_admin") {
    redirect("/dashboard?message=Unauthorized. Only super admins can view global inventory.");
  }

  const admin = createAdminClient();

  // Fetch health centers and profiles
  const { data: healthCenters } = await admin
    .from("health_centers")
    .select("*");

  const { data: profiles } = await admin
    .from("profiles")
    .select("id,display_name,email")
    .eq("role", "bhw")
    .eq("approval_status", "approved");

  // Since we don't have database tables for medicine batches yet, we simulate them.
  // This will be replaced with real database queries in Phase 9.
  const mockBarangayData = (healthCenters || []).map((hc, idx) => {
    const BHW = (profiles || []).find((p) => p.id === hc.profile_id);
    
    // Seed different mock numbers per barangay for high-fidelity presentation
    const totalItems = [240, 180, 310, 140, 0, 95][idx % 6] ?? 120;
    const lowStock = [12, 4, 18, 0, 0, 9][idx % 6] ?? 5;
    const nearExpiry = [8, 11, 2, 1, 0, 4][idx % 6] ?? 3;
    const expired = [2, 0, 4, 0, 0, 1][idx % 6] ?? 0;
    const lastActive = BHW ? "2 hours ago" : "Never";

    return {
      id: hc.id,
      centerName: hc.center_name || `${hc.barangay_name} Health Center`,
      barangay: hc.barangay_name,
      municipality: hc.municipality,
      province: hc.province,
      bhwName: BHW?.display_name || "Unassigned",
      bhwEmail: BHW?.email || "",
      totalItems,
      lowStock,
      nearExpiry,
      expired,
      lastActive,
    };
  });

  const totals = mockBarangayData.reduce(
    (acc, curr) => {
      acc.items += curr.totalItems;
      acc.low += curr.lowStock;
      acc.expiring += curr.nearExpiry;
      acc.expired += curr.expired;
      return acc;
    },
    { items: 0, low: 0, expiring: 0, expired: 0 }
  );

  return (
    <ProtectedShell title="Barangay Inventories">
      <div className="space-y-6">
        
        {/* Metric widgets */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111827]">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                <Boxes className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Global Stocks</p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-[#1E293B] dark:text-slate-100">{totals.items} <span className="text-xs font-normal text-[#64748B] dark:text-slate-400">units</span></p>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-amber-50/20 p-5 shadow-sm dark:border-amber-950/20 dark:bg-amber-950/5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                <AlertTriangle className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Low Stock Alert</p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-amber-700 dark:text-amber-300">{totals.low} <span className="text-xs font-normal text-amber-600 dark:text-amber-400">items</span></p>
          </div>

          <div className="rounded-3xl border border-rose-100 bg-rose-50/20 p-5 shadow-sm dark:border-rose-950/20 dark:bg-rose-950/5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                <AlertTriangle className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Near Expiry</p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-rose-700 dark:text-rose-300">{totals.expiring} <span className="text-xs font-normal text-rose-600 dark:text-rose-400">batches</span></p>
          </div>

          <div className="rounded-3xl border border-red-200 bg-red-100/10 p-5 shadow-sm dark:border-red-950/30 dark:bg-red-950/15">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                <AlertTriangle className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">Expired Batches</p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-red-700 dark:text-red-400">{totals.expired} <span className="text-xs font-normal text-red-600 dark:text-red-400">batches</span></p>
          </div>
        </div>

        {/* Global center list */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">Barangay Inventories Overview</h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Check stock counts, expiration logs, and active alert events across all approved health centers.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-white/5 text-[#64748B] dark:text-slate-400 font-semibold">
                  <th className="pb-3 pr-4 font-bold">Health Center</th>
                  <th className="pb-3 px-4 font-bold">Location</th>
                  <th className="pb-3 px-4 font-bold">Assigned BHW</th>
                  <th className="pb-3 px-4 font-bold text-center">Active Stock</th>
                  <th className="pb-3 px-4 font-bold text-center">Alerts</th>
                  <th className="pb-3 pl-4 font-bold text-right">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-white/5">
                {mockBarangayData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#64748B] dark:text-slate-500">
                      No active health center inventories found. Make sure BHW accounts are approved.
                    </td>
                  </tr>
                ) : (
                  mockBarangayData.map((data) => (
                    <tr key={data.id} className="hover:bg-[#F8FAFC]/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 pr-4 font-bold text-[#1E293B] dark:text-slate-200">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-8 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                            <Landmark className="size-4" />
                          </span>
                          <span>{data.centerName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-[#64748B] dark:text-slate-400">
                        {data.barangay}, {data.municipality}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs">
                          <p className="font-semibold text-[#1E293B] dark:text-slate-200">{data.bhwName}</p>
                          <p className="text-[#64748B] dark:text-slate-400 mt-0.5">{data.bhwEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex rounded-xl bg-[#EFF6FF] px-2.5 py-1 text-xs font-bold text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                          {data.totalItems} units
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-1.5">
                          {data.lowStock > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                              {data.lowStock} Low
                            </span>
                          )}
                          {data.nearExpiry > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
                              {data.nearExpiry} Expiring
                            </span>
                          )}
                          {data.expired > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/30 dark:text-red-400 animate-pulse">
                              {data.expired} Expired
                            </span>
                          )}
                          {data.lowStock === 0 && data.nearExpiry === 0 && data.expired === 0 && (
                            <span className="text-xs text-[#64748B] dark:text-slate-500">Normal</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 pl-4 text-right text-xs text-[#64748B] dark:text-slate-400">
                        {data.lastActive}
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
