"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FolderOpen, Users, User } from "lucide-react"

const navItems = [
  {
    label: "Assign Management",
    href: "assign-management",
    icon: FolderOpen,
  },
  {
    label: "Labour Target",
    href: "labour-target",
    icon: Users,
  }
]

export function ProjectLayoutClient({ projectId }: { projectId: string }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const href = `/projects/${projectId}/${item.href}`
        const isActive = pathname === href || pathname.startsWith(href + "/")
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-white/10 text-slate-100"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
