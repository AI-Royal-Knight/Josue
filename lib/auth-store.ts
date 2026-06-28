"use client"

/**
 * Auth store — persists the JWT tokens and the authenticated user.
 *
 * Tokens are stored in localStorage (keyed under "tresta:*") so that
 * the API client can read them without needing React context.
 */

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { RoleAssignment } from "@/lib/api/auth"

export interface AuthUserState {
  email: string
  first_name: string
  last_name: string
  role: string
  role_assignments?: RoleAssignment[]
}

type AuthState = {
  isAuthenticated: boolean
  user: AuthUserState | null
  accessToken: string | null
  refreshToken: string | null

  // Actions
  setTokens: (access: string, refresh: string) => void
  setUser: (user: AuthUserState) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,

      setTokens: (access, refresh) => {
        // Also sync to raw localStorage so the API client can read it without
        // needing Zustand hydration (SSR-safe).
        if (typeof window !== "undefined") {
          localStorage.setItem("tresta:accessToken", access)
          localStorage.setItem("tresta:refreshToken", refresh)
        }
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true })
      },

      setUser: (user) => set({ user }),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("tresta:accessToken")
          localStorage.removeItem("tresta:refreshToken")
        }
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        })
      },
    }),
    {
      name: "tresta:auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
