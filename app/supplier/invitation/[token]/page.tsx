"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  KeyRound,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getSupplierInvitation,
  acceptSupplierInvitation,
  declineSupplierInvitation,
  type SupplierInvitationDetails,
} from "@/lib/api/suppliers"
import { useAuthStore } from "@/lib/auth-store"
import { useRoleStore } from "@/lib/role-store"
import { useSupplierStore } from "@/lib/supplier-store"

export default function SupplierInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const { setTokens, setUser } = useAuthStore()
  const { setRole } = useRoleStore()
  const { setActiveCompany } = useSupplierStore()

  const [isLoading, setIsLoading] = useState(true)
  const [invitation, setInvitation] = useState<SupplierInvitationDetails | null>(null)
  const [errorState, setErrorState] = useState<{
    type: "not_found" | "expired" | "already_accepted" | "declined" | "error"
    message: string
  } | null>(null)

  // Form inputs for new supplier registration
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)
  const [hasDeclined, setHasDeclined] = useState(false)

  useEffect(() => {
    async function loadInvitation() {
      try {
        const data = await getSupplierInvitation(token)
        setInvitation(data)
        setCompanyName(data.supplier_name || "")

        if (data.status === "accepted") {
          setErrorState({
            type: "already_accepted",
            message: "This invitation has already been accepted.",
          })
        } else if (data.status === "declined") {
          setErrorState({
            type: "declined",
            message: "This invitation was previously declined.",
          })
        } else if (data.is_expired || data.status === "expired") {
          setErrorState({
            type: "expired",
            message: "This invitation has expired.",
          })
        }
      } catch (err: any) {
        const code = err.data?.code || ""
        if (code === "already_accepted") {
          setErrorState({
            type: "already_accepted",
            message: "This invitation has already been accepted.",
          })
        } else if (code === "declined") {
          setErrorState({
            type: "declined",
            message: "This invitation was previously declined.",
          })
        } else if (code === "expired") {
          setErrorState({
            type: "expired",
            message: "This invitation has expired.",
          })
        } else {
          setErrorState({
            type: "not_found",
            message: err.message || "Invitation not found or invalid token.",
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      loadInvitation()
    }
  }, [token])

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()

    if (invitation && !invitation.is_existing_user) {
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters long.")
        return
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.")
        return
      }
    }

    setIsSubmitting(true)
    try {
      const res = await acceptSupplierInvitation(token, {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        password: password || undefined,
      })

      toast.success(res.message || "Invitation accepted!")

      if (res.access_token && res.refresh_token && res.user && res.company) {
        // Authenticate immediately
        setTokens(res.access_token, res.refresh_token)
        setUser({
          email: res.user.email,
          first_name: res.user.first_name,
          last_name: res.user.last_name,
          role: "supplier",
        })
        setRole("supplier")
        setActiveCompany(res.company.id, res.company.company_name)

        router.push("/supplier")
      } else {
        router.push("/supplier/login")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to accept invitation.")
      setIsSubmitting(false)
    }
  }

  const handleDecline = async () => {
    if (!window.confirm("Are you sure you want to decline this supplier invitation?")) {
      return
    }

    setIsDeclining(true)
    try {
      await declineSupplierInvitation(token)
      toast.info("Invitation declined.")
      setHasDeclined(true)
    } catch (err: any) {
      toast.error(err.message || "Failed to decline invitation.")
    } finally {
      setIsDeclining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070d18] p-4 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-sm text-slate-400">Validating supplier invitation...</p>
        </div>
      </div>
    )
  }

  // Handle errors / inactive invitation states
  if (errorState || hasDeclined) {
    const isDeclined = hasDeclined || errorState?.type === "declined"
    const isExpired = errorState?.type === "expired"
    const isAccepted = errorState?.type === "already_accepted"

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070d18] p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1527]/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            {isAccepted ? (
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>
            ) : isExpired ? (
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
                <Clock className="h-8 w-8" />
              </div>
            ) : isDeclined ? (
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30">
                <XCircle className="h-8 w-8" />
              </div>
            ) : (
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30">
                <ShieldAlert className="h-8 w-8" />
              </div>
            )}

            <h1 className="text-xl font-bold text-white">
              {isAccepted
                ? "Invitation Already Accepted"
                : isExpired
                ? "Invitation Expired"
                : isDeclined
                ? "Invitation Declined"
                : "Invalid Invitation"}
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              {isAccepted
                ? "This invitation has already been accepted. You can log in to your supplier portal anytime to view and submit invoices."
                : isExpired
                ? "This invitation link has expired. Please contact the procurement department to request a new invitation."
                : isDeclined
                ? "You have declined this company relationship. If this was a mistake, please request a new invitation from Procurement."
                : errorState?.message || "We could not find a valid invitation matching this link."}
            </p>

            <div className="mt-6 flex w-full flex-col gap-2">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white hover:from-blue-500 hover:to-indigo-500"
              >
                <Link href="/supplier/login">Go to Supplier Login</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full text-slate-400 hover:text-white"
              >
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!invitation) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070d18] p-4">
      {/* Subtle Background Glow */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1527]/95 p-8 shadow-2xl backdrop-blur-2xl">
        {/* Header Branding */}
        <div className="mb-6 border-b border-white/10 pb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
            <Building2 className="h-3.5 w-3.5" />
            <span>Supplier Portal Invitation</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            You&apos;ve Been Invited
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Connect your supplier account to start submitting invoices.
          </p>
        </div>

        {/* Company & Supplier Information Card */}
        <div className="mb-6 space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Inviting Company:</span>
            <span className="font-semibold text-white">{invitation.company_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Supplier Email:</span>
            <span className="font-mono text-xs text-blue-300">{invitation.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Invitation Status:</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
              <Clock className="h-3 w-3" />
              Pending Acceptance
            </span>
          </div>
        </div>

        {invitation.is_existing_user ? (
          /* Existing User Flow */
          <div className="space-y-6">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs text-blue-200">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                <div>
                  <p className="font-semibold">Existing Supplier Identity</p>
                  <p className="mt-1 text-blue-300/90 leading-relaxed">
                    You already have a verified supplier account on Trust.Cloud. Click Accept below to link{" "}
                    <strong>{invitation.company_name}</strong> to your account. You will be able to switch between
                    companies anytime.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleAccept}
                disabled={isSubmitting || isDeclining}
                className="h-12 w-full bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg transition-all hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting Invitation...
                  </>
                ) : (
                  "Accept Invitation"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDecline}
                disabled={isSubmitting || isDeclining}
                className="h-11 border-white/10 text-slate-300 hover:bg-rose-500/10 hover:text-rose-400"
              >
                {isDeclining ? "Declining..." : "Decline"}
              </Button>
            </div>
          </div>
        ) : (
          /* New Supplier Registration Form */
          <form onSubmit={handleAccept} className="space-y-4">
            <div className="rounded-lg border border-white/5 bg-slate-900/50 p-3 text-xs text-slate-300">
              Please set up your supplier login credentials below to complete activation.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">First Name</Label>
                <Input
                  required
                  placeholder="e.g. Sarah"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Last Name</Label>
                <Input
                  required
                  placeholder="e.g. Jenkins"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Supplier / Company Name</Label>
              <Input
                required
                placeholder="e.g. BuildMat Supplies Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Create Password</Label>
              <Input
                required
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Confirm Password</Label>
              <Input
                required
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Button
                type="submit"
                disabled={isSubmitting || isDeclining}
                className="h-12 w-full bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg transition-all hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account & Activating...
                  </>
                ) : (
                  "Accept & Create Supplier Account"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDecline}
                disabled={isSubmitting || isDeclining}
                className="h-11 border-white/10 text-slate-300 hover:bg-rose-500/10 hover:text-rose-400"
              >
                {isDeclining ? "Declining..." : "Decline Invitation"}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 border-t border-white/5 pt-4 text-center">
          <Link
            href="/supplier/login"
            className="inline-flex items-center gap-1 text-xs text-slate-400 transition hover:text-blue-400"
          >
            Already have an active account? Log in here
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
