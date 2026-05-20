"use client"

import { useId } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { format } from "date-fns"

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import ErrorMessage from "@/components/shared/form-error-message"
import type { OnboardingFormValues } from "../onboarding-schemas"
import SignaturePadField from "../fields/SignaturePadField"

export default function TermsSignatureStep() {
  const checkboxId = useId()
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>()

  const acceptTerms = watch("acceptTerms")
  const signatureDate = useWatch<OnboardingFormValues>({
    name: "signatureDate",
  })
  const signatureDataUrl = useWatch<OnboardingFormValues>({
    name: "signatureDataUrl",
  })

  return (
    <div className="space-y-4">
      <div className="rounded-none border border-input bg-background px-4 py-3">
        <div className="text-xs font-medium text-foreground">
          Terms and Conditions Document
        </div>

        <div className="mt-3 max-h-44 overflow-auto rounded-none border border-input bg-background px-3 py-3">
          <div className="space-y-3 text-xs text-muted-foreground">
            <div>
              Payment for services will be processed according to agreed project
              terms. Bank details provided must be accurate and belong to the
              registered individual or company.
            </div>
            <div>
              <div className="text-xs font-medium text-foreground">
                6. Account Approval Process
              </div>
              <div className="text-xs text-muted-foreground">
                Account registration is subject to approval by authorized
                personnel (Commercial Manager or Contracts Manager). Approval is
                not guaranteed and may be denied if information is incomplete or
                inaccurate.
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-foreground">
                7. Liability
              </div>
              <div className="text-xs text-muted-foreground">
                Users agree to indemnify and hold harmless the platform and its
                operators from any claim, damages, or expenses arising from use
                of the service or breach of these terms.
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-foreground">
                8. Changes to Terms
              </div>
              <div className="text-xs text-muted-foreground">
                We reserve the right to modify these terms at any time. Users
                will be notified of significant changes, and continued use of
                the platform constitutes acceptance of modified terms.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Field>
        <div className="flex items-start gap-3">
          <Checkbox
            id={checkboxId}
            checked={acceptTerms}
            onCheckedChange={(checked) => {
              setValue("acceptTerms", checked === true, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }}
          />
          <div className="flex-1">
            <FieldLabel htmlFor={checkboxId}>
              I have read and agree to the terms and conditions*
            </FieldLabel>
            {errors.acceptTerms && (
              <ErrorMessage message={errors.acceptTerms.message} />
            )}
          </div>
        </div>
      </Field>

      <Field>
        <FieldLabel>Digital Signature*</FieldLabel>
        <FieldContent>
          <SignaturePadField<OnboardingFormValues> name="signatureDataUrl" />
          {!signatureDataUrl && (
            <div className="mt-2 rounded-none border border-input bg-accent/20 px-3 py-2 text-xs text-muted-foreground">
              Please provide your digital signature before submitting
            </div>
          )}
          {errors.signatureDataUrl && (
            <ErrorMessage message={errors.signatureDataUrl.message} />
          )}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="signatureName">Type Full Name*</FieldLabel>
        <FieldContent>
          <Input
            id="signatureName"
            placeholder="Alex Turner"
            {...register("signatureName")}
          />
          {errors.signatureName && (
            <ErrorMessage message={errors.signatureName.message} />
          )}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="signatureDate">Signature Date</FieldLabel>
        <FieldContent>
          <Input
            id="signatureDate"
            value={
              signatureDate instanceof Date
                ? format(signatureDate, "dd MMMM yyyy")
                : ""
            }
            disabled
            readOnly
          />
          {errors.signatureDate && (
            <ErrorMessage message={errors.signatureDate.message} />
          )}
        </FieldContent>
      </Field>
    </div>
  )
}
