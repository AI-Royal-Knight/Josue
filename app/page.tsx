"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DASHBOARD_NAV as ACTIVE_DASHBOARD_NAV } from "@/constants/dashboards"
import { DASHBOARD_NAV as LEGACY_DASHBOARD_NAV } from "@/config/nav"

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

const storageKey = "tresta:selectedRole"

type RoleKey =
  | keyof typeof ACTIVE_DASHBOARD_NAV
  | keyof typeof LEGACY_DASHBOARD_NAV

const roleKeys = [
  ...new Set([
    ...Object.keys(ACTIVE_DASHBOARD_NAV),
    ...Object.keys(LEGACY_DASHBOARD_NAV),
  ]),
] as RoleKey[]

export default function Page() {
  const router = useRouter()

  const roles = useMemo(
    () =>
      roleKeys.map((role) => ({
        key: role,
        label: roleLabels[role] ?? role,
      })),
    []
  )

  const handleSelectRole = (role: RoleKey) => {
    window.localStorage.setItem(storageKey, role)
    // Redirect to the top/first page the role has access to.
    const navForRole =
      (
        ACTIVE_DASHBOARD_NAV as unknown as Record<
          string,
          { title: string; url: string }[]
        >
      )[role] ||
      (
        LEGACY_DASHBOARD_NAV as unknown as Record<
          string,
          { title: string; url: string }[]
        >
      )[role]
    const firstUrl =
      Array.isArray(navForRole) && navForRole.length
        ? navForRole[0].url
        : "/home"
    router.push(firstUrl)
  }

  return (
    <main>
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <Card className="border-white/10 bg-[#0b1328]/90 text-slate-100">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-center text-lg">
              Dashboard roles
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 sm:grid-cols-1 xl:grid-cols-1">
            {roles.map((role, idx) => (
              <Button
                key={role.key}
                type="button"
                onClick={() => handleSelectRole(role.key)}
                variant="ghost"
                className="justify-start text-left"
              >
                <span className="text-sm">{idx + 1}.</span>
                {role.label}
              </Button>
            ))}
            <Button onClick={() => router.push("/supplier")} variant="outline">
              Supplier
            </Button>
            <Button
              onClick={() => router.push("/super-admin")}
              variant="outline"
            >
              SUPER ADMIN
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
