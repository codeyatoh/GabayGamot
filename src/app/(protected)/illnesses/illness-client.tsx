"use client";

import { useState, useTransition } from "react";
import { User, CheckCircle2, ChevronRight, Activity, AlertCircle, Loader2, Stethoscope, FileText, CalendarDays } from "lucide-react";
import { logIllnessAction } from "./actions";

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

const ACTION_TAKEN_OPTIONS = [
  "Consultation / Advice Only",
  "Dispensed Medicine",
  "Referred to Other Center",
  "Emergency / Hospital Transfer"
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
      patient.patient_code,
      formatPatientName(patient),
      formatPatientSearchValue(patient),
    ];

    return searchableValues.some((entry) => entry.toLowerCase() === value);
  }) ?? null;
}

export function IllnessClient({
  recentLogs,
  patients,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentLogs: any[];
  patients: PatientLookup[];
}) {
  const [patientCode, setPatientCode] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientLookup | null>(null);
  const [illnessCategory, setIllnessCategory] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [notes, setNotes] = useState("");
  
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [receipt, setReceipt] = useState<any | null>(null);

  const patientMatches = patientSearch.trim()
    ? patients.filter((patient) => matchesPatientQuery(patient, patientSearch)).slice(0, 6)
    : patients.slice(0, 6);

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

    if (!patientCode || !illnessCategory || !actionTaken) {
      setErrorMsg("Pakikumpleto ang lahat ng required fields (*)");
      return;
    }

    startTransition(async () => {
      const result = await logIllnessAction({
        patientCode: patientCode.trim(),
        illnessCategory,
        actionTaken,
        notes: notes.trim()
      });

      if (result.success && result.log) {
        setReceipt(result.log);
      } else {
        setErrorMsg(result.error || "May error sa pag-save. Please try again.");
      }
    });
  };

  const handleReset = () => {
    setPatientCode("");
    setPatientSearch("");
    setSelectedPatient(null);
    setIllnessCategory("");
    setActionTaken("");
    setNotes("");
    setReceipt(null);
    setErrorMsg(null);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
      
      {/* Left Column: Log Form */}
      <div className="space-y-6">
        {receipt ? (
          <div className="rounded-3xl border border-green-100 bg-green-50/10 p-8 text-center space-y-6 dark:border-green-950/20 dark:bg-green-950/5">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
              <CheckCircle2 className="size-8" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-green-900 dark:text-green-300">Case Recorded Successfully</h2>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-2 max-w-sm mx-auto">
                Ang patient consultation log para sa <strong>{receipt.patientCode}</strong> ay naisave na sa database.
              </p>
            </div>
            
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 text-left max-w-sm mx-auto space-y-2 text-xs dark:border-white/10 dark:bg-[#111827]">
              <p className="text-[#64748B] dark:text-slate-400">Patient: <strong className="text-[#1E293B] dark:text-slate-200">{receipt.patientCode}</strong></p>
              <p className="text-[#64748B] dark:text-slate-400">Illness: <strong className="text-[#1E293B] dark:text-slate-200">{receipt.illnessCategory}</strong></p>
              <p className="text-[#64748B] dark:text-slate-400">Action: <strong className="text-[#1E293B] dark:text-slate-200">{receipt.actionTaken}</strong></p>
              <p className="text-[#64748B] dark:text-slate-400">Date/Time: <strong className="text-[#1E293B] dark:text-slate-200">{new Date(receipt.timestamp).toLocaleString()}</strong></p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 font-bold shadow-md shadow-[#2563EB]/15 transition"
            >
              Log Another Case
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-6">
            
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                <Stethoscope className="size-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">Log New Consultation</h2>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Record illnesses even when medicine is out of stock.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  * Patient Search / Identifier
                </label>
                <div className="relative mt-2">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search by code, name, or barangay"
                    value={patientSearch}
                    onChange={(e) => handlePatientSearchChange(e.target.value)}
                    required
                    disabled={isPending}
                    className="w-full rounded-2xl border border-[#E2E8F0] bg-white pl-11 pr-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100 disabled:opacity-50"
                  />
                </div>
                <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400">
                  Automatic patient lookup is active. Pick an existing patient to reuse the saved code and details.
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
                  * Illness Classification
                </label>
                <select
                  value={illnessCategory}
                  onChange={(e) => setIllnessCategory(e.target.value)}
                  required
                  disabled={isPending}
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100 disabled:opacity-50"
                >
                  <option value="">-- Select Illness Category --</option>
                  {ILLNESS_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  * Action Taken
                </label>
                <select
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  required
                  disabled={isPending}
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100 disabled:opacity-50"
                >
                  <option value="">-- What was done? --</option>
                  {ACTION_TAKEN_OPTIONS.map((action) => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  Notes (Optional)
                </label>
                <div className="relative mt-2">
                  <FileText className="absolute left-4 top-3.5 size-4 text-[#94A3B8]" />
                  <textarea
                    placeholder="Enter any additional remarks..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    disabled={isPending}
                    className="w-full rounded-2xl border border-[#E2E8F0] bg-white pl-11 pr-4 py-3 text-sm font-medium text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100 disabled:opacity-50 resize-none"
                  />
                </div>
              </div>
              
              {errorMsg && (
                <div className="flex gap-2.5 items-center rounded-xl border border-rose-100 bg-rose-50/30 p-3 text-xs text-rose-700 dark:border-rose-950/20 dark:bg-rose-950/5 dark:text-rose-450 font-medium">
                  <AlertCircle className="size-4 shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending || !patientCode || !illnessCategory || !actionTaken}
              className="w-full rounded-2xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white py-3.5 font-bold shadow-md shadow-green-500/10 flex items-center justify-center gap-2 transition"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Saving Case...
                </>
              ) : (
                <>
                  Save Consultation Log
                  <ChevronRight className="size-5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Right Column: History Feed */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] flex flex-col max-h-[700px]">
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-650 dark:bg-white/5 dark:text-purple-400">
            <Activity className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">Recent Cases</h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Latest consultations in your center.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {recentLogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E2E8F0] p-8 text-center dark:border-white/10">
              <p className="text-sm font-medium text-[#64748B] dark:text-slate-400">No cases logged yet.</p>
            </div>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]/50 p-4 dark:border-white/5 dark:bg-white/5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-sm font-bold text-[#1E293B] dark:text-slate-100">{log.illness_category}</p>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Patient: {log.patient_code}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] shadow-sm border border-[#E2E8F0] dark:bg-black/20 dark:border-white/5 dark:text-slate-300">
                    {log.action_taken}
                  </span>
                </div>
                
                {log.notes && (
                  <div className="mt-3 rounded-xl bg-white/50 p-2.5 text-xs text-[#475569] dark:bg-black/20 dark:text-slate-400 border border-[#E2E8F0] dark:border-white/5 italic">
                    &quot;{log.notes}&quot;
                  </div>
                )}
                
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#94A3B8] font-medium uppercase tracking-wider">
                  <CalendarDays className="size-3" />
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
    </div>
  );
}
