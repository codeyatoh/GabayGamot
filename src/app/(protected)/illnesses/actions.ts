"use server";

import { recordAuditEvent } from "@/lib/supabase/audit";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface IllnessLogPayload {
  patientCode: string;
  illnessCategory: string;
  actionTaken: string;
  notes?: string;
}

export async function logIllnessAction(payload: IllnessLogPayload) {
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
      throw new Error("Unauthorized: Only approved BHWs can log illnesses.");
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

    // 4. Validate input
    if (!payload.patientCode.trim() || !payload.illnessCategory || !payload.actionTaken) {
      throw new Error("Missing required fields.");
    }

    // 5. Insert illness log
    const { data: log, error: logError } = await supabase
      .from("illness_logs")
      .insert({
        health_center_id: healthCenter.id,
        logged_by: userId,
        patient_code: payload.patientCode.trim(),
        illness_category: payload.illnessCategory,
        action_taken: payload.actionTaken,
        notes: payload.notes || null,
      })
      .select()
      .single();

    if (logError) {
      console.error("Failed to insert illness log:", logError);
      throw new Error("Failed to save the illness log. Please try again.");
    }

    await recordAuditEvent({
      eventType: "illness_logged",
      entityType: "illness_log",
      entityId: log.id,
      healthCenterId: healthCenter.id,
      summary: `Logged ${payload.illnessCategory} case for ${log.patient_code}.`,
      metadata: {
        patient_code: log.patient_code,
        illness_category: log.illness_category,
        action_taken: log.action_taken,
      },
    });

    // 6. Revalidate caches
    revalidatePath("/illnesses");
    revalidatePath("/dashboard");

    return {
      success: true,
      log: {
        patientCode: log.patient_code,
        illnessCategory: log.illness_category,
        actionTaken: log.action_taken,
        timestamp: log.created_at,
      }
    };

  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}
