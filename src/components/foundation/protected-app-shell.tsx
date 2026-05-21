"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
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
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background text-foreground border-b border-border">
          <div className="flex flex-1 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 hover:bg-muted hover:text-foreground" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href={isAdmin ? "/admin" : "/dashboard"} className="text-muted-foreground hover:text-foreground">
                      {workspaceLabel}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-muted-foreground">
                  <ChevronRight className="size-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold">{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-x-hidden p-4 bg-background text-foreground">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
