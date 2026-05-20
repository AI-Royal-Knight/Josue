"use client"

import { useFormContext, useWatch } from "react-hook-form"
import { Shield, Bell } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import ErrorMessage from "@/components/shared/form-error-message"
import RHFDatePicker from "../fields/RHFDatePicker"
import RHFInlineFileUpload from "../fields/RHFInlineFileUpload"
import type { OnboardingFormValues } from "../onboarding-schemas"

function InsuranceCard({
  title,
  name,
}: {
  title: string
  name: "publicLiability" | "employersLiability"
}) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>()

  const reminder = useWatch<OnboardingFormValues>({
    name: `insurance.${name}.reminder` as const,
  })

  const policyError = (errors.insurance as any)?.[name]?.policyNumber
    ?.message as string | undefined

  return (
    <div className="rounded-none border border-input p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium text-foreground">{title}</div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Bell className="size-3.5" /> Reminder
          </div>
          <Switch
            checked={Boolean(reminder)}
            onCheckedChange={(checked) =>
              setValue(
                `insurance.${name}.reminder` as const,
                checked === true,
                {
                  shouldDirty: true,
                }
              )
            }
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor={`${name}-policy`}>Policy Number</FieldLabel>
          <FieldContent>
            <Input
              id={`${name}-policy`}
              placeholder="PL123456789"
              {...register(`insurance.${name}.policyNumber` as const)}
            />
            {policyError && <ErrorMessage message={policyError} />}
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Expiry Date</FieldLabel>
          <FieldContent>
            <RHFDatePicker<OnboardingFormValues>
              name={`insurance.${name}.expiryDate` as const}
              placeholder="Expiry date"
            />
          </FieldContent>
        </Field>

        <div className="col-span-full">
          <Field>
            <FieldLabel>Upload Document</FieldLabel>
            <FieldContent>
              <div className="text-xs text-muted-foreground">
                Upload your {title} insurance certificate
              </div>
              <div className="mt-2">
                <RHFInlineFileUpload<OnboardingFormValues>
                  name={`insurance.${name}.file` as const}
                  accept="application/pdf,image/*"
                />
              </div>
            </FieldContent>
          </Field>
        </div>
      </div>
    </div>
  )
}

export default function InsuranceAddressStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>()

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-medium text-foreground">
          Insurance Details
        </div>
        <div className="mt-3 space-y-3">
          <InsuranceCard title="Public Liability" name="publicLiability" />
          <InsuranceCard
            title="Employers Liability"
            name="employersLiability"
          />
        </div>
      </div>

      <div>
        <div className="text-xs font-medium text-foreground">Address</div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="col-span-full">
            <Field>
              <FieldLabel htmlFor="buildingNumber">Building Number</FieldLabel>
              <FieldContent>
                <Input
                  id="buildingNumber"
                  placeholder="42"
                  {...register("address.buildingNumber")}
                />
                {(errors.address as any)?.buildingNumber?.message && (
                  <ErrorMessage
                    message={(errors.address as any)?.buildingNumber?.message}
                  />
                )}
              </FieldContent>
            </Field>
          </div>

          <div className="col-span-full">
            <Field>
              <FieldLabel htmlFor="street">Street</FieldLabel>
              <FieldContent>
                <Input
                  id="street"
                  placeholder="Victoria Street"
                  {...register("address.street")}
                />
                {(errors.address as any)?.street?.message && (
                  <ErrorMessage
                    message={(errors.address as any)?.street?.message}
                  />
                )}
              </FieldContent>
            </Field>
          </div>

          <div className="col-span-full">
            <Field>
              <FieldLabel htmlFor="postcode">Postcode</FieldLabel>
              <FieldContent>
                <Input
                  id="postcode"
                  placeholder="SW1A 1AA"
                  {...register("address.postcode")}
                />
                {(errors.address as any)?.postcode?.message && (
                  <ErrorMessage
                    message={(errors.address as any)?.postcode?.message}
                  />
                )}
              </FieldContent>
            </Field>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-none border border-input bg-accent/20 px-4 py-3">
        <Shield className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="text-xs text-muted-foreground">
          Insurance details are reviewed before activation.
        </div>
      </div>
    </div>
  )
}
