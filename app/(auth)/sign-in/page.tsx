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
        role_assignments: res.user.role_assignments,
      })

      const assignments = res.user.role_assignments
      const hasManyRoles = assignments && assignments.length > 1

      if (res.user.role === "super_admin") {
        setRole("super_admin")
        window.location.href = "/super-admin"
      } else if (
        res.user.role === "admin" ||
        res.user.role === "project_admin"
      ) {
        // Top-level roles go straight to their dedicated dashboard
        setRole(res.user.role)
        router.push(getDashboardUrl(res.user.role))
      } else if (hasManyRoles) {
        // User has multiple role assignments — show the selector page
        router.push("/")
      } else {
        // Single role — go straight in
        const role = assignments?.[0]?.role ?? res.user.role
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

function getDashboardUrl(role: string): string {
  const map: Record<string, string> = {
    super_admin: "/super-admin",
    admin: "/home",
    project_admin: "/projects",
    managing_director: "/project-overview",
    document_controller: "/users",
    commercial_department: "/variations",
    procurement_department: "/supplier-lists",
    contracts_manager: "/users",
    managers: "/users",
    supervisor: "/users",
    project_director: "/project-overview",
    employee: "/home",
    supplier: "/supplier",
    finance_department: "/invoice-list",
    technical_department: "/project-rfis",
  }
  return map[role] ?? "/home"
}
