"use client"

import { Info } from "lucide-react"
import { useFormContext } from "react-hook-form"

import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { OnboardingFormValues } from "../onboarding-schemas"

export default function CompanyInfoStep() {
  const { register } = useFormContext<OnboardingFormValues>()

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-none border border-input bg-accent/20 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="text-xs text-muted-foreground">
          Only fill this section if you are registering under a company. If
          you're registering as an individual, you can skip these fields and
          continue.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-full">
          <Field>
            <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
            <FieldContent>
              <Input
                id="companyName"
                placeholder="Enter company name"
                {...register("companyName")}
              />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="companiesHouseNumber">
            Companies House Number
          </FieldLabel>
          <FieldContent>
            <Input
              id="companiesHouseNumber"
              placeholder="12345678"
              {...register("companiesHouseNumber")}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="companyUtr">Company UTR</FieldLabel>
          <FieldContent>
            <Input
              id="companyUtr"
              placeholder="1234567890"
              {...register("companyUtr")}
            />
          </FieldContent>
        </Field>

        <div className="col-span-full">
          <Field>
            <FieldLabel htmlFor="vatNumber">VAT Number</FieldLabel>
            <FieldContent>
              <Input
                id="vatNumber"
                placeholder="GB123456789"
                {...register("vatNumber")}
              />
            </FieldContent>
          </Field>
        </div>
      </div>
    </div>
  )
}
