import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/env/public";
import type { Database } from "@/types/database";

const protectedPrefixes = [
  "/dashboard",
  "/scan",
  "/inventory",
  "/dispense",
  "/ai-insights",
  "/referrals",
  "/admin",
];

const authEntryPaths = ["/login", "/signup"];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isAuthEntryPath(pathname: string) {
  return authEntryPaths.includes(pathname);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && isProtectedPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("message", "Please log in to continue.");
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthEntryPath(pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role,display_name,contact_number,barangay_name,municipality,province,proof_document_path,approval_status")
      .eq("id", user.id)
      .maybeSingle();

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.search = "";

    if (profile?.role === "super_admin") {
      redirectUrl.pathname = "/admin";
      redirectUrl.searchParams.set("message", "You are already signed in.");
      return NextResponse.redirect(redirectUrl);
    }

    const isComplete = Boolean(
      profile?.display_name &&
        profile.contact_number &&
        profile.barangay_name &&
        profile.municipality &&
        profile.province &&
        profile.proof_document_path
    );

    if (!isComplete) {
      redirectUrl.pathname = "/onboarding";
      redirectUrl.searchParams.set(
        "message",
        "Complete your BHW registration to continue."
      );
      return NextResponse.redirect(redirectUrl);
    }

    if (profile?.approval_status === "approved") {
      redirectUrl.pathname = "/dashboard";
      redirectUrl.searchParams.set("message", "You are already signed in.");
      return NextResponse.redirect(redirectUrl);
    }

    redirectUrl.pathname = "/pending-approval";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
