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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import logo from "@/assets/images/logo.png"
import { useRouter } from "next/navigation"

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="w-64">
          <SidebarHeader>
            <div className="px-4 py-3">
              <div className="flex gap-2 px-6 py-2">
                <Button variant={"ghost"} onClick={() => router.push("/")}>
                  <Image src={logo} alt="Logo" width={32} height={32} />
                  <h1 className="text-xl font-bold">TRESTA</h1>
                </Button>
              </div>
              <div className="text-sm text-slate-400">Super Admin Portal</div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/super-admin">Overview Dashboard</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/super-admin/companies">Companies (Admins)</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/super-admin/projects">Projects</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/super-admin/users">Users</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="min-h-screen flex-1 bg-background p-4">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
