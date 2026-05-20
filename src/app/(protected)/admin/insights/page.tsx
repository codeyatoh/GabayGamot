import { redirect } from "next/navigation";
import { Sparkles, AlertOctagon, ShieldAlert } from "lucide-react";

import { ProtectedShell } from "@/components/foundation/protected-shell";
import { getCurrentProfile } from "@/lib/supabase/profiles";

export default async function AdminInsightsPage() {
  const { profile } = await getCurrentProfile();

  if (profile?.role !== "super_admin") {
    redirect("/dashboard?message=Unauthorized. Only super admins can view global AI insights.");
  }

  // Simulated Global AI Insights for high-fidelity presentation.
  // Real DB integration will follow in Phase 16.
  const mockGlobalInsights = [
    {
      id: "insight-1",
      centerName: "Barangay San Jose Health Center",
      severity: "critical",
      observation: "Amoxicillin 500mg (Batch #AMX-202) is expiring in 12 days with 450 units remaining.",
      reason: "Dispensing logs show a 60% decline in upper respiratory illness logs in this barangay.",
      risk: "Complete medicine expiry and loss of approximately ₱13,500 worth of active stock.",
      action: "Transfer 300 units to Barangay Santa Rita Health Center, which currently has a 75% stock deficit and active cases.",
    },
    {
      id: "insight-2",
      centerName: "Barangay Santa Rita Health Center",
      severity: "warning",
      observation: "Paracetamol 500mg stock is dropping below the safety margin (currently 15 units left).",
      reason: "Simulated dengue/fever symptom reports have spiked by 35% in this sector over the past week.",
      risk: "Complete stockout within 48 hours, leaving symptomatic patients without basic antipyretic relief.",
      action: "Initiate stock replenishment or request a 100-unit transfer from Barangay Bulaklakan Health Center which has a surplus.",
    },
    {
      id: "insight-3",
      centerName: "Barangay Bulaklakan Health Center",
      severity: "info",
      observation: "Metformin 500mg dispensing rate matches ideal inventory levels with no expiry risks.",
      reason: "Barangay diabetes maintenance program is highly structured and patients regularly collect medication.",
      risk: "Low risk. Current stock is projected to last exactly until the next quarterly allocation cycle.",
      action: "No immediate action required. Maintain current distribution intervals.",
    },
  ];

  const severityColors = {
    critical: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30",
    info: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/20 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900/30",
  };

  const severityIcons = {
    critical: <ShieldAlert className="size-5 text-red-600 dark:text-red-400" />,
    warning: <AlertOctagon className="size-5 text-amber-600 dark:text-amber-400" />,
    info: <Sparkles className="size-5 text-cyan-600 dark:text-cyan-400" />,
  };

  return (
    <ProtectedShell title="Global AI Insights">
      <div className="space-y-6">

        {/* AI Insight Intro */}
        <div className="rounded-3xl border border-cyan-100 bg-gradient-to-r from-cyan-500/10 via-teal-500/5 to-transparent p-6 dark:border-cyan-950/30">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-md shadow-cyan-500/20">
              <Sparkles className="size-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-cyan-900 dark:text-cyan-300">Gemini AI Copilot Panel</h2>
              <p className="text-sm text-cyan-700 dark:text-cyan-400/80 mt-1 max-w-3xl leading-relaxed">
                This panel highlights actionable redistribution pathways and critical inventory warnings across all barangays. Recommendations are based on real-time consumption rates, local illness trends, and batch expiration dates.
              </p>
            </div>
          </div>
        </div>

        {/* Global recommendations */}
        <div className="space-y-4">
          {mockGlobalInsights.map((insight) => (
            <div
              key={insight.id}
              className={`rounded-3xl p-6 transition-all duration-300 bg-white border border-[#E2E8F0] dark:border-white/10 dark:bg-[#111827]`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-[#E2E8F0] dark:border-white/5 gap-3">
                <div className="flex items-center gap-2.5">
                  {severityIcons[insight.severity as keyof typeof severityIcons]}
                  <h3 className="font-bold text-[#1E293B] dark:text-slate-200">{insight.centerName}</h3>
                </div>
                <span className={`inline-flex items-center rounded-xl px-2.5 py-0.5 text-xs font-bold capitalize ${severityColors[insight.severity as keyof typeof severityColors]}`}>
                  {insight.severity} Priority
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Observation</h4>
                  <p className="text-sm text-[#1E293B] dark:text-slate-200 mt-2 leading-relaxed">{insight.observation}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Reason</h4>
                  <p className="text-sm text-[#64748B] dark:text-slate-300 mt-2 leading-relaxed">{insight.reason}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Wastage Risk</h4>
                  <p className="text-sm text-red-650 dark:text-red-400 mt-2 leading-relaxed">{insight.risk}</p>
                </div>
                <div className="rounded-2xl bg-[#EFF6FF] p-4 dark:bg-white/5 border border-[#BFDBFE]/30 dark:border-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA]">Recommended Action</h4>
                  <p className="text-sm text-[#1E293B] dark:text-slate-200 mt-2 leading-relaxed font-medium">{insight.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </ProtectedShell>
  );
}
