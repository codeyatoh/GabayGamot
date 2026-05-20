import { ProtectedShell } from "@/components/foundation/protected-shell";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/profiles";

import { PatientsClient } from "./patients-client";

function readSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  return typeof value === "string" ? value : value?.[0];
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user, profile } = await getCurrentProfile();
  const params = searchParams ? await searchParams : {};
  const requestedPatientId = readSearchParam(params.patient);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let patients: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let medicines: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let selectedPatient: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consultations: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consultationRequests: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dispenseHistory: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let referralHistory: any[] = [];

  if (user && profile && profile.approval_status === "approved") {
    const supabase = await createClient();

    const { data: center } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (center) {
      const { data: patientRows } = await supabase
        .from("patients")
        .select("*")
        .eq("health_center_id", center.id)
        .order("updated_at", { ascending: false })
        .limit(100);

      if (patientRows) {
        patients = patientRows;
      }

      const { data: medicineRows } = await supabase
        .from("medicine_master")
        .select("id, generic_name, brand_name, strength, prescription_required")
        .order("generic_name", { ascending: true });

      if (medicineRows) {
        medicines = medicineRows;
      }

      const selectedPatientId = requestedPatientId || patients[0]?.id;

      if (selectedPatientId) {
        const { data: patientDetail } = await supabase
          .from("patients")
          .select("*")
          .eq("id", selectedPatientId)
          .eq("health_center_id", center.id)
          .maybeSingle();

        selectedPatient = patientDetail;

        if (selectedPatient) {
          const { data: consultationRows } = await supabase
            .from("consultations")
            .select("*")
            .eq("patient_id", selectedPatient.id)
            .eq("health_center_id", center.id)
            .order("consultation_date", { ascending: false });

          if (consultationRows) {
            consultations = consultationRows;
          }

          if (consultations.length > 0) {
            const consultationIds = consultations.map((item) => item.id);
            const { data: requestRows } = await supabase
              .from("consultation_medicine_requests")
              .select(`
                *,
                medicine_master (
                  generic_name,
                  brand_name,
                  strength
                )
              `)
              .in("consultation_id", consultationIds)
              .order("created_at", { ascending: false });

            if (requestRows) {
              consultationRequests = requestRows;
            }
          }

          const { data: dispenseRows } = await supabase
            .from("dispense_logs")
            .select(`
              *,
              medicine_batches (
                batch_number,
                medicine_master (
                  generic_name,
                  brand_name,
                  strength
                )
              )
            `)
            .eq("patient_id", selectedPatient.id)
            .order("dispensed_at", { ascending: false });

          if (dispenseRows) {
            dispenseHistory = dispenseRows;
          }

          const { data: referralRows } = await supabase
            .from("referrals")
            .select(`
              *,
              medicine_master (
                generic_name,
                brand_name,
                strength
              ),
              receiving_center:health_centers!receiving_center_id (
                center_name,
                barangay_name
              ),
              referring_center:health_centers!referring_center_id (
                center_name,
                barangay_name
              )
            `)
            .eq("patient_id", selectedPatient.id)
            .order("created_at", { ascending: false });

          if (referralRows) {
            referralHistory = referralRows;
          }
        }
      }
    }
  }

  return (
    <ProtectedShell title="Patients & Consultations">
      <PatientsClient
        patients={patients}
        medicines={medicines}
        selectedPatient={selectedPatient}
        consultations={consultations}
        consultationRequests={consultationRequests}
        dispenseHistory={dispenseHistory}
        referralHistory={referralHistory}
      />
    </ProtectedShell>
  );
}
