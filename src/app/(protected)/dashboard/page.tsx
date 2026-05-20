import { ProtectedShell } from "@/components/foundation/protected-shell";
import { RoutePlaceholder } from "@/components/foundation/route-placeholder";

export default function DashboardPage() {
  return (
    <ProtectedShell title="Dashboard">
      <RoutePlaceholder description="This dashboard route is a stable placeholder for the future app shell and summary cards." />
    </ProtectedShell>
  );
}
