"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Search, ArrowRight, XCircle, Loader2, MapPin, Package } from "lucide-react";
import { createReferralAction, completeReferralAction, cancelReferralAction } from "./actions";

interface CenterWithStock {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  totalQuantity: number;
}

export function ReferralsClient({ myCenterId, medicines, referrals, centersWithStock, myBatches, initialFlow }: { 
  myCenterId: string, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  medicines: any[], 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  referrals: any[], 
  centersWithStock: Record<string, CenterWithStock[]>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  myBatches: any[],
  initialFlow?: {
    patientCode?: string;
    medicineId?: string;
    quantity?: string;
    patientId?: string;
    consultationId?: string;
    requestId?: string;
  }
}) {
  const [activeTab, setActiveTab] = useState<"create" | "incoming" | "outgoing">("create");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Create Form State
  const [selectedMedId, setSelectedMedId] = useState(initialFlow?.medicineId ?? "");
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [patientCode, setPatientCode] = useState(initialFlow?.patientCode ?? "");
  const [quantity, setQuantity] = useState(initialFlow?.quantity ?? "1");
  const [createSuccess, setCreateSuccess] = useState(false);

  // Incoming Fulfill Modal State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fulfillReferral, setFulfillReferral] = useState<any | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const incomingRefs = referrals.filter(r => r.receiving_center_id === myCenterId);
  const outgoingRefs = referrals.filter(r => r.referring_center_id === myCenterId);
  
  const availableCenters = selectedMedId ? (centersWithStock[selectedMedId] || []) : [];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCreateSuccess(false);

    if (!selectedMedId || !selectedCenterId || !patientCode || !quantity) {
      setErrorMsg("Pakikumpleto lahat ng required fields.");
      return;
    }

    startTransition(async () => {
      const result = await createReferralAction({
        medicineId: selectedMedId,
        receivingCenterId: selectedCenterId,
        patientCode,
        quantityRequested: parseInt(quantity, 10),
        patientId: initialFlow?.patientId,
        consultationId: initialFlow?.consultationId,
        requestId: initialFlow?.requestId,
      });

      if (result.success) {
        setCreateSuccess(true);
        setSelectedMedId("");
        setSelectedCenterId("");
        setPatientCode("");
        setQuantity("1");
      } else {
        setErrorMsg(result.error || "Failed to create referral.");
      }
    });
  };

  const handleComplete = () => {
    if (!fulfillReferral || !selectedBatchId) return;
    setErrorMsg(null);
    startTransition(async () => {
      const result = await completeReferralAction(fulfillReferral.id, selectedBatchId);
      if (result.success) {
        setFulfillReferral(null);
        setSelectedBatchId("");
      } else {
        setErrorMsg(result.error || "Failed to complete referral.");
      }
    });
  };

  const handleCancel = (refId: string) => {
    if (!window.confirm("Sigurado kang gusto mong i-cancel itong referral?")) return;
    startTransition(async () => {
      await cancelReferralAction(refId);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E2E8F0] dark:border-white/10 pb-4 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => { setActiveTab("create"); setCreateSuccess(false); setErrorMsg(null); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${activeTab === "create" ? "bg-[#2563EB] text-white shadow-sm" : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB] dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"}`}
        >
          Generate Referral
        </button>
        <button
          onClick={() => { setActiveTab("incoming"); setCreateSuccess(false); setErrorMsg(null); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition flex items-center gap-2 ${activeTab === "incoming" ? "bg-[#0D9488] text-white shadow-sm" : "bg-[#F8FAFC] text-[#64748B] hover:bg-teal-50 hover:text-teal-700 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-teal-400"}`}
        >
          Incoming Requests
          {incomingRefs.filter(r => r.status === "pending").length > 0 && (
            <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[10px]">{incomingRefs.filter(r => r.status === "pending").length}</span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab("outgoing"); setCreateSuccess(false); setErrorMsg(null); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${activeTab === "outgoing" ? "bg-purple-600 text-white shadow-sm" : "bg-[#F8FAFC] text-[#64748B] hover:bg-purple-50 hover:text-purple-700 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-purple-400"}`}
        >
          Outgoing Requests
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4 text-sm text-rose-700 dark:border-rose-950/20 dark:bg-rose-950/5 dark:text-rose-450 font-medium">
          {errorMsg}
        </div>
      )}

      {/* CREATE TAB */}
      {activeTab === "create" && (
        <div className="mx-auto max-w-2xl">
          {initialFlow?.consultationId && (
            <div className="mb-4 rounded-2xl border border-cyan-100 bg-cyan-50/40 p-4 text-sm text-cyan-800 dark:border-cyan-950/20 dark:bg-cyan-950/10 dark:text-cyan-300">
              Consultation-first mode is active. This referral request will carry the linked patient consultation context while keeping the existing barangay-to-barangay transfer workflow intact.
            </div>
          )}
          {createSuccess ? (
            <div className="rounded-3xl border border-green-100 bg-green-50/10 p-8 text-center space-y-6 dark:border-green-950/20 dark:bg-green-950/5">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                <CheckCircle2 className="size-8" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-green-900 dark:text-green-300">Referral Created!</h2>
                <p className="text-sm text-[#64748B] dark:text-slate-400 mt-2">
                  The request has been sent to the receiving health center. It is marked as <strong>Pending</strong>.
                </p>
              </div>
              <button
                onClick={() => setCreateSuccess(false)}
                className="rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 font-bold shadow-sm transition"
              >
                Create Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateSubmit} className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 mb-2">
                  1. Search Required Medicine
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
                  <select
                    value={selectedMedId}
                    onChange={(e) => { setSelectedMedId(e.target.value); setSelectedCenterId(""); }}
                    disabled={isPending}
                    className="w-full rounded-2xl border border-[#E2E8F0] bg-white pl-11 pr-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100 disabled:opacity-50 appearance-none"
                  >
                    <option value="">-- Choose Medicine --</option>
                    {medicines.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.generic_name} {med.brand_name ? `(${med.brand_name})` : ""} {med.strength}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedMedId && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    2. Select Nearest Center with Stock
                  </label>
                  {availableCenters.length === 0 ? (
                    <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-center text-sm font-medium text-rose-700 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-450">
                      No other centers have available stock for this medicine.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {availableCenters.map((center) => (
                        <label key={center.id} className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${selectedCenterId === center.id ? 'border-[#2563EB] bg-[#EFF6FF] dark:border-[#60A5FA] dark:bg-[#2563EB]/10' : 'border-[#E2E8F0] bg-white hover:border-[#BFDBFE] hover:bg-slate-50 dark:border-white/10 dark:bg-[#111827] dark:hover:bg-white/5'}`}>
                          <input 
                            type="radio" 
                            name="center" 
                            value={center.id} 
                            checked={selectedCenterId === center.id}
                            onChange={() => setSelectedCenterId(center.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-[#1E293B] dark:text-slate-100">{center.name}</h4>
                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B] dark:text-slate-400">
                              <span className="flex items-center gap-1"><MapPin className="size-3" /> {center.distanceKm.toFixed(1)} km away</span>
                              <span className="flex items-center gap-1"><Package className="size-3 text-green-600 dark:text-green-400" /> {center.totalQuantity} in stock</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedCenterId && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 mb-2">
                      3. Patient Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PAT-123"
                      value={patientCode}
                      onChange={(e) => setPatientCode(e.target.value)}
                      required
                      disabled={isPending}
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 mb-2">
                      4. Quantity Needed
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                      disabled={isPending}
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100 disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || !selectedMedId || !selectedCenterId || !patientCode || !quantity}
                className="w-full rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white py-3.5 font-bold shadow-md shadow-[#2563EB]/15 flex items-center justify-center gap-2 transition mt-6"
              >
                {isPending ? (
                  <><Loader2 className="size-5 animate-spin" /> Submitting Request...</>
                ) : (
                  <><ArrowRight className="size-5" /> Generate Referral</>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* INCOMING TAB */}
      {activeTab === "incoming" && (
        <div className="space-y-4">
          {incomingRefs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#E2E8F0] p-12 text-center dark:border-white/10">
              <p className="text-sm font-medium text-[#64748B] dark:text-slate-400">No incoming referrals.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {incomingRefs.map((ref) => (
                <div key={ref.id} className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111827] relative overflow-hidden">
                  {ref.status === "pending" && <div className="absolute top-0 left-0 w-full h-1 bg-amber-400"></div>}
                  {ref.status === "completed" && <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>}
                  {ref.status === "cancelled" && <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>}
                  
                  <div className="flex justify-between items-start mb-3 mt-1">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      ref.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-400" :
                      ref.status === "completed" ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:border-green-800/50 dark:text-green-400" :
                      "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/50 dark:text-rose-400"
                    }`}>
                      {ref.status}
                    </span>
                    <span className="text-xs text-[#94A3B8] font-medium">{new Date(ref.created_at).toLocaleDateString()}</span>
                  </div>

                  <h3 className="font-bold text-[#1E293B] dark:text-slate-100 leading-tight">
                    {ref.medicine_master?.generic_name}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                    {ref.medicine_master?.brand_name} {ref.medicine_master?.strength}
                  </p>

                  <div className="mt-4 space-y-2 text-xs font-medium bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] dark:bg-white/5 dark:border-white/5">
                    <div className="flex justify-between">
                      <span className="text-[#64748B] dark:text-slate-400">From:</span>
                      <span className="text-[#1E293B] dark:text-slate-200 text-right max-w-[150px] truncate">{ref.referring_center?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B] dark:text-slate-400">Patient:</span>
                      <span className="text-[#1E293B] dark:text-slate-200">{ref.patient_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B] dark:text-slate-400">Qty Needed:</span>
                      <span className="text-[#1E293B] dark:text-slate-200 font-bold">{ref.quantity_requested}</span>
                    </div>
                  </div>

                  {ref.status === "pending" && (
                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={() => { setFulfillReferral(ref); setSelectedBatchId(""); }}
                        disabled={isPending}
                        className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white py-2 rounded-xl text-xs font-bold transition disabled:opacity-50"
                      >
                        Fulfill Request
                      </button>
                      <button 
                        onClick={() => handleCancel(ref.id)}
                        disabled={isPending}
                        className="px-3 bg-white border border-[#E2E8F0] text-rose-600 hover:bg-rose-50 py-2 rounded-xl text-xs font-bold transition dark:bg-black/20 dark:border-white/10 dark:text-rose-400 dark:hover:bg-white/5 disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OUTGOING TAB */}
      {activeTab === "outgoing" && (
        <div className="space-y-4">
          {outgoingRefs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#E2E8F0] p-12 text-center dark:border-white/10">
              <p className="text-sm font-medium text-[#64748B] dark:text-slate-400">No outgoing referrals.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {outgoingRefs.map((ref) => (
                <div key={ref.id} className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111827] relative overflow-hidden">
                  {ref.status === "pending" && <div className="absolute top-0 left-0 w-full h-1 bg-amber-400"></div>}
                  {ref.status === "completed" && <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>}
                  {ref.status === "cancelled" && <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>}
                  
                  <div className="flex justify-between items-start mb-3 mt-1">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      ref.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-400" :
                      ref.status === "completed" ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:border-green-800/50 dark:text-green-400" :
                      "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/50 dark:text-rose-400"
                    }`}>
                      {ref.status}
                    </span>
                    <span className="text-xs text-[#94A3B8] font-medium">{new Date(ref.created_at).toLocaleDateString()}</span>
                  </div>

                  <h3 className="font-bold text-[#1E293B] dark:text-slate-100 leading-tight">
                    {ref.medicine_master?.generic_name}
                  </h3>
                  
                  <div className="mt-4 space-y-2 text-xs font-medium bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] dark:bg-white/5 dark:border-white/5">
                    <div className="flex justify-between">
                      <span className="text-[#64748B] dark:text-slate-400">To:</span>
                      <span className="text-[#1E293B] dark:text-slate-200 text-right max-w-[150px] truncate">{ref.receiving_center?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B] dark:text-slate-400">Patient:</span>
                      <span className="text-[#1E293B] dark:text-slate-200">{ref.patient_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B] dark:text-slate-400">Qty Requested:</span>
                      <span className="text-[#1E293B] dark:text-slate-200 font-bold">{ref.quantity_requested}</span>
                    </div>
                  </div>

                  {ref.status === "pending" && (
                    <div className="mt-4">
                      <button 
                        onClick={() => handleCancel(ref.id)}
                        disabled={isPending}
                        className="w-full bg-white border border-[#E2E8F0] text-rose-600 hover:bg-rose-50 py-2 rounded-xl text-xs font-bold transition dark:bg-black/20 dark:border-white/10 dark:text-rose-400 dark:hover:bg-white/5 disabled:opacity-50"
                      >
                        Cancel Request
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FULFILL MODAL OVERLAY */}
      {fulfillReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setFulfillReferral(null); setErrorMsg(null); }}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#1E293B] dark:hover:text-white transition"
            >
              <XCircle className="size-6" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-650 dark:bg-teal-950/30 dark:text-teal-400">
                <CheckCircle2 className="size-5" />
              </span>
              <h2 className="text-xl font-bold text-[#1E293B] dark:text-slate-100">Fulfill Referral</h2>
            </div>
            
            <p className="text-sm text-[#64748B] dark:text-slate-400 mb-6">
              Select which batch to deduct <strong>{fulfillReferral.quantity_requested}</strong> units from for patient <strong>{fulfillReferral.patient_code}</strong>.
            </p>

            <div className="space-y-3 mb-6">
              {myBatches.filter(b => b.medicine_id === fulfillReferral.medicine_id).length === 0 ? (
                <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 text-sm text-rose-700 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-450 font-medium text-center">
                  You have no active batches for this medicine! Decline the referral.
                </div>
              ) : (
                myBatches
                  .filter(b => b.medicine_id === fulfillReferral.medicine_id)
                  .map(batch => {
                    const hasEnough = batch.quantity >= fulfillReferral.quantity_requested;
                    return (
                      <label key={batch.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${!hasEnough ? 'opacity-50 cursor-not-allowed' : selectedBatchId === batch.id ? 'border-[#0D9488] bg-teal-50/50 dark:border-teal-500/50 dark:bg-teal-950/20' : 'border-[#E2E8F0] bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-black/20'}`}>
                        <input 
                          type="radio" 
                          name="fulfillBatch" 
                          value={batch.id} 
                          checked={selectedBatchId === batch.id}
                          onChange={() => setSelectedBatchId(batch.id)}
                          disabled={!hasEnough || isPending}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-sm text-[#1E293B] dark:text-slate-100">Batch {batch.batch_number}</p>
                          <div className="mt-1 flex justify-between text-xs text-[#64748B] dark:text-slate-400">
                            <span>Exp: {new Date(batch.expiry_date).toLocaleDateString()}</span>
                            <span className={hasEnough ? "text-green-650 font-bold dark:text-green-400" : "text-rose-500 font-bold"}>{batch.quantity} available</span>
                          </div>
                        </div>
                      </label>
                    );
                  })
              )}
            </div>

            <button
              onClick={handleComplete}
              disabled={isPending || !selectedBatchId}
              className="w-full bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition shadow-md shadow-teal-500/20"
            >
              {isPending ? <Loader2 className="size-5 animate-spin" /> : <><CheckCircle2 className="size-5" /> Confirm Fulfillment</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
