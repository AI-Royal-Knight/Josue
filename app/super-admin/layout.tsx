"use client"

import React from "react"
import Link from "next/link"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarRail,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import logo from "@/assets/images/logo.png"
import { useRouter } from "next/navigation"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const handleLogout = React.useCallback(() => {
    router.push("/sign-in")
  }, [router])
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="w-64">
          <SidebarHeader className="h-16 justify-center border-b">
            <div className="flex gap-2 px-6 py-2">
              <Button variant={"ghost"} onClick={() => router.push("/")}>
                <Image src={logo} alt="Logo" width={32} height={32} />
                <h1 className="text-xl font-bold">TRESTA</h1>
              </Button>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <div className="pb-2 text-sm tracking-[0.10em] text-slate-400 uppercase">
              Super Admin Portal
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/super-admin">Overview</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/super-admin/companies">Companies (Admins)</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/super-admin/accounts-overview">
                    Accounts Overview
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/super-admin/invoice-list">Invoice List</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/super-admin/profile">Profile</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="mt-auto w-full p-2">
            <div className="w-full pb-8">
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="min-h-screen flex-1 flex-col bg-background">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-[#0b1328]/90 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <DashboardBreadcrumb />
            {/* <div className="ml-auto flex items-center gap-4">
            <UserAccountNav />
          </div> */}
          </header>
          <div className="flex min-h-0 flex-1 flex-col p-4">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
