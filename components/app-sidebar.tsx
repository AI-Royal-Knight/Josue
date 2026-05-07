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
} from "@/components/ui/sidebar"
import Image from "next/image"
import logo from "@/assets/images/logo.png"
import { Separator } from "./ui/separator"
import { DASHBOARD_NAV } from "@/constants/dashboards"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "./ui/button"
import Link from "next/link"

const storageKey = "tresta:selectedRole"

const roleLabels: Record<string, string> = {
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
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null)

  React.useEffect(() => {
    setSelectedRole(window.localStorage.getItem(storageKey))

    const handleStorage = () => {
      setSelectedRole(window.localStorage.getItem(storageKey))
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const navItems =
    selectedRole && DASHBOARD_NAV[selectedRole as keyof typeof DASHBOARD_NAV]
      ? DASHBOARD_NAV[selectedRole as keyof typeof DASHBOARD_NAV]
      : []

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        /> */}
        <div className="flex items-center gap-2 px-6 py-2">
          <Button variant={"ghost"} onClick={() => router.push("/")}>
            <Image src={logo} alt="Logo" width={32} height={32} />
            <h1 className="text-xl font-bold">TRESTA</h1>
          </Button>
        </div>
        {/* <SearchForm /> */}
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <div className="px-3 pb-2 text-xs tracking-[0.24em] text-slate-400 uppercase">
            {selectedRole
              ? (roleLabels[selectedRole] ?? selectedRole)
              : "Select a role on the home page"}
          </div>
          <SidebarGroupContent>
            {navItems.length ? (
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">
                No dashboard pages available until a role is selected.
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
