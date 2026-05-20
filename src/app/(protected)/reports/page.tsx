import { redirect } from "next/navigation";

import { ProtectedShell } from "@/components/foundation/protected-shell";
import { ReportsDashboard } from "@/components/foundation/reports-dashboard";
import { getOperationalReport } from "@/lib/reports/operational-reports";
import { getCurrentProfile } from "@/lib/supabase/profiles";

export default async function ReportsPage() {
  const { profile } = await getCurrentProfile();

  if (profile?.role === "super_admin") {
    redirect("/admin/reports");
  }

  const report = await getOperationalReport({ scope: "local", rangeDays: 30 });

  return (
    <ProtectedShell title="Reports & Audit Trail">
      <ReportsDashboard report={report} />
    </ProtectedShell>
  );
}
