"use server";

import {
  findMedicineMaster,
  createMedicineMaster,
  findMedicineBatch,
  upsertMedicineBatch,
  incrementBatchQuantity,
} from "@/lib/supabase/inventory";
import { recordAuditEvent } from "@/lib/supabase/audit";
import { getCurrentProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

export async function saveScannedMedicineAction(payload: {
  genericName: string;
  brandName: string | null;
  strength: string;
  dosageForm: string;
  category: string | null;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unit?: string;
}) {
  try {
    const { user, profile } = await getCurrentProfile();
    if (!user || !profile) {
      throw new Error("You must be logged in to save inventory.");
    }

    if (profile.approval_status !== "approved") {
      throw new Error("Your health center account is pending admin approval.");
    }

    // Validate unit against known dispensing base units
    const VALID_UNITS = ["tabs", "caps", "mL", "vials", "sachets", "g", "pcs"];
    const sanitizedUnit = payload.unit?.trim() || "pcs";
    if (!VALID_UNITS.includes(sanitizedUnit)) {
      throw new Error(`Invalid unit "${sanitizedUnit}". Accepted units: ${VALID_UNITS.join(", ")}.`);
    }

    // Load user's health center
    const supabase = await createClient();
    const { data: center, error: centerError } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (centerError || !center) {
      throw new Error("Unable to locate a health center matching your account. Make sure you complete your profile.");
    }

    // Find or create medicine master
    let medicine = await findMedicineMaster(
      payload.genericName,
      payload.brandName,
      payload.strength,
      payload.dosageForm
    );

    if (!medicine) {
      medicine = await createMedicineMaster({
        generic_name: payload.genericName,
        brand_name: payload.brandName || null,
        strength: payload.strength,
        dosage_form: payload.dosageForm,
        category: payload.category || null,
        prescription_required: false,
      });
    }

    let savedBatchId: string | null = null;
    let inventoryEventType = "inventory_batch_created";

    // Check if batch already exists at this center
    const existingBatch = await findMedicineBatch(
      medicine.id,
      center.id,
      payload.batchNumber
    );

    if (existingBatch) {
      // Increment quantity
      const updatedBatch = await incrementBatchQuantity(existingBatch.id, payload.quantity);
      savedBatchId = updatedBatch.id;
      inventoryEventType = "inventory_batch_incremented";
    } else {
      // Create new batch
      const newBatch = await upsertMedicineBatch({
        medicine_id: medicine.id,
        health_center_id: center.id,
        batch_number: payload.batchNumber,
        quantity: payload.quantity,
        expiry_date: payload.expiryDate,
        unit: sanitizedUnit,
        status: "active",
        created_by: user.id,
      });
      savedBatchId = newBatch.id;
    }

    await recordAuditEvent({
      eventType: inventoryEventType,
      entityType: "medicine_batch",
      entityId: savedBatchId,
      healthCenterId: center.id,
      summary: `${existingBatch ? "Incremented" : "Created"} scanned inventory batch ${payload.batchNumber}.`,
      metadata: {
        medicine_id: medicine.id,
        generic_name: payload.genericName,
        brand_name: payload.brandName,
        strength: payload.strength,
        batch_number: payload.batchNumber,
        quantity_added: payload.quantity,
        unit: sanitizedUnit,
      },
    });

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to save medicine batch.";
    console.error("Failed to save scanned medicine:", err);
    return { success: false, error: errorMessage };
  }
}

export async function checkDatabaseMatchAction(payload: {
  genericName: string;
  brandName: string | null;
  strength: string;
  dosageForm: string;
  batchNumber: string;
}) {
  try {
    const { user, profile } = await getCurrentProfile();
    if (!user || !profile) {
      throw new Error("You must be logged in.");
    }

    if (profile.approval_status !== "approved") {
      throw new Error("Your account is pending admin approval.");
    }

    const supabase = await createClient();
    
    // Find health center
    const { data: center, error: centerError } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (centerError || !center) {
      throw new Error("Health center not found.");
    }

    const sanitizedBrand = !payload.brandName || payload.brandName.trim() === "" || payload.brandName.trim().toUpperCase() === "N/A"
      ? null
      : payload.brandName.trim();

    // 1. Search medicine_master
    const medicine = await findMedicineMaster(
      payload.genericName,
      sanitizedBrand,
      payload.strength,
      payload.dosageForm
    );

    if (!medicine) {
      return {
        success: true,
        matchType: "new_medicine" as const,
        medicine: null,
        matchingBatch: null,
        existingBatches: [],
      };
    }

    // 2. Fetch all batches for this medicine at this center
    const { data: batches, error: batchesError } = await supabase
      .from("medicine_batches")
      .select("*")
      .eq("medicine_id", medicine.id)
      .eq("health_center_id", center.id);

    if (batchesError) {
      throw new Error(`Failed to fetch batches: ${batchesError.message}`);
    }

    // Check if the current scanned batch exists
    const matchingBatch = batches?.find(
      (b) => b.batch_number.toLowerCase().trim() === payload.batchNumber.toLowerCase().trim()
    ) || null;

    return {
      success: true,
      matchType: matchingBatch ? ("existing_batch" as const) : ("existing_medicine_new_batch" as const),
      medicine,
      matchingBatch,
      existingBatches: batches || [],
    };
  } catch (err) {
    console.error("Match action error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to query database.",
      matchType: "error" as const,
      medicine: null,
      matchingBatch: null,
      existingBatches: [],
    };
  }
}
