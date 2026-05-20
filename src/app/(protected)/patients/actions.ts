"use server";

import { revalidatePath } from "next/cache";

import { recordAuditEvent } from "@/lib/supabase/audit";
import { createClient } from "@/lib/supabase/server";

interface CreatePatientPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  age: number;
  sex: string;
  barangay: string;
  cityMunicipality: string;
  contactNumber?: string;
}

interface RecordConsultationPayload {
  patientId: string;
  consultationDate: string;
  chiefComplaint: string;
  illnessCategory: string;
  consultationNotes?: string;
  medicineId: string;
  requestedQuantity: number;
  requestNotes?: string;
}

async function resolveApprovedCenterContext() {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    throw new Error("Unauthorized: Please log in.");
  }

  const userId = authData.user.id;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, approval_status")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error("Failed to verify user profile.");
  }

  if (profile.role !== "bhw" || profile.approval_status !== "approved") {
    throw new Error("Unauthorized: Only approved BHWs can manage patients and consultations.");
  }

  const { data: healthCenter, error: centerError } = await supabase
    .from("health_centers")
    .select("id")
    .eq("profile_id", userId)
    .single();

  if (centerError || !healthCenter) {
    throw new Error("No health center assigned to your profile.");
  }

  return { supabase, userId, healthCenterId: healthCenter.id };
}

function generatePatientCode() {
  const now = new Date();
  const datePart = `${now.getFullYear().toString().slice(-2)}${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `PAT-${datePart}-${randomPart}`;
}

export async function createPatientAction(payload: CreatePatientPayload) {
  try {
    const { supabase, userId, healthCenterId } = await resolveApprovedCenterContext();

    if (!payload.firstName.trim() || !payload.lastName.trim()) {
      throw new Error("First name and last name are required.");
    }

    if (!payload.barangay.trim() || !payload.cityMunicipality.trim()) {
      throw new Error("Barangay and city or municipality are required.");
    }

    if (!Number.isFinite(payload.age) || payload.age < 0 || payload.age > 150) {
      throw new Error("Age must be a valid number between 0 and 150.");
    }

    const { data: patient, error } = await supabase
      .from("patients")
      .insert({
        patient_code: generatePatientCode(),
        first_name: payload.firstName.trim(),
        middle_name: payload.middleName?.trim() || null,
        last_name: payload.lastName.trim(),
        suffix: payload.suffix?.trim() || null,
        age: payload.age,
        sex: payload.sex.trim(),
        barangay: payload.barangay.trim(),
        city_municipality: payload.cityMunicipality.trim(),
        contact_number: payload.contactNumber?.trim() || null,
        health_center_id: healthCenterId,
        created_by: userId,
      })
      .select("id, patient_code")
      .single();

    if (error || !patient) {
      throw new Error("Failed to save the patient record.");
    }

    await recordAuditEvent({
      eventType: "patient_created",
      entityType: "patient",
      entityId: patient.id,
      healthCenterId,
      summary: `Created patient record ${patient.patient_code}.`,
      metadata: {
        patient_code: patient.patient_code,
      },
    });

    revalidatePath("/patients");

    return {
      success: true,
      patientId: patient.id,
      patientCode: patient.patient_code,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function recordConsultationAction(payload: RecordConsultationPayload) {
  try {
    const { supabase, userId, healthCenterId } = await resolveApprovedCenterContext();

    if (!payload.patientId) {
      throw new Error("Please select a patient before recording a consultation.");
    }

    if (!payload.chiefComplaint.trim() || !payload.illnessCategory.trim()) {
      throw new Error("Chief complaint and illness category are required.");
    }

    if (!payload.medicineId || payload.requestedQuantity <= 0) {
      throw new Error("A medicine request with a valid quantity is required.");
    }

    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, patient_code")
      .eq("id", payload.patientId)
      .eq("health_center_id", healthCenterId)
      .single();

    if (patientError || !patient) {
      throw new Error("Selected patient was not found in your health center records.");
    }

    const consultationDate = payload.consultationDate
      ? new Date(payload.consultationDate).toISOString()
      : new Date().toISOString();

    const { data: consultation, error: consultationError } = await supabase
      .from("consultations")
      .insert({
        patient_id: patient.id,
        health_center_id: healthCenterId,
        consulted_by: userId,
        consultation_date: consultationDate,
        chief_complaint: payload.chiefComplaint.trim(),
        illness_category: payload.illnessCategory.trim(),
        consultation_notes: payload.consultationNotes?.trim() || null,
        prescription_status: "pending",
      })
      .select("id, illness_category")
      .single();

    if (consultationError || !consultation) {
      throw new Error("Failed to save the consultation record.");
    }

    const { data: request, error: requestError } = await supabase
      .from("consultation_medicine_requests")
      .insert({
        consultation_id: consultation.id,
        patient_id: patient.id,
        medicine_id: payload.medicineId,
        requested_quantity: payload.requestedQuantity,
        status: "pending",
        notes: payload.requestNotes?.trim() || null,
      })
      .select("id")
      .single();

    if (requestError || !request) {
      throw new Error("Consultation saved but the medicine request could not be recorded.");
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const { data: localStock } = await supabase
      .from("medicine_batches")
      .select("quantity")
      .eq("health_center_id", healthCenterId)
      .eq("medicine_id", payload.medicineId)
      .gt("quantity", 0)
      .gte("expiry_date", todayStr);

    const localQuantity = (localStock || []).reduce(
      (sum, batch) => sum + batch.quantity,
      0,
    );
    const hasLocalStock = localQuantity >= payload.requestedQuantity;

    const { data: referralOptions } = await supabase
      .from("medicine_batches")
      .select("id")
      .neq("health_center_id", healthCenterId)
      .eq("medicine_id", payload.medicineId)
      .gt("quantity", 0)
      .gte("expiry_date", todayStr)
      .limit(1);

    const nextStatus = hasLocalStock ? "ready_for_dispense" : "ready_for_referral";

    const { error: updateConsultationError } = await supabase
      .from("consultations")
      .update({ prescription_status: nextStatus })
      .eq("id", consultation.id)
      .eq("health_center_id", healthCenterId);

    if (updateConsultationError) {
      console.error("Failed to update consultation status:", updateConsultationError);
    }

    const { error: updateRequestError } = await supabase
      .from("consultation_medicine_requests")
      .update({ status: nextStatus })
      .eq("id", request.id)
      .eq("consultation_id", consultation.id);

    if (updateRequestError) {
      console.error("Failed to update consultation medicine request status:", updateRequestError);
    }

    const { error: illnessLogError } = await supabase
      .from("illness_logs")
      .insert({
        health_center_id: healthCenterId,
        logged_by: userId,
        patient_code: patient.patient_code,
        illness_category: payload.illnessCategory.trim(),
        action_taken: "consultation_recorded",
        notes:
          payload.consultationNotes?.trim() ||
          `Chief complaint: ${payload.chiefComplaint.trim()}`,
      });

    if (illnessLogError) {
      console.error("Failed to mirror consultation into illness logs:", illnessLogError);
    }

    await recordAuditEvent({
      eventType: "consultation_recorded",
      entityType: "consultation",
      entityId: consultation.id,
      healthCenterId,
      summary: `Recorded consultation for ${patient.patient_code} with ${payload.illnessCategory.trim()} category.`,
      metadata: {
        patient_code: patient.patient_code,
        request_id: request.id,
        prescription_status: nextStatus,
        requested_quantity: payload.requestedQuantity,
        has_local_stock: hasLocalStock,
      },
    });

    revalidatePath("/patients");
    revalidatePath("/illnesses");
    revalidatePath("/dashboard");

    return {
      success: true,
      result: {
        consultationId: consultation.id,
        requestId: request.id,
        patientId: patient.id,
        patientCode: patient.patient_code,
        illnessCategory: consultation.illness_category,
        medicineId: payload.medicineId,
        quantity: payload.requestedQuantity,
        hasLocalStock,
        hasReferralOptions: Boolean(referralOptions?.length),
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "An unexpected error occurred." };
  }
}
