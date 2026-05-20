"use server";

import { revalidatePath } from "next/cache";
import { updateMedicineBatch, deleteMedicineBatch } from "@/lib/supabase/inventory";
import { getCurrentProfile } from "@/lib/supabase/profiles";
import { recordAuditEvent } from "@/lib/supabase/audit";
import { createClient } from "@/lib/supabase/server";

/**
 * Update an existing medicine batch's quantity, unit, and expiry date.
 * Verifies that the BHW is approved and owns the health center containing the batch.
 */
export async function updateInventoryBatchAction(
  batchId: string,
  payload: {
    quantity: number;
    unit: string;
    expiryDate: string;
  }
) {
  try {
    const { user, profile } = await getCurrentProfile();
    if (!user || !profile) {
      throw new Error("You must be logged in to update inventory.");
    }

    if (profile.approval_status !== "approved") {
      throw new Error("Your account is pending admin approval.");
    }

    // Validate inputs
    if (payload.quantity < 0) {
      throw new Error("Quantity cannot be negative.");
    }
    const VALID_UNITS = ["tabs", "caps", "mL", "vials", "sachets", "g", "pcs"];
    const sanitizedUnit = payload.unit?.trim();
    if (!VALID_UNITS.includes(sanitizedUnit)) {
      throw new Error(`Invalid unit "${sanitizedUnit}".`);
    }

    const supabase = await createClient();

    const { data: batch, error: batchError } = await supabase
      .from("medicine_batches")
      .select("health_center_id")
      .eq("id", batchId)
      .maybeSingle();

    if (batchError || !batch) {
      throw new Error("Medicine batch not found.");
    }

    // Verify ownership if not super_admin
    if (profile.role !== "super_admin") {
      const { data: center, error: centerError } = await supabase
        .from("health_centers")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (centerError || !center) {
        throw new Error("Unable to locate your health center record.");
      }

      if (batch.health_center_id !== center.id) {
        throw new Error("Access denied: This batch does not belong to your health center.");
      }
    }

    // Perform database update
    await updateMedicineBatch(batchId, {
      quantity: payload.quantity,
      unit: sanitizedUnit,
      expiry_date: payload.expiryDate,
    });

    await recordAuditEvent({
      eventType: "inventory_batch_updated",
      entityType: "medicine_batch",
      entityId: batchId,
      healthCenterId: batch.health_center_id,
      summary: "Updated inventory batch quantity, unit, or expiry date.",
      metadata: {
        quantity: payload.quantity,
        unit: sanitizedUnit,
        expiry_date: payload.expiryDate,
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: errMsg };
  }
}

/**
 * Delete a medicine batch from a health center's inventory.
 * Verifies that the BHW is approved and owns the health center containing the batch.
 */
export async function deleteInventoryBatchAction(batchId: string) {
  try {
    const { user, profile } = await getCurrentProfile();
    if (!user || !profile) {
      throw new Error("You must be logged in to delete inventory.");
    }

    if (profile.approval_status !== "approved") {
      throw new Error("Your account is pending admin approval.");
    }

    const supabase = await createClient();

    const { data: batch, error: batchError } = await supabase
      .from("medicine_batches")
      .select("health_center_id")
      .eq("id", batchId)
      .maybeSingle();

    if (batchError || !batch) {
      throw new Error("Medicine batch not found.");
    }

    // Verify ownership if not super_admin
    if (profile.role !== "super_admin") {
      const { data: center, error: centerError } = await supabase
        .from("health_centers")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (centerError || !center) {
        throw new Error("Unable to locate your health center record.");
      }

      if (batch.health_center_id !== center.id) {
        throw new Error("Access denied: This batch does not belong to your health center.");
      }
    }

    // Perform database deletion
    await deleteMedicineBatch(batchId);

    await recordAuditEvent({
      eventType: "inventory_batch_deleted",
      entityType: "medicine_batch",
      entityId: batchId,
      healthCenterId: batch.health_center_id,
      summary: "Deleted an inventory batch from the health center cabinet.",
      metadata: {
        batch_id: batchId,
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: errMsg };
  }
}
