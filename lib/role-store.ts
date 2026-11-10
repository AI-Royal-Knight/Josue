"use client"

import { create } from "zustand"
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware"

const storageKey = "tresta:selectedRole"

export type SelectedRole = string | null

type RoleState = {
  role: SelectedRole
  setRole: (role: string) => void
  clearRole: () => void
}

const legacyCompatibleStateStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null
    const raw = window.localStorage.getItem(name)
    if (!raw) return null

    // Legacy format (pre-Zustand) stored just the role string.
    // Zustand persist expects a JSON blob.
    const trimmed = raw.trim()
    if (!trimmed.startsWith("{")) {
      return JSON.stringify({ state: { role: trimmed }, version: 0 })
    }

    return raw
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(name, value)
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return
    window.localStorage.removeItem(name)
  },
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("tresta:activeRole", role)
        }
        set({ role })
      },
      clearRole: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("tresta:activeRole")
        }
        set({ role: null })
      },
    }),
    {
      name: storageKey,
      storage: createJSONStorage(() => legacyCompatibleStateStorage),
      partialize: (state) => ({ role: state.role }),
      onRehydrateStorage: () => (state) => {
        if (state?.role && typeof window !== "undefined") {
          localStorage.setItem("tresta:activeRole", state.role)
        }
      },
    }
  )
)

export const roleStorageKey = storageKey
