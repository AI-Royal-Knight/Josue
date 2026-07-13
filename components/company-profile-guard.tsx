"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getProfile } from "@/lib/api/profile"
import { useAuthStore } from "@/lib/auth-store"
import { useRoleStore } from "@/lib/role-store"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "./ui/button"

export function CompanyProfileGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()
  const { role } = useRoleStore()
  const [loading, setLoading] = useState(true)
  const [needsProfile, setNeedsProfile] = useState(false)

  useEffect(() => {
    // Only enforce this for admin roles
    if (!isAuthenticated || role !== "admin") {
      setLoading(false)
      return
    }

    // Do not block access if the user is already on the profile edit page
    if (pathname === "/admin/profile" || pathname === "/profile") {
      setNeedsProfile(false)
      setLoading(false)
      return
    }

    let isMounted = true

    getProfile()
      .then((data) => {
        if (!isMounted) return
        
        const c = data.company
        if (!c) {
          setNeedsProfile(true)
          setLoading(false)
          return
        }

        const missingFields = 
          !c.company_name || 
          !c.company_number || 
          !c.building_number || 
          !c.street || 
          !c.postcode

        if (missingFields) {
          setNeedsProfile(true)
        }
      })
      .catch((err) => {
        console.error("Failed to fetch profile for guard", err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, role, pathname])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Double check pathname in render just to be safe
  if (pathname === "/admin/profile" || pathname === "/profile") {
    return <>{children}</>
  }

  if (needsProfile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-2xl text-center">
          <div className="mb-6 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
            <AlertCircle className="h-6 w-6 text-amber-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-card-foreground">Company Information Required</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            You must provide your complete company information before accessing the dashboard. This includes your company number, building address, and postcode.
          </p>
          <Button 
            onClick={() => router.push("/admin/profile")}
            className="h-12 w-full text-base font-semibold"
          >
            Complete Company Profile
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
