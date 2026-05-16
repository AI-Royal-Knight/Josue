import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

 export function getRoleVariant(role: string) {
    const r = role?.toLowerCase() ?? ""
    if (r.includes("admin")) return "admin"
    if (r.includes("manager") || r.includes("director")) return "manager"
    if (r.includes("finance") || r.includes("accounts")) return "finance"
    return "outline"
  }

  export function getStatusVariant(status: string) {
    const s = status?.toLowerCase() ?? ""
    if (s === "active") return "active"
    if (s === "pending") return "pending"
    if (s === "completed") return "completed"
    if (s === "suspended") return "suspended"
    if (s === "inactive") return "inactive"
    return "secondary"
  }
