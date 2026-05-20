import { ProtectedShell } from "@/components/foundation/protected-shell";
import { AiInsightsClient } from "./ai-insights-client";

export default function AiInsightsPage() {
  return (
    <ProtectedShell title="Gemini AI Health Insights">
      <AiInsightsClient scope="local" />
    </ProtectedShell>
  );
}
