"use client"

import { Shield } from "lucide-react"
import { useFormContext } from "react-hook-form"

import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import ErrorMessage from "@/components/shared/form-error-message"
import type { OnboardingFormValues } from "../onboarding-schemas"

export default function BankDetailsStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>()

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-none border border-input bg-accent/20 px-4 py-3">
        <Shield className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="text-xs text-muted-foreground">
          Your banking information is stored securely and used for payment
          processing.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-full">
          <Field>
            <FieldLabel htmlFor="bankName">Name of Bank*</FieldLabel>
            <FieldContent>
              <Input
                id="bankName"
                placeholder="Barclays Bank"
                {...register("bankName")}
              />
              {errors.bankName && (
                <ErrorMessage message={errors.bankName.message} />
              )}
            </FieldContent>
          </Field>
        </div>

        <div className="col-span-full">
          <Field>
            <FieldLabel htmlFor="bankAddress">Address of Bank*</FieldLabel>
            <FieldContent>
              <Input
                id="bankAddress"
                placeholder="1 Churchill Place, London, E14 5HP"
                {...register("bankAddress")}
              />
              {errors.bankAddress && (
                <ErrorMessage message={errors.bankAddress.message} />
              )}
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="nameOnCard">Name on the card*</FieldLabel>
          <FieldContent>
            <Input
              id="nameOnCard"
              placeholder="Alex Turner"
              {...register("nameOnCard")}
            />
            {errors.nameOnCard && (
              <ErrorMessage message={errors.nameOnCard.message} />
            )}
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="accountNumber">Account Number*</FieldLabel>
          <FieldContent>
            <Input
              id="accountNumber"
              placeholder="12345678"
              {...register("accountNumber")}
            />
            {errors.accountNumber && (
              <ErrorMessage message={errors.accountNumber.message} />
            )}
          </FieldContent>
        </Field>
      </div>
    </div>
  )
}
