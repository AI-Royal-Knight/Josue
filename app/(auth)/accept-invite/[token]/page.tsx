"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { validateInvitationToken, acceptInvitation, InvitationDetails } from "@/lib/api/invitations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Clock, CheckCircle } from "lucide-react"

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  project_admin: "Project Admin",
  managing_director: "Managing Director",
  project_director: "Project Director",
  contracts_manager: "Contracts Manager",
  managers: "Manager",
  supervisor: "Supervisor",
  document_controller: "Document Controller",
  procurement_department: "Procurement Department",
  commercial_department: "Commercial Department",
  finance_department: "Finance Department",
  technical_department: "Technical Department",
  employee: "Employee (Mobile App User)",
  supplier: "Supplier",
}

export default function AcceptInvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [details, setDetails] = useState<InvitationDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingApproval, setPendingApproval] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    async function loadInvitation() {
      try {
        const data = await validateInvitationToken(token)
        setDetails(data)
      } catch (err: any) {
        setError(err.message || "Invalid or expired invitation link.")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      loadInvitation()
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await acceptInvitation({
        token,
        first_name: firstName,
        last_name: lastName,
        password,
      })

      if (result.pending_approval) {
        // Employee users — show pending state, don't redirect to login
        setPendingApproval(true)
        setSuccessMessage(
          result.message ||
          "Your application has been submitted. Your account will become active once the Document Controller reviews and approves your documents."
        )
      } else {
        toast.success(result.message || "Account activated successfully! You can now log in.")
        router.push("/sign-in")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to activate account.")
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !details) {
    return (
      <Card className="w-full max-w-md bg-[#182235]/60 border-[#2b3c5a] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-white">Invalid Invitation</CardTitle>
          <CardDescription className="text-[#94a3b8]">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/sign-in")} className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Show pending approval state for employee users
  if (pendingApproval) {
    return (
      <Card className="w-full max-w-md bg-[#182235]/60 border-[#2b3c5a] backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-amber-500/20">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
            <CardTitle className="text-xl font-medium text-white">Application Submitted</CardTitle>
          </div>
          <CardDescription className="text-[#94a3b8]">
            {successMessage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-sm text-amber-300">
                <strong>Next steps:</strong> The Document Controller will review your submitted documents.
                Once approved, you will be able to log into the mobile app.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const roleLabel = ROLE_LABELS[details.role] || details.role

  return (
    <Card className="w-full max-w-md bg-[#182235]/60 border-[#2b3c5a] backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-blue-500/20">
            <CheckCircle className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-medium text-white">Accept Invitation</CardTitle>
            <CardDescription className="text-[#94a3b8] mt-1">
              You have been invited as <strong className="text-blue-300">{roleLabel}</strong>
            </CardDescription>
          </div>
        </div>
        <p className="text-sm text-[#94a3b8]">
          Please enter your details to set up your account.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white">First Name</Label>
              <Input
                id="firstName"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-[#0b1018]/50 border-[#2b3c5a] text-white placeholder:text-muted-foreground"
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white">Last Name</Label>
              <Input
                id="lastName"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-[#0b1018]/50 border-[#2b3c5a] text-white placeholder:text-muted-foreground"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Show email (read-only) */}
          <div className="space-y-2">
            <Label className="text-white">Email</Label>
            <Input
              value={details.email}
              disabled
              className="bg-[#0b1018]/30 border-[#2b3c5a] text-[#94a3b8]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#0b1018]/50 border-[#2b3c5a] text-white placeholder:text-muted-foreground"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-white">Confirm Password</Label>
            <Input
              id="confirm_password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-[#0b1018]/50 border-[#2b3c5a] text-white placeholder:text-muted-foreground"
              placeholder="••••••••"
            />
          </div>

          {details.role === "employee" && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-xs text-amber-300">
                ⚠️ After submitting, your account will be <strong>pending review</strong> by the Document Controller. You will not be able to log in until approved.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {details.role === "employee" ? "Submit Application" : "Activate Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
