"use client"

import { useMemo, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"

import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import ErrorMessage from "@/components/shared/form-error-message"
import { Button } from "@/components/ui/button"
import type { OnboardingFormValues } from "../onboarding-schemas"

function PasswordChecklist({ password }: { password: string }) {
  const items = useMemo(
    () => [
      { ok: password.length >= 8, label: "8+ characters" },
      { ok: /[A-Z]/.test(password), label: "1 uppercase letter" },
      { ok: /\d/.test(password), label: "1 number" },
    ],
    [password]
  )

  return (
    <div className="rounded-none border border-input bg-background px-3 py-2">
      <div className="text-xs text-muted-foreground">
        Password must contain:
      </div>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li
            key={item.label}
            className={
              item.ok
                ? "text-xs text-emerald-500"
                : "text-xs text-muted-foreground"
            }
          >
            {item.ok ? "✓" : "•"} {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function BasicInfoStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>()

  const password = (useWatch<OnboardingFormValues>({ name: "password" }) as string) ?? ""

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className="grid grid-cols-2 gap-4">
      <Field>
        <FieldLabel htmlFor="firstName">First Name*</FieldLabel>
        <FieldContent>
          <Input
            id="firstName"
            placeholder="First name"
            {...register("firstName")}
          />
          {errors.firstName && (
            <ErrorMessage message={errors.firstName.message} />
          )}
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="surname">Surname*</FieldLabel>
        <FieldContent>
          <Input id="surname" placeholder="Surname" {...register("surname")} />
          {errors.surname && <ErrorMessage message={errors.surname.message} />}
        </FieldContent>
      </Field>

      <div className="col-span-full">
        <Field>
          <FieldLabel htmlFor="email">Email Address*</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              placeholder="name@example.com"
              {...register("email")}
              disabled
            />
            <div className="mt-2 text-xs text-muted-foreground">
              This email was used in your invite
            </div>
            {errors.email && <ErrorMessage message={errors.email.message} />}
          </FieldContent>
        </Field>
      </div>

      <div className="col-span-full">
        <Field>
          <FieldLabel htmlFor="password">Password*</FieldLabel>
          <FieldContent>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 -translate-y-1/2"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            {errors.password && (
              <ErrorMessage message={errors.password.message} />
            )}

            <div className="mt-3">
              <PasswordChecklist password={password} />
            </div>
          </FieldContent>
        </Field>
      </div>

      <div className="col-span-full">
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password*</FieldLabel>
          <FieldContent>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                {...register("confirmPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 -translate-y-1/2"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <ErrorMessage message={errors.confirmPassword.message} />
            )}
          </FieldContent>
        </Field>
      </div>
    </div>
  )
}
