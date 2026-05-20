import { ProtectedShell } from "@/components/foundation/protected-shell";
import { DispenseClient } from "./dispense-client";
import { getCurrentProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { getInventoryBatches, MedicineBatchWithDetails } from "@/lib/supabase/inventory";

function readSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  return typeof value === "string" ? value : value?.[0];
}

export default async function DispensePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user, profile } = await getCurrentProfile();
  const params = searchParams ? await searchParams : {};
  
  let availableBatches: MedicineBatchWithDetails[] = [];
  let outOfStockBatches: MedicineBatchWithDetails[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let patients: any[] = [];
  
  if (user && profile && profile.approval_status === "approved") {
    const supabase = await createClient();
    const { data: center } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (center) {
      const allBatches = await getInventoryBatches(center.id);
      availableBatches = allBatches.filter(b => b.quantity > 0);
      outOfStockBatches = allBatches.filter(b => b.quantity === 0);

      const { data: patientRows } = await supabase
        .from("patients")
        .select(`
          id,
          patient_code,
          first_name,
          middle_name,
          last_name,
          suffix,
          age,
          sex,
          barangay,
          city_municipality
        `)
        .eq("health_center_id", center.id)
        .order("updated_at", { ascending: false })
        .limit(100);

      if (patientRows) {
        patients = patientRows;
      }
    }
  }

  const initialFlow = {
    patientCode: readSearchParam(params.patientCode),
    illnessCategory: readSearchParam(params.illnessCategory),
    medicineId: readSearchParam(params.medicineId),
    quantity: readSearchParam(params.quantity),
    patientId: readSearchParam(params.patientId),
    consultationId: readSearchParam(params.consultationId),
    requestId: readSearchParam(params.requestId),
  };

  const flowKey = [
    initialFlow.patientCode,
    initialFlow.illnessCategory,
    initialFlow.medicineId,
    initialFlow.quantity,
    initialFlow.patientId,
    initialFlow.consultationId,
    initialFlow.requestId,
  ].join(":");

  return (
    <ProtectedShell title="Dispense Medicine Workspace">
      <DispenseClient 
        key={flowKey}
        availableBatches={availableBatches} 
        outOfStockBatches={outOfStockBatches} 
        patients={patients}
        initialFlow={initialFlow}
      />
    </ProtectedShell>
  );
}
