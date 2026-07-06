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
      // Also check raw localStorage in case Zustand hasn't hydrated properly yet
      const rawToken = localStorage.getItem("tresta:accessToken")
      if (!isAuthenticated && !rawToken) {
        router.push("/sign-in")
        return
      }

      if (isAuthenticated && role && pathname) {
        // 1. Super Admin checking
        if (role === "super_admin") {
          if (!pathname.startsWith("/super-admin")) {
            router.push("/super-admin")
          }
          return
        }

        // 2. Supplier checking
        if (role === "supplier") {
          if (!pathname.startsWith("/supplier")) {
            router.push("/supplier")
          }
          return
        }

        // 3. Prevent normal roles from accessing super-admin or supplier
        if (pathname.startsWith("/super-admin") || pathname.startsWith("/supplier")) {
          router.push("/")
          return
        }

        // 4. Role-based Dashboard Checking
        const allowedNav = DASHBOARD_NAV[role as keyof typeof DASHBOARD_NAV] || []
        const allowedBaseUrls = allowedNav.map(nav => nav.url)
        
        const isAllowed = allowedBaseUrls.some(baseUrl => {
          return pathname === baseUrl || pathname.startsWith(`${baseUrl}/`)
        })

        if (!isAllowed && pathname !== "/home") {
          const fallback = allowedBaseUrls.length > 0 ? allowedBaseUrls[0] : "/home"
          router.push(fallback)
        }
      }
    }
  }, [isClient, isAuthenticated, role, pathname, router])

  if (!isClient) return null
  
  return <>{children}</>
}
