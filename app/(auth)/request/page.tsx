"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthCard from "@/app/(auth)/_components/auth-card"
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

  // Common input styling matching the auth system
  const inputClass = "h-12 rounded-xl border-white/20 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
  const labelClass = "block text-xs font-semibold tracking-[0.15em] text-slate-300 uppercase transition-colors group-focus-within:text-blue-400 mb-1.5"

  if (successMsg) {
    return (
      <AuthCard title="Request Submitted!" subtitle={successMsg + " Our team will review your application shortly. You will receive an email once your account has been approved."}>
        <div className="flex flex-col items-center justify-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <Link href="/" className="w-full">
            <Button
              type="button"
              className="h-12 w-full rounded-xl bg-slate-800 text-sm font-semibold tracking-[0.2em] uppercase text-white shadow-sm transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-slate-500/30"
            >
              Return to Home
            </Button>
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard 
      title="Apply as a Company" 
      subtitle="Fill out the form below to register your company and become an administrator."
      footer={
        <div className="text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
            Log In
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="group">
          <label htmlFor="company_name" className={labelClass}>Company Name</label>
          <Input
            id="company_name"
            placeholder="e.g. Acme Corp"
            className={inputClass}
            {...register("company_name")}
          />
          {errors.company_name && (
            <p className="mt-1.5 text-xs text-red-400">{errors.company_name.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="group">
            <label htmlFor="first_name" className={labelClass}>First Name</label>
            <Input
              id="first_name"
              placeholder="John"
              className={inputClass}
              {...register("first_name")}
            />
            {errors.first_name && (
              <p className="mt-1.5 text-xs text-red-400">{errors.first_name.message}</p>
            )}
          </div>

          <div className="group">
            <label htmlFor="last_name" className={labelClass}>Surname</label>
            <Input
              id="last_name"
              placeholder="Doe"
              className={inputClass}
              {...register("last_name")}
            />
            {errors.last_name && (
              <p className="mt-1.5 text-xs text-red-400">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div className="group">
          <label htmlFor="email" className={labelClass}>Work Email</label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@acme.com"
            className={inputClass}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="group">
          <label htmlFor="phone_number" className={labelClass}>Phone Number</label>
          <Input
            id="phone_number"
            placeholder="+44 20 7123 4567"
            className={inputClass}
            {...register("phone_number")}
          />
          {errors.phone_number && (
            <p className="mt-1.5 text-xs text-red-400">{errors.phone_number.message}</p>
          )}
        </div>

        {serverError && (
          <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
            <div className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            {serverError}
          </div>
        )}

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold tracking-[0.2em] uppercase text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/30"
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
      </form>
    </AuthCard>
  )
}
