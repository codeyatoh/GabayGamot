import { ProtectedShell } from "@/components/foundation/protected-shell";
import { RoutePlaceholder } from "@/components/foundation/route-placeholder";

export default function InventoryPage() {
  return (
    <ProtectedShell title="Inventory">
      <RoutePlaceholder description="This placeholder keeps the inventory route ready without starting medicine CRUD or stock calculations yet." />
    </ProtectedShell>
  );
}
