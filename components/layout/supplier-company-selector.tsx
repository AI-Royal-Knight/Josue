"use client"

import { useAuthStore } from "@/lib/auth-store"
import { useSupplierStore } from "@/lib/supplier-store"
import { getCompanies } from "@/lib/company-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useMemo } from "react"

export function SupplierCompanySelector() {
  const { user, isAuthenticated } = useAuthStore()
  
  const activeCompanyId = useSupplierStore((state) => state.activeCompanyId)
  const setActiveCompanyId = useSupplierStore((state) => state.setActiveCompanyId)
  const getCompaniesForSupplier = useSupplierStore((state) => state.getCompaniesForSupplier)

  // This selector is only for suppliers
  const isSupplier = user?.role === "supplier"

  const availableCompanyIds = useMemo(() => {
    if (!isSupplier || !user?.email) return []
    return getCompaniesForSupplier(user.email)
  }, [isSupplier, user?.email, getCompaniesForSupplier])

  const availableCompanies = useMemo(() => {
    const allCompanies = getCompanies()
    return allCompanies.filter(c => availableCompanyIds.includes(c.id))
  }, [availableCompanyIds])

  // Automatically select the first company if none is selected
  useEffect(() => {
    if (isSupplier && availableCompanyIds.length > 0 && !activeCompanyId) {
      setActiveCompanyId(availableCompanyIds[0])
    }
  }, [isSupplier, availableCompanyIds, activeCompanyId, setActiveCompanyId])

  if (!isAuthenticated || !isSupplier) return null

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-400">Operating as:</span>
      <Select 
        value={activeCompanyId || undefined} 
        onValueChange={setActiveCompanyId}
      >
        <SelectTrigger className="w-[200px] h-8 bg-slate-900 border-white/10 text-slate-200">
          <SelectValue placeholder="Select Company" />
        </SelectTrigger>
        <SelectContent>
          {availableCompanies.length === 0 ? (
            <SelectItem value="none" disabled>No companies available</SelectItem>
          ) : (
            availableCompanies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
