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
  FileText,
  Stethoscope,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface RouteItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const bhwRoutes: RouteItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/scan", label: "Scan Medicine", icon: Camera },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/dispense", label: "Dispense", icon: Activity },
  { href: "/illnesses", label: "Illness Cases", icon: Stethoscope },
  { href: "/ai-insights", label: "AI Insights", icon: Sparkles },
  { href: "/referrals", label: "Referral Suggestions", icon: ArrowLeftRight },
  { href: "/reports", label: "Reports & Exports", icon: FileText },
];

const adminRoutes: RouteItem[] = [
  { href: "/admin", label: "BHW Approvals", icon: UserCheck },
  { href: "/admin/inventory", label: "All Inventories", icon: Boxes },
  { href: "/admin/referrals", label: "Referral Activity", icon: ClipboardList },
  { href: "/admin/insights", label: "Global AI Insights", icon: Sparkles },
  { href: "/admin/reports", label: "Reports & Exports", icon: FileText },
  { href: "/illnesses", label: "Global Illnesses", icon: Stethoscope },
];

export function SidebarNavigation({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const routeGroups = isAdmin
    ? [
        {
          label: "Platform",
          items: adminRoutes.slice(0, 3),
        },
        {
          label: "Projects",
          items: adminRoutes.slice(3),
        },
      ]
    : [
        {
          label: "Platform",
          items: bhwRoutes.slice(0, 6),
        },
        {
          label: "Projects",
          items: bhwRoutes.slice(6),
        },
      ];

  return (
    <div className="space-y-4">
      {routeGroups.map((group) => (
        <div key={group.label}>
          <p className="px-2 py-1 text-[11px] font-medium text-[#b9d6dd]">
            {group.label}
          </p>
          <nav className="space-y-1">
            {group.items.map((route) => {
              const Icon = route.icon;
              const isActive =
                pathname === route.href ||
                (route.href !== "/admin" &&
                  route.href !== "/dashboard" &&
                  pathname.startsWith(route.href));

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex h-8 items-center gap-2 rounded-md px-2 text-xs font-semibold outline-none transition",
                    isActive
                      ? "text-white"
                      : "text-white hover:bg-[#202020]"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center transition-colors",
                      isActive
                        ? "text-white"
                        : "text-white/90 group-hover:text-white"
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{route.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}
