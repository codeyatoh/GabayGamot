"use client";

import { useState } from "react";
import { MapPin, HelpCircle } from "lucide-react";

interface ReferralItem {
  id: string;
  medicineName: string;
  quantity: number;
  otherCenter: string;
  distance: string;
  bhwName: string;
  status: "pending" | "completed" | "declined";
  timestamp: string;
}

export function ReferralsClient() {
  const [activeTab, setActiveTab] = useState<"outgoing" | "incoming">("outgoing");
  
  // Simulated referrals local state for interactivity
  const [outgoingReferrals] = useState<ReferralItem[]>([
    {
      id: "ref-out-1",
      medicineName: "Amoxicillin 500mg (Generic)",
      quantity: 150,
      otherCenter: "Barangay Santa Rita Health Center",
      distance: "1.4 km",
      bhwName: "Juan dela Cruz",
      status: "pending",
      timestamp: "10 mins ago",
    },
    {
      id: "ref-out-2",
      medicineName: "Metformin 500mg (Glucophage)",
      quantity: 100,
      otherCenter: "Barangay Santa Rita Health Center",
      distance: "1.4 km",
      bhwName: "Juan dela Cruz",
      status: "declined",
      timestamp: "1 day ago",
    },
  ]);

  const [incomingReferrals, setIncomingReferrals] = useState<ReferralItem[]>([
    {
      id: "ref-in-1",
      medicineName: "Paracetamol 500mg (Biogesic)",
      quantity: 200,
      otherCenter: "Barangay Santa Rita Health Center",
      distance: "1.4 km",
      bhwName: "Juan dela Cruz",
      status: "pending",
      timestamp: "2 hours ago",
    },
    {
      id: "ref-in-2",
      medicineName: "Amlodipine 5mg (Generic)",
      quantity: 80,
      otherCenter: "Barangay Bulaklakan Health Center",
      distance: "2.8 km",
      bhwName: "Ana Santos",
      status: "completed",
      timestamp: "2 days ago",
    },
  ]);

  const handleAction = (id: string, newStatus: "completed" | "declined") => {
    setIncomingReferrals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const statusColors = {
    pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30",
    completed: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30",
    declined: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30",
  };

  return (
    <div className="space-y-6">

      {/* Tab Selector */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">Cross-Center Transfers</h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Coordinate medicine stock distribution when patients require out-of-stock items.</p>
        </div>

        <div className="flex gap-2 border-b border-[#E2E8F0] dark:border-white/5 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("outgoing")}
            className={`rounded-2xl px-5 py-3 text-xs font-bold transition-all duration-200 ${
              activeTab === "outgoing"
                ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/15"
                : "text-[#64748B] hover:text-[#2563EB] dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            Outgoing Requests (Sent)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("incoming")}
            className={`rounded-2xl px-5 py-3 text-xs font-bold transition-all duration-200 ${
              activeTab === "incoming"
                ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/15"
                : "text-[#64748B] hover:text-[#2563EB] dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            Incoming Demands (Received)
          </button>
        </div>
      </div>

      {/* Referral List */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-white/5 text-[#64748B] dark:text-slate-400 font-semibold">
                <th className="pb-3 pr-4 font-bold">Medicine Requested</th>
                <th className="pb-3 px-4 font-bold">
                  {activeTab === "outgoing" ? "Target Health Center" : "Requesting Center"}
                </th>
                <th className="pb-3 px-4 font-bold text-center">Distance</th>
                <th className="pb-3 px-4 font-bold text-center">Status</th>
                {activeTab === "incoming" && <th className="pb-3 px-4 font-bold text-center">Actions</th>}
                <th className="pb-3 pl-4 font-bold text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-white/5">
              {(activeTab === "outgoing" ? outgoingReferrals : incomingReferrals).length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "incoming" ? 6 : 5} className="py-8 text-center text-[#64748B] dark:text-slate-500 font-medium">
                    No {activeTab} referrals recorded.
                  </td>
                </tr>
              ) : (
                (activeTab === "outgoing" ? outgoingReferrals : incomingReferrals).map((ref) => (
                  <tr key={ref.id} className="hover:bg-[#F8FAFC]/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-[#1E293B] dark:text-slate-200">{ref.medicineName}</div>
                      <div className="text-xs text-[#2563EB] dark:text-[#60A5FA] font-semibold mt-0.5">{ref.quantity} capsules</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs">
                        <p className="font-semibold text-[#1E293B] dark:text-slate-200">{ref.otherCenter}</p>
                        <p className="text-[#64748B] dark:text-slate-400 mt-0.5">BHW: {ref.bhwName}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-xl bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-bold text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                        <MapPin className="size-3" />
                        {ref.distance}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusColors[ref.status as keyof typeof statusColors]}`}>
                        {ref.status}
                      </span>
                    </td>
                    {activeTab === "incoming" && (
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-2">
                          {ref.status === "pending" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAction(ref.id, "completed")}
                                className="rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white px-3 py-1.5 text-xs font-bold shadow-sm transition"
                              >
                                Release
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAction(ref.id, "declined")}
                                className="rounded-xl border border-red-200 hover:bg-red-50 text-red-650 px-3 py-1.5 text-xs font-bold transition dark:border-white/10 dark:hover:bg-white/5"
                              >
                                Decline
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-[#64748B] dark:text-slate-500 font-medium">Logged</span>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="py-4 pl-4 text-right text-xs text-[#64748B] dark:text-slate-400">
                      {ref.timestamp}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rule Highlight banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50/10 p-4 dark:border-white/5 dark:bg-white/5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-650 dark:bg-white/5 dark:text-purple-400">
          <HelpCircle className="size-4" />
        </span>
        <p className="text-xs text-[#64748B] dark:text-slate-400">
          <strong className="text-[#1E293B] dark:text-slate-200 font-semibold">Stock Deduction Rule:</strong> Medicine stocks are deducted from the inventory only when the receiving BHW completes the &quot;Release&quot; action. Sending a request does not reserve or lock inventory counts.
        </p>
      </div>

    </div>
  );
}
