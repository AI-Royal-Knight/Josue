"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, AlertTriangle } from "lucide-react"

import OnboardingWizard from "./_components/OnboardingWizard"
import RegistrationInvite, {
  type RegistrationInviteData,
} from "./_components/RegistrationInvite"
import { validateInvitationToken } from "@/lib/api/invitations"
import type { InvitationDetails } from "@/lib/api/invitations"
import { ApiError } from "@/lib/api/client"

const DRAFT_KEY = "onboarding-draft"

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "invite"; invitation: InvitationDetails }
  | { status: "wizard"; invitation: InvitationDetails; resumeDraft: boolean }

import { Suspense } from "react"

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}>
      <OnboardingContent />
    </Suspense>
  )
}

function OnboardingContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [state, setState] = useState<PageState>({ status: "loading" })

  // Validate token from URL on mount
  useEffect(() => {
    if (!token) {
      setState({
        status: "error",
        message:
          "No invitation token found. Please check the link in your email.",
      })
      return
    }

    validateInvitationToken(token)
      .then((invitation) => {
        setState({ status: "invite", invitation })
      })
      .catch((err) => {
        const message =
          err instanceof ApiError
            ? err.message
            : "Invalid or expired invitation link."
        setState({ status: "error", message })
      })
  }, [token])

  const canResume = useMemo(() => {
    if (typeof window === "undefined") return false
    try {
      return Boolean(localStorage.getItem(DRAFT_KEY))
    } catch {
      return false
    }
  }, [])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Validating invitation…</p>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (state.status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h1 className="text-xl font-semibold text-foreground">
          Invitation Error
        </h1>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          {state.message}
        </p>
      </div>
    )
  }

  const { invitation } = state

  const invite: RegistrationInviteData = {
    statusLabel: "Invite Verified",
    projectName: invitation.project_name ?? "—",
    companyName: invitation.company_name ?? "—",
    inviteEmail: invitation.email,
    role: invitation.role,
  }

  // ── Wizard ─────────────────────────────────────────────────────────────────
  if (state.status === "wizard") {
    return (
      <OnboardingWizard
        token={token!}
        invitation={invitation}
        resumeDraft={state.resumeDraft}
        onExit={() =>
          setState({ status: "invite", invitation })
        }
      />
    )
  }

  // ── Invite card ────────────────────────────────────────────────────────────
  return (
    <RegistrationInvite
      invite={invite}
      canResume={canResume}
      onStart={() =>
        setState({ status: "wizard", invitation, resumeDraft: false })
      }
      onResume={() =>
        setState({ status: "wizard", invitation, resumeDraft: true })
      }
    />
  )
}
