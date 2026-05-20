"use client"

import { useFormContext } from "react-hook-form"

import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import ErrorMessage from "@/components/shared/form-error-message"
import RHFDatePicker from "../fields/RHFDatePicker"
import RHFInlineFileUpload from "../fields/RHFInlineFileUpload"
import type { OnboardingFormValues } from "../onboarding-schemas"

export default function TaxIdentityStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="niNumber">NI Number*</FieldLabel>
          <FieldContent>
            <Input
              id="niNumber"
              placeholder="QQ 12 34 56 C"
              {...register("niNumber")}
            />
            {errors.niNumber && (
              <ErrorMessage message={errors.niNumber.message} />
            )}
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="utr">UTR*</FieldLabel>
          <FieldContent>
            <Input id="utr" placeholder="1234567890" {...register("utr")} />
            <div className="mt-2 text-xs text-muted-foreground">
              Unique Taxpayer Reference
            </div>
            {errors.utr && <ErrorMessage message={errors.utr.message} />}
          </FieldContent>
        </Field>
      </div>

      <div className="border-t border-input pt-6">
        <div className="text-sm font-medium text-foreground">
          Passport Details (Optional)
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="passportNumber">Passport Number</FieldLabel>
            <FieldContent>
              <Input
                id="passportNumber"
                placeholder="123456789"
                {...register("passportNumber")}
              />
              {errors.passportNumber && (
                <ErrorMessage message={errors.passportNumber.message} />
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Passport Expiry Date</FieldLabel>
            <FieldContent>
              <RHFDatePicker<OnboardingFormValues>
                name="passportExpiryDate"
                placeholder="Passport expiry date"
              />
            </FieldContent>
          </Field>

          <div className="col-span-full">
            <Field>
              <FieldLabel>Passport Upload</FieldLabel>
              <FieldContent>
                <div className="text-xs text-muted-foreground">
                  Upload a clear copy of your passport (optional)
                </div>
                <div className="mt-2">
                  <RHFInlineFileUpload<OnboardingFormValues>
                    name="passportFile"
                    accept="application/pdf,image/*"
                  />
                </div>
              </FieldContent>
            </Field>
          </div>
        </div>
      </div>
    </div>
  )
}
