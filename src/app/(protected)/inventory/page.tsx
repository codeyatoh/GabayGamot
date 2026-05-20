import { ProtectedShell } from "@/components/foundation/protected-shell";
import { InventoryClient } from "./inventory-client";

export default function InventoryPage() {
  return (
    <ProtectedShell title="Medicine Inventory">
      <InventoryClient />
    </ProtectedShell>
  );
}
