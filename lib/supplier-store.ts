"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type SupplierConnection = {
  supplierEmail: string
  supplierName: string
  companyId: string
  status: "Invited" | "Active"
}

type SupplierState = {
  connections: SupplierConnection[]
  activeCompanyId: string | null

  inviteSupplier: (email: string, name: string, companyId: string) => void
  setActiveCompanyId: (companyId: string | null) => void
  getCompaniesForSupplier: (email: string) => string[]
  getSuppliersForCompany: (companyId: string) => SupplierConnection[]
}

export const useSupplierStore = create<SupplierState>()(
  persist(
    (set, get) => ({
      connections: [],
      activeCompanyId: null,

      inviteSupplier: (email, name, companyId) => {
        set((state) => {
          const existing = state.connections.find(
            (c) => c.supplierEmail === email && c.companyId === companyId
          )
          if (existing) return state

          return {
            connections: [
              ...state.connections,
              { supplierEmail: email, supplierName: name, companyId, status: "Invited" },
            ],
          }
        })
      },

      setActiveCompanyId: (companyId) => set({ activeCompanyId: companyId }),

      getCompaniesForSupplier: (email) => {
        return get()
          .connections.filter((c) => c.supplierEmail === email)
          .map((c) => c.companyId)
      },

      getSuppliersForCompany: (companyId) => {
        return get().connections.filter((c) => c.companyId === companyId)
      },
    }),
    {
      name: "tresta:suppliers",
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
