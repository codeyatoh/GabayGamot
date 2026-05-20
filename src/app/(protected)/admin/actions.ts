"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAuditEvent } from "@/lib/supabase/audit";
import { getCurrentProfile } from "@/lib/supabase/profiles";

async function ensureSuperAdmin() {
  const { profile } = await getCurrentProfile();
  if (profile?.role !== "super_admin") {
    throw new Error("Unauthorized access. Only super admins can approve or reject accounts.");
  }
}

export async function approveBhw(bhwId: string) {
  await ensureSuperAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ approval_status: "approved" })
    .eq("id", bhwId);

  if (error) {
    throw new Error(`Failed to approve BHW: ${error.message}`);
  }

  await recordAuditEvent({
    eventType: "bhw_approved",
    entityType: "profile",
    entityId: bhwId,
    summary: "Approved a BHW account.",
    metadata: {
      bhw_id: bhwId,
    },
  });

  revalidatePath("/admin");
}

export async function rejectBhw(bhwId: string) {
  await ensureSuperAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ approval_status: "rejected" })
    .eq("id", bhwId);

  if (error) {
    throw new Error(`Failed to reject BHW: ${error.message}`);
  }

  await recordAuditEvent({
    eventType: "bhw_rejected",
    entityType: "profile",
    entityId: bhwId,
    summary: "Rejected a BHW account.",
    metadata: {
      bhw_id: bhwId,
    },
  });

  revalidatePath("/admin");
}
