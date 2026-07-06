"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user?.role === "managers") {
      router.push("/users")
    }
  }, [user, router])

  if (user?.role === "managers") {
    return null
  }

  return <>{children}</>
}
