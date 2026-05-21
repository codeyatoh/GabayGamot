"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type ProtectedAppShellProps = {
  children: React.ReactNode
  title: string
  displayName: string
  subtitle: string
  approvalStatus: string
  isAdmin: boolean
  roleLabel: string
  workspaceLabel: string
  userInitials: string
}

export function ProtectedAppShell({
  children,
  title,
  displayName,
  subtitle,
  isAdmin,
  roleLabel,
  workspaceLabel,
  userInitials,
}: ProtectedAppShellProps) {
  const user = {
    name: displayName,
    email: subtitle,
    initials: userInitials,
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} isAdmin={isAdmin} roleLabel={roleLabel} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-[#0a0a0a] text-[#fafafa] border-b border-[#2a2a2a]/40">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 text-[#fafafa] hover:bg-[#202020] hover:text-white" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4 bg-[#2a2a2a]"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href={isAdmin ? "/admin" : "/dashboard"} className="text-[#a1a1aa] hover:text-[#fafafa]">
                      {workspaceLabel}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-[#737373]">
                  <ChevronRight className="size-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-[#fafafa] font-semibold">{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-x-hidden p-4 bg-[#0a0a0a] text-[#fafafa]">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
