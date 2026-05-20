import "server-only";

import type { User } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const PROOF_BUCKET = "bhw-proof-documents";

const allowedProofMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

export function isProfileComplete(profile: ProfileRow | null) {
  return Boolean(
    profile?.display_name &&
      profile.contact_number &&
      profile.barangay_name &&
      profile.municipality &&
      profile.province &&
      profile.proof_document_path
  );
}

export function validateProofDocument(file: File | null) {
  if (!file || file.size === 0) {
    return "Please upload a valid proof document.";
  }

  if (!allowedProofMimeTypes.includes(file.type)) {
    return "Please upload a PDF, JPG, or PNG proof document.";
  }

  if (file.size > 5 * 1024 * 1024) {
    return "Proof documents must be 5MB or smaller.";
  }

  return null;
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function ensureProfileForUser(user: Pick<User, "id" | "email">) {
  const admin = createAdminClient();

  const { error } = await admin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      role: "bhw",
      approval_status: "pending",
    },
    {
      onConflict: "id",
      ignoreDuplicates: true,
    }
  );

  if (error) {
    throw new Error(`Unable to ensure user profile: ${error.message}`);
  }
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw new Error(`Unable to load current profile: ${error.message}`);
  }

  return { user, profile };
}

export async function updateProfileById(userId: string, values: ProfileUpdate) {
  const admin = createAdminClient();

  const { error } = await admin.from("profiles").update(values).eq("id", userId);

  if (error) {
    throw new Error(`Unable to update profile: ${error.message}`);
  }
}

export async function uploadProofDocument(userId: string, file: File) {
  const admin = createAdminClient();
  const objectPath = `${userId}/${Date.now()}-${sanitizeFilename(file.name)}`;

  const { error } = await admin.storage.from(PROOF_BUCKET).upload(objectPath, file, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    throw new Error(`Unable to upload proof document: ${error.message}`);
  }

  return objectPath;
}
