"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, RefreshCw } from "lucide-react"

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
  status: "Active" | "Suspended"
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
    status: c.status === "active" ? "Active" : "Suspended",
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CompaniesPage() {
  const [rows, setRows] = useState<CompanyRow[]>([])
  const [summary, setSummary] = useState<CompanySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const columnDefs: ColDef<CompanyRow>[] = useMemo(() => [
    { field: "name", headerName: "Company" },
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
        return (
          <div className="flex items-center gap-2 py-1">
            <Switch
              checked={row.activated}
              onCheckedChange={(checked) => handleUpdate(row.id, { activate: checked })}
            />
            <span className="text-xs text-slate-400">
              {row.activated ? "On" : "Off"}
            </span>
          </div>
        )
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
        return (
          <div className="flex items-center gap-2 py-1">
            <Switch
              checked={row.automaticMonthlyInvoices}
              onCheckedChange={(checked) => handleUpdate(row.id, { auto_monthly_inv: checked })}
            />
            <span className="text-xs text-slate-400">
              {row.automaticMonthlyInvoices ? "Yes" : "No"}
            </span>
          </div>
        )
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
          />
        )}
      </div>
    </div>
  )
}
