import { ProtectedShell } from "@/components/foundation/protected-shell";
import { DispenseClient } from "./dispense-client";

export default function DispensePage() {
  return (
    <ProtectedShell title="Dispense Medicine Workspace">
      <DispenseClient />
    </ProtectedShell>
  );
}
