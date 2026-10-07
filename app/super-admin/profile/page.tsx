"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileText,
  KeyRound,
  Landmark,
  Loader2,
  Lock,
  Save,
  ShieldCheck,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import {
  getProfile,
  updateProfile,
  changePassword,
  type ProfileData,
} from "@/lib/api/auth"

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Surname is required"),
  email: z.string().email("Enter a valid email"),
  backup_email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  company_name: z.string().optional().or(z.literal("")),
  vat_number: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  account_name: z.string().optional().or(z.literal("")),
  bank_name: z.string().optional().or(z.literal("")),
  bank_address: z.string().optional().or(z.literal("")),
  sort_code: z.string().optional().or(z.literal("")),
  account_number: z.string().optional().or(z.literal("")),
  iban: z.string().optional().or(z.literal("")),
  swift_bic: z.string().optional().or(z.literal("")),
})

const passwordSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(6, "New password must be at least 6 characters"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "New passwords do not match",
    path: ["confirm_password"],
  })

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export default function SuperAdminProfilePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [updating2FA, setUpdating2FA] = useState(false)

  // Profile form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  // Password change form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    getProfile()
      .then((data: ProfileData) => {
        reset({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          backup_email: data.backup_email || "",
          company_name: data.profile?.company_name || "",
          vat_number: data.profile?.vat_number || "",
          address: data.profile?.address || "",
          account_name: data.profile?.account_name || "",
          bank_name: data.profile?.bank_name || "",
          bank_address: data.profile?.bank_address || "",
          sort_code: data.profile?.sort_code || "",
          account_number: data.profile?.account_number || "",
          iban: data.profile?.iban || "",
          swift_bic: data.profile?.swift_bic || "",
        })
        const is2FA = Boolean(
          data.two_factor_enabled ?? data.profile?.two_factor_enabled
        )
        setTwoFactorEnabled(is2FA)
      })
      .catch(() => {
        setError("Failed to load super admin profile.")
        toast.error("Failed to load profile details")
      })
      .finally(() => setLoading(false))
  }, [reset])

  const onSubmitProfile = async (values: ProfileFormValues) => {
    setError(null)
    setSuccess(null)
    try {
      const data = await updateProfile({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        backup_email: values.backup_email || undefined,
        two_factor_enabled: twoFactorEnabled,
        profile: {
          company_name: values.company_name ?? "",
          vat_number: values.vat_number ?? "",
          address: values.address ?? "",
          account_name: values.account_name ?? "",
          bank_name: values.bank_name ?? "",
          bank_address: values.bank_address ?? "",
          sort_code: values.sort_code ?? "",
          account_number: values.account_number ?? "",
          iban: values.iban ?? "",
          swift_bic: values.swift_bic ?? "",
          two_factor_enabled: twoFactorEnabled,
        },
      })

      reset({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        backup_email: data.backup_email || "",
        company_name: data.profile?.company_name || "",
        vat_number: data.profile?.vat_number || "",
        address: data.profile?.address || "",
        account_name: data.profile?.account_name || "",
        bank_name: data.profile?.bank_name || "",
        bank_address: data.profile?.bank_address || "",
        sort_code: data.profile?.sort_code || "",
        account_number: data.profile?.account_number || "",
        iban: data.profile?.iban || "",
        swift_bic: data.profile?.swift_bic || "",
      })

      setSuccess("Profile and invoice billing details updated successfully.")
      toast.success("Profile & billing details saved successfully")
      setTimeout(() => setSuccess(null), 4000)
    } catch (err: any) {
      const msg = err.message || "Failed to update profile."
      setError(msg)
      toast.error(msg)
    }
  }

  const handleToggle2FA = async (checked: boolean) => {
    setUpdating2FA(true)
    try {
      await updateProfile({
        two_factor_enabled: checked,
        profile: {
          two_factor_enabled: checked,
        },
      })
      setTwoFactorEnabled(checked)
      if (checked) {
        toast.success("Two-Step Verification (2FA) enabled successfully")
      } else {
        toast.info("Two-Step Verification (2FA) disabled")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update Two-Step Verification")
    } finally {
      setUpdating2FA(false)
    }
  }

  const onSubmitPassword = async (values: PasswordFormValues) => {
    try {
      await changePassword({
        old_password: values.old_password,
        new_password: values.new_password,
      })
      toast.success("Password changed successfully.")
      resetPassword({
        old_password: "",
        new_password: "",
        confirm_password: "",
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to change password.")
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Super Admin Profile
        </h1>
        <p className="text-sm text-slate-400">
          Manage your account credentials, invoice billing information, bank payment details, and security settings.
        </p>
      </div>

      {/* Info Notice about dynamic invoices */}
      <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
        <FileText className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-white">Dynamic Invoice Synchronization</p>
          <p className="text-slate-300 text-xs mt-0.5">
            Your Company Name, VAT Registration Number, Billing Address, and Bank Account details configured below are dynamically applied to every newly generated invoice and downloaded PDF for subscribed companies.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Column 1: Account Information & Invoice Company Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardContent className="pt-6">
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold text-white">Basic Information</h2>
                  </div>
                  <span className="text-xs text-slate-400">Admin Account</span>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel>First Name</FieldLabel>
                      <FieldContent>
                        <Input placeholder="First Name" {...register("first_name")} />
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
                        <Input placeholder="Surname" {...register("last_name")} />
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
                      <Input type="email" placeholder="admin@example.com" {...register("email")} />
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
                      <Input
                        type="email"
                        placeholder="backup@example.com"
                        {...register("backup_email")}
                      />
                      {errors.backup_email && (
                        <p className="mt-1 text-xs text-red-400">
                          {errors.backup_email.message}
                        </p>
                      )}
                    </FieldContent>
                  </Field>
                </div>
              </CardContent>
            </Card>

            {/* Company & Billing Address (Appears on Invoice FROM) */}
            <Card>
              <CardContent className="pt-6">
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold text-white">Invoice & Company Details</h2>
                  </div>
                  <span className="text-xs text-slate-400">Header & FROM info</span>
                </div>

                <div className="space-y-4">
                  <Field>
                    <FieldLabel>Company / Trading Name</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="e.g. Tresta"
                        {...register("company_name")}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>VAT Registration Number</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="e.g. 237 5409 01"
                        {...register("vat_number")}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>Company / Billing Address</FieldLabel>
                    <FieldContent>
                      <Textarea
                        rows={3}
                        placeholder="e.g. 84 Alers Road, Bexleyheath, DA6 8HT"
                        {...register("address")}
                      />
                    </FieldContent>
                  </Field>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Bank Information (Appears on Invoice PAYMENT DETAILS) */}
          <div className="space-y-6">
            <Card className="h-full flex flex-col justify-between">
              <CardContent className="pt-6">
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold text-white">Bank & Remittance Details</h2>
                  </div>
                  <span className="text-xs text-slate-400">PAYMENT DETAILS on Invoices</span>
                </div>

                <div className="space-y-4">
                  <Field>
                    <FieldLabel>Account Name (Beneficiary)</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="e.g. Estrada building services"
                        {...register("account_name")}
                      />
                    </FieldContent>
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel>Bank Name</FieldLabel>
                      <FieldContent>
                        <Input
                          placeholder="e.g. Santander"
                          {...register("bank_name")}
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>Account Number</FieldLabel>
                      <FieldContent>
                        <Input
                          placeholder="e.g. 82051171"
                          {...register("account_number")}
                        />
                      </FieldContent>
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel>Bank Address</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="e.g. 84 Alers Road, Bexleyheath, DA6 8HT"
                        {...register("bank_address")}
                      />
                    </FieldContent>
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel>Sort Code</FieldLabel>
                      <FieldContent>
                        <Input
                          placeholder="e.g. 09-01-28"
                          {...register("sort_code")}
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>IBAN</FieldLabel>
                      <FieldContent>
                        <Input
                          placeholder="e.g. GB29NWBK60161331926819"
                          {...register("iban")}
                        />
                      </FieldContent>
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel>SWIFT / BIC</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="e.g. SANTGB2L"
                        {...register("swift_bic")}
                      />
                    </FieldContent>
                  </Field>
                </div>
              </CardContent>

              <div className="p-6 pt-0 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Profile & Invoice Details
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>

      {/* Security Section (2FA & Change Password) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-white">Security & Account Protection</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Two-Step Verification (2FA) */}
          <Card>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-semibold text-white">Two-Step Verification (2FA)</h3>
                </div>
                <Badge
                  variant={twoFactorEnabled ? "active" : "inactive"}
                  className="text-xs"
                >
                  {twoFactorEnabled ? "Active" : "Disabled"}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Add an extra layer of defense to your super admin account. When Two-Step Verification is enabled, you will be required to verify your credentials to protect administrative and billing operations.
              </p>

              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-white">Enable 2-Step Verification</p>
                  <p className="text-xs text-slate-400">
                    {twoFactorEnabled
                      ? "Two-step verification is active and guarding this account."
                      : "Account currently protected by password only."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {updating2FA && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                  <Switch
                    checked={twoFactorEnabled}
                    disabled={updating2FA}
                    onCheckedChange={handleToggle2FA}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-white">Change Password</h3>
                </div>
                <span className="text-xs text-slate-400">Password Security</span>
              </div>

              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                <Field>
                  <FieldLabel>Current Password</FieldLabel>
                  <FieldContent>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      {...registerPassword("old_password")}
                    />
                    {passwordErrors.old_password && (
                      <p className="mt-1 text-xs text-red-400">
                        {passwordErrors.old_password.message}
                      </p>
                    )}
                  </FieldContent>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>New Password</FieldLabel>
                    <FieldContent>
                      <Input
                        type="password"
                        placeholder="New password (min 6 chars)"
                        {...registerPassword("new_password")}
                      />
                      {passwordErrors.new_password && (
                        <p className="mt-1 text-xs text-red-400">
                          {passwordErrors.new_password.message}
                        </p>
                      )}
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>Confirm New Password</FieldLabel>
                    <FieldContent>
                      <Input
                        type="password"
                        placeholder="Repeat new password"
                        {...registerPassword("confirm_password")}
                      />
                      {passwordErrors.confirm_password && (
                        <p className="mt-1 text-xs text-red-400">
                          {passwordErrors.confirm_password.message}
                        </p>
                      )}
                    </FieldContent>
                  </Field>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="w-full sm:w-auto"
                  >
                    {isSubmittingPassword ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="mr-2 h-4 w-4" />
                    )}
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

