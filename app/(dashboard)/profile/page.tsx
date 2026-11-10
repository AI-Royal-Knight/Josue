"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  Loader2,
  Pencil,
  Check,
  X,
  Lock,
  KeyRound,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Copy,
  RotateCcw,
} from "lucide-react"
import { getProfile, updateProfile, type ProfileResponse } from "@/lib/api/profile"
import { changePassword } from "@/lib/api/auth"
import { useRoleStore } from "@/lib/role-store"
import { useAuthStore } from "@/lib/auth-store"
import { toast } from "sonner"

// ─── Password strength calculation helpers ────────────────────────────────────

interface PasswordStrength {
  score: number // 0 to 4
  label: "Empty" | "Weak" | "Fair" | "Good" | "Strong"
  bg: string
  text: string
  checks: {
    length: boolean
    hasLower: boolean
    hasUpper: boolean
    hasNumber: boolean
    hasSpecial: boolean
  }
}

function computePasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  }

  if (!password) {
    return {
      score: 0,
      label: "Empty",
      bg: "bg-white/10",
      text: "text-slate-500",
      checks,
    }
  }

  const passedCount = Object.values(checks).filter(Boolean).length

  if (password.length < 6 || passedCount <= 2) {
    return {
      score: 1,
      label: "Weak",
      bg: "bg-rose-500",
      text: "text-rose-400",
      checks,
    }
  }

  if (passedCount === 3) {
    return {
      score: 2,
      label: "Fair",
      bg: "bg-amber-500",
      text: "text-amber-400",
      checks,
    }
  }

  if (passedCount === 4) {
    return {
      score: 3,
      label: "Good",
      bg: "bg-sky-500",
      text: "text-sky-400",
      checks,
    }
  }

  return {
    score: 4,
    label: "Strong",
    bg: "bg-emerald-500",
    text: "text-emerald-400",
    checks,
  }
}

function generateStrongPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const lower = "abcdefghjkmnpqrstuvwxyz"
  const numbers = "23456789"
  const special = "!@#$%^&*"

  const guaranteed = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ]

  const all = upper + lower + numbers + special
  const remaining: string[] = []
  for (let i = 0; i < 10; i++) {
    remaining.push(all[Math.floor(Math.random() * all.length)])
  }

  return [...guaranteed, ...remaining].sort(() => 0.5 - Math.random()).join("")
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

// Schema for basic profile (Name and Email)
const basicProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
})

type BasicProfileFormValues = z.infer<typeof basicProfileSchema>

// Schema for Change Password
const passwordSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

// ─── Main Profile Page Component ──────────────────────────────────────────────

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null)

  // Password visibility & form state
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null)
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null)
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [justGeneratedPassword, setJustGeneratedPassword] = useState(false)

  const storeRole = useRoleStore((s) => s.role)
  const authUser = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [localActiveRole, setLocalActiveRole] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("tresta:activeRole")
      if (active) return active
      try {
        const sel = localStorage.getItem("tresta:selectedRole")
        if (sel) {
          if (sel.startsWith("{")) {
            const parsed = JSON.parse(sel)
            if (parsed?.state?.role) return parsed.state.role
          } else {
            return sel
          }
        }
      } catch {}
    }
    return null
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("tresta:activeRole")
      if (active && active !== localActiveRole) {
        setLocalActiveRole(active)
      } else if (!active) {
        try {
          const sel = localStorage.getItem("tresta:selectedRole")
          if (sel) {
            const parsed = sel.startsWith("{") ? JSON.parse(sel)?.state?.role : sel
            if (parsed && parsed !== localActiveRole) {
              setLocalActiveRole(parsed)
            }
          }
        } catch {}
      }
    }
  }, [storeRole, localActiveRole])

  // Determine current effective active role with prioritization
  const effectiveRole =
    localActiveRole ||
    storeRole ||
    (typeof window !== "undefined" ? localStorage.getItem("tresta:activeRole") : null) ||
    authUser?.role ||
    profileData?.role ||
    ""

  const roleTitle = effectiveRole
    ? effectiveRole.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "User"

  // Basic Profile Form
  const basicForm = useForm<BasicProfileFormValues>({
    resolver: zodResolver(basicProfileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
    },
  })

  // Password Form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  })

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const data = await getProfile()
      setProfileData(data)

      basicForm.reset({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
      })
    } catch {
      setError("Failed to load profile data.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  // Handle basic profile update (Name and Email)
  const onBasicSubmit = async (values: BasicProfileFormValues) => {
    try {
      setError(null)
      await updateProfile({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
      })
      if (authUser) {
        setUser({
          ...authUser,
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
        })
      }
      toast.success("Profile updated successfully.")
      setIsEditing(false)
      loadProfile()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile."
      setError(msg)
      toast.error(msg)
    }
  }

  // Watched basic form values
  const watchedFirstName = basicForm.watch("first_name")
  const watchedLastName = basicForm.watch("last_name")
  const watchedEmail = basicForm.watch("email")

  // Watched password values for live strength & matching calculation
  const watchedOldPassword = passwordForm.watch("old_password") || ""
  const watchedNewPassword = passwordForm.watch("new_password") || ""
  const watchedConfirmPassword = passwordForm.watch("confirm_password") || ""
  const passwordStrength = computePasswordStrength(watchedNewPassword)
  const isMatching =
    watchedNewPassword.length > 0 && watchedNewPassword === watchedConfirmPassword
  const isMismatched =
    watchedConfirmPassword.length > 0 && watchedNewPassword !== watchedConfirmPassword

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword()
    passwordForm.setValue("new_password", generated, { shouldValidate: true })
    passwordForm.setValue("confirm_password", generated, { shouldValidate: true })
    setShowNewPassword(true)
    setShowConfirmPassword(true)
    setJustGeneratedPassword(true)
    setPasswordErrorMessage(null)
    toast.info("Strong password generated and applied to fields.")
  }

  const handleCopyGeneratedPassword = async () => {
    if (!watchedNewPassword) return
    try {
      await navigator.clipboard.writeText(watchedNewPassword)
      setCopiedPassword(true)
      toast.success("Password copied to clipboard.")
      setTimeout(() => setCopiedPassword(false), 2000)
    } catch {
      toast.error("Failed to copy password to clipboard.")
    }
  }

  const handleResetPasswordForm = () => {
    passwordForm.reset({
      old_password: "",
      new_password: "",
      confirm_password: "",
    })
    setShowOldPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setPasswordErrorMessage(null)
    setPasswordSuccessMessage(null)
    setJustGeneratedPassword(false)
    setCopiedPassword(false)
  }

  // Handle password change
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    try {
      setIsSubmittingPassword(true)
      setPasswordErrorMessage(null)
      setPasswordSuccessMessage(null)
      await changePassword({
        old_password: values.old_password,
        new_password: values.new_password,
      })
      const successMsg =
        "Your password has been changed successfully. Please use your new password the next time you sign in."
      setPasswordSuccessMessage(successMsg)
      toast.success("Password changed successfully.")
      passwordForm.reset({
        old_password: "",
        new_password: "",
        confirm_password: "",
      })
      setShowOldPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      setJustGeneratedPassword(false)
      setCopiedPassword(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password."
      setPasswordErrorMessage(msg)
      toast.error(msg)
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              {roleTitle} Profile
            </h1>
            <Badge
              variant="outline"
              className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-2.5 py-0.5 text-xs font-medium"
            >
              {roleTitle}
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            Manage your personal credentials, contact email, and account security.
          </p>
        </div>

        <div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  basicForm.reset({
                    first_name: profileData?.first_name || "",
                    last_name: profileData?.last_name || "",
                    email: profileData?.email || "",
                  })
                }}
                className="border-white/10 text-slate-300 hover:text-white"
              >
                <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
              </Button>
              <Button
                size="sm"
                onClick={basicForm.handleSubmit(onBasicSubmit)}
                disabled={basicForm.formState.isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {basicForm.formState.isSubmitting ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                )}
                Save Changes
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-white/10 text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800"
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      {/* 2-Column Grid: Basic Information & Change Password */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. Basic Information */}
        <Card className="border border-white/10 bg-slate-900/60 shadow-sm">
          <CardHeader className="border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <User className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base text-white">Basic Information</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Your personal name and primary account email.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={basicForm.handleSubmit(onBasicSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">First Name</label>
                  {isEditing ? (
                    <div>
                      <Input
                        {...basicForm.register("first_name")}
                        placeholder="First Name"
                        className="border-white/10 bg-slate-950 text-slate-100"
                      />
                      {basicForm.formState.errors.first_name && (
                        <p className="mt-1 text-xs text-red-400">
                          {basicForm.formState.errors.first_name.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="rounded border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-slate-100">
                      {watchedFirstName || profileData?.first_name || "—"}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Last Name</label>
                  {isEditing ? (
                    <div>
                      <Input
                        {...basicForm.register("last_name")}
                        placeholder="Last Name"
                        className="border-white/10 bg-slate-950 text-slate-100"
                      />
                      {basicForm.formState.errors.last_name && (
                        <p className="mt-1 text-xs text-red-400">
                          {basicForm.formState.errors.last_name.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="rounded border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-slate-100">
                      {watchedLastName || profileData?.last_name || "—"}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Email Address</label>
                {isEditing ? (
                  <div>
                    <Input
                      type="email"
                      {...basicForm.register("email")}
                      placeholder="email@example.com"
                      className="border-white/10 bg-slate-950 text-slate-100"
                    />
                    {basicForm.formState.errors.email && (
                      <p className="mt-1 text-xs text-red-400">
                        {basicForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="rounded border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-slate-100">
                    {watchedEmail || profileData?.email || "—"}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Account Role</span>
                  </div>
                  <span className="font-semibold text-slate-200">{roleTitle}</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 2. Change Password */}
        <Card className="border border-white/10 bg-slate-900/60 shadow-lg backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <CardHeader className="border-b border-white/10 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-sky-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
                    <KeyRound className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-white">Change Password</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Update your account password and security credentials.
                    </CardDescription>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePassword}
                  className="h-8 gap-1.5 border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-colors w-fit"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Suggest strong</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              {/* Success Alert */}
              {passwordSuccessMessage && (
                <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-200">Password Updated Successfully</p>
                    <p className="text-emerald-300/90 mt-0.5">{passwordSuccessMessage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPasswordSuccessMessage(null)}
                    className="text-emerald-400 hover:text-white transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Error Alert */}
              {passwordErrorMessage && (
                <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-rose-200">Password Change Failed</p>
                    <p className="text-rose-300/90 mt-0.5">{passwordErrorMessage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPasswordErrorMessage(null)}
                    className="text-rose-400 hover:text-white transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Suggested Password Notice */}
              {justGeneratedPassword && watchedNewPassword && (
                <div className="flex items-center justify-between rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs text-indigo-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Strong password generated and applied to fields below.</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyGeneratedPassword}
                    className="h-7 gap-1 text-xs text-indigo-200 hover:text-white hover:bg-indigo-500/20"
                  >
                    {copiedPassword ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Current Password</label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                    >
                      Forgot current password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <Input
                      type={showOldPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      autoComplete="current-password"
                      {...passwordForm.register("old_password")}
                      className="border-white/10 bg-slate-950 pl-9 pr-10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      tabIndex={-1}
                      aria-label={showOldPassword ? "Hide password" : "Show password"}
                    >
                      {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.old_password && (
                    <p className="text-xs text-rose-400">
                      {passwordForm.formState.errors.old_password.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">New Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      {...passwordForm.register("new_password")}
                      className="border-white/10 bg-slate-950 pl-9 pr-10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      tabIndex={-1}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.new_password && (
                    <p className="text-xs text-rose-400">
                      {passwordForm.formState.errors.new_password.message}
                    </p>
                  )}

                  {/* Interactive Strength Meter */}
                  {watchedNewPassword.length > 0 && (
                    <div className="space-y-2 pt-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Password strength:</span>
                        <span className={`font-semibold ${passwordStrength.text}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            passwordStrength.score >= 1 ? passwordStrength.bg : "bg-white/10"
                          }`}
                        />
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            passwordStrength.score >= 2 ? passwordStrength.bg : "bg-white/10"
                          }`}
                        />
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            passwordStrength.score >= 3 ? passwordStrength.bg : "bg-white/10"
                          }`}
                        />
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            passwordStrength.score >= 4 ? passwordStrength.bg : "bg-white/10"
                          }`}
                        />
                      </div>

                      {/* Requirements Checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                        <div
                          className={`flex items-center gap-1.5 transition-colors ${
                            passwordStrength.checks.length
                              ? "text-emerald-400 font-medium"
                              : "text-slate-400"
                          }`}
                        >
                          {passwordStrength.checks.length ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-600 shrink-0 mx-1" />
                          )}
                          <span>At least 8 characters</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 transition-colors ${
                            passwordStrength.checks.hasUpper && passwordStrength.checks.hasLower
                              ? "text-emerald-400 font-medium"
                              : "text-slate-400"
                          }`}
                        >
                          {passwordStrength.checks.hasUpper && passwordStrength.checks.hasLower ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-600 shrink-0 mx-1" />
                          )}
                          <span>Upper & lowercase</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 transition-colors ${
                            passwordStrength.checks.hasNumber
                              ? "text-emerald-400 font-medium"
                              : "text-slate-400"
                          }`}
                        >
                          {passwordStrength.checks.hasNumber ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-600 shrink-0 mx-1" />
                          )}
                          <span>At least 1 number</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 transition-colors ${
                            passwordStrength.checks.hasSpecial
                              ? "text-emerald-400 font-medium"
                              : "text-slate-400"
                          }`}
                        >
                          {passwordStrength.checks.hasSpecial ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-600 shrink-0 mx-1" />
                          )}
                          <span>Special character</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Confirm Password</label>
                    {isMatching && (
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="h-3 w-3" /> Passwords match
                      </span>
                    )}
                    {isMismatched && (
                      <span className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
                        <X className="h-3 w-3" /> Passwords do not match
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat new password"
                      autoComplete="new-password"
                      {...passwordForm.register("confirm_password")}
                      className={`border-white/10 bg-slate-950 pl-9 pr-10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500 ${
                        isMatching
                          ? "border-emerald-500/50 focus-visible:ring-emerald-500"
                          : isMismatched
                          ? "border-rose-500/50 focus-visible:ring-rose-500"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirm_password && (
                    <p className="text-xs text-rose-400">
                      {passwordForm.formState.errors.confirm_password.message}
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Lock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span>Encrypted & hashed securely</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {(watchedOldPassword || watchedNewPassword || watchedConfirmPassword) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResetPasswordForm}
                        disabled={isSubmittingPassword}
                        className="text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 h-9"
                      >
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Clear
                      </Button>
                    )}

                    <Button
                      type="submit"
                      disabled={
                        isSubmittingPassword ||
                        !watchedOldPassword ||
                        !watchedNewPassword ||
                        !watchedConfirmPassword ||
                        watchedNewPassword.length < 8 ||
                        watchedNewPassword !== watchedConfirmPassword
                      }
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium h-9 px-4 w-full sm:w-auto shadow-sm shadow-indigo-500/20 disabled:opacity-50"
                    >
                      {isSubmittingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Updating Password...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Update Password
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  )
}
