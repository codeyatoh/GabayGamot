"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  CheckCircle2,
  ClipboardPlus,
  FileText,
  Search,
  Stethoscope,
  UserPlus,
} from "lucide-react";

import { createPatientAction, recordConsultationAction } from "./actions";
import { PatientAddressPicker } from "@/components/foundation/patient-address-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

function formatPatientName(patient: {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
}) {
  return [
    patient.first_name,
    patient.middle_name,
    patient.last_name,
    patient.suffix,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatMedicineName(medicine: {
  generic_name?: string | null;
  brand_name?: string | null;
  strength?: string | null;
} | null | undefined) {
  if (!medicine?.generic_name) {
    return "Medicine request";
  }

  return `${medicine.generic_name}${
    medicine.brand_name ? ` (${medicine.brand_name})` : ""
  }${medicine.strength ? ` ${medicine.strength}` : ""}`;
}

export function PatientsClient({
  patients,
  medicines,
  selectedPatient,
  consultations,
  consultationRequests,
  dispenseHistory,
  referralHistory,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patients: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  medicines: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedPatient: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  consultations: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  consultationRequests: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispenseHistory: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  referralHistory: any[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCreatePatientOpen, setIsCreatePatientOpen] = useState(false);
  const [listQuery, setListQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [consultationResult, setConsultationResult] = useState<{
    consultationId: string;
    requestId: string;
    patientId: string;
    patientCode: string;
    illnessCategory: string;
    medicineId: string;
    quantity: number;
    hasLocalStock: boolean;
    hasReferralOptions: boolean;
  } | null>(null);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [barangay, setBarangay] = useState("");
  const [cityMunicipality, setCityMunicipality] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const [consultationDate, setConsultationDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [illnessCategory, setIllnessCategory] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");
  const [medicineId, setMedicineId] = useState("");
  const [requestedQuantity, setRequestedQuantity] = useState("1");
  const [requestNotes, setRequestNotes] = useState("");

  const filteredPatients = patients.filter((patient) => {
    const haystack = [
      patient.patient_code,
      patient.first_name,
      patient.middle_name,
      patient.last_name,
      patient.barangay,
      patient.city_municipality,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(listQuery.trim().toLowerCase());
  });

  const fieldClassName =
    "rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100";

  const handleCreatePatient = (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const result = await createPatientAction({
        firstName,
        middleName,
        lastName,
        suffix,
        age: Number(age),
        sex,
        barangay,
        cityMunicipality,
        contactNumber,
      });

      if (!result.success || !result.patientId) {
        setErrorMsg(result.error || "Failed to create patient.");
        return;
      }

      setSuccessMsg(`Patient record created with code ${result.patientCode}.`);
      setIsCreatePatientOpen(false);
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setSuffix("");
      setAge("");
      setSex("");
      setBarangay("");
      setCityMunicipality("");
      setContactNumber("");
      router.push(`/patients?patient=${result.patientId}`);
    });
  };

  const handleConsultationSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setConsultationResult(null);

    if (!selectedPatient?.id) {
      setErrorMsg("Select or create a patient first.");
      return;
    }

    startTransition(async () => {
      const result = await recordConsultationAction({
        patientId: selectedPatient.id,
        consultationDate,
        chiefComplaint,
        illnessCategory,
        consultationNotes,
        medicineId,
        requestedQuantity: Number(requestedQuantity),
        requestNotes,
      });

      if (!result.success || !result.result) {
        setErrorMsg(result.error || "Failed to save consultation.");
        return;
      }

      setConsultationResult(result.result);
      setChiefComplaint("");
      setIllnessCategory("");
      setConsultationNotes("");
      setMedicineId("");
      setRequestedQuantity("1");
      setRequestNotes("");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
              <UserPlus className="size-5" />
            </span>
            <div>
              <h2 className="font-bold text-[#1E293B] dark:text-slate-100">
                Create Patient Record
              </h2>
              <p className="text-xs leading-5 text-[#64748B] dark:text-slate-400">
                Open a focused modal to create a new on-site patient without crowding the main consultation screen.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#475569] dark:text-slate-300">
              Keep the patient profile minimal for the MVP demo and create the record only when needed.
            </p>
            <Dialog open={isCreatePatientOpen} onOpenChange={setIsCreatePatientOpen}>
              <DialogTrigger asChild>
                <Button className="sm:min-w-[190px]">
                  <UserPlus className="size-4" />
                  Create New Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Patient</DialogTitle>
                  <DialogDescription>
                    Enter the basic patient details needed for the consultation-first flow.
                  </DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <form
                    id="create-patient-form"
                    onSubmit={handleCreatePatient}
                    className="space-y-4"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        required
                        className={fieldClassName}
                      />
                      <input
                        type="text"
                        placeholder="Middle name (optional)"
                        value={middleName}
                        onChange={(event) => setMiddleName(event.target.value)}
                        className={fieldClassName}
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        required
                        className={fieldClassName}
                      />
                      <input
                        type="text"
                        placeholder="Suffix (optional)"
                        value={suffix}
                        onChange={(event) => setSuffix(event.target.value)}
                        className={fieldClassName}
                      />
                      <input
                        type="number"
                        placeholder="Age"
                        min="0"
                        max="150"
                        value={age}
                        onChange={(event) => setAge(event.target.value)}
                        required
                        className={fieldClassName}
                      />
                      <select
                        value={sex}
                        onChange={(event) => setSex(event.target.value)}
                        required
                        className={fieldClassName}
                      >
                        <option value="">Sex</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <PatientAddressPicker
                      barangay={barangay}
                      cityMunicipality={cityMunicipality}
                      onBarangayChange={setBarangay}
                      onCityMunicipalityChange={setCityMunicipality}
                    />

                    <input
                      type="text"
                      placeholder="Contact number (optional)"
                      value={contactNumber}
                      onChange={(event) => setContactNumber(event.target.value)}
                      className={`w-full ${fieldClassName}`}
                    />
                  </form>
                </DialogBody>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    form="create-patient-form"
                    disabled={isPending}
                    className="sm:min-w-[180px]"
                  >
                    {isPending ? "Saving patient..." : "Save Patient Record"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-white/5 dark:text-teal-400">
              <Search className="size-5" />
            </span>
            <div>
              <h2 className="font-bold text-[#1E293B] dark:text-slate-100">
                Search Patients
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Find an existing patient before starting the consultation flow.
              </p>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search by code, name, or barangay"
            value={listQuery}
            onChange={(event) => setListQuery(event.target.value)}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
          />

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {filteredPatients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#E2E8F0] p-6 text-center text-sm text-[#64748B] dark:border-white/10 dark:text-slate-400">
                No patient records match your search yet.
              </div>
            ) : (
              filteredPatients.map((patient) => {
                const isActive = selectedPatient?.id === patient.id;

                return (
                  <Link
                    key={patient.id}
                    href={`/patients?patient=${patient.id}`}
                    className={`block rounded-2xl border px-4 py-3 transition ${
                      isActive
                        ? "border-[#2563EB] bg-[#EFF6FF] dark:border-[#60A5FA] dark:bg-[#2563EB]/10"
                        : "border-[#E2E8F0] bg-white hover:border-[#BFDBFE] hover:bg-slate-50 dark:border-white/10 dark:bg-[#0F172A] dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-[#1E293B] dark:text-slate-100">
                          {formatPatientName(patient)}
                        </p>
                        <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                          {patient.patient_code} - {patient.age} yrs - {patient.sex}
                        </p>
                      </div>
                      <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2563EB] dark:bg-white/5 dark:text-[#93C5FD]">
                        View
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {errorMsg && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 text-sm font-medium text-rose-700 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="rounded-2xl border border-green-100 bg-green-50/40 p-4 text-sm font-medium text-green-700 dark:border-green-950/20 dark:bg-green-950/10 dark:text-green-400">
            {successMsg}
          </div>
        )}

        {consultationResult && (
          <div className="rounded-3xl border border-cyan-100 bg-cyan-50/30 p-6 shadow-sm dark:border-cyan-950/20 dark:bg-cyan-950/10">
            <div className="flex items-start gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-cyan-600 text-white">
                <CheckCircle2 className="size-5" />
              </span>
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-cyan-900 dark:text-cyan-300">
                    Consultation Saved
                  </h3>
                  <p className="text-sm text-cyan-800/90 dark:text-cyan-300/90">
                    The patient consultation is now recorded and a medicine request has been prepared.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/dispense?patientCode=${encodeURIComponent(
                      consultationResult.patientCode,
                    )}&illnessCategory=${encodeURIComponent(
                      consultationResult.illnessCategory,
                    )}&medicineId=${encodeURIComponent(
                      consultationResult.medicineId,
                    )}&quantity=${consultationResult.quantity}&patientId=${consultationResult.patientId}&consultationId=${consultationResult.consultationId}&requestId=${consultationResult.requestId}`}
                    className="rounded-2xl bg-[#16A34A] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#15803D]"
                  >
                    Proceed to Dispense
                  </Link>
                  <Link
                    href={`/referrals?patientCode=${encodeURIComponent(
                      consultationResult.patientCode,
                    )}&medicineId=${encodeURIComponent(
                      consultationResult.medicineId,
                    )}&quantity=${consultationResult.quantity}&patientId=${consultationResult.patientId}&consultationId=${consultationResult.consultationId}&requestId=${consultationResult.requestId}`}
                    className="rounded-2xl bg-[#0891B2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0E7490]"
                  >
                    Proceed to Referral
                  </Link>
                </div>

                <p className="text-xs font-medium text-cyan-900/80 dark:text-cyan-300/80">
                  {consultationResult.hasLocalStock
                    ? "Local inventory appears sufficient for the requested quantity."
                    : consultationResult.hasReferralOptions
                      ? "Local inventory is not enough, but nearby center stock appears available for referral."
                      : "Local inventory is not enough. Manual review is still needed before fulfilling the request."}
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedPatient ? (
          <>
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#64748B] dark:text-slate-400">
                    Selected Patient
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-[#1E293B] dark:text-slate-100">
                    {formatPatientName(selectedPatient)}
                  </h2>
                  <p className="mt-2 text-sm text-[#64748B] dark:text-slate-400">
                    {selectedPatient.patient_code} - {selectedPatient.age} yrs - {selectedPatient.sex}
                  </p>
                  <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">
                    {selectedPatient.barangay}, {selectedPatient.city_municipality}
                  </p>
                </div>
                <span className="rounded-2xl bg-[#EFF6FF] px-3 py-1.5 text-xs font-bold text-[#2563EB] dark:bg-white/5 dark:text-[#93C5FD]">
                  On-site patient only
                </span>
              </div>
            </div>

            <form
              onSubmit={handleConsultationSubmit}
              className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-white/5 dark:text-amber-400">
                  <ClipboardPlus className="size-5" />
                </span>
                <div>
                  <h2 className="font-bold text-[#1E293B] dark:text-slate-100">
                    Record Consultation
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    Consultation first, then move into dispense or referral handling.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="date"
                  value={consultationDate}
                  onChange={(event) => setConsultationDate(event.target.value)}
                  required
                  className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
                <select
                  value={illnessCategory}
                  onChange={(event) => setIllnessCategory(event.target.value)}
                  required
                  className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                >
                  <option value="">Select illness category</option>
                  {ILLNESS_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                placeholder="Chief complaint"
                value={chiefComplaint}
                onChange={(event) => setChiefComplaint(event.target.value)}
                required
                rows={3}
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
              />

              <textarea
                placeholder="Consultation notes (optional)"
                value={consultationNotes}
                onChange={(event) => setConsultationNotes(event.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
              />

              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
                <select
                  value={medicineId}
                  onChange={(event) => setMedicineId(event.target.value)}
                  required
                  className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                >
                  <option value="">Select requested medicine</option>
                  {medicines.map((medicine) => (
                    <option key={medicine.id} value={medicine.id}>
                      {formatMedicineName(medicine)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={requestedQuantity}
                  onChange={(event) => setRequestedQuantity(event.target.value)}
                  required
                  className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>

              <textarea
                placeholder="Medicine request notes (optional)"
                value={requestNotes}
                onChange={(event) => setRequestNotes(event.target.value)}
                rows={2}
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
              />

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-2xl bg-[#0D9488] px-4 py-3 text-sm font-bold text-white shadow-md shadow-teal-500/10 transition hover:bg-[#0F766E] disabled:opacity-50"
              >
                {isPending ? "Saving consultation..." : "Save Consultation & Medicine Request"}
              </button>
            </form>

            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 dark:bg-white/5 dark:text-purple-400">
                  <Stethoscope className="size-5" />
                </span>
                <div>
                  <h2 className="font-bold text-[#1E293B] dark:text-slate-100">
                    Consultation History
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    Track consultation records, dispense logs, and referrals for this patient.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {consultations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#E2E8F0] p-6 text-center text-sm text-[#64748B] dark:border-white/10 dark:text-slate-400">
                    No consultations have been recorded for this patient yet.
                  </div>
                ) : (
                  consultations.map((consultation) => {
                    const relatedRequests = consultationRequests.filter(
                      (item) => item.consultation_id === consultation.id,
                    );

                    return (
                      <div
                        key={consultation.id}
                        className="rounded-2xl border border-[#E2E8F0] p-4 dark:border-white/10"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-bold text-[#1E293B] dark:text-slate-100">
                              {consultation.illness_category}
                            </p>
                            <p className="text-sm text-[#64748B] dark:text-slate-400">
                              {consultation.chief_complaint}
                            </p>
                          </div>
                          <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2563EB] dark:bg-white/5 dark:text-[#93C5FD]">
                            {consultation.prescription_status}
                          </span>
                        </div>

                        {consultation.consultation_notes && (
                          <p className="mt-3 text-sm text-[#475569] dark:text-slate-300">
                            {consultation.consultation_notes}
                          </p>
                        )}

                        {relatedRequests.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {relatedRequests.map((request) => (
                              <div
                                key={request.id}
                                className="rounded-2xl bg-[#F8FAFC] px-4 py-3 text-sm dark:bg-white/5"
                              >
                                <p className="font-semibold text-[#1E293B] dark:text-slate-100">
                                  {formatMedicineName(
                                    Array.isArray(request.medicine_master)
                                      ? request.medicine_master[0]
                                      : request.medicine_master,
                                  )}
                                </p>
                                <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                                  Qty requested: {request.requested_quantity} - Status: {request.status}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-green-50 text-green-700 dark:bg-white/5 dark:text-green-400">
                    <FileText className="size-5" />
                  </span>
                  <h2 className="font-bold text-[#1E293B] dark:text-slate-100">
                    Dispense History
                  </h2>
                </div>

                {dispenseHistory.length === 0 ? (
                  <p className="text-sm text-[#64748B] dark:text-slate-400">
                    No dispense logs are linked to this patient yet.
                  </p>
                ) : (
                  dispenseHistory.map((item) => {
                    const batch = Array.isArray(item.medicine_batches)
                      ? item.medicine_batches[0]
                      : item.medicine_batches;
                    const medicine = Array.isArray(batch?.medicine_master)
                      ? batch?.medicine_master[0]
                      : batch?.medicine_master;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#E2E8F0] p-4 text-sm dark:border-white/10"
                      >
                        <p className="font-semibold text-[#1E293B] dark:text-slate-100">
                          {formatMedicineName(medicine)}
                        </p>
                        <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                          {item.quantity_dispensed} {item.unit} - Batch {batch?.batch_number || "N/A"}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 dark:bg-white/5 dark:text-cyan-400">
                    <Stethoscope className="size-5" />
                  </span>
                  <h2 className="font-bold text-[#1E293B] dark:text-slate-100">
                    Referral History
                  </h2>
                </div>

                {referralHistory.length === 0 ? (
                  <p className="text-sm text-[#64748B] dark:text-slate-400">
                    No referrals are linked to this patient yet.
                  </p>
                ) : (
                  referralHistory.map((item) => {
                    const medicine = Array.isArray(item.medicine_master)
                      ? item.medicine_master[0]
                      : item.medicine_master;
                    const receivingCenter = Array.isArray(item.receiving_center)
                      ? item.receiving_center[0]
                      : item.receiving_center;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#E2E8F0] p-4 text-sm dark:border-white/10"
                      >
                        <p className="font-semibold text-[#1E293B] dark:text-slate-100">
                          {formatMedicineName(medicine)}
                        </p>
                        <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                          Qty requested: {item.quantity_requested} - Status: {item.status}
                        </p>
                        <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                          Receiving center: {receivingCenter?.center_name || receivingCenter?.barangay_name || "Unknown center"}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#E2E8F0] bg-white p-12 text-center shadow-sm dark:border-white/10 dark:bg-[#111827]">
            <p className="text-lg font-bold text-[#1E293B] dark:text-slate-100">
              No patient selected yet
            </p>
            <p className="mt-2 text-sm text-[#64748B] dark:text-slate-400">
              Create a patient record or select one from the list to start the consultation-first flow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
