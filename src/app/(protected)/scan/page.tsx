import { ProtectedShell } from "@/components/foundation/protected-shell";
import { ScanClient } from "./scan-client";

export default function ScanPage() {
  return (
    <ProtectedShell title="Medicine Scan Workspace">
      <ScanClient />
    </ProtectedShell>
  );
}
