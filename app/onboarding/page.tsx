"use client"

import { useMemo, useState } from "react"

import OnboardingWizard from "./_components/OnboardingWizard"
import RegistrationInvite, {
  type RegistrationInviteData,
} from "./_components/RegistrationInvite"

const DRAFT_KEY = "onboarding-draft"

export default function Page() {
  const [view, setView] = useState<"invite" | "wizard">("invite")
  const [resumeDraft, setResumeDraft] = useState(false)

  const invite = useMemo<RegistrationInviteData>(() => {
    // TODO: Replace these with actual invite lookup by token.
    return {
      statusLabel: "Invite Verified",
      projectName: "Riverside Tower",
      companyName: "Umasong Ltd.",
      inviteEmail: "alex.turner@example.com",
    }
  }, [])

  const canResume = (() => {
    if (typeof window === "undefined") return false
    try {
      return Boolean(localStorage.getItem(DRAFT_KEY))
    } catch {
      return false
    }
  })()

  if (view === "wizard") {
    return (
      <OnboardingWizard
        inviteEmail={invite.inviteEmail}
        resumeDraft={resumeDraft}
        onExit={() => {
          setView("invite")
          setResumeDraft(false)
        }}
      />
    )
  }

  return (
    <RegistrationInvite
      invite={invite}
      canResume={canResume}
      onStart={() => {
        setResumeDraft(false)
        setView("wizard")
      }}
      onResume={() => {
        setResumeDraft(true)
        setView("wizard")
      }}
    />
  )
}
