"use server";

import { recordAuditEvent } from "@/lib/supabase/audit";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface CreateReferralPayload {
  receivingCenterId: string;
  medicineId: string;
  patientCode: string;
  quantityRequested: number;
  patientId?: string;
  consultationId?: string;
  requestId?: string;
}

export async function createReferralAction(payload: CreateReferralPayload) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) throw new Error("Unauthorized: Please log in.");
    const userId = authData.user.id;

    // 2. Resolve referring center
    const { data: center, error: centerError } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", userId)
      .single();

    if (centerError || !center) throw new Error("No health center assigned to your profile.");
    if (center.id === payload.receivingCenterId) throw new Error("Cannot refer to your own center.");

    if (payload.quantityRequested <= 0) throw new Error("Quantity must be greater than zero.");

    let linkedPatientId: string | null = null;
    let linkedConsultationId: string | null = null;
    let consultationContext:
      | {
          chief_complaint: string;
          illness_category: string;
          consultation_notes: string | null;
        }
      | null = null;

    if (payload.patientId) {
      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("id", payload.patientId)
        .eq("health_center_id", center.id)
        .maybeSingle();

      linkedPatientId = patient?.id ?? null;
    }

    if (payload.consultationId) {
      const { data: consultation } = await supabase
        .from("consultations")
        .select("id, chief_complaint, illness_category, consultation_notes")
        .eq("id", payload.consultationId)
        .eq("health_center_id", center.id)
        .maybeSingle();

      if (consultation) {
        linkedConsultationId = consultation.id;
        consultationContext = {
          chief_complaint: consultation.chief_complaint,
          illness_category: consultation.illness_category,
          consultation_notes: consultation.consultation_notes,
        };
      }
    }

    // 3. Insert pending referral
    const { data: newReferral, error: insertError } = await supabase
      .from("referrals")
      .insert({
        referring_center_id: center.id,
        receiving_center_id: payload.receivingCenterId,
        created_by: userId,
        patient_code: payload.patientCode.trim(),
        patient_id: linkedPatientId,
        consultation_id: linkedConsultationId,
        chief_complaint: consultationContext?.chief_complaint ?? null,
        illness_category: consultationContext?.illness_category ?? null,
        consultation_notes: consultationContext?.consultation_notes ?? null,
        medicine_id: payload.medicineId,
        quantity_requested: payload.quantityRequested,
        status: "pending"
      })
      .select("id")
      .single();

    if (insertError || !newReferral) throw new Error("Failed to create referral request.");

    if (payload.requestId) {
      const { error: requestUpdateError } = await supabase
        .from("consultation_medicine_requests")
        .update({ status: "referred" })
        .eq("id", payload.requestId)
        .eq("consultation_id", linkedConsultationId ?? "");

      if (requestUpdateError) {
        console.error("Failed to update consultation medicine request status:", requestUpdateError);
      }
    }

    if (linkedConsultationId) {
      const { error: consultationUpdateError } = await supabase
        .from("consultations")
        .update({ prescription_status: "referred" })
        .eq("id", linkedConsultationId)
        .eq("health_center_id", center.id);

      if (consultationUpdateError) {
        console.error("Failed to update consultation prescription status:", consultationUpdateError);
      }
    }

    await recordAuditEvent({
      eventType: "referral_created",
      entityType: "referral",
      entityId: newReferral.id,
      healthCenterId: center.id,
      summary: `Created referral request for ${payload.patientCode.trim()}.`,
      metadata: {
        receiving_center_id: payload.receivingCenterId,
        medicine_id: payload.medicineId,
        patient_code: payload.patientCode.trim(),
        quantity_requested: payload.quantityRequested,
        consultation_id: linkedConsultationId,
      },
    });

    revalidatePath("/referrals");
    revalidatePath("/dashboard");
    revalidatePath("/patients");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function completeReferralAction(referralId: string, batchId: string) {
  try {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) throw new Error("Unauthorized");
    const userId = authData.user.id;

    // Resolve our center
    const { data: center } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", userId)
      .single();

    if (!center) throw new Error("No health center assigned.");

    // Verify referral belongs to us and is pending
    const { data: referral, error: refError } = await supabase
      .from("referrals")
      .select("*")
      .eq("id", referralId)
      .eq("receiving_center_id", center.id)
      .eq("status", "pending")
      .single();

    if (refError || !referral) throw new Error("Referral not found or already processed.");

    // Verify batch belongs to us and matches medicine
    const { data: batch, error: batchError } = await supabase
      .from("medicine_batches")
      .select("*")
      .eq("id", batchId)
      .eq("health_center_id", center.id)
      .eq("medicine_id", referral.medicine_id)
      .single();

    if (batchError || !batch) throw new Error("Selected batch is invalid or does not match medicine.");
    if (batch.quantity < referral.quantity_requested) {
      throw new Error(`Insufficient stock in selected batch. Only ${batch.quantity} remaining.`);
    }

    // Deduct stock using optimistic locking
    const { error: updateBatchError } = await supabase
      .from("medicine_batches")
      .update({ quantity: batch.quantity - referral.quantity_requested })
      .eq("id", batchId)
      .gte("quantity", referral.quantity_requested);

    if (updateBatchError) throw new Error("Failed to deduct stock due to concurrent updates.");

    // Update referral status
    const { error: updateRefError } = await supabase
      .from("referrals")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", referralId);

    if (updateRefError) {
      console.error("Stock deducted but referral status failed to update", updateRefError);
      throw new Error("Stock deducted but failed to complete referral.");
    }

    await recordAuditEvent({
      eventType: "referral_completed",
      entityType: "referral",
      entityId: referralId,
      healthCenterId: center.id,
      summary: `Completed referral release for ${referral.patient_code}.`,
      metadata: {
        batch_id: batchId,
        medicine_id: referral.medicine_id,
        patient_code: referral.patient_code,
        quantity_released: referral.quantity_requested,
      },
    });

    revalidatePath("/referrals");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/patients");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function cancelReferralAction(referralId: string) {
  try {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) throw new Error("Unauthorized");
    const userId = authData.user.id;

    // Resolve center
    const { data: center } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", userId)
      .single();

    if (!center) throw new Error("No health center assigned.");

    // Only update if it belongs to us (either as sender or receiver) and is still pending
    const { error: updateError } = await supabase
      .from("referrals")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", referralId)
      .eq("status", "pending")
      .or(`referring_center_id.eq.${center.id},receiving_center_id.eq.${center.id}`);

    if (updateError) throw new Error("Failed to cancel referral.");

    await recordAuditEvent({
      eventType: "referral_cancelled",
      entityType: "referral",
      entityId: referralId,
      healthCenterId: center.id,
      summary: "Cancelled a pending referral request.",
      metadata: {
        referral_id: referralId,
      },
    });

    revalidatePath("/referrals");
    revalidatePath("/dashboard");
    revalidatePath("/patients");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred." };
  }
}
