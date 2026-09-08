"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  LogOut,
  ShieldCheck,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  getSupplierCompanies,
  type SupplierCompanyRelationship,
} from "@/lib/api/suppliers"
import { useAuthStore } from "@/lib/auth-store"
import { useSupplierStore } from "@/lib/supplier-store"

export default function SupplierCompaniesPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { setActiveCompany } = useSupplierStore()

  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<SupplierCompanyRelationship[]>([])

  useEffect(() => {
    const token = localStorage.getItem("tresta:accessToken")
    if (!token) {
      router.push("/supplier/login")
      return
    }

    async function loadCompanies() {
      try {
        const data = await getSupplierCompanies()
        setCompanies(data)
      } catch (err) {
        console.error("Failed to load companies:", err)
      } finally {
        setLoading(false)
      }
    }

    loadCompanies()
  }, [])

  const handleSelectCompany = (companyId: string, companyName: string) => {
    setActiveCompany(companyId, companyName)
    router.push("/supplier")
  }

  const activeCompanies = companies.filter((c) => c.relationship_status === "active")
  const pendingCompanies = companies.filter((c) => c.relationship_status === "pending")
  const otherCompanies = companies.filter(
    (c) => c.relationship_status !== "active" && c.relationship_status !== "pending"
  )

  const handleLogout = () => {
    logout()
    router.push("/supplier/login")
  }

  return (
    <div className="min-h-screen bg-[#070d18] text-white">
      {/* Navigation Header */}
      <header className="border-b border-white/10 bg-[#0d1527]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white">Trust.Cloud</span>
              <span className="ml-2 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400">
                Supplier Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-xs">
              <div className="font-medium text-slate-200">{user?.email}</div>
              <div className="text-slate-500">Supplier Account</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-rose-500/10 hover:text-rose-400"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Select Client Company
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Choose which company you wish to view or submit invoices for. Your session and billing
            records will be scoped to the selected company.
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Active Companies Section */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Active Client Companies ({activeCompanies.length})
                </h2>
              </div>

              {activeCompanies.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-10 text-center">
                  <Building2 className="mx-auto h-12 w-12 text-slate-600" />
                  <h3 className="mt-4 text-base font-semibold text-white">
                    No active company relationships
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-xs text-slate-400">
                    You do not currently have any active company connections. If you were recently
                    invited by a company, please check your email and click the invitation link to
                    activate access.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d1527]/90 p-6 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-500/10"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 text-lg font-bold text-blue-400 ring-1 ring-blue-500/30">
                            {company.company_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        </div>

                        <h3 className="mt-4 text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                          {company.company_name}
                        </h3>

                        <div className="mt-4 space-y-2 border-t border-white/5 pt-3 text-xs text-slate-400">
                          <div className="flex items-center justify-between">
                            <span>Payment Terms:</span>
                            <span className="font-medium text-slate-300">
                              {company.eom_payment_terms} Days EOM
                            </span>
                          </div>
                          {parseFloat(company.credit_limit) > 0 && (
                            <div className="flex items-center justify-between">
                              <span>Credit Limit:</span>
                              <span className="font-medium text-slate-300">
                                £{parseFloat(company.credit_limit).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-2">
                        <Button
                          onClick={() =>
                            handleSelectCompany(company.company_id, company.company_name)
                          }
                          className="w-full bg-blue-600 font-semibold text-white shadow-md transition-all hover:bg-blue-500 group-hover:shadow-blue-500/20"
                        >
                          Enter Portal
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Invitations Section (if any) */}
            {pendingCompanies.length > 0 && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                  <Clock className="h-4 w-4" />
                  <span>Pending Invitations ({pendingCompanies.length})</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  These companies have invited your supplier account. Please check your invitation
                  email to accept and activate access.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pendingCompanies.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-black/20 p-4"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {c.company_name}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400">
                          Invited {new Date(c.invited_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
