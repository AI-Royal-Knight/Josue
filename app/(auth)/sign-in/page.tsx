"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, Loader2, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthCard from "@/app/(auth)/_components/auth-card"
import { login, verify2FA, resend2FA, type LoginSuccessResponse } from "@/lib/api/auth"
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

  // Two-Factor Authentication state
  const [twoFactorPending, setTwoFactorPending] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isResendingOtp, setIsResendingOtp] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendSuccess, setResendSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const handleSuccessfulLogin = (res: LoginSuccessResponse) => {
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
    } else if (res.user.role === "supplier") {
      setRole("supplier")
      router.push("/supplier/companies")
    } else if (res.user.role === "managing_director") {
      // Managing Director dashboard is strictly and only for Managing Director
      setRole("managing_director")
      router.push(getDashboardUrl("managing_director"))
    } else if (uniqueRoles.size > 1) {
      // User has multiple roles — show the selector page
      router.push("/select-role")
    } else {
      // Single role — go straight in
      const role = Array.from(uniqueRoles)[0] || res.user.role
      setRole(role)
      router.push(getDashboardUrl(role))
    }
  }

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)
    setResendSuccess(null)
    try {
      const res = await login({ email: values.email, password: values.password })

      if (res.requires_2fa) {
        setTwoFactorPending(true)
        setPendingEmail(res.email)
        setOtp("")
        toast.info("Verification code sent to your email")
        return
      }

      handleSuccessfulLogin(res)
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message)
      } else {
        setServerError("Something went wrong. Please try again.")
      }
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      setServerError("Please enter a valid 6-digit code.")
      return
    }

    setServerError(null)
    setIsVerifyingOtp(true)
    try {
      const res = await verify2FA({
        email: pendingEmail,
        otp: otp.trim(),
      })
      toast.success("Verification successful")
      handleSuccessfulLogin(res)
    } catch (err: any) {
      if (err instanceof ApiError) {
        setServerError(err.message)
      } else {
        setServerError("Invalid or expired verification code.")
      }
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleResend2FA = async () => {
    if (resendCooldown > 0 || isResendingOtp) return
    setIsResendingOtp(true)
    setServerError(null)
    try {
      const res = await resend2FA({ email: pendingEmail })
      setResendSuccess("A new verification code has been sent to your email.")
      setResendCooldown(30)
      toast.success("New verification code sent")
      setTimeout(() => setResendSuccess(null), 5000)
    } catch (err: any) {
      toast.error(err.message || "Failed to resend code")
    } finally {
      setIsResendingOtp(false)
    }
  }

  // Two-Step Verification challenge screen
  if (twoFactorPending) {
    return (
      <AuthCard
        title="Two-Step Verification"
        subtitle={`We've sent a 6-digit verification code to ${pendingEmail}`}
        className="text-slate-100"
        footer={
          <button
            type="button"
            onClick={() => {
              setTwoFactorPending(false)
              setOtp("")
              setServerError(null)
            }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </button>
        }
      >
        <div className="flex justify-center -mt-2 mb-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <ShieldCheck className="h-7 w-7" />
          </div>
        </div>

        <form onSubmit={handleVerify2FA} className="flex flex-col gap-4">
          <div className="space-y-1.5 text-center">
            <label className="block text-xs font-semibold tracking-[0.15em] text-slate-300 uppercase">
              Enter 6-Digit Code
            </label>
            <Input
              id="2fa-otp-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6)
                setOtp(val)
                if (serverError) setServerError(null)
              }}
              onPaste={(e) => {
                e.preventDefault()
                const pasted = e.clipboardData.getData("text")
                const val = pasted.replace(/\D/g, "").slice(0, 6)
                setOtp(val)
                if (serverError) setServerError(null)
              }}
              placeholder="••••••"
              className="h-14 rounded-xl border-white/20 bg-white/5 text-center font-mono text-2xl font-bold tracking-[0.4em] text-white placeholder:text-slate-600 backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Check your inbox (and spam folder) for the verification code.
            </p>
          </div>

          {/* Resend success notice */}
          {resendSuccess && (
            <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300 backdrop-blur-sm">
              <div className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {resendSuccess}
            </div>
          )}

          {/* Server error */}
          {serverError && (
            <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300 backdrop-blur-sm">
              <div className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
              {serverError}
            </div>
          )}

          <Button
            id="verify-2fa-submit"
            type="submit"
            disabled={otp.length !== 6 || isVerifyingOtp}
            className="mt-2 h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold tracking-[0.2em] uppercase text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/30"
          >
            {isVerifyingOtp ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Verify & Sign in"
            )}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              disabled={resendCooldown > 0 || isResendingOtp}
              onClick={handleResend2FA}
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 transition hover:text-blue-300 disabled:opacity-50 disabled:hover:text-blue-400"
            >
              {isResendingOtp ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Didn't receive a code? Resend"}
            </button>
          </div>
        </form>
      </AuthCard>
    )
  }

  // Standard email + password sign-in screen
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

