"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supplierLogin } from "@/lib/api/suppliers"
import { useAuthStore } from "@/lib/auth-store"
import { useRoleStore } from "@/lib/role-store"
import { useSupplierStore } from "@/lib/supplier-store"

export default function SupplierLoginPage() {
  const router = useRouter()
  const { setTokens, setUser } = useAuthStore()
  const { setRole } = useRoleStore()
  const { setActiveCompany, clearActiveCompany } = useSupplierStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setLoading(true)

    try {
      const res = await supplierLogin({
        email: email.trim(),
        password,
      })

      // Persist auth state
      setTokens(res.access_token, res.refresh_token)
      setUser({
        email: res.user.email,
        first_name: res.user.first_name,
        last_name: res.user.last_name,
        role: "supplier",
      })
      setRole("supplier")

      const activeCompanies = res.active_companies || []

      if (activeCompanies.length > 1) {
        // Multiple companies -> Supplier must choose which company to enter
        clearActiveCompany()
        router.push("/supplier/companies")
      } else if (activeCompanies.length === 1) {
        // Single active company -> Enter directly
        setActiveCompany(activeCompanies[0].id, activeCompanies[0].company_name)
        router.push("/supplier")
      } else {
        // No active companies yet
        clearActiveCompany()
        router.push("/supplier")
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Please verify your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070d18] p-4 text-white">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[130px]" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1527]/95 p-8 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
            <Building2 className="h-3.5 w-3.5" />
            <span>Trust.Cloud Supplier Portal</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            Supplier Sign In
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to submit and track your invoices across client companies.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Supplier Email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <Input
                required
                type="email"
                placeholder="supplier@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-300">Password</Label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <Input
                required
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg transition-all hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In to Supplier Portal"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 border-t border-white/5 pt-4 text-center">
          <p className="text-xs text-slate-400">
            Need access?{" "}
            <span className="text-slate-300">
              Suppliers are invited directly by client procurement teams.
            </span>
          </p>
          <div className="mt-3">
            <Link
              href="/sign-in"
              className="text-xs text-slate-500 transition hover:text-slate-300"
            >
              Staff or Management user? Go to Staff Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
