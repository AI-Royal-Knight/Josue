"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Save } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { getProfile, updateProfile, type ProfileData } from "@/lib/api/auth"

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Surname is required"),
  email: z.string().email("Enter a valid email"),
  backup_email: z.string().email("Enter a valid email").optional().or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function Page() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    getProfile()
      .then((data) => {
        reset({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          backup_email: data.backup_email || "",
        })
      })
      .catch((err) => setError("Failed to load profile."))
      .finally(() => setLoading(false))
  }, [reset])

  const onSubmit = async (values: ProfileFormValues) => {
    setError(null)
    setSuccess(null)
    try {
      const data = await updateProfile({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        backup_email: values.backup_email || undefined,
      })
      reset({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        backup_email: data.backup_email || "",
      })
      setSuccess("Profile updated successfully.")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update profile.")
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Super Admin Profile</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="font-semibold text-white">Basic Information</h2>
            </div>
            
            {error && (
              <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>First Name</FieldLabel>
                  <FieldContent>
                    <Input {...register("first_name")} />
                    {errors.first_name && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.first_name.message}
                      </p>
                    )}
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Surname</FieldLabel>
                  <FieldContent>
                    <Input {...register("last_name")} />
                    {errors.last_name && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.last_name.message}
                      </p>
                    )}
                  </FieldContent>
                </Field>
              </div>

              <Field>
                <FieldLabel>Email Address</FieldLabel>
                <FieldContent>
                  <Input type="email" {...register("email")} />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>Backup Email Address (Optional)</FieldLabel>
                <FieldContent>
                  <Input type="email" {...register("backup_email")} />
                  {errors.backup_email && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.backup_email.message}
                    </p>
                  )}
                </FieldContent>
              </Field>

              <div className="pt-4">
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
