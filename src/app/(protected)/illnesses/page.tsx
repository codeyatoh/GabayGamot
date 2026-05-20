import { ProtectedShell } from "@/components/foundation/protected-shell";
import { IllnessClient } from "./illness-client";
import { getCurrentProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

export default async function IllnessesPage() {
  const { user, profile } = await getCurrentProfile();
  
  // Using explicit any to avoid deep typing of Supabase row result just for this array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentLogs: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let patients: any[] = [];
  
  if (user && profile && profile.approval_status === "approved") {
    const supabase = await createClient();
    
    // Resolve BHW center
    const { data: center } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (center) {
      const { data: logs } = await supabase
        .from("illness_logs")
        .select("*")
        .eq("health_center_id", center.id)
        .order("created_at", { ascending: false })
        .limit(50);

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
        
      if (logs) {
        recentLogs = logs;
      }

      if (patientRows) {
        patients = patientRows;
      }
    }
  }

  return (
    <ProtectedShell title="Illness Cases & Consultations">
      <IllnessClient recentLogs={recentLogs} patients={patients} />
    </ProtectedShell>
  );
}
