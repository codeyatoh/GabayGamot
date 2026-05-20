import { ProtectedShell } from "@/components/foundation/protected-shell";
import { RoutePlaceholder } from "@/components/foundation/route-placeholder";

export default function ScanPage() {
  return (
    <ProtectedShell title="Scan Medicine">
      <RoutePlaceholder description="This placeholder reserves the camera-first scan route without starting OCR or review logic yet." />
    </ProtectedShell>
  );
}
