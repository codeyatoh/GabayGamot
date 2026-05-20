import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import {
  ensureProfileForUser,
  getCurrentProfile,
  isProfileComplete,
} from "@/lib/supabase/profiles";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile } = await getCurrentProfile();

  if (!user) {
    redirect("/login?message=Please log in to continue.");
  }

  if (!profile) {
    await ensureProfileForUser({
      id: user.id,
      email: user.email ?? undefined,
    });
    redirect("/onboarding?message=Complete your BHW registration to continue.");
  }

  if (!isProfileComplete(profile)) {
    redirect("/onboarding?message=Complete your BHW registration to continue.");
  }

  if (profile.approval_status !== "approved") {
    redirect("/pending-approval");
  }

  return children;
}
