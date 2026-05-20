import "server-only";

import type { User } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type HealthCenterInsert = Database["public"]["Tables"]["health_centers"]["Insert"];

export const PROOF_BUCKET = "bhw-proof-documents";

const allowedProofMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function isProfileComplete(profile: ProfileRow | null) {
  if (profile?.role === "super_admin") {
    return true;
  }
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
    return "Please upload a PDF or Word proof document.";
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

export async function upsertHealthCenter(values: HealthCenterInsert) {
  const admin = createAdminClient();

  const { error } = await admin.from("health_centers").upsert(values, {
    onConflict: "profile_id",
  });

  if (error) {
    throw new Error(`Unable to upsert health center: ${error.message}`);
  }
}

export async function seedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_TEMP_PASSWORD;
  const displayName = process.env.SUPER_ADMIN_DISPLAY_NAME || "System Owner";

  if (!email || !password) {
    return;
  }

  const admin = createAdminClient();

  // Check if super admin profile exists in profiles table
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "super_admin")
    .maybeSingle();

  if (profile) {
    return; // Already seeded
  }

  // Check if auth user exists
  const { data: usersData, error: listError } = await admin.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list users:", listError.message);
    return;
  }

  const existingUser = usersData.users.find((u) => u.email === email);

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
  } else {
    // Create new auth user
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      console.error("Failed to create super admin user:", createError.message);
      return;
    }

    userId = newUser.user.id;
  }

  // Create/update profile row as super_admin
  const { error: upsertError } = await admin.from("profiles").upsert({
    id: userId,
    email,
    display_name: displayName,
    role: "super_admin",
    approval_status: "approved",
    is_super_admin_seeded: true,
  });

  if (upsertError) {
    console.error("Failed to upsert super admin profile:", upsertError.message);
  }
}
