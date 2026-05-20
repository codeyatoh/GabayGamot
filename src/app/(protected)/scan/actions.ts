"use server";

import {
  findMedicineMaster,
  createMedicineMaster,
  findMedicineBatch,
  upsertMedicineBatch,
  incrementBatchQuantity,
} from "@/lib/supabase/inventory";
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

    // Check if batch already exists at this center
    const existingBatch = await findMedicineBatch(
      medicine.id,
      center.id,
      payload.batchNumber
    );

    if (existingBatch) {
      // Increment quantity
      await incrementBatchQuantity(existingBatch.id, payload.quantity);
    } else {
      // Create new batch
      await upsertMedicineBatch({
        medicine_id: medicine.id,
        health_center_id: center.id,
        batch_number: payload.batchNumber,
        quantity: payload.quantity,
        expiry_date: payload.expiryDate,
        unit: sanitizedUnit,
        status: "active",
        created_by: user.id,
      });
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to save medicine batch.";
    console.error("Failed to save scanned medicine:", err);
    return { success: false, error: errorMessage };
  }
}
