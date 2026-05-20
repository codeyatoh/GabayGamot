import { redirect } from "next/navigation";

import { ProtectedShell } from "@/components/foundation/protected-shell";
import { ReportsDashboard } from "@/components/foundation/reports-dashboard";
import { getOperationalReport } from "@/lib/reports/operational-reports";
import { getCurrentProfile } from "@/lib/supabase/profiles";

export default async function AdminReportsPage() {
  const { profile } = await getCurrentProfile();

  if (profile?.role !== "super_admin") {
    redirect("/dashboard?message=Unauthorized. Only super admins can view global reports.");
  }

  const report = await getOperationalReport({ scope: "global", rangeDays: 30 });

  return (
    <ProtectedShell title="Global Reports & Audit Trail">
      <ReportsDashboard report={report} />
    </ProtectedShell>
  );
}
