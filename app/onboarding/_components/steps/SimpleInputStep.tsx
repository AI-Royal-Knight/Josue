"use client"

import { useFormContext } from "react-hook-form"

import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import ErrorMessage from "@/components/shared/form-error-message"
import type { OnboardingFormValues } from "../onboarding-schemas"

export default function SimpleInputStep({
  fields,
}: {
  fields: Array<{
    name: keyof OnboardingFormValues
    label: string
    placeholder?: string
  }>
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>()

  return (
    <div className="grid grid-cols-2 gap-4">
      {fields.map((field) => (
        <Field key={String(field.name)} className="col-span-full md:col-span-1">
          <FieldLabel htmlFor={String(field.name)}>{field.label}</FieldLabel>
          <FieldContent>
            <Input
              id={String(field.name)}
              placeholder={field.placeholder}
              {...register(field.name)}
            />
            {errors[field.name] && (
              <ErrorMessage
                message={(errors[field.name] as { message?: string })?.message}
              />
            )}
          </FieldContent>
        </Field>
      ))}
    </div>
  )
}
