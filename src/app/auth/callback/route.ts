import { NextResponse, type NextRequest } from "next/server";

import { ensureProfileForUser, getCurrentProfile, isProfileComplete } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ensure profile row exists for this OAuth user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await ensureProfileForUser({
          id: user.id,
          email: user.email ?? undefined,
        });

        // Route based on profile completion
        const { profile } = await getCurrentProfile();

        if (!isProfileComplete(profile)) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }

        if (profile?.approval_status === "approved") {
          return NextResponse.redirect(`${origin}/dashboard`);
        }

        return NextResponse.redirect(`${origin}/pending-approval`);
      }
    }
  }

  // OAuth failed — send back to login with message
  return NextResponse.redirect(
    `${origin}/login?message=${encodeURIComponent("Sign in with Google failed. Please try again.")}`
  );
}
