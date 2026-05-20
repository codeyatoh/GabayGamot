"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAppUrl } from "@/lib/env/public";
import {
  ensureProfileForUser,
  updateProfileById,
  uploadProofDocument,
  validateProofDocument,
} from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getProofDocument(formData: FormData) {
  const value = formData.get("proofDocument");
  return value instanceof File ? value : null;
}

function signupMessagePath(message: string) {
  return `/signup?message=${encodeURIComponent(message)}`;
}

function onboardingMessagePath(message: string) {
  return `/onboarding?message=${encodeURIComponent(message)}`;
}

function validateProfileFields(formData: FormData) {
  const displayName = getFormValue(formData, "displayName");
  const contactNumber = getFormValue(formData, "contactNumber");
  const province = getFormValue(formData, "province");
  const municipality = getFormValue(formData, "municipality");
  const barangayName = getFormValue(formData, "barangayName");

  if (!displayName || !contactNumber || !province || !municipality || !barangayName) {
    return {
      error: "Please complete all required BHW profile fields.",
      values: null,
    };
  }

  return {
    error: null,
    values: {
      display_name: displayName,
      contact_number: contactNumber,
      province,
      municipality,
      barangay_name: barangayName,
    },
  };
}

export async function registerBhw(formData: FormData) {
  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");
  const proofDocument = getProofDocument(formData);
  const profileValidation = validateProfileFields(formData);
  const proofValidation = validateProofDocument(proofDocument);

  if (!email || !password) {
    redirect(signupMessagePath("Please enter both email and password."));
  }

  if (profileValidation.error) {
    redirect(signupMessagePath(profileValidation.error));
  }

  if (proofValidation) {
    redirect(signupMessagePath(proofValidation));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/confirm?next=/pending-approval`,
    },
  });

  if (error) {
    redirect(signupMessagePath(error.message));
  }

  if (!data.user || !profileValidation.values || !proofDocument) {
    redirect(signupMessagePath("We could not finish your registration."));
  }

  await ensureProfileForUser({
    id: data.user.id,
    email: data.user.email ?? undefined,
  });

  const proofDocumentPath = await uploadProofDocument(data.user.id, proofDocument);

  await updateProfileById(data.user.id, {
    ...profileValidation.values,
    proof_document_path: proofDocumentPath,
    role: "bhw",
    approval_status: "pending",
  });

  revalidatePath("/", "layout");

  if (data.session) {
    redirect("/pending-approval");
  }

  redirect(
    "/login?message=" +
      encodeURIComponent(
        "Registration submitted. Check your email to confirm your account, then log in."
      )
  );
}

export async function completeBhwRegistration(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Please log in to complete your registration.");
  }

  const proofDocument = getProofDocument(formData);
  const profileValidation = validateProfileFields(formData);
  const proofValidation = validateProofDocument(proofDocument);

  if (profileValidation.error) {
    redirect(onboardingMessagePath(profileValidation.error));
  }

  if (proofValidation) {
    redirect(onboardingMessagePath(proofValidation));
  }

  if (!profileValidation.values || !proofDocument) {
    redirect(onboardingMessagePath("We could not finish your registration."));
  }

  const proofDocumentPath = await uploadProofDocument(user.id, proofDocument);

  await updateProfileById(user.id, {
    ...profileValidation.values,
    proof_document_path: proofDocumentPath,
    role: "bhw",
    approval_status: "pending",
  });

  revalidatePath("/", "layout");
  redirect("/pending-approval");
}
