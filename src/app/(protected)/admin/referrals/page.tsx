import { redirect } from "next/navigation";
import { Clock, CheckCircle2, XCircle, MapPin, ClipboardList } from "lucide-react";

import { ProtectedShell } from "@/components/foundation/protected-shell";
import { getCurrentProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default async function AdminReferralsPage() {
  const { profile } = await getCurrentProfile();

  if (profile?.role !== "super_admin") {
    redirect("/dashboard?message=Unauthorized. Only super admins can view global referrals.");
  }

  const supabase = await createClient();
  
  const { data: dbReferrals } = await supabase
    .from("referrals")
    .select(`
      *,
      medicine_master(*),
      referring_center:health_centers!referring_center_id(
        center_name,
        barangay_name,
        latitude,
        longitude,
        profiles(display_name, email)
      ),
      receiving_center:health_centers!receiving_center_id(
        center_name,
        barangay_name,
        latitude,
        longitude,
        profiles(display_name, email)
      )
    `)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const referrals = (dbReferrals || []).map((ref: any) => {
    let distanceStr = "N/A";
    const refLat = ref.referring_center?.latitude;
    const refLon = ref.referring_center?.longitude;
    const recLat = ref.receiving_center?.latitude;
    const recLon = ref.receiving_center?.longitude;

    if (refLat != null && refLon != null && recLat != null && recLon != null) {
      const distance = getDistanceInKm(
        Number(refLat),
        Number(refLon),
        Number(recLat),
        Number(recLon)
      );
      distanceStr = `${distance.toFixed(1)} km`;
    }

    const refProfile = Array.isArray(ref.referring_center?.profiles) 
      ? ref.referring_center?.profiles[0] 
      : ref.referring_center?.profiles;

    const recProfile = Array.isArray(ref.receiving_center?.profiles) 
      ? ref.receiving_center?.profiles[0] 
      : ref.receiving_center?.profiles;

    return {
      id: ref.id,
      medicineName: `${ref.medicine_master?.generic_name} ${ref.medicine_master?.brand_name ? `(${ref.medicine_master?.brand_name})` : ""} ${ref.medicine_master?.strength || ""}`,
      requestorCenter: ref.referring_center?.center_name || ref.referring_center?.barangay_name || "Unknown Center",
      requestorBhw: refProfile?.display_name || refProfile?.email || "Unknown BHW",
      receiverCenter: ref.receiving_center?.center_name || ref.receiving_center?.barangay_name || "Unknown Center",
      receiverBhw: recProfile?.display_name || recProfile?.email || "Unknown BHW",
      quantity: ref.quantity_requested,
      status: ref.status as "pending" | "completed" | "cancelled",
      distance: distanceStr,
      createdAt: new Date(ref.created_at).toLocaleDateString() + " " + new Date(ref.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  });

  const statusColors = {
    pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30",
    completed: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30",
    cancelled: "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 border border-rose-200 dark:border-rose-900/30",
  };

  const totals = referrals.reduce(
    (acc, curr) => {
      acc.total += 1;
      if (curr.status === "pending") acc.pending += 1;
      if (curr.status === "completed") acc.completed += 1;
      if (curr.status === "cancelled") acc.cancelled += 1;
      return acc;
    },
    { total: 0, pending: 0, completed: 0, cancelled: 0 }
  );

  return (
    <ProtectedShell title="Referral Activity">
      <div className="space-y-6">
        
        {/* Referral stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111827]">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                <ClipboardList className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Total Referrals</p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-[#1E293B] dark:text-slate-100">{totals.total}</p>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-amber-50/20 p-5 shadow-sm dark:border-amber-950/20 dark:bg-amber-950/5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                <Clock className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending Actions</p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-amber-700 dark:text-amber-300">{totals.pending}</p>
          </div>

          <div className="rounded-3xl border border-green-100 bg-green-50/20 p-5 shadow-sm dark:border-green-950/20 dark:bg-green-950/5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400">
                <CheckCircle2 className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">Completed Transfers</p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-green-700 dark:text-green-300">{totals.completed}</p>
          </div>

          <div className="rounded-3xl border border-rose-100 bg-rose-50/20 p-5 shadow-sm dark:border-rose-950/20 dark:bg-rose-950/5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450">
                <XCircle className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-650 dark:text-rose-400">Cancelled / Expired</p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-rose-700 dark:text-rose-350">{totals.cancelled}</p>
          </div>
        </div>

        {/* Global referral activity list */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">Global Referral Logs</h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Monitor cross-barangay stock distribution requests, distances involved, and completion records.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-white/5 text-[#64748B] dark:text-slate-400 font-semibold">
                  <th className="pb-3 pr-4 font-bold">Medicine Requested</th>
                  <th className="pb-3 px-4 font-bold">Requesting Center</th>
                  <th className="pb-3 px-4 font-bold">Releasing Center</th>
                  <th className="pb-3 px-4 font-bold text-center">Distance</th>
                  <th className="pb-3 px-4 font-bold text-center">Status</th>
                  <th className="pb-3 pl-4 font-bold text-right">Requested At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-white/5">
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                      No referrals found in the system.
                    </td>
                  </tr>
                ) : (
                  referrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-[#F8FAFC]/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-bold text-[#1E293B] dark:text-slate-200">{ref.medicineName}</div>
                        <div className="text-xs text-[#2563EB] dark:text-[#60A5FA] font-semibold mt-0.5">{ref.quantity} requested</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs">
                          <p className="font-semibold text-[#1E293B] dark:text-slate-200">{ref.requestorCenter}</p>
                          <p className="text-[#64748B] dark:text-slate-400 mt-0.5">BHW: {ref.requestorBhw}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs">
                          <p className="font-semibold text-[#1E293B] dark:text-slate-200">{ref.receiverCenter}</p>
                          <p className="text-[#64748B] dark:text-slate-400 mt-0.5">BHW: {ref.receiverBhw}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-xl bg-[#EFF6FF] px-2 py-0.5 text-xs font-bold text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                          <MapPin className="size-3" />
                          {ref.distance}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusColors[ref.status] || ""}`}>
                          {ref.status}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right text-xs text-[#64748B] dark:text-slate-400">
                        {ref.createdAt}
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
