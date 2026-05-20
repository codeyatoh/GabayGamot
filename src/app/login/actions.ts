"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { seedSuperAdmin } from "@/lib/supabase/profiles";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function loginMessagePath(message: string) {
  return `/login?message=${encodeURIComponent(message)}`;
}

export async function login(formData: FormData) {
  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");

  if (!email || !password) {
    redirect(loginMessagePath("Please enter both email and password."));
  }

  // Seed super admin dynamically before checking credentials
  await seedSuperAdmin();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(loginMessagePath(error.message));
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
