import { ProtectedShell } from "@/components/foundation/protected-shell";
import { ReferralsClient } from "./referrals-client";
import { getCurrentProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function readSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  return typeof value === "string" ? value : value?.[0];
}

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user, profile } = await getCurrentProfile();
  const params = searchParams ? await searchParams : {};
  
  // Using explicit any to avoid massive nested typing for this complex join
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let myCenter: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let medicines: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let referrals: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let myBatches: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const availableCentersMap = new Map<string, any>(); // Map medicine_id to array of centers with stock

  if (user && profile && profile.approval_status === "approved") {
    const supabase = await createClient();
    
    // Resolve BHW center
    const { data: center } = await supabase
      .from("health_centers")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (center) {
      myCenter = center;

      // 1. Fetch all medicine masters
      const { data: meds } = await supabase
        .from("medicine_master")
        .select("*")
        .order("generic_name");
      if (meds) medicines = meds;

      // 2. Fetch referrals (incoming and outgoing)
      const { data: refs } = await supabase
        .from("referrals")
        .select(`
          *,
          medicine_master(*),
          referring_center:health_centers!referring_center_id(name:center_name, address:street_address),
          receiving_center:health_centers!receiving_center_id(name:center_name, address:street_address)
        `)
        .or(`referring_center_id.eq.${center.id},receiving_center_id.eq.${center.id}`)
        .order("created_at", { ascending: false });
      if (refs) referrals = refs;

      // 3. Fetch our own active batches for fulfilling incoming referrals
      const todayStr = new Date().toISOString().split("T")[0];
      const { data: batches } = await supabase
        .from("medicine_batches")
        .select("*, medicine_master(*)")
        .eq("health_center_id", center.id)
        .gt("quantity", 0)
        .gte("expiry_date", todayStr);
      if (batches) myBatches = batches;

      // 4. Discover nearby stock for referring out
      // Fetch all global batches that are not ours, active, and not expired
      const { data: globalBatches } = await supabase
        .from("medicine_batches")
        .select(`
          quantity,
          medicine_id,
          health_center_id,
          health_centers(name:center_name, address:street_address, latitude, longitude)
        `)
        .neq("health_center_id", center.id)
        .gt("quantity", 0)
        .gte("expiry_date", todayStr);

      if (globalBatches && center.latitude && center.longitude) {
        globalBatches.forEach((gb) => {
          // Flatten the structure
          const hc = Array.isArray(gb.health_centers) ? gb.health_centers[0] : gb.health_centers;
          if (!hc || !hc.latitude || !hc.longitude) return;

          const distance = getDistanceInKm(
            center.latitude!, center.longitude!,
            hc.latitude, hc.longitude
          );

          if (!availableCentersMap.has(gb.medicine_id)) {
            availableCentersMap.set(gb.medicine_id, new Map());
          }
          
          const medCenters = availableCentersMap.get(gb.medicine_id);
          
          if (!medCenters.has(gb.health_center_id)) {
            medCenters.set(gb.health_center_id, {
              id: gb.health_center_id,
              name: hc.name,
              address: hc.address,
              distanceKm: distance,
              totalQuantity: 0
            });
          }
          
          // Accumulate quantity across multiple batches of the same medicine in that center
          const c = medCenters.get(gb.health_center_id);
          c.totalQuantity += gb.quantity;
        });
      }
    }
  }

  // Convert the complex Map to a flat JSON-friendly object for the client
  // { [medicineId]: Array<{ id, name, address, distanceKm, totalQuantity }> }
  const centersWithStock: Record<
    string,
    {
      id: string;
      name: string;
      address: string;
      distanceKm: number;
      totalQuantity: number;
    }[]
  > = {};
  for (const [medId, centersMap] of availableCentersMap.entries()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const centersArr: any[] = Array.from(centersMap.values());
    centersArr.sort((a, b) => a.distanceKm - b.distanceKm);
    centersWithStock[medId] = centersArr;
  }

  const initialFlow = {
    patientCode: readSearchParam(params.patientCode),
    medicineId: readSearchParam(params.medicineId),
    quantity: readSearchParam(params.quantity),
    patientId: readSearchParam(params.patientId),
    consultationId: readSearchParam(params.consultationId),
    requestId: readSearchParam(params.requestId),
  };

  const flowKey = [
    initialFlow.patientCode,
    initialFlow.medicineId,
    initialFlow.quantity,
    initialFlow.patientId,
    initialFlow.consultationId,
    initialFlow.requestId,
  ].join(":");

  return (
    <ProtectedShell title="Referral Suggestions">
      <ReferralsClient 
        key={flowKey}
        myCenterId={myCenter?.id} 
        medicines={medicines}
        referrals={referrals}
        centersWithStock={centersWithStock}
        myBatches={myBatches}
        initialFlow={initialFlow}
      />
    </ProtectedShell>
  );
}
