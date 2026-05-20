import { ProtectedShell } from "@/components/foundation/protected-shell";
import { RoutePlaceholder } from "@/components/foundation/route-placeholder";

export default function ReferralsPage() {
  return (
    <ProtectedShell title="Referral Suggestions">
      <RoutePlaceholder description="This placeholder reserves the referral route without starting nearby barangay logic yet." />
    </ProtectedShell>
  );
}
