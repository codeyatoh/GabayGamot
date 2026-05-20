import { ProtectedShell } from "@/components/foundation/protected-shell";
import { RoutePlaceholder } from "@/components/foundation/route-placeholder";

export default function DispensePage() {
  return (
    <ProtectedShell title="Dispense">
      <RoutePlaceholder description="This placeholder keeps the dispense route stable before stock deduction and log behavior are introduced." />
    </ProtectedShell>
  );
}
