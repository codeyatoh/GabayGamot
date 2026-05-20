"use client";

import { useState, useTransition } from "react";
import { User, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { MedicineBatchWithDetails } from "@/lib/supabase/inventory";
import { dispenseStockAction } from "./actions";

const ILLNESS_CATEGORIES = [
  "Upper Respiratory Infection (URI / Sipon at Ubo)",
  "Hypertension / Cardiovascular Disease",
  "Type 2 Diabetes Mellitus",
  "Fever / Headache / General Pain",
  "Skin Infection / Dermatitis",
  "Diarrhea / Gastroenteritis",
  "Wound / Laceration Care",
  "Eye Infection / Conjunctivitis",
  "Urinary Tract Infection (UTI)",
  "Other / Hindi nakatala",
];

interface PatientLookup {
  id: string;
  patient_code: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  age: number;
  sex: string;
  barangay: string;
  city_municipality: string;
}

function formatPatientName(patient: PatientLookup) {
  return [
    patient.first_name,
    patient.middle_name,
    patient.last_name,
    patient.suffix,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatPatientSearchValue(patient: PatientLookup) {
  return `${patient.patient_code} - ${formatPatientName(patient)}`;
}

function matchesPatientQuery(patient: PatientLookup, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return true;
  }

  return [
    patient.patient_code,
    patient.first_name,
    patient.middle_name,
    patient.last_name,
    patient.suffix,
    patient.barangay,
    patient.city_municipality,
    formatPatientName(patient),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function findExactPatientMatch(patients: PatientLookup[], rawValue: string) {
  const value = rawValue.trim().toLowerCase();
  if (!value) {
    return null;
  }

  return patients.find((patient) => {
    const searchableValues = [
      patient.id,
      patient.patient_code,
      formatPatientName(patient),
      formatPatientSearchValue(patient),
    ];

    return searchableValues.some((entry) => entry.toLowerCase() === value);
  }) ?? null;
}

interface DispenseClientProps {
  availableBatches: MedicineBatchWithDetails[];
  outOfStockBatches: MedicineBatchWithDetails[];
  patients: PatientLookup[];
  initialFlow?: {
    patientCode?: string;
    illnessCategory?: string;
    medicineId?: string;
    quantity?: string;
    patientId?: string;
    consultationId?: string;
    requestId?: string;
  };
}

interface Receipt {
  medicineName: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  patientCode: string;
  timestamp: string;
}

export function DispenseClient({
  availableBatches,
  outOfStockBatches,
  patients,
  initialFlow,
}: DispenseClientProps) {
  const initialPatient = patients.find((patient) => {
    if (initialFlow?.patientId && patient.id === initialFlow.patientId) {
      return true;
    }

    return Boolean(
      initialFlow?.patientCode &&
        patient.patient_code.toLowerCase() === initialFlow.patientCode.toLowerCase(),
    );
  }) ?? null;

  const [step, setStep] = useState(
    initialFlow?.patientCode && initialFlow?.illnessCategory ? 2 : 1,
  );
  const [patientCode, setPatientCode] = useState(
    initialPatient?.patient_code ?? initialFlow?.patientCode ?? "",
  );
  const [patientSearch, setPatientSearch] = useState(
    initialPatient
      ? formatPatientSearchValue(initialPatient)
      : initialFlow?.patientCode ?? "",
  );
  const [selectedPatient, setSelectedPatient] = useState<PatientLookup | null>(initialPatient);
  const [illnessCategory, setIllnessCategory] = useState(initialFlow?.illnessCategory ?? "");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [dispenseQty, setDispenseQty] = useState(initialFlow?.quantity ?? "");
  
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const visibleAvailableBatches = initialFlow?.medicineId
    ? availableBatches.filter((batch) => batch.medicine_id === initialFlow.medicineId)
    : availableBatches;
  const visibleOutOfStockBatches = initialFlow?.medicineId
    ? outOfStockBatches.filter((batch) => batch.medicine_id === initialFlow.medicineId)
    : outOfStockBatches;
  const selectedBatch = visibleAvailableBatches.find((b) => b.id === selectedBatchId);
  const patientMatches = patientSearch.trim()
    ? patients.filter((patient) => matchesPatientQuery(patient, patientSearch)).slice(0, 6)
    : patients.slice(0, 6);

  // Status computation for the selected batch
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let daysToExpiry = 9999;
  let isNearExpiry = false;
  let isExpired = false;

  if (selectedBatch) {
    const expDate = new Date(selectedBatch.expiry_date);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    isExpired = daysToExpiry < 0;
    isNearExpiry = !isExpired && daysToExpiry <= 180;
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && patientCode && illnessCategory) {
      setStep(2);
      setErrorMsg(null);
    }
  };

  const handlePatientSearchChange = (value: string) => {
    setPatientSearch(value);

    const exactMatch = findExactPatientMatch(patients, value);
    if (exactMatch) {
      setSelectedPatient(exactMatch);
      setPatientCode(exactMatch.patient_code);
      return;
    }

    setSelectedPatient(null);
    setPatientCode(value.trim());
  };

  const handlePatientSelect = (patient: PatientLookup) => {
    setSelectedPatient(patient);
    setPatientSearch(formatPatientSearchValue(patient));
    setPatientCode(patient.patient_code);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const qty = Number(dispenseQty);
    if (!selectedBatch || isNaN(qty) || qty <= 0 || qty > selectedBatch.quantity) {
      setErrorMsg("Pakilagay ang tamang quantity na hindi lalampas sa available stock.");
      return;
    }

    startTransition(async () => {
      const result = await dispenseStockAction({
        batchId: selectedBatch.id,
        patientCode: patientCode.trim(),
        illnessCategory,
        quantityDispensed: qty,
        patientId: selectedPatient?.id ?? initialFlow?.patientId,
        consultationId: initialFlow?.consultationId,
        requestId: initialFlow?.requestId,
      });

      if (result.success && result.receipt) {
        setReceipt(result.receipt);
      } else {
        setErrorMsg(result.error || "May error sa pag-dispense. Please try again.");
      }
    });
  };

  const handleReset = () => {
    setStep(1);
    setPatientCode("");
    setPatientSearch("");
    setSelectedPatient(null);
    setIllnessCategory("");
    setSelectedBatchId("");
    setDispenseQty("");
    setReceipt(null);
    setErrorMsg(null);
  };

  const formatMedName = (b: MedicineBatchWithDetails) => {
    const m = Array.isArray(b.medicine_master) ? b.medicine_master[0] : b.medicine_master;
    if (!m) return "Unknown Medicine";
    return `${m.generic_name} ${m.brand_name ? `(${m.brand_name})` : ""} ${m.strength}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      
      {receipt ? (
        <div className="rounded-3xl border border-green-100 bg-green-50/10 p-8 text-center space-y-6 dark:border-green-950/20 dark:bg-green-950/5">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
            <CheckCircle2 className="size-8" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-green-900 dark:text-green-300">Dispensing Recorded Successfully</h2>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-2 max-w-md mx-auto">
              Stock has been successfully deducted from the database. The patient dispensing event is logged under patient code <strong className="text-[#1E293B] dark:text-slate-200">{receipt.patientCode}</strong>.
            </p>
          </div>
          
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 text-left max-w-sm mx-auto space-y-2 text-xs dark:border-white/10 dark:bg-[#111827]">
            <p className="text-[#64748B] dark:text-slate-400">Patient: <strong className="text-[#1E293B] dark:text-slate-200">{receipt.patientCode}</strong></p>
            <p className="text-[#64748B] dark:text-slate-400">Medicine: <strong className="text-[#1E293B] dark:text-slate-200">{receipt.medicineName}</strong></p>
            <p className="text-[#64748B] dark:text-slate-400">Batch Code: <strong className="text-[#1E293B] dark:text-slate-200 font-mono">{receipt.batchNumber}</strong></p>
            <p className="text-[#64748B] dark:text-slate-400">Quantity Released: <strong className="text-[#1E293B] dark:text-slate-200">{receipt.quantity} {receipt.unit}</strong></p>
            <p className="text-[#64748B] dark:text-slate-400">Date/Time: <strong className="text-[#1E293B] dark:text-slate-200">{new Date(receipt.timestamp).toLocaleString()}</strong></p>
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
          {initialFlow?.consultationId && (
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/40 p-4 text-sm text-cyan-800 dark:border-cyan-950/20 dark:bg-cyan-950/10 dark:text-cyan-300">
              Consultation-first mode is active. This dispensing step was opened from a recorded patient consultation, so the patient and illness details are already prepared for release logging.
            </div>
          )}
          
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
                <h3 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">Step 1: Patient Details & Consultation Context</h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Please record basic on-site details. Patient profile logins are not supported in GabayGamot.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    Patient Search / identifier
                  </label>
                  <div className="relative mt-2">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="Search by code, name, or barangay"
                      value={patientSearch}
                      onChange={(e) => handlePatientSearchChange(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white pl-11 pr-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                    />
                  </div>
                  <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400">
                    Automatic patient lookup is active. Select the on-site patient record so the dispense log uses the saved patient code.
                  </p>
                  {selectedPatient ? (
                    <div className="mt-3 rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
                      <p className="font-bold text-[#1E293B] dark:text-slate-100">
                        {formatPatientName(selectedPatient)}
                      </p>
                      <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                        {selectedPatient.patient_code} - {selectedPatient.age} yrs - {selectedPatient.sex}
                      </p>
                      <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                        {selectedPatient.barangay}, {selectedPatient.city_municipality}
                      </p>
                    </div>
                  ) : patientSearch.trim() ? (
                    <div className="mt-3 space-y-2 rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC]/60 p-3 dark:border-white/10 dark:bg-white/5">
                      {patientMatches.length === 0 ? (
                        <p className="text-xs text-[#64748B] dark:text-slate-400">
                          No patient match found yet. You can still continue with a manual identifier if needed.
                        </p>
                      ) : (
                        patientMatches.map((patient) => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => handlePatientSelect(patient)}
                            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-left transition hover:border-[#BFDBFE] hover:bg-slate-50 dark:border-white/10 dark:bg-[#0F172A] dark:hover:bg-white/5"
                          >
                            <p className="font-bold text-[#1E293B] dark:text-slate-100">
                              {formatPatientName(patient)}
                            </p>
                            <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                              {patient.patient_code} - {patient.barangay}, {patient.city_municipality}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    Illness Classification
                  </label>
                  <div className="relative mt-2">
                    <select
                      value={illnessCategory}
                      onChange={(e) => setIllnessCategory(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                    >
                      <option value="">-- Select Illness Category --</option>
                      {ILLNESS_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!patientCode || !illnessCategory}
                className="w-full rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white py-3.5 font-bold shadow-md shadow-[#2563EB]/15 flex items-center justify-center gap-2 transition"
              >
                Continue to Stock Selection
                <ChevronRight className="size-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">Step 2: Stock Verification & Release</h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Verify batch details, confirm remaining quantities, and enter final dispensing count.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    Select Available Medicine Batch
                  </label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => {
                      setSelectedBatchId(e.target.value);
                      setDispenseQty("");
                      setErrorMsg(null);
                    }}
                    required
                    className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                  >
                    <option value="">-- Choose Batch --</option>
                    {visibleAvailableBatches.length > 0 && <optgroup label="Available Stock">
                      {visibleAvailableBatches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {formatMedName(b)} (Batch: {b.batch_number}) - {b.quantity} {b.unit} left
                        </option>
                      ))}
                    </optgroup>}
                    {visibleOutOfStockBatches.length > 0 && <optgroup label="Out of Stock (Cannot Dispense)">
                      {visibleOutOfStockBatches.map((b) => (
                        <option key={b.id} value={b.id} disabled>
                          {formatMedName(b)} (Batch: {b.batch_number}) - OUT OF STOCK
                        </option>
                      ))}
                    </optgroup>}
                  </select>
                  {initialFlow?.medicineId && visibleAvailableBatches.length === 0 && (
                    <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                      No currently available batches match the consultation medicine request in this center. You may need to switch to the referral flow.
                    </p>
                  )}
                </div>

                {selectedBatch && (
                  <div className="rounded-2xl border border-[#E2E8F0] p-4 space-y-3 dark:border-white/5 bg-[#F8FAFC]/50 dark:bg-white/5">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-[#64748B] dark:text-slate-400">Batch Expiry</p>
                        <p className="font-bold text-[#1E293B] dark:text-slate-200 mt-0.5">
                          {selectedBatch.expiry_date}
                          {isExpired && <span className="ml-2 text-rose-500 font-bold uppercase">(Expired)</span>}
                          {isNearExpiry && <span className="ml-2 text-amber-500 font-bold uppercase">(Near Expiry)</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#64748B] dark:text-slate-400">Stock Remaining</p>
                        <p className="font-bold text-[#1E293B] dark:text-slate-200 mt-0.5">{selectedBatch.quantity} {selectedBatch.unit}</p>
                      </div>
                    </div>

                    {/* Expiry / Low stock alert warnings */}
                    {isExpired && (
                      <div className="flex gap-2.5 items-start rounded-xl border border-rose-100 bg-rose-50/30 p-3 text-xs text-rose-700 dark:border-rose-950/20 dark:bg-rose-950/5 dark:text-rose-450 font-medium">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <p>
                          <strong>Babala (Expired):</strong> Ang gamot na ito ay expired na noong {selectedBatch.expiry_date}. Siguraduhing ligtas pa itong ibigay o kaya&apos;y i-dispose na.
                        </p>
                      </div>
                    )}
                    
                    {isNearExpiry && (
                      <div className="flex gap-2.5 items-start rounded-xl border border-amber-100 bg-amber-50/30 p-3 text-xs text-amber-700 dark:border-amber-950/20 dark:bg-amber-950/5 dark:text-amber-450 font-medium">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <p>
                          <strong>Near Expiry:</strong> Malapit nang ma-expire ang batch na ito ({daysToExpiry} days remaining). Unahin itong i-dispense.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    * Quantity to Dispense
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={dispenseQty}
                      onChange={(e) => setDispenseQty(e.target.value)}
                      required
                      min={1}
                      max={selectedBatch ? selectedBatch.quantity : undefined}
                      disabled={!selectedBatch || isPending}
                      className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100 disabled:opacity-50"
                    />
                    {selectedBatch && <span className="absolute right-4 top-1/2 -translate-y-1/2 mt-1 text-sm font-bold text-[#64748B]">{selectedBatch.unit}</span>}
                  </div>
                </div>
                
                {errorMsg && (
                  <div className="flex gap-2.5 items-center rounded-xl border border-rose-100 bg-rose-50/30 p-3 text-xs text-rose-700 dark:border-rose-950/20 dark:bg-rose-950/5 dark:text-rose-450 font-medium">
                    <AlertCircle className="size-4 shrink-0" />
                    <p>{errorMsg}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-between pt-4 border-t border-[#E2E8F0] dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isPending}
                  className="rounded-2xl border border-[#E2E8F0] px-5 py-3 text-sm font-bold text-[#1E293B] hover:bg-[#F8FAFC] flex items-center gap-2 transition dark:border-white/10 dark:text-slate-100 dark:hover:bg-white/5 disabled:opacity-50"
                >
                  <ChevronLeft className="size-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!selectedBatchId || !dispenseQty || Number(dispenseQty) > (selectedBatch?.quantity ?? 0) || isPending}
                  className="rounded-2xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white px-6 py-3 font-bold shadow-md shadow-green-500/10 transition flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Dispensing"
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      )}

    </div>
  );
}
