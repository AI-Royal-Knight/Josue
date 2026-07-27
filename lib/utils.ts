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

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value)
}

export function getDashboardUrl(role: string): string {
  const map: Record<string, string> = {
    super_admin: "/super-admin",
    admin: "/home",
    project_admin: "/projects",
    managing_director: "/project-overview",
    document_controller: "/users",
    commercial_department: "/variations",
    procurement_department: "/supplier-lists",
    contracts_manager: "/users",
    managers: "/users",
    supervisor: "/users",
    project_director: "/project-overview",
    employee: "/projects",
    supplier: "/supplier",
    finance_department: "/invoice-list",
    technical_department: "/project-rfis",
  }
  return map[role] ?? "/home"
}
