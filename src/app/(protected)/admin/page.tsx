import { redirect } from "next/navigation";

import { ProtectedShell } from "@/components/foundation/protected-shell";
import { getCurrentProfile } from "@/lib/supabase/profiles";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminDashboard } from "./admin-dashboard";

export default async function AdminPage() {
  const { profile } = await getCurrentProfile();

  // Role Guard: Only super_admin can access the approvals workflow
  if (profile?.role !== "super_admin") {
    redirect("/dashboard?message=Unauthorized. Only system administrators can access this route.");
  }

  const admin = createAdminClient();

  // Fetch BHW profiles
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("*")
    .eq("role", "bhw")
    .order("created_at", { ascending: false });

  if (profilesError) {
    throw new Error(`Failed to load health workers: ${profilesError.message}`);
  }

  // Fetch associated health centers to map location details
  const { data: healthCenters, error: centersError } = await admin
    .from("health_centers")
    .select("*");

  if (centersError) {
    throw new Error(`Failed to load health centers: ${centersError.message}`);
  }

  // Combine and sign proof document URLs securely
  const profilesWithSignedDocs = await Promise.all(
    (profiles || []).map(async (p) => {
      const healthCenter =
        (healthCenters || []).find((hc) => hc.profile_id === p.id) || null;

      let signedUrl = "";
      if (p.proof_document_path) {
        try {
          const { data } = await admin.storage
            .from("bhw-proof-documents")
            .createSignedUrl(p.proof_document_path, 3600);
          if (data) {
            signedUrl = data.signedUrl;
          }
        } catch (err) {
          console.error(`Error generating signed URL for user ${p.id}:`, err);
        }
      }

      // Convert healthCenter type to match the expected decimal values in frontend component
      const parsedHealthCenter = healthCenter
        ? {
            ...healthCenter,
            latitude: healthCenter.latitude ? Number(healthCenter.latitude) : null,
            longitude: healthCenter.longitude ? Number(healthCenter.longitude) : null,
          }
        : null;

      return {
        ...p,
        health_center: parsedHealthCenter,
        proof_document_url: signedUrl,
      };
    })
  );

  return (
    <ProtectedShell title="BHW Approvals">
      <AdminDashboard profiles={profilesWithSignedDocs} />
    </ProtectedShell>
  );
}
