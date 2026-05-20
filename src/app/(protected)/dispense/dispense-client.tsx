"use client";

import { useState } from "react";
import { User, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";

// Mock medicine stock list for search/selection
const mockStockList = [
  { id: "batch-1", name: "Amoxicillin Trihydrate (Amoxil) 500mg", batch: "AMX-202", qty: 450, exp: "2028-09-12" },
  { id: "batch-2", name: "Paracetamol (Biogesic) 500mg", batch: "PAR-501", qty: 12, exp: "2027-12-05" },
  { id: "batch-3", name: "Metformin (Glucophage) 500mg", batch: "MET-301", qty: 250, exp: "2026-06-15" }, // near expiry
  { id: "batch-4", name: "Amlodipine Besilate (Generic) 5mg", batch: "AML-902", qty: 800, exp: "2029-01-20" },
];

const mockIllnesses = [
  { id: "ill-1", name: "Upper Respiratory Infection (URI)" },
  { id: "ill-2", name: "Hypertension / Cardiovascular" },
  { id: "ill-3", name: "Type 2 Diabetes Mellitus" },
  { id: "ill-4", name: "Fever / Headache / General Pain" },
];

export function DispenseClient() {
  const [step, setStep] = useState(1);
  const [patientCode, setPatientCode] = useState("");
  const [illnessId, setIllnessId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [dispenseQty, setDispenseQty] = useState("");
  const [dispenseSuccess, setDispenseSuccess] = useState(false);

  const selectedBatch = mockStockList.find((b) => b.id === selectedBatchId);
  const isNearExpiry = selectedBatch && new Date(selectedBatch.exp) < new Date("2026-08-01");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && patientCode && illnessId) {
      setStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBatch && dispenseQty && Number(dispenseQty) <= selectedBatch.qty) {
      setDispenseSuccess(true);
    }
  };

  const handleReset = () => {
    setStep(1);
    setPatientCode("");
    setIllnessId("");
    setSelectedBatchId("");
    setDispenseQty("");
    setDispenseSuccess(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      
      {dispenseSuccess ? (
        <div className="rounded-3xl border border-green-100 bg-green-50/10 p-8 text-center space-y-6 dark:border-green-950/20 dark:bg-green-950/5">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
            <CheckCircle2 className="size-8" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-green-900 dark:text-green-300">Dispensing Recorded Successfully</h2>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-2 max-w-md mx-auto">
              Stock has been successfully deducted from the database. The patient dispensing event is logged under patient code <strong className="text-[#1E293B] dark:text-slate-200">{patientCode}</strong>.
            </p>
          </div>
          
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 text-left max-w-sm mx-auto space-y-2 text-xs dark:border-white/10 dark:bg-[#111827]">
            <p className="text-[#64748B] dark:text-slate-400">Patient: <strong className="text-[#1E293B] dark:text-slate-200">{patientCode}</strong></p>
            <p className="text-[#64748B] dark:text-slate-400">Illness: <strong className="text-[#1E293B] dark:text-slate-200">{mockIllnesses.find((i) => i.id === illnessId)?.name}</strong></p>
            <p className="text-[#64748B] dark:text-slate-400">Medicine: <strong className="text-[#1E293B] dark:text-slate-200">{selectedBatch?.name}</strong></p>
            <p className="text-[#64748B] dark:text-slate-400">Batch Code: <strong className="text-[#1E293B] dark:text-slate-200 font-mono">{selectedBatch?.batch}</strong></p>
            <p className="text-[#64748B] dark:text-slate-400">Quantity Released: <strong className="text-[#1E293B] dark:text-slate-200">{dispenseQty} units</strong></p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 font-bold shadow-md shadow-[#2563EB]/15 transition"
          >
            Dispense Another Medicine
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-6">
          
          {/* Step Indicators */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
            <span className={`px-2 py-0.5 rounded-md ${step === 1 ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-white/10 dark:text-[#60A5FA]" : ""}`}>
              Step 1: Patient info
            </span>
            <ChevronRight className="size-4 text-[#94A3B8]" />
            <span className={`px-2 py-0.5 rounded-md ${step === 2 ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-white/10 dark:text-[#60A5FA]" : ""}`}>
              Step 2: Stock Select
            </span>
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-[#1E293B] dark:text-slate-100 font-bold">Step 1: Patient Registration & Diagnosis</h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Please record basic on-site details. Patient profile logins are not supported in GabayGamot.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    Patient Code / identifier
                  </label>
                  <div className="relative mt-2">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="e.g. PAT-9831 or Initials"
                      value={patientCode}
                      onChange={(e) => setPatientCode(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white pl-11 pr-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    Illness Classification
                  </label>
                  <div className="relative mt-2">
                    <select
                      value={illnessId}
                      onChange={(e) => setIllnessId(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                    >
                      <option value="">-- Select Illness Category --</option>
                      {mockIllnesses.map((i) => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!patientCode || !illnessId}
                className="w-full rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white py-3.5 font-bold shadow-md shadow-[#2563EB]/15 flex items-center justify-center gap-2 transition"
              >
                Continue to Stock Selection
                <ChevronRight className="size-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-[#1E293B] dark:text-slate-100 font-bold">Step 2: Stock Verification & Release</h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Verify batch details, confirm remaining quantities, and enter final dispensing count.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    Select Available Medicine Batch
                  </label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                  >
                    <option value="">-- Choose Batch (Expiry - Available) --</option>
                    {mockStockList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} (Batch: {b.batch}) [Exp: {b.exp}] - {b.qty} left
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBatch && (
                  <div className="rounded-2xl border border-[#E2E8F0] p-4 space-y-3 dark:border-white/5 bg-[#F8FAFC]/50 dark:bg-white/5">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-[#64748B] dark:text-slate-400">Batch Expiry</p>
                        <p className="font-bold text-[#1E293B] dark:text-slate-200 mt-0.5">{selectedBatch.exp}</p>
                      </div>
                      <div>
                        <p className="text-[#64748B] dark:text-slate-400">Stock Remaining</p>
                        <p className="font-bold text-[#1E293B] dark:text-slate-200 mt-0.5">{selectedBatch.qty} units</p>
                      </div>
                    </div>

                    {/* Expiry / Low stock alert warnings */}
                    {isNearExpiry && (
                      <div className="flex gap-2.5 items-start rounded-xl border border-rose-100 bg-rose-50/30 p-3 text-xs text-rose-700 dark:border-rose-950/20 dark:bg-rose-950/5 dark:text-rose-450 font-medium">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <p>
                          <strong>Expiry Warning:</strong> This batch expires in less than 60 days. Prioritize dispensing this stock first.
                        </p>
                      </div>
                    )}
                    
                    {selectedBatch.qty < 50 && (
                      <div className="flex gap-2.5 items-start rounded-xl border border-amber-100 bg-amber-50/30 p-3 text-xs text-amber-700 dark:border-amber-950/20 dark:bg-amber-950/5 dark:text-amber-450 font-medium">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <p>
                          <strong>Low Stock Warning:</strong> Remaining quantity is low. A referral or replenishment is recommended after dispensing.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    * Quantity to Dispense
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={dispenseQty}
                    onChange={(e) => setDispenseQty(e.target.value)}
                    required
                    min={1}
                    max={selectedBatch ? selectedBatch.qty : undefined}
                    className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-between pt-4 border-t border-[#E2E8F0] dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-2xl border border-[#E2E8F0] px-5 py-3 text-sm font-bold text-[#1E293B] hover:bg-[#F8FAFC] flex items-center gap-2 transition dark:border-white/10 dark:text-slate-100 dark:hover:bg-white/5"
                >
                  <ChevronLeft className="size-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!selectedBatchId || !dispenseQty || Number(dispenseQty) > (selectedBatch?.qty ?? 0)}
                  className="rounded-2xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white px-6 py-3 font-bold shadow-md shadow-green-500/10 transition"
                >
                  Confirm Dispensing
                </button>
              </div>
            </form>
          )}

        </div>
      )}

    </div>
  );
}
