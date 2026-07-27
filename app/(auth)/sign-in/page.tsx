"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthCard from "@/app/(auth)/_components/auth-card"
import { login } from "@/lib/api/auth"
import { useAuthStore } from "@/lib/auth-store"
import { useRoleStore } from "@/lib/role-store"
import { ApiError } from "@/lib/api/client"
import { getDashboardUrl } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function SignInPage() {
  const router = useRouter()
  const { setTokens, setUser } = useAuthStore()
  const { setRole } = useRoleStore()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)
    try {
      const res = await login({ email: values.email, password: values.password })

      // Persist tokens
      setTokens(res.access_token, res.refresh_token)

      // Persist user info
      setUser({
        email: res.user.email,
        first_name: res.user.first_name,
        last_name: res.user.last_name,
        role: res.user.role,
        secondary_role: res.user.secondary_role,
        role_assignments: res.user.role_assignments,
      })

      const uniqueRoles = new Set<string>()
      if (res.user.role) uniqueRoles.add(res.user.role)
      if (res.user.secondary_role) uniqueRoles.add(res.user.secondary_role)
      if (res.user.role_assignments) {
        res.user.role_assignments.forEach((a: any) => uniqueRoles.add(a.role))
      }

      if (res.user.role === "super_admin") {
        setRole("super_admin")
        window.location.href = "/super-admin"
      } else if (uniqueRoles.size > 1) {
        // User has multiple roles — show the selector page
        router.push("/select-role")
      } else {
        // Single role — go straight in
        const role = Array.from(uniqueRoles)[0] || res.user.role
        setRole(role)
        router.push(getDashboardUrl(role))
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message)
      } else {
        setServerError("Something went wrong. Please try again.")
      }
    }
  }

  return (
    <AuthCard
      title="Sign in"
      className="text-slate-100"
      footer={
        <Link
          href="/forgot-password"
          className="text-xs text-slate-300 transition hover:text-white"
        >
          Forgot password?
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Email */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold tracking-[0.15em] text-slate-300 uppercase transition-colors group-focus-within:text-blue-400">
            Email
          </label>
          <div className="relative group/input">
            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/input:text-blue-400" />
            <Input
              id="sign-in-email"
              type="email"
              placeholder="Enter email"
              autoComplete="email"
              {...register("email")}
              className="h-12 rounded-xl border-white/20 bg-white/5 pl-10 text-sm text-white placeholder:text-slate-500 backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          {errors.email && (
            <p className="animate-in fade-in slide-in-from-top-1 mt-1 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold tracking-[0.15em] text-slate-300 uppercase transition-colors group-focus-within:text-blue-400">
            Password
          </label>
          <div className="relative group/input">
            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/input:text-blue-400" />
            <Input
              id="sign-in-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              autoComplete="current-password"
              {...register("password")}
              className="h-12 rounded-xl border-white/20 bg-white/5 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-white focus:outline-none focus:text-blue-400"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="animate-in fade-in slide-in-from-top-1 mt-1 text-xs text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Server error */}
        {serverError && (
          <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
            <div className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            {serverError}
          </div>
        )}

        <Button
          id="sign-in-submit"
          type="submit"
          disabled={isSubmitting}
          className="mt-4 h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold tracking-[0.2em] uppercase text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/30"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </AuthCard>
  )
}
