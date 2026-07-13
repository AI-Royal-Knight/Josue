"use client"
import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import Image from "next/image"
import logo from "@/assets/images/logo.png"
import { Separator } from "./ui/separator"
import { DASHBOARD_NAV } from "@/constants/dashboards"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "./ui/button"
import Link from "next/link"
import { useRoleStore } from "@/lib/role-store"
import { useAuthStore } from "@/lib/auth-store"

const roleLabels: Record<string, string> = {
  admin: "Admin",
  project_admin: "Project Admin",
  managing_director: "Managing Director",
  project_director: "Project Director",
  procurement_department: "Procurement Department",
  commercial_department: "Commercial Department",
  document_controller: "Document Controller",
  finance_department: "Finance Department",
  contracts_manager: "Contracts Manager",
  managers: "Managers",
  supervisor: "Supervisor",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const selectedRole = useRoleStore((s) => s.role)
  const clearRole = useRoleStore((s) => s.clearRole)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = React.useCallback(() => {
    logout()
    clearRole()
    router.push("/sign-in")
  }, [router, logout, clearRole])

  const navItems =
    selectedRole && DASHBOARD_NAV[selectedRole as keyof typeof DASHBOARD_NAV]
      ? DASHBOARD_NAV[selectedRole as keyof typeof DASHBOARD_NAV]
      : []

  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-16 justify-center border-b p-0">
        <div className="flex w-full items-center justify-center gap-2">
          <Button variant={"ghost"} onClick={() => router.push("/")}>
            <Image src={logo} alt="Logo" width={32} height={32} />
            <h1 className="text-xl font-bold">TRESTA</h1>
          </Button>
        </div>
      </SidebarHeader>
      {/* <hr className="text-xs tracking-[0.24em] text-slate-400 uppercase" /> */}
      {/* <Separator /> */}

      <SidebarContent>
        <SidebarGroup>
          <div className="pb-2 text-sm tracking-[0.10em] text-slate-400 uppercase">
            {selectedRole
              ? (roleLabels[selectedRole] ?? selectedRole)
              : "Select a role on the home page"}
          </div>
          <SidebarGroupContent>
            {navItems.length ? (
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.url ||
                    (item.url !== "/" && pathname.startsWith(`${item.url}/`))
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>{item.title}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">
                No dashboard pages available until a role is selected.
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
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
  )
}
