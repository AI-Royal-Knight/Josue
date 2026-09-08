"use client"

import { useAuthStore } from "@/lib/auth-store"
import { useSupplierStore } from "@/lib/supplier-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SupplierCompanySelector() {
  const { user, isAuthenticated } = useAuthStore()
  const { activeCompanyId, setActiveCompany, companies } = useSupplierStore()

  const isSupplier = user?.role === "supplier"
  if (!isAuthenticated || !isSupplier) return null

  const activeCompanies = companies.filter((c) => c.relationship_status === "active")

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-400">Operating as:</span>
      <Select
        value={activeCompanyId || undefined}
        onValueChange={(id) => {
          const comp = activeCompanies.find((c) => c.company_id === id)
          if (comp) {
            setActiveCompany(comp.company_id, comp.company_name)
          }
        }}
      >
        <SelectTrigger className="h-8 w-[200px] border-white/10 bg-slate-900 text-slate-200">
          <SelectValue placeholder="Select Company" />
        </SelectTrigger>
        <SelectContent>
          {activeCompanies.length === 0 ? (
            <SelectItem value="none" disabled>
              No companies available
            </SelectItem>
          ) : (
            activeCompanies.map((company) => (
              <SelectItem key={company.id} value={company.company_id}>
                {company.company_name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
