"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { SupplierCompanyRelationship } from "./api/suppliers"

interface SupplierState {
  activeCompanyId: string | null
  activeCompanyName: string | null
  companies: SupplierCompanyRelationship[]

  setActiveCompany: (id: string, name: string) => void
  setCompanies: (companies: SupplierCompanyRelationship[]) => void
  clearActiveCompany: () => void
}

export const useSupplierStore = create<SupplierState>()(
  persist(
    (set) => ({
      activeCompanyId: null,
      activeCompanyName: null,
      companies: [],

      setActiveCompany: (id: string, name: string) =>
        set({ activeCompanyId: id, activeCompanyName: name }),

      setCompanies: (companies: SupplierCompanyRelationship[]) => set({ companies }),

      clearActiveCompany: () =>
        set({ activeCompanyId: null, activeCompanyName: null }),
    }),
    {
      name: "tresta:supplier:store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
)
