"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { formatDistanceToNowStrict } from "date-fns"
import { ArrowLeft, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  onboardingDefaultValues,
  onboardingFullSchema,
  onboardingSteps,
  type OnboardingFormValues,
} from "./onboarding-schemas"
import { cn } from "@/lib/utils"
import BasicInfoStep from "./steps/BasicInfoStep"
import ProfessionStep from "./steps/ProfessionStep"
import TaxIdentityStep from "./steps/TaxIdentityStep"
import CertificationsStep from "./steps/CertificationsStep"
import CompanyInfoStep from "./steps/CompanyInfoStep"
import InsuranceAddressStep from "./steps/InsuranceAddressStep"
import BankDetailsStep from "./steps/BankDetailsStep"
import TermsSignatureStep from "./steps/TermsSignatureStep"

const DRAFT_KEY = "onboarding-draft"

type StepperItem = {
  label: string
  isComplete: boolean
  isActive: boolean
  index: number
}

function Stepper({ items }: { items: StepperItem[] }) {
  return (
    <div className="w-full border-b border-input">
      <div className="mx-auto max-w-5xl overflow-x-auto px-6 py-4">
        <div className="flex min-w-[860px] items-center">
          {items.map((item, idx) => (
            <div key={item.label} className="flex flex-1 items-center">
              <div className="flex min-w-[96px] flex-col items-center gap-2">
                <div
                  className={cn(
                    "grid size-7 place-content-center rounded-none border border-input text-xs",
                    item.isComplete
                      ? "bg-emerald-500/20 text-emerald-400"
                      : item.isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "bg-background text-muted-foreground"
                  )}
                >
                  {item.isComplete ? (
                    <Check className="size-4" />
                  ) : (
                    item.index + 1
                  )}
                </div>
                <div
                  className={cn(
                    "text-center text-[11px]",
                    item.isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </div>
              </div>

              {idx < items.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-px flex-1",
                    item.isComplete ? "bg-sidebar-primary" : "bg-input"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function getStepContent(stepKey: string) {
  switch (stepKey) {
    case "basic":
      return <BasicInfoStep />
    case "profession":
      return <ProfessionStep />
    case "taxIdentity":
      return <TaxIdentityStep />
    case "certifications":
      return <CertificationsStep />
    case "companyInfo":
      return <CompanyInfoStep />
    case "insuranceAddress":
      return <InsuranceAddressStep />
    case "bankDetails":
      return <BankDetailsStep />
    case "terms":
      return <TermsSignatureStep />
    default:
      return null
  }
}

function reviveDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value
  if (typeof value === "string") {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) return d
  }
  return undefined
}

export default function OnboardingWizard({
  inviteEmail,
  resumeDraft,
  onExit,
}: {
  inviteEmail: string
  resumeDraft: boolean
  onExit: () => void
}) {
  const [stepIndex, setStepIndex] = useState(0)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  const schemaRef = useRef(onboardingSteps[0].schema)
  schemaRef.current = onboardingSteps[stepIndex]?.schema

  const resolver = useMemo(() => {
    return async (...args: Parameters<ReturnType<typeof zodResolver>>) => {
      const baseResolver = zodResolver(schemaRef.current as any)
      return baseResolver(...args)
    }
  }, [])

  const form = useForm<OnboardingFormValues>({
    resolver: resolver as any,
    defaultValues: { ...onboardingDefaultValues, email: inviteEmail } as any,
    mode: "onSubmit",
  })

  const { handleSubmit, trigger, getValues, reset } = form

  useEffect(() => {
    if (!resumeDraft) return

    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<OnboardingFormValues> & {
        __savedAt?: string
      }

      const nextValues = {
        ...onboardingDefaultValues,
        ...parsed,
        email: inviteEmail,
      } as Partial<OnboardingFormValues>

      // Re-hydrate date fields from JSON strings.
      ;(nextValues as any).passportExpiryDate = reviveDate(
        (parsed as any).passportExpiryDate
      )

      const certKeys = ["ipaf", "pasma", "sssts", "cscs"] as const
      for (const key of certKeys) {
        const raw = (parsed as any)?.certifications?.[key]?.expiryDate
        if (raw) {
          ;(nextValues as any).certifications ??= {}
          ;(nextValues as any).certifications[key] ??= {}
          ;(nextValues as any).certifications[key].expiryDate = reviveDate(raw)
        }
      }

      const insKeys = ["publicLiability", "employersLiability"] as const
      for (const key of insKeys) {
        const raw = (parsed as any)?.insurance?.[key]?.expiryDate
        if (raw) {
          ;(nextValues as any).insurance ??= {}
          ;(nextValues as any).insurance[key] ??= {}
          ;(nextValues as any).insurance[key].expiryDate = reviveDate(raw)
        }
      }

      ;(nextValues as any).signatureDate = reviveDate(
        (parsed as any).signatureDate
      )

      reset(nextValues as any)
      if (parsed.__savedAt) {
        setLastSavedAt(new Date(parsed.__savedAt))
      }
    } catch {
      // ignore
    }
  }, [inviteEmail, reset, resumeDraft])

  const step = onboardingSteps[stepIndex]
  const isLastStep = stepIndex === onboardingSteps.length - 1

  const stepperItems: StepperItem[] = onboardingSteps.map((s, idx) => ({
    label: s.label,
    index: idx,
    isActive: idx === stepIndex,
    isComplete: idx < stepIndex,
  }))

  const goBack = () => {
    if (stepIndex === 0) {
      onExit()
      return
    }
    setStepIndex((i) => Math.max(0, i - 1))
  }

  const onSaveDraft = () => {
    const snapshot = {
      ...getValues(),
      __savedAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(snapshot))
      setLastSavedAt(new Date())
    } catch {
      // ignore
    }
  }

  const onNext = async () => {
    const ok = await trigger()
    if (!ok) return
    setStepIndex((i) => Math.min(onboardingSteps.length - 1, i + 1))
  }

  const onSubmit = async (values: OnboardingFormValues) => {
    const parsed = onboardingFullSchema.safeParse(values)
    if (!parsed.success) {
      // Let the user correct with step-by-step navigation.
      console.log("Onboarding invalid", parsed.error.flatten())
      return
    }

    console.log("Submitting onboarding", parsed.data)
    localStorage.removeItem(DRAFT_KEY)
    setLastSavedAt(null)
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <Stepper items={stepperItems} />

      <div className="mx-auto max-w-5xl px-6 py-6">
        <Button type="button" variant="ghost" size="sm" onClick={goBack}>
          <ArrowLeft /> Back
        </Button>

        <div className="mt-4">
          <div className="text-2xl font-semibold text-foreground">
            {step.title}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {lastSavedAt
              ? `Saved ${formatDistanceToNowStrict(lastSavedAt)} ago`
              : ""}
          </div>
        </div>

        <div className="mt-6">
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className="border border-input">
                <CardHeader className="border-b border-input">
                  <CardTitle className="text-sm">
                    Step {stepIndex + 1}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-4">
                  {getStepContent(step.key)}
                </CardContent>

                <CardFooter className="flex items-center justify-between gap-3">
                  <Button type="button" variant="outline" onClick={onSaveDraft}>
                    Save as Draft
                  </Button>

                  {isLastStep ? (
                    <Button type="submit" className="h-10 flex-1">
                      Submit Registration
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={onNext}
                      className="h-10 flex-1"
                    >
                      Continue
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  )
}
