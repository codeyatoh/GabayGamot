import { ProtectedShell } from "@/components/foundation/protected-shell";
import { RoutePlaceholder } from "@/components/foundation/route-placeholder";

export default function AiInsightsPage() {
  return (
    <ProtectedShell title="AI Insights">
      <RoutePlaceholder description="This placeholder reserves the AI insights route without starting Gemini or recommendation logic yet." />
    </ProtectedShell>
  );
}
