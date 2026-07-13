"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { requestAdminAccess, type RequestAdminPayload } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"

const requestSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Surname is required"),
  email: z.string().email("Enter a valid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
})

type RequestFormValues = z.infer<typeof requestSchema>

export default function RequestAdminPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormValues>({ resolver: zodResolver(requestSchema) })

  const onSubmit = async (values: RequestFormValues) => {
    setServerError(null)
    setSuccessMsg(null)
    try {
      const res = await requestAdminAccess(values)
      setSuccessMsg(res.message)
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : "Something went wrong while submitting your request."
      )
    }
  }

  if (successMsg) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#151515] p-4 text-white">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1A] p-8 shadow-2xl transition-all">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 rounded-full bg-emerald-500/20 p-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">Request Submitted!</h1>
            <p className="mb-8 text-sm text-slate-400">
              {successMsg} Our team will review your application shortly. You will receive an email once your account has been approved.
            </p>
            <Button asChild className="h-12 w-full !bg-[#E5FE4D] text-base font-semibold !text-black hover:!bg-[#D4ED40] hover:!text-black border-0">
              <Link href="/">
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#151515] p-4 text-white sm:p-8">
      <div className="w-full max-w-[500px] overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1A] p-6 shadow-2xl sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Request Admin Access
          </h1>
          <p className="text-sm text-slate-400">
            Fill out the form below to register your company and become an administrator on our platform.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Field>
            <FieldLabel htmlFor="company_name" className="text-slate-300">Company Name</FieldLabel>
            <FieldContent>
              <Input
                id="company_name"
                placeholder="e.g. Acme Corp"
                className="h-11 border-white/10 bg-[#222222] text-white focus:border-[#E5FE4D]"
                {...register("company_name")}
              />
              {errors.company_name && (
                <p className="mt-1 text-xs text-red-400">{errors.company_name.message}</p>
              )}
            </FieldContent>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="first_name" className="text-slate-300">First Name</FieldLabel>
              <FieldContent>
                <Input
                  id="first_name"
                  placeholder="John"
                  className="h-11 border-white/10 bg-[#222222] text-white focus:border-[#E5FE4D]"
                  {...register("first_name")}
                />
                {errors.first_name && (
                  <p className="mt-1 text-xs text-red-400">{errors.first_name.message}</p>
                )}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="last_name" className="text-slate-300">Surname</FieldLabel>
              <FieldContent>
                <Input
                  id="last_name"
                  placeholder="Doe"
                  className="h-11 border-white/10 bg-[#222222] text-white focus:border-[#E5FE4D]"
                  {...register("last_name")}
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-red-400">{errors.last_name.message}</p>
                )}
              </FieldContent>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="email" className="text-slate-300">Work Email</FieldLabel>
            <FieldContent>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@acme.com"
                className="h-11 border-white/10 bg-[#222222] text-white focus:border-[#E5FE4D]"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="phone_number" className="text-slate-300">Phone Number</FieldLabel>
            <FieldContent>
              <Input
                id="phone_number"
                placeholder="+44 20 7123 4567"
                className="h-11 border-white/10 bg-[#222222] text-white focus:border-[#E5FE4D]"
                {...register("phone_number")}
              />
              {errors.phone_number && (
                <p className="mt-1 text-xs text-red-400">{errors.phone_number.message}</p>
              )}
            </FieldContent>
          </Field>

          {serverError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full !bg-[#E5FE4D] text-base font-semibold !text-black hover:!bg-[#D4ED40] hover:!text-black border-0"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Submit Request
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#E5FE4D] hover:underline">
              Log In
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
