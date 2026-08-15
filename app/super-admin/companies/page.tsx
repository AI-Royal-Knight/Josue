"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, RefreshCw, FolderGit2, FileText, FileQuestion, HardDrive, FileUp, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts"

import { AgTable } from "@/components/common/AgTable"
import type { ColDef, ICellRendererParams } from "ag-grid-community"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import TableStat from "@/components/common/table-stat"
import { Badge } from "@/components/ui/badge"
import { getStatusVariant } from "@/lib/utils"
import {
  getCompanies,
  inviteAdmin,
  updateCompany,
  resendCompanyInvitation,
  type CompanyRecord,
  type CompanySummary,
} from "@/lib/api/super-admin"
import { ApiError } from "@/lib/api/client"

// ── Types ─────────────────────────────────────────────────────────────────────

type CompanyRow = {
  id: string
  name: string
  adminFirstName: string
  adminSurname: string
  email: string
  phoneNumber: string
  projects: number
  users: number
  activated: boolean
  monthlySubscriptionGbp: number | null
  perUserRateGbp: number | null
  automaticMonthlyInvoices: boolean
  autoMonthlyInvoiceDate: number | null
  status: "Active" | "Suspended"
  invoicesCount: number
  rfisCount: number
  storageUsage: string
  uploadedFilesCount: number
  adminIsActive: boolean | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapApiToRow(c: CompanyRecord): CompanyRow {
  return {
    id: c.id,
    name: c.company_name ?? "—",
    adminFirstName: c.admin_name ?? "—",
    adminSurname: c.admin_surname ?? "—",
    email: c.admin_email ?? "—",
    phoneNumber: c.phone ?? "—",
    projects: c.projects,
    users: c.user,
    activated: c.activate,
    monthlySubscriptionGbp: c.monthly_subscription
      ? parseFloat(c.monthly_subscription)
      : null,
    perUserRateGbp: c.per_user_rate
      ? parseFloat(c.per_user_rate)
      : null,
    automaticMonthlyInvoices: c.auto_monthly_inv,
    autoMonthlyInvoiceDate: c.auto_monthly_inv_date ?? null,
    status: c.status === "active" ? "Active" : "Suspended",
    invoicesCount: c.invoices_count || 0,
    rfisCount: c.rfis_count || 0,
    storageUsage: c.storage_usage || "0 MB",
    uploadedFilesCount: c.uploaded_files_count || 0,
    adminIsActive: c.admin_is_active,
  }
}

// ── Currency Cell ─────────────────────────────────────────────────────────────

function CurrencyInputCell({
  value,
  disabled,
  onCommit,
}: {
  value: number | null
  disabled?: boolean
  onCommit: (next: number | null) => void
}) {
  const initialValue =
    value === null || value === undefined ? "" : String(value)

  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-xs text-slate-400">
        £
      </span>
      <Input
        className="h-8 pl-6"
        inputMode="decimal"
        disabled={disabled}
        key={initialValue}
        defaultValue={initialValue}
        onBlur={(e) => {
          const trimmed = e.currentTarget.value.trim()
          if (!trimmed) return onCommit(null)
          const n = Number(trimmed)
          if (Number.isFinite(n)) onCommit(n)
          else onCommit(value ?? null)
        }}
      />
    </div>
  )
}

// ── Invite Admin Dialog ───────────────────────────────────────────────────────

const inviteSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Surname is required"),
  email: z.string().email("Enter a valid email"),
  phone_number: z.string().min(1, "Phone number is required"),
})

type InviteFormValues = z.infer<typeof inviteSchema>

function InviteAdminDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormValues>({ resolver: zodResolver(inviteSchema) })

  const onSubmit = async (values: InviteFormValues) => {
    setServerError(null)
    setSuccessMsg(null)
    try {
      const res = await inviteAdmin(values)
      setSuccessMsg(res.message)
      reset()
      onSuccess()
      // Close after 2 seconds
      setTimeout(() => {
        setOpen(false)
        setSuccessMsg(null)
      }, 2000)
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : "Something went wrong."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="invite-admin-btn">Invite Admin</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Invite Admin</DialogTitle>
          <DialogDescription>
            Add a new company admin by entering the required details.
          </DialogDescription>
        </DialogHeader>

        <form
          id="invite-admin-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 py-4"
        >
          <Field>
            <FieldLabel htmlFor="company_name">Company Name</FieldLabel>
            <FieldContent>
              <Input
                id="company_name"
                placeholder="Enter company name"
                {...register("company_name")}
              />
              {errors.company_name && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.company_name.message}
                </p>
              )}
            </FieldContent>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="first_name">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="first_name"
                  placeholder="Enter name"
                  {...register("first_name")}
                />
                {errors.first_name && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.first_name.message}
                  </p>
                )}
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="last_name">Surname</FieldLabel>
              <FieldContent>
                <Input
                  id="last_name"
                  placeholder="Enter surname"
                  {...register("last_name")}
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.last_name.message}
                  </p>
                )}
              </FieldContent>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <FieldContent>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="phone_number">Phone Number</FieldLabel>
            <FieldContent>
              <Input
                id="phone_number"
                placeholder="Enter phone number"
                {...register("phone_number")}
              />
              {errors.phone_number && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.phone_number.message}
                </p>
              )}
            </FieldContent>
          </Field>

          {serverError && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {serverError}
            </div>
          )}
          {successMsg && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
              {successMsg}
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="invite-admin-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send Invite"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Company Stats Dialog ──────────────────────────────────────────────────────

function CompanyStatsDialog({
  company,
  onClose,
}: {
  company: CompanyRow | null
  onClose: () => void
}) {
  if (!company) return null

  const chartData = [
    { name: "Projects", count: company.projects, color: "#3b82f6" }, // blue-500
    { name: "Invoices", count: company.invoicesCount, color: "#10b981" }, // emerald-500
    { name: "RFIs", count: company.rfisCount, color: "#f59e0b" }, // amber-500
    { name: "Files", count: company.uploadedFilesCount, color: "#8b5cf6" }, // violet-500
  ]

  return (
    <Dialog open={!!company} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] bg-[#0f172a] border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{company.name}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Performance and storage metrics overview.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
          <div className="flex flex-col gap-1 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <FolderGit2 size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Projects</span>
            </div>
            <span className="text-2xl font-bold">{company.projects}</span>
          </div>
          <div className="flex flex-col gap-1 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <FileText size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Invoices</span>
            </div>
            <span className="text-2xl font-bold">{company.invoicesCount}</span>
          </div>
          <div className="flex flex-col gap-1 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <FileQuestion size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">RFIs</span>
            </div>
            <span className="text-2xl font-bold">{company.rfisCount}</span>
          </div>
          <div className="flex flex-col gap-1 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-violet-400 mb-1">
              <FileUp size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Files Uploaded</span>
            </div>
            <span className="text-2xl font-bold">{company.uploadedFilesCount}</span>
          </div>
          <div className="md:col-span-2 flex flex-col gap-1 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-300 mb-1">
              <HardDrive size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Storage Usage</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{company.storageUsage}</span>
              <span className="text-xs text-slate-500 font-mono">/ ∞</span>
            </div>
          </div>
        </div>

        <div className="mt-4 h-[250px] w-full pt-4 border-t border-slate-800/80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                cursor={{ fill: '#1e293b' }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Activate Cell ─────────────────────────────────────────────────────────────

function ActivateCell({
  row,
  onUpdate,
}: {
  row: CompanyRow
  onUpdate: (id: string, payload: Partial<CompanyRecord>) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [nextState, setNextState] = useState(row.activated)

  const handleToggle = (checked: boolean) => {
    setNextState(checked)
    setOpen(true)
  }

  const handleConfirm = () => {
    onUpdate(row.id, { activate: nextState })
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-2 py-1" data-cell-click-ignore>
      <Switch checked={row.activated} onCheckedChange={handleToggle} />
      <span className="text-xs text-slate-400">
        {row.activated ? "On" : "Off"}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {nextState ? "activate" : "deactivate"} the company "{row.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Auto Invoices Cell ────────────────────────────────────────────────────────

function AutoInvoicesCell({
  row,
  onUpdate,
}: {
  row: CompanyRow
  onUpdate: (id: string, payload: Partial<CompanyRecord>) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [nextState, setNextState] = useState(row.automaticMonthlyInvoices)

  const handleToggle = (checked: boolean) => {
    setNextState(checked)
    setOpen(true)
  }

  const handleConfirm = () => {
    onUpdate(row.id, { auto_monthly_inv: nextState })
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-2 py-1" data-cell-click-ignore>
      <Switch checked={row.automaticMonthlyInvoices} onCheckedChange={handleToggle} />
      <span className="text-xs text-slate-400">
        {row.automaticMonthlyInvoices ? "Yes" : "No"}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {nextState ? "enable" : "disable"} automatic monthly invoices for "{row.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Auto Invoice Date Cell ───────────────────────────────────────────────────

function AutoInvoiceDateCell({
  row,
  onUpdate,
}: {
  row: CompanyRow
  onUpdate: (id: string, payload: Partial<CompanyRecord>) => Promise<void>
}) {
  const value = row.autoMonthlyInvoiceDate === null || row.autoMonthlyInvoiceDate === undefined ? "" : String(row.autoMonthlyInvoiceDate)

  if (!row.automaticMonthlyInvoices) {
    return (
      <div className="absolute inset-0 flex items-center px-4">
        <span className="text-xs text-slate-500">—</span>
      </div>
    )
  }

  return (
    <div
      className="absolute inset-0 flex items-center px-2"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <select
        className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        value={value}
        onChange={(e) => {
          const val = e.target.value
          if (!val) {
            onUpdate(row.id, { auto_monthly_inv_date: null })
          } else {
            onUpdate(row.id, { auto_monthly_inv_date: parseInt(val, 10) })
          }
        }}
      >
        <option value="">Select date</option>
        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => {
          const suffix = day === 1 || day === 21 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
          return (
            <option key={day} value={day}>
              {day}{suffix}
            </option>
          )
        })}
      </select>
    </div>
  )
}

// ── Resend Action Cell ────────────────────────────────────────────────────────

function ResendActionCell({
  row,
  onResend,
}: {
  row: CompanyRow
  onResend: (id: string) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)

  const handleResend = async () => {
    setLoading(true)
    await onResend(row.id)
    setLoading(false)
  }

  return (
    <div data-cell-click-ignore className="flex items-center py-1">
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs px-2 min-w-[95px]"
        onClick={handleResend}
        disabled={row.adminIsActive === true || loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Sending
          </>
        ) : (
          "Resend Email"
        )}
      </Button>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CompaniesPage() {
  const [rows, setRows] = useState<CompanyRow[]>([])
  const [summary, setSummary] = useState<CompanySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<CompanyRow | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getCompanies()
      setSummary(res.summary)
      setRows(res.companies.map(mapApiToRow))
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load companies."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUpdate = async (id: string, payload: Partial<CompanyRecord>) => {
    // Optimistically update the local state for a smooth UI experience
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            activated: payload.activate !== undefined ? payload.activate : r.activated,
            automaticMonthlyInvoices:
              payload.auto_monthly_inv !== undefined
                ? payload.auto_monthly_inv
                : r.automaticMonthlyInvoices,
            autoMonthlyInvoiceDate:
              payload.auto_monthly_inv_date !== undefined
                ? payload.auto_monthly_inv_date
                : r.autoMonthlyInvoiceDate,
            monthlySubscriptionGbp:
              payload.monthly_subscription !== undefined
                ? parseFloat(payload.monthly_subscription)
                : r.monthlySubscriptionGbp,
            perUserRateGbp:
              payload.per_user_rate !== undefined
                ? parseFloat(payload.per_user_rate)
                : r.perUserRateGbp,
          }
        }
        return r
      })
    )

    try {
      await updateCompany(id, payload)
    } catch (err) {
      alert("Failed to update company.")
      // Revert changes by refetching from the server
      fetchData()
    }
  }

  const handleResend = async (id: string) => {
    try {
      const res = await resendCompanyInvitation(id)
      toast.success(res.message || "Invitation email resent successfully.")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to resend email.")
    }
  }

  const columnDefs: ColDef<CompanyRow>[] = useMemo(() => [
    { 
      field: "name", 
      headerName: "Company",
      cellRenderer: (params: ICellRendererParams<CompanyRow>) => {
        if (!params.data) return null
        return (
          <button 
            className="text-amber-400 hover:text-amber-300 font-semibold underline decoration-amber-400/30 underline-offset-4 transition-colors"
            onClick={() => setSelectedCompany(params.data || null)}
          >
            {params.data.name}
          </button>
        )
      }
    },
    { field: "adminFirstName", headerName: "Name" },
    { field: "adminSurname", headerName: "Surname" },
    { field: "email", headerName: "Email", minWidth: 220 },
    { field: "phoneNumber", headerName: "Phone", minWidth: 160 },
    { field: "users", headerName: "Users", minWidth: 110 },
    { field: "projects", headerName: "Projects", minWidth: 110 },
    {
      headerName: "Activate",
      colId: "activated",
      minWidth: 140,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<CompanyRow>) => {
        const row = params.data
        if (!row) return null
        return <ActivateCell row={row} onUpdate={handleUpdate} />
      },
    },
    {
      headerName: "Monthly Subscription",
      colId: "monthlySubscriptionGbp",
      minWidth: 170,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<CompanyRow>) => {
        const row = params.data
        if (!row) return null
        return (
          <CurrencyInputCell
            value={row.monthlySubscriptionGbp}
            onCommit={(val) => handleUpdate(row.id, { monthly_subscription: val === null ? "0.00" : String(val) })}
          />
        )
      },
    },
    {
      headerName: "Per user rate",
      colId: "perUserRateGbp",
      minWidth: 150,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<CompanyRow>) => {
        const row = params.data
        if (!row) return null
        return (
          <CurrencyInputCell
            value={row.perUserRateGbp}
            onCommit={(val) => handleUpdate(row.id, { per_user_rate: val === null ? "0.00" : String(val) })}
          />
        )
      },
    },
    {
      headerName: "Auto Invoices",
      colId: "automaticMonthlyInvoices",
      minWidth: 160,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<CompanyRow>) => {
        const row = params.data
        if (!row) return null
        return <AutoInvoicesCell row={row} onUpdate={handleUpdate} />
      },
    },
    {
      headerName: "Invoice Date",
      colId: "autoMonthlyInvoiceDate",
      minWidth: 130,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<CompanyRow>) => {
        const row = params.data
        if (!row) return null
        return <AutoInvoiceDateCell row={row} onUpdate={handleUpdate} />
      },
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      cellRenderer: (params: { value?: CompanyRow["status"] }) => {
        const s = params.value ?? "Suspended"
        return <Badge variant={getStatusVariant(s)}>{s}</Badge>
      },
    },
    {
      headerName: "Actions",
      colId: "actions",
      minWidth: 135,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<CompanyRow>) => {
        const row = params.data
        if (!row) return null
        return <ResendActionCell row={row} onResend={handleResend} />
      }
    },
  ], [])

  const defaultColDef = useMemo(
    () => ({ flex: 1, minWidth: 140, resizable: true }),
    []
  )

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Companies (Admins)</h1>
          <p className="text-sm text-slate-400">
            Manage admin companies and invitations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <InviteAdminDialog onSuccess={fetchData} />
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      {loading && !summary ? (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading stats…
        </div>
      ) : summary ? (
        <TableStat
          summaryRows={[
            { label: "Admin users", value: String(summary.admin_users) },
            { label: "Users", value: String(summary.users) },
            { label: "Projects", value: String(summary.projects) },
            { label: "Active", value: String(summary.active) },
            { label: "Suspended", value: String(summary.suspended) },
          ]}
        />
      ) : null}

      {/* Table */}
      <div className="flex flex-1 flex-col rounded-lg bg-card">
        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 py-16 text-sm text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading companies…
          </div>
        ) : (
          <AgTable
            rowData={rows}
            columnDefs={columnDefs}
            height="100%"
            pagination
            pageSize={10}
            defaultColDef={defaultColDef}
            suppressCellClickAction
          />
        )}
      </div>

      <CompanyStatsDialog 
        company={selectedCompany} 
        onClose={() => setSelectedCompany(null)} 
      />
    </div>
  )
}
