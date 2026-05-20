import { ProtectedShell } from "@/components/foundation/protected-shell";
import { ReferralsClient } from "./referrals-client";

export default function ReferralsPage() {
  return (
    <ProtectedShell title="Referrals Coordinator">
      <ReferralsClient />
    </ProtectedShell>
  );
}
