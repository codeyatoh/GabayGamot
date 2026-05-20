import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/onboarding",
    "/pending-approval",
    "/dashboard/:path*",
    "/patients/:path*",
    "/scan/:path*",
    "/inventory/:path*",
    "/dispense/:path*",
    "/ai-insights/:path*",
    "/referrals/:path*",
    "/auth/:path*",
  ],
};
