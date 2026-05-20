import { ProtectedShell } from "@/components/foundation/protected-shell";
import { InventoryClient } from "./inventory-client";
import { getCurrentProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { getInventoryBatches, MedicineBatchWithDetails } from "@/lib/supabase/inventory";

export default async function InventoryPage() {
  const { user, profile } = await getCurrentProfile();
  
  let batches: MedicineBatchWithDetails[] = [];
  
  if (user && profile && profile.approval_status === "approved") {
    const supabase = await createClient();
    const { data: center } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (center) {
      batches = await getInventoryBatches(center.id);
    }
  }

  return (
    <ProtectedShell title="Medicine Inventory">
      <InventoryClient initialBatches={batches} />
    </ProtectedShell>
  );
}
