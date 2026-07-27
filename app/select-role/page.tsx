"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { useRoleStore } from "@/lib/role-store"
import { getDashboardUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { UserCircle2, ArrowRight } from "lucide-react"

export default function SelectRolePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { setRole } = useRoleStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/sign-in")
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted || !user) {
    return null
  }

  const handleSelectRole = (role: string) => {
    setRole(role)
    router.push(getDashboardUrl(role))
  }

  // Format roles nicely for display
  const formatRole = (role: string) => {
    return role.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
            <UserCircle2 className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">Select Your Role</h2>
          <p className="mt-2 text-sm text-slate-400">
            Welcome back, {user.first_name}. Please select which role you want to access for this session.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {Array.from(
            new Set([
              user.role,
              ...(user.secondary_role ? [user.secondary_role] : []),
              ...(user.role_assignments ? user.role_assignments.map((a: any) => a.role) : [])
            ].filter(Boolean))
          ).map((roleKey) => (
            <Button
              key={roleKey}
              onClick={() => handleSelectRole(roleKey)}
              variant="outline"
              className="group flex h-16 w-full items-center justify-between border-slate-700 bg-slate-800 hover:border-blue-500 hover:bg-slate-800"
            >
              <span className="text-lg font-medium text-slate-200 group-hover:text-white">
                {formatRole(roleKey)}
              </span>
              <ArrowRight className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-blue-400" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
