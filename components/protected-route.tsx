"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { useRoleStore } from "@/lib/role-store"
import { DASHBOARD_NAV } from "@/constants/dashboards"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()
  const { role } = useRoleStore()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
      // Use raw localStorage token as the authoritative "logged in" signal.
      // Zustand's persisted state may not have hydrated yet when this effect
      // first fires, so isAuthenticated could still be false even though the
      // user has a valid token. We must not redirect in that case.
      const rawToken = localStorage.getItem("tresta:accessToken")

      if (!rawToken) {
        // No token at all — definitely not logged in
        router.push("/sign-in")
        return
      }

      // Token exists — user is logged in. Now enforce role-based routing,
      // but only once both the auth store AND the role store have hydrated.
      if (!isAuthenticated || !role) {
        // Stores haven't hydrated yet — wait for the next render cycle.
        return
      }

      // 1. Super Admin
      if (role === "super_admin") {
        if (!pathname.startsWith("/super-admin")) {
          router.push("/super-admin")
        }
        return
      }

      // 2. Supplier
      if (role === "supplier") {
        if (pathname !== "/supplier" && !pathname.startsWith("/supplier/")) {
          router.push("/supplier")
        }
        return
      }

      // 3. Prevent normal roles from accessing super-admin or supplier routes
      if (
        pathname.startsWith("/super-admin") ||
        pathname === "/supplier" ||
        pathname.startsWith("/supplier/")
      ) {
        router.push("/")
        return
      }

      // 4. Role-based nav check
      const allowedNav = DASHBOARD_NAV[role as keyof typeof DASHBOARD_NAV] || []
      const allowedBaseUrls = allowedNav.map((nav) => nav.url)

      const isAllowed = allowedBaseUrls.some(
        (baseUrl) => pathname === baseUrl || pathname.startsWith(`${baseUrl}/`)
      )

      if (!isAllowed && pathname !== "/home") {
        const fallback = allowedBaseUrls.length > 0 ? allowedBaseUrls[0] : "/home"
        router.push(fallback)
      }
    }
  }, [isClient, isAuthenticated, role, pathname, router])

  if (!isClient) return null

  return <>{children}</>
}
