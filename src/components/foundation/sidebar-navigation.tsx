"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCheck,
  Boxes,
  Activity,
  Sparkles,
  ArrowLeftRight,
  Camera,
  ClipboardList,
} from "lucide-react";

interface RouteItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const bhwRoutes: RouteItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scan", label: "Scan Medicine", icon: Camera },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/dispense", label: "Dispense", icon: Activity },
  { href: "/ai-insights", label: "AI Insights", icon: Sparkles },
  { href: "/referrals", label: "Referral Suggestions", icon: ArrowLeftRight },
];

const adminRoutes: RouteItem[] = [
  { href: "/admin", label: "BHW Approvals", icon: UserCheck },
  { href: "/admin/inventory", label: "All Inventories", icon: Boxes },
  { href: "/admin/referrals", label: "Referral Activity", icon: ClipboardList },
  { href: "/admin/insights", label: "Global AI Insights", icon: Sparkles },
];

export function SidebarNavigation({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const routes = isAdmin ? adminRoutes : bhwRoutes;

  return (
    <nav className="space-y-1">
      {routes.map((route) => {
        const Icon = route.icon;
        const isActive =
          pathname === route.href ||
          (route.href !== "/admin" && route.href !== "/dashboard" && pathname.startsWith(route.href));

        return (
          <Link
            key={route.href}
            href={route.href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-white/10 dark:text-[#60A5FA]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B] dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
            }`}
          >
            <Icon className={`size-5 shrink-0 ${isActive ? "text-[#2563EB] dark:text-[#60A5FA]" : "text-[#94A3B8] group-hover:text-[#64748B]"}`} />
            <span>{route.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
