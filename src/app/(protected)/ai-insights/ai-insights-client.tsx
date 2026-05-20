"use client";

import { useState } from "react";
import { Sparkles, AlertOctagon, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";

export function AiInsightsClient() {
  const [transferState, setTransferState] = useState<"idle" | "sending" | "sent">("idle");

  const handleInitiateTransfer = () => {
    setTransferState("sending");
    setTimeout(() => {
      setTransferState("sent");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* AI Insight Header */}
      <div className="rounded-3xl border border-cyan-100 bg-gradient-to-r from-cyan-500/10 via-teal-500/5 to-transparent p-6 dark:border-cyan-950/30">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#0891B2] text-white shadow-md shadow-cyan-500/20">
            <Sparkles className="size-6" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-cyan-900 dark:text-cyan-300">Active Center Advisory</h2>
            <p className="text-sm text-cyan-700 dark:text-cyan-400/80 mt-1 max-w-2xl leading-relaxed">
              Gemini co-pilot analyzes your local stock levels, batch dates, and illness patterns to suggest waste prevention and stock replenishment strategies.
            </p>
          </div>
        </div>
      </div>

      {/* AI Insight Advisory Feed */}
      <div className="space-y-6">
        
        {/* Card 1: Critical Expiry Waste Risk */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E2E8F0] dark:border-white/5 gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="size-5 text-red-600 dark:text-red-400 animate-pulse" />
              <h3 className="font-bold text-[#1E293B] dark:text-slate-200">Critical Expiry Waste Risk</h3>
            </div>
            <span className="inline-flex items-center rounded-xl bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30">
              Critical Priority
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">1. Observation</h4>
              <p className="text-sm text-[#1E293B] dark:text-slate-205 mt-2 leading-relaxed">
                Amoxicillin 500mg (Batch #AMX-202) has 450 units expiring in 12 days.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">2. Reason</h4>
              <p className="text-sm text-[#64748B] dark:text-slate-350 mt-2 leading-relaxed">
                Dispensing logs show a 60% decline in upper respiratory illness reports in your barangay.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">3. Risk</h4>
              <p className="text-sm text-red-650 dark:text-red-400 mt-2 leading-relaxed font-semibold">
                Complete medicine expiry and loss of approximately ₱13,500 worth of active stock.
              </p>
            </div>
            <div className="rounded-2xl bg-cyan-50/50 p-4 dark:bg-white/5 border border-cyan-100/30 dark:border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-400">4. Recommended Action</h4>
              <p className="text-sm text-[#1E293B] dark:text-slate-200 mt-2 leading-relaxed font-bold">
                Transfer 300 units to Barangay Santa Rita Health Center.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] dark:border-white/5">
            <span className="text-xs text-[#64748B] dark:text-slate-450">Suggested transfer recipient: <strong>Barangay Santa Rita (1.4 km away)</strong></span>
            
            {transferState === "idle" && (
              <button
                type="button"
                onClick={handleInitiateTransfer}
                className="rounded-2xl bg-[#0891B2] hover:bg-[#06B6D4] text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-cyan-500/10 flex items-center gap-1.5 transition"
              >
                Initiate Referral Transfer
                <ArrowRight className="size-3.5" />
              </button>
            )}

            {transferState === "sending" && (
              <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 flex items-center gap-2">
                <span className="size-2 rounded-full bg-cyan-500 animate-ping" />
                Creating request...
              </span>
            )}

            {transferState === "sent" && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30">
                <CheckCircle2 className="size-4" />
                Referral Request Sent!
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Low Stock & Epidemic Risk Warning */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E2E8F0] dark:border-white/5 gap-3">
            <div className="flex items-center gap-2.5">
              <AlertOctagon className="size-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-[#1E293B] dark:text-slate-200">Replenishment Advisory</h3>
            </div>
            <span className="inline-flex items-center rounded-xl bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
              Warning Priority
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">1. Observation</h4>
              <p className="text-sm text-[#1E293B] dark:text-slate-200 mt-2 leading-relaxed">
                Paracetamol 500mg stock is dropping below safety margins (12 units left).
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">2. Reason</h4>
              <p className="text-sm text-[#64748B] dark:text-slate-350 mt-2 leading-relaxed">
                Symptomatic fever and general pain logs have spiked by 35% in your barangay this week.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">3. Risk</h4>
              <p className="text-sm text-red-650 dark:text-red-400 mt-2 leading-relaxed font-semibold">
                Complete stockout within 48 hours, leaving patients without basic fever relief.
              </p>
            </div>
            <div className="rounded-2xl bg-cyan-50/50 p-4 dark:bg-white/5 border border-cyan-100/30 dark:border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-400">4. Recommended Action</h4>
              <p className="text-sm text-[#1E293B] dark:text-slate-200 mt-2 leading-relaxed font-bold">
                Request 200 Paracetamol units from Barangay Santa Rita.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
