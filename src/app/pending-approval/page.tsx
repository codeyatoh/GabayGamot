import { redirect } from "next/navigation";

import { getCurrentProfile, isProfileComplete } from "@/lib/supabase/profiles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function getStatusCopy(status: string | null | undefined) {
  if (status === "rejected") {
    return {
      title: "Registration needs review",
      body: "Your registration is currently marked as rejected. Approval actions belong to a later phase, so please keep your proof document and profile details ready for future review handling.",
      accent: "text-[#DC2626]",
    };
  }

  if (status === "approved") {
    return {
      title: "Registration approved",
      body: "Your account is approved. You can continue into the protected routes.",
      accent: "text-[#16A34A]",
    };
  }

  return {
    title: "Registration pending approval",
    body: "Your BHW account is saved and waiting for Super Admin review. You cannot use the main system routes until the approval workflow is built and your account status changes to approved.",
    accent: "text-[#F59E0B]",
  };
}

export default async function PendingApprovalPage() {
  const { user, profile } = await getCurrentProfile();

  if (!user) {
    redirect("/login?message=Please log in to continue.");
  }

  if (!isProfileComplete(profile)) {
    redirect("/onboarding?message=Complete your BHW registration first.");
  }

  if (profile?.approval_status === "approved") {
    redirect("/dashboard");
  }

  const statusCopy = getStatusCopy(profile?.approval_status);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-10 dark:bg-[#0F172A]">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-3">
          <CardTitle>{statusCopy.title}</CardTitle>
          <CardDescription>{statusCopy.body}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-medium text-[#1E293B] dark:text-slate-100">
              {profile?.display_name || user.email}
            </p>
            <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">
              {profile?.email || user.email}
            </p>
            <p className="mt-3 text-sm text-[#64748B] dark:text-slate-400">
              {profile?.barangay_name}, {profile?.municipality}, {profile?.province}
            </p>
            <p className={`mt-3 text-sm font-semibold ${statusCopy.accent}`}>
              Status: {(profile?.approval_status || "pending").toUpperCase()}
            </p>
          </div>

          <p className="text-sm leading-7 text-[#64748B] dark:text-slate-400">
            Map location pinning, document review, and the actual approval
            decisions are intentionally deferred to the next phases.
          </p>

          <form action="/auth/signout" method="post">
            <button
              className="w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm font-medium text-[#1E293B] transition hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#2563EB] dark:border-white/10 dark:text-slate-100 dark:hover:border-white/15 dark:hover:bg-white/10 dark:hover:text-[#93C5FD]"
              type="submit"
            >
              Sign Out
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
