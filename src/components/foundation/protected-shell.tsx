import { type ReactNode } from "react";

import { getCurrentProfile } from "@/lib/supabase/profiles";
import { ProtectedAppShell } from "./protected-app-shell";

function formatApprovalStatus(status: string | null | undefined, role?: string) {
  if (role === "super_admin") {
    return "Verified Super Admin";
  }

  if (!status) {
    return "Profile pending";
  }

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(value: string) {
  const parts = value
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "GG";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export async function ProtectedShell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const { user, profile } = await getCurrentProfile();
  const displayName = profile?.display_name || user?.email || "Signed-in user";
  const subtitle = profile?.email || user?.email || "Authenticated account";
  const approvalStatus = formatApprovalStatus(profile?.approval_status, profile?.role);
  const isAdmin = profile?.role === "super_admin";
  const roleLabel = isAdmin ? "Super Admin" : "BHW";
  const workspaceLabel = isAdmin ? "Admin workspace" : "Barangay workspace";
  const userInitials = getInitials(displayName);

  return (
    <ProtectedAppShell
      approvalStatus={approvalStatus}
      displayName={displayName}
      isAdmin={isAdmin}
      roleLabel={roleLabel}
      subtitle={subtitle}
      title={title}
      userInitials={userInitials}
      workspaceLabel={workspaceLabel}
    >
      {children}
    </ProtectedAppShell>
  );
}
