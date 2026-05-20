import { redirect } from "next/navigation";
import { Clock, CheckCircle2, XCircle, MapPin, ClipboardList } from "lucide-react";

import { ProtectedShell } from "@/components/foundation/protected-shell";
import { getCurrentProfile } from "@/lib/supabase/profiles";

export default async function AdminReferralsPage() {
  const { profile } = await getCurrentProfile();

  if (profile?.role !== "super_admin") {
    redirect("/dashboard?message=Unauthorized. Only super admins can view global referrals.");
  }

  // Simulated Global Referrals list.
  // Real DB integration will follow in Phase 15.
  const mockReferrals = [
    {
      id: "ref-1",
      medicineName: "Amoxicillin 500mg (Generic)",
      requestorCenter: "Barangay San Jose Health Center",
      requestorBhw: "Maria Clara",
      receiverCenter: "Barangay Santa Rita Health Center",
      receiverBhw: "Juan dela Cruz",
      quantity: 150,
      status: "pending",
      distance: "1.4 km",
      createdAt: "10 mins ago",
    },
    {
      id: "ref-2",
      medicineName: "Paracetamol 500mg (Biogesic)",
      requestorCenter: "Barangay Santa Rita Health Center",
      requestorBhw: "Juan dela Cruz",
      receiverCenter: "Barangay San Jose Health Center",
      receiverBhw: "Maria Clara",
      quantity: 200,
      status: "completed",
      distance: "1.4 km",
      createdAt: "3 hours ago",
    },
    {
      id: "ref-3",
      medicineName: "Metformin 500mg (Glucophage)",
      requestorCenter: "Barangay San Jose Health Center",
      requestorBhw: "Maria Clara",
      receiverCenter: "Barangay Santa Rita Health Center",
      receiverBhw: "Juan dela Cruz",
      quantity: 100,
      status: "declined",
      distance: "1.4 km",
      createdAt: "1 day ago",
    },
    {
      id: "ref-4",
      medicineName: "Amlodipine 5mg (Generic)",
      requestorCenter: "Barangay Bulaklakan Health Center",
      requestorBhw: "Ana Santos",
      receiverCenter: "Barangay San Jose Health Center",
      receiverBhw: "Maria Clara",
      quantity: 80,
      status: "completed",
      distance: "2.8 km",
      createdAt: "2 days ago",
    },
  ];

  const statusColors = {
    pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30",
    completed: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30",
    declined: "bg-red-55 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30",
  };

  const totals = mockReferrals.reduce(
    (acc, curr) => {
      acc.total += 1;
      if (curr.status === "pending") acc.pending += 1;
      if (curr.status === "completed") acc.completed += 1;
      if (curr.status === "declined") acc.declined += 1;
      return acc;
    },
    { total: 0, pending: 0, completed: 0, declined: 0 }
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

          <div className="rounded-3xl border border-red-100 bg-red-50/20 p-5 shadow-sm dark:border-red-950/20 dark:bg-red-950/5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-red-55 text-red-605 dark:bg-red-950/20 dark:text-red-400">
                <XCircle className="size-5" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#DC2626] dark:text-red-400">Declined / Expired</p>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-red-750 dark:text-red-300">{totals.declined}</p>
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
                {mockReferrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-[#F8FAFC]/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-[#1E293B] dark:text-slate-200">{ref.medicineName}</div>
                      <div className="text-xs text-[#2563EB] dark:text-[#60A5FA] font-semibold mt-0.5">{ref.quantity} capsules requested</div>
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
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusColors[ref.status as keyof typeof statusColors]}`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right text-xs text-[#64748B] dark:text-slate-400">
                      {ref.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ProtectedShell>
  );
}
