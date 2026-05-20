import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database";

type ProfileRole = Database["public"]["Enums"]["app_role"];

type AuditEventInput = {
  eventType: string;
  entityType: string;
  entityId?: string | null;
  healthCenterId?: string | null;
  summary: string;
  metadata?: Json;
};

export async function recordAuditEvent(input: AuditEventInput) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, approval_status")
      .eq("id", authData.user.id)
      .maybeSingle<{ role: ProfileRole; approval_status: string }>();

    if (profileError || !profile || profile.approval_status !== "approved") {
      return;
    }

    const { error } = await supabase.from("audit_events").insert({
      actor_id: authData.user.id,
      actor_role: profile.role,
      event_type: input.eventType,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      health_center_id: input.healthCenterId ?? null,
      summary: input.summary,
      metadata: input.metadata ?? {},
    });

    if (error) {
      console.warn("[audit] Event was not recorded:", error.message);
    }
  } catch (error) {
    console.warn("[audit] Event recording skipped:", error);
  }
}
