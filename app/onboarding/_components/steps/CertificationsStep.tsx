"use client"

import { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { ChevronDown, ChevronUp, Info } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import ErrorMessage from "@/components/shared/form-error-message"
import RHFDatePicker from "../fields/RHFDatePicker"
import RHFInlineFileUpload from "../fields/RHFInlineFileUpload"
import type { OnboardingFormValues } from "../onboarding-schemas"

type CertKey = "ipaf" | "pasma" | "sssts" | "cscs"

type CertConfig = {
  key: CertKey
  label: string
  required?: boolean
}

const certs: CertConfig[] = [
  { key: "ipaf", label: "IPAF" },
  { key: "pasma", label: "PASMA" },
  { key: "sssts", label: "SSTSS / SMSTS" },
  { key: "cscs", label: "CSCS / ECS / JIB", required: true },
]

function CertAccordion({
  cert,
  isOpen,
  onToggle,
}: {
  cert: CertConfig
  isOpen: boolean
  onToggle: () => void
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>()

  const file = useWatch<OnboardingFormValues>({
    name: `certifications.${cert.key}.file` as const,
  })

  const uploaded = Boolean(file)

  const numberError = (errors.certifications as any)?.[cert.key]?.number
    ?.message as string | undefined
  const expiryError = (errors.certifications as any)?.[cert.key]?.expiryDate
    ?.message as string | undefined

  return (
    <div className="rounded-none border border-input">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-foreground">
            {cert.label}
            {cert.required ? "*" : ""}
          </div>
          {uploaded && <Badge variant="active">Uploaded</Badge>}
        </div>

        {isOpen ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-input px-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor={`${cert.key}-number`}>
                Number{cert.required ? "*" : ""}
              </FieldLabel>
              <FieldContent>
                <Input
                  id={`${cert.key}-number`}
                  placeholder={`${cert.label} number`}
                  {...register(`certifications.${cert.key}.number` as const)}
                />
                {numberError && <ErrorMessage message={numberError} />}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Expiry Date{cert.required ? "*" : ""}</FieldLabel>
              <FieldContent>
                <RHFDatePicker<OnboardingFormValues>
                  name={`certifications.${cert.key}.expiryDate` as const}
                  placeholder="Expiry date"
                />
                {expiryError && <ErrorMessage message={expiryError} />}
              </FieldContent>
            </Field>

            <div className="col-span-full">
              <Field>
                <FieldLabel>Upload Document</FieldLabel>
                <FieldContent>
                  <div className="text-xs text-muted-foreground">
                    Upload your {cert.label} certification
                  </div>
                  <div className="mt-2">
                    <RHFInlineFileUpload<OnboardingFormValues>
                      name={`certifications.${cert.key}.file` as const}
                      accept="application/pdf,image/*"
                    />
                  </div>
                </FieldContent>
              </Field>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-none border border-input bg-accent/20 px-3 py-2">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">
              A notification is sent 2 weeks before expiry. When expired, the
              user must upload a new card and updated expiry date for approval.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CertificationsStep() {
  const [openKey, setOpenKey] = useState<CertKey | null>("cscs")

  return (
    <div className="space-y-3">
      {certs.map((cert) => (
        <CertAccordion
          key={cert.key}
          cert={cert}
          isOpen={openKey === cert.key}
          onToggle={() => setOpenKey((k) => (k === cert.key ? null : cert.key))}
        />
      ))}
    </div>
  )
}
