import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("message", "You have been signed out.");
  return NextResponse.redirect(loginUrl, { status: 302 });
}
