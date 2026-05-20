import { redirect } from "next/navigation";

import { ProtectedShell } from "@/components/foundation/protected-shell";
import { getCurrentProfile } from "@/lib/supabase/profiles";

import { AiInsightsClient } from "../../ai-insights/ai-insights-client";

export default async function AdminInsightsPage() {
  const { profile } = await getCurrentProfile();

  if (profile?.role !== "super_admin") {
    redirect("/dashboard?message=Unauthorized. Only super admins can view global AI insights.");
  }

  return (
    <ProtectedShell title="Global AI Insights">
      <AiInsightsClient scope="global" />
    </ProtectedShell>
  );
}
