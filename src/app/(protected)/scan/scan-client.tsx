"use client";

import { useState } from "react";
import { Camera, Bolt, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

export function ScanClient() {
  const [scanState, setScanState] = useState<"idle" | "capturing" | "extracting" | "reviewed">("idle");
  const [flash, setFlash] = useState(false);
  const [manualQty, setManualQty] = useState("");

  const handleScan = () => {
    setScanState("capturing");
    // Simulate camera capture frame delay
    setTimeout(() => {
      setScanState("extracting");
      // Simulate Gemini API route extraction delay
      setTimeout(() => {
        setScanState("reviewed");
      }, 2000);
    }, 1000);
  };

  const resetScan = () => {
    setScanState("idle");
    setManualQty("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {scanState === "idle" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
            <h2 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">Add Stock via Label Scanner</h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
              Aim your device camera at the medicine bottle/box label. Gemini AI will automatically read details like brand, dosage, and batch numbers.
            </p>
          </div>

          {/* Viewfinder Container */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[#0F172A] border border-[#334155] flex flex-col justify-between p-5">
            {/* Grid guide */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:40px_40px] opacity-10" />

            {/* Viewfinder Target Guide */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-40 border-2 border-dashed border-[#2563EB]/60 rounded-2xl flex items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-[#EFF6FF]/60 tracking-wider">Position Label Here</span>
            </div>

            {/* Top controls inside container */}
            <div className="z-10 flex justify-between">
              <button
                type="button"
                onClick={() => setFlash(!flash)}
                className={`flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-[#1E293B]/80 text-white backdrop-blur transition hover:bg-[#334155] ${flash ? "text-amber-400 bg-[#334155]" : ""}`}
              >
                <Bolt className="size-5" />
              </button>
              <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-[#1E293B]/80 text-white backdrop-blur">
                <span className="text-[10px] font-bold tracking-wider">1.0x</span>
              </div>
            </div>

            {/* Bottom camera overlay */}
            <div className="z-10 flex justify-center mt-auto">
              <button
                type="button"
                onClick={handleScan}
                className="flex items-center gap-2 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3.5 font-bold shadow-lg shadow-[#2563EB]/25 active:scale-95 transition duration-200"
              >
                <Camera className="size-5" />
                Capture & Scan Label
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#EFF6FF] bg-[#EFF6FF]/40 p-4 dark:border-white/5 dark:bg-white/5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
              <Sparkles className="size-4" />
            </span>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              <strong className="text-[#1E293B] dark:text-slate-200 font-semibold">Gemini Rule:</strong> You must review all extracted fields and manually enter the stock count. AI is not permitted to auto-save inventory records.
            </p>
          </div>
        </div>
      )}

      {/* Capturing / Loading states */}
      {(scanState === "capturing" || scanState === "extracting") && (
        <div className="aspect-[4/3] w-full rounded-3xl bg-[#0F172A] border border-[#334155] flex flex-col items-center justify-center text-center p-6 space-y-4">
          <Loader2 className="size-10 text-[#2563EB] animate-spin" />
          <div>
            <p className="font-bold text-slate-100 text-base">
              {scanState === "capturing" ? "Capturing image..." : "AI analyzing medicine label..."}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {scanState === "capturing"
                ? "Freezing camera view and capturing high-resolution frame."
                : "Securely sending to Gemini to extract generic name, brand name, batch codes, and expiry dates."}
            </p>
          </div>
        </div>
      )}

      {/* Review Form */}
      {scanState === "reviewed" && (
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-white/5 gap-3">
            <div>
              <h3 className="font-bold text-[#1E293B] dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="size-5 text-[#16A34A]" />
                Verify AI-Extracted Details
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Please review the details extracted by Gemini and complete the fields below.</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-xl bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30">
              Confidence: High
            </span>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); resetScan(); }} className="space-y-4">
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Medicine Generic Name</label>
                <input
                  type="text"
                  defaultValue="Amoxicillin Trihydrate"
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Brand Name (Optional)</label>
                <input
                  type="text"
                  defaultValue="Amoxil"
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Strength</label>
                <input
                  type="text"
                  defaultValue="500 mg"
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Dosage Form</label>
                <input
                  type="text"
                  defaultValue="Capsule"
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Category</label>
                <input
                  type="text"
                  defaultValue="Antibiotic"
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Batch Number</label>
                <input
                  type="text"
                  defaultValue="AMX-202"
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Expiry Date</label>
                <input
                  type="date"
                  defaultValue="2028-09-12"
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA]">
                  * Quantity (Enter Manually)
                </label>
                <input
                  type="number"
                  placeholder="Enter count"
                  value={manualQty}
                  onChange={(e) => setManualQty(e.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border-2 border-[#2563EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#1E293B] focus:outline-none dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-[#E2E8F0] dark:border-white/5">
              <button
                type="button"
                onClick={resetScan}
                className="rounded-2xl border border-[#E2E8F0] px-5 py-3 text-sm font-bold text-[#1E293B] hover:bg-[#F8FAFC] transition dark:border-white/10 dark:text-slate-100 dark:hover:bg-white/5"
              >
                Discard Scan
              </button>
              <button
                type="submit"
                disabled={!manualQty}
                className="rounded-2xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white px-6 py-3 font-bold shadow-md shadow-green-500/10 transition"
              >
                Confirm & Save Stock
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
