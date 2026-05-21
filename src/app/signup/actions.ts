"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAppUrl } from "@/lib/env/public";
import {
  ensureProfileForUser,
  updateProfileById,
  upsertHealthCenter,
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

function getRegistrationActionErrorMessage(error: unknown) {
  const message =
    error instanceof Error ? error.message : "We could not finish your registration.";

  if (message.toLowerCase().includes("proof document")) {
    return message;
  }

  if (message.toLowerCase().includes("bucket")) {
    return "Proof document storage is not ready yet. Please try again in a moment.";
  }

  if (message.toLowerCase().includes("mime")) {
    return "The selected proof document format is not allowed yet. Please use PDF, DOC, or DOCX.";
  }

  return "We could not finish your registration right now. Please try again.";
}

function validateProfileFields(formData: FormData) {
  const firstName = getFormValue(formData, "firstName");
  const middleName = getFormValue(formData, "middleName");
  const lastName = getFormValue(formData, "lastName");
  const suffix = getFormValue(formData, "suffix");
  const contactNumber = getFormValue(formData, "contactNumber");
  const province = getFormValue(formData, "province");
  const municipality = getFormValue(formData, "municipality");
  const barangayName = getFormValue(formData, "barangayName");
  const latitude = getFormValue(formData, "latitude");
  const longitude = getFormValue(formData, "longitude");
  const mapboxPlaceName = getFormValue(formData, "mapboxPlaceName");
  const displayName = [
    firstName,
    middleName,
    lastName,
    suffix,
  ]
    .filter(Boolean)
    .join(" ");

  if (
    !firstName ||
    !lastName ||
    !contactNumber ||
    !province ||
    !municipality ||
    !barangayName ||
    !latitude ||
    !longitude
  ) {
    return {
      error: "Please complete the required first name, last name, profile, and location fields.",
      values: null,
      location: null,
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
    location: {
      province,
      municipality,
      barangay_name: barangayName,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      mapbox_place_name: mapboxPlaceName || null,
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

  console.log("Supabase signUp results - user:", data.user?.id, "error:", error?.message);

  if (error) {
    redirect(signupMessagePath(error.message));
  }

  if (!data.user) {
    redirect(
      signupMessagePath(
        "Registration blocked by security rules. This usually happens if the email is already registered but unconfirmed. Please check your inbox for a previous confirmation link, or use a different email."
      )
    );
  }

  if (!profileValidation.values || !proofDocument) {
    console.error("Signup validation mismatch: values=", !!profileValidation.values, "proof=", !!proofDocument);
    redirect(signupMessagePath("We could not finish your registration."));
  }

  try {
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

    if (profileValidation.location) {
      await upsertHealthCenter({
        profile_id: data.user.id,
        ...profileValidation.location,
      });
    }
  } catch (error) {
    console.error("BHW registration failed:", error);
    redirect(signupMessagePath(getRegistrationActionErrorMessage(error)));
  }

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

  try {
    const proofDocumentPath = await uploadProofDocument(user.id, proofDocument);

    await updateProfileById(user.id, {
      ...profileValidation.values,
      proof_document_path: proofDocumentPath,
      role: "bhw",
      approval_status: "pending",
    });

    if (profileValidation.location) {
      await upsertHealthCenter({
        profile_id: user.id,
        ...profileValidation.location,
      });
    }
  } catch (error) {
    console.error("BHW onboarding completion failed:", error);
    redirect(onboardingMessagePath(getRegistrationActionErrorMessage(error)));
  }

  revalidatePath("/", "layout");
  redirect("/pending-approval");
}
