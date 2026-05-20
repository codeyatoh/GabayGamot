import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";

import { getCurrentProfile } from "@/lib/supabase/profiles";
import { SidebarNavigation } from "./sidebar-navigation";

function formatApprovalStatus(status: string | null | undefined, role?: string) {
  if (role === "super_admin") {
    return "Verified Super Admin";
  }

  if (!status) {
    return "Profile pending";
  }

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function ProtectedShell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const { user, profile } = await getCurrentProfile();
  const displayName = profile?.display_name || user?.email || "Signed-in user";
  const subtitle = profile?.email || user?.email || "Authenticated account";
  const approvalStatus = formatApprovalStatus(profile?.approval_status, profile?.role);
  const isAdmin = profile?.role === "super_admin";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111827]">
          <Link className="mb-6 flex items-center gap-3" href="/">
            <span className="flex size-10 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#EFF6FF] dark:border-white/10 dark:bg-white/5">
              <Image
                alt="GabayGamot logo"
                className="size-6 object-contain"
                height={24}
                src="/assets/images/gabay-gamot-logo-sm.png"
                width={24}
                priority
              />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#1E293B] dark:text-slate-100">
                GabayGamot
              </p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                {isAdmin ? "Admin Panel" : "Protected dashboard"}
              </p>
            </div>
          </Link>
 
          <div className="mb-6 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#64748B] dark:text-slate-400">
              Signed In
            </p>
            <p className="mt-2 text-sm font-semibold text-[#1E293B] dark:text-slate-100">
              {displayName}
            </p>
            <p className="mt-1 break-all text-xs text-[#64748B] dark:text-slate-400">
              {subtitle}
            </p>
            <p className="mt-3 text-xs font-medium text-[#0D9488] dark:text-[#5EEAD4]">
              {approvalStatus}
            </p>
          </div>
 
          <SidebarNavigation isAdmin={isAdmin} />

          <form action="/auth/signout" className="mt-6" method="post">
            <button
              className="w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm font-medium text-[#1E293B] transition hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#2563EB] dark:border-white/10 dark:text-slate-100 dark:hover:border-white/15 dark:hover:bg-white/10 dark:hover:text-[#93C5FD]"
              type="submit"
            >
              Sign Out
            </button>
          </form>
        </aside>

        <main className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#64748B] dark:text-slate-400">
              Foundation route
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[#1E293B] dark:text-slate-100">
              {title}
            </h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
