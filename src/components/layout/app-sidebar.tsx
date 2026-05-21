"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Activity,
  ArrowLeftRight,
  Boxes,
  Camera,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Sparkles,
  Stethoscope,
  UserCheck,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavProjects } from "@/components/layout/nav-projects"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

// Navigation items matching GabayGamot system
const platformNav = {
  bhw: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Patients", url: "/patients", icon: Users },
    { title: "Scan Medicine", url: "/scan", icon: Camera },
    { title: "Inventory", url: "/inventory", icon: Boxes },
    { title: "Dispense", url: "/dispense", icon: Activity },
    { title: "Illness Cases", url: "/illnesses", icon: Stethoscope },
  ],
  admin: [
    { title: "BHW Approvals", url: "/admin", icon: UserCheck },
    { title: "All Inventories", url: "/admin/inventory", icon: Boxes },
    { title: "Referral Activity", url: "/admin/referrals", icon: ClipboardList },
  ]
}

const projectsNav = {
  bhw: [
    { name: "AI Insights", url: "/ai-insights", icon: Sparkles },
    { name: "Referral Suggestions", url: "/referrals", icon: ArrowLeftRight },
    { name: "Reports & Exports", url: "/reports", icon: FileText },
  ],
  admin: [
    { name: "Global AI Insights", url: "/admin/insights", icon: Sparkles },
    { name: "Reports & Exports", url: "/admin/reports", icon: FileText },
    { name: "Global Illnesses", url: "/illnesses", icon: Stethoscope },
  ]
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
    initials: string
  }
  isAdmin: boolean
  roleLabel: string
}

export function AppSidebar({ user, isAdmin, roleLabel, ...props }: AppSidebarProps) {
  const mainItems = isAdmin ? platformNav.admin : platformNav.bhw
  const projectItems = isAdmin ? projectsNav.admin : projectsNav.bhw

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={isAdmin ? "/admin" : "/dashboard"}>
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-[#1d4ed8] text-white shadow-sm">
                  <Image
                    alt="GabayGamot logo"
                    className="size-7 object-contain"
                    height={28}
                    src="/assets/images/gabay-gamot-logo-sm.png"
                    width={28}
                    priority
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-tight">GabayGamot</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">{roleLabel}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mainItems} />
        <NavProjects projects={projectItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
