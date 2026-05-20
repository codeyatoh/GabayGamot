"use server";

import { recordAuditEvent } from "@/lib/supabase/audit";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface DispensePayload {
  batchId: string;
  patientCode: string;
  illnessCategory: string;
  quantityDispensed: number;
  patientId?: string;
  consultationId?: string;
  requestId?: string;
}

export async function dispenseStockAction(payload: DispensePayload) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      throw new Error("Unauthorized: Please log in.");
    }
    const userId = authData.user.id;

    // 2. Get profile and verify BHW approval
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, approval_status")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new Error("Failed to verify user profile.");
    }

    if (profile.role !== "bhw" || profile.approval_status !== "approved") {
      throw new Error("Unauthorized: Only approved BHWs can dispense medicines.");
    }

    // 3. Resolve health center
    const { data: healthCenter, error: centerError } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", userId)
      .single();

    if (centerError || !healthCenter) {
      throw new Error("No health center assigned to your profile.");
    }

    let linkedPatientId: string | null = null;
    let linkedConsultationId: string | null = null;

    if (payload.patientId) {
      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("id", payload.patientId)
        .eq("health_center_id", healthCenter.id)
        .maybeSingle();

      linkedPatientId = patient?.id ?? null;
    }

    if (payload.consultationId) {
      const { data: consultation } = await supabase
        .from("consultations")
        .select("id")
        .eq("id", payload.consultationId)
        .eq("health_center_id", healthCenter.id)
        .maybeSingle();

      linkedConsultationId = consultation?.id ?? null;
    }

    // 4. Validate quantity
    if (payload.quantityDispensed <= 0) {
      throw new Error("Dispense quantity must be greater than zero.");
    }

    // 5. Fetch batch and verify it belongs to the center
    const { data: batch, error: batchError } = await supabase
      .from("medicine_batches")
      .select("*, medicine_master(generic_name, brand_name, strength)")
      .eq("id", payload.batchId)
      .eq("health_center_id", healthCenter.id)
      .single();

    if (batchError || !batch) {
      throw new Error("Medicine batch not found or does not belong to your center.");
    }

    if (batch.quantity < payload.quantityDispensed) {
      throw new Error(`Insufficient stock. Only ${batch.quantity} ${batch.unit} remaining.`);
    }

    // 6. Deduct stock using optimistic locking (gte check)
    const { error: updateError } = await supabase
      .from("medicine_batches")
      .update({ quantity: batch.quantity - payload.quantityDispensed })
      .eq("id", batch.id)
      .gte("quantity", payload.quantityDispensed); // Ensures stock hasn't dropped below what we need in the meantime

    if (updateError) {
      throw new Error("Failed to deduct stock. Please try again.");
    }

    // 7. Insert dispense log
    const { data: log, error: logError } = await supabase
      .from("dispense_logs")
      .insert({
        health_center_id: healthCenter.id,
        batch_id: batch.id,
        dispensed_by: userId,
        patient_code: payload.patientCode,
        patient_id: linkedPatientId,
        consultation_id: linkedConsultationId,
        illness_category: payload.illnessCategory,
        quantity_dispensed: payload.quantityDispensed,
        unit: batch.unit,
      })
      .select()
      .single();

    if (logError) {
      // NOTE: In a production system we'd use a postgres RPC transaction to avoid this partial failure state,
      // but for this phase we log the error if insertion fails post-deduction.
      console.error("Stock deducted but log failed to insert:", logError);
      throw new Error("Stock deducted but failed to record dispense log.");
    }

    if (payload.requestId) {
      const { error: requestUpdateError } = await supabase
        .from("consultation_medicine_requests")
        .update({ status: "dispensed" })
        .eq("id", payload.requestId)
        .eq("consultation_id", linkedConsultationId ?? "");

      if (requestUpdateError) {
        console.error("Failed to update consultation medicine request status:", requestUpdateError);
      }
    }

    if (linkedConsultationId) {
      const { error: consultationUpdateError } = await supabase
        .from("consultations")
        .update({ prescription_status: "dispensed" })
        .eq("id", linkedConsultationId)
        .eq("health_center_id", healthCenter.id);

      if (consultationUpdateError) {
        console.error("Failed to update consultation prescription status:", consultationUpdateError);
      }
    }

    // 8. Revalidate paths
    revalidatePath("/dispense");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/patients");

    // 9. Format response for receipt
    // Handle the array/object return type from the medicine_master join safely
    const medMaster = Array.isArray(batch.medicine_master) 
      ? batch.medicine_master[0] 
      : batch.medicine_master;
      
    const medicineName = medMaster 
      ? `${medMaster.generic_name} ${medMaster.brand_name ? `(${medMaster.brand_name})` : ""} ${medMaster.strength}`
      : "Unknown Medicine";

    await recordAuditEvent({
      eventType: "medicine_dispensed",
      entityType: "dispense_log",
      entityId: log.id,
      healthCenterId: healthCenter.id,
      summary: `Dispensed ${payload.quantityDispensed} ${batch.unit} of ${medicineName} to ${payload.patientCode}.`,
      metadata: {
        batch_id: batch.id,
        batch_number: batch.batch_number,
        medicine_name: medicineName,
        patient_code: payload.patientCode,
        consultation_id: linkedConsultationId,
        quantity_dispensed: payload.quantityDispensed,
        unit: batch.unit,
      },
    });

    return {
      success: true,
      receipt: {
        medicineName,
        batchNumber: batch.batch_number,
        quantity: payload.quantityDispensed,
        unit: batch.unit,
        patientCode: payload.patientCode,
        timestamp: log.dispensed_at,
      }
    };

  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}
