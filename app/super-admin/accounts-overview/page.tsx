"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import { AgTable } from "@/components/common/AgTable"
import type { ColDef } from "ag-grid-community"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import {
  getCompanies,
  updateCompany,
  type CompanyRecord,
  getInvoices,
  submitInvoice,
  type MonthlyInvoice,
} from "@/lib/api/super-admin"
import TableStat from "@/components/common/table-stat"
import { ExportCsvButton } from "@/components/common/export-csv-button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

type AccountsRow = CompanyRecord

type BillingMonth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

const months: { key: BillingMonth; label: string }[] = [
  { key: 1, label: "January" },
  { key: 2, label: "February" },
  { key: 3, label: "March" },
  { key: 4, label: "April" },
  { key: 5, label: "May" },
  { key: 6, label: "June" },
  { key: 7, label: "July" },
  { key: 8, label: "August" },
  { key: 9, label: "September" },
  { key: 10, label: "October" },
  { key: 11, label: "November" },
  { key: 12, label: "December" },
]

function formatGbp(amount: number | string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return "£0.00"
  const hasDecimals = Math.round(num * 100) % 100 !== 0
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(num)
}

function monthlyCharge(row: AccountsRow): number {
  const monthly = parseFloat(row.monthly_subscription || "0")
  const perUser = parseFloat(row.per_user_rate || "0")
  return monthly + perUser * (row.user || 0)
}

/** Number of months from the company's creation month to December (inclusive), capped to 12. */
function billableMonthsInYear(row: AccountsRow, year: number): number {
  if (!row.created_at) return 12
  const created = new Date(row.created_at)
  if (created.getFullYear() > year) return 0
  if (created.getFullYear() < year) return 12
  // Same year — bill from creation month to December
  return 13 - (created.getMonth() + 1) // getMonth() is 0-indexed
}

/** Projected annual revenue from the company's creation month to year-end. */
function projectedAnnualCharge(row: AccountsRow, year: number): number {
  return monthlyCharge(row) * billableMonthsInYear(row, year)
}

/** The earliest billable month (1-12) for a company in a given year. */
function firstBillableMonth(row: AccountsRow, year: number): number {
  if (!row.created_at) return 1
  const created = new Date(row.created_at)
  if (created.getFullYear() < year) return 1
  if (created.getFullYear() > year) return 13 // no billable months
  return created.getMonth() + 1 // getMonth() is 0-indexed
}

type PendingInvoice = {
  companyId: string
  companyName: string
  month: BillingMonth
  monthLabel: string
  amount: number
}

// ── Input Cells ─────────────────────────────────────────────────────────────

function CurrencyInputCell({
  value,
  disabled,
  onCommit,
}: {
  value: number | string | null
  disabled?: boolean
  onCommit: (next: string | null) => void
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
          if (Number.isFinite(n)) onCommit(String(n))
          else onCommit(value === null ? null : String(value))
        }}
      />
    </div>
  )
}

function NumberInputCell({
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
      <Input
        className="h-8"
        inputMode="numeric"
        disabled={disabled}
        key={initialValue}
        defaultValue={initialValue}
        onBlur={(e) => {
          const trimmed = e.currentTarget.value.trim()
          if (!trimmed) return onCommit(null)
          const n = parseInt(trimmed, 10)
          if (Number.isFinite(n)) onCommit(n)
          else onCommit(value)
        }}
      />
    </div>
  )
}

export default function AccountsOverviewPage() {
  const year = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1 // 1-12, today's month
  const [expanded, setExpanded] = useState(false)

  const [rows, setRows] = useState<AccountsRow[]>([])
  const [invoices, setInvoices] = useState<MonthlyInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<PendingInvoice | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [compRes, invRes] = await Promise.all([
        getCompanies(),
        getInvoices(year),
      ])
      // Filter for active companies only
      setRows(compRes.companies.filter((c) => c.activate))
      setInvoices(invRes)
    } catch (err) {
      console.error("Failed to load accounts overview", err)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdate = async (companyId: string, payload: Partial<CompanyRecord>) => {
    try {
      await updateCompany(companyId, payload)
      setRows((prev) =>
        prev.map((r) =>
          r.id === companyId ? { ...r, ...payload } : r
        )
      )
      toast.success("Settings updated")
    } catch (err) {
      toast.error("Failed to update settings")
      loadData()
    }
  }

  const handleSubmitInvoice = async () => {
    if (!pending) return
    setIsSubmitting(true)
    try {
      await submitInvoice({
        company_id: pending.companyId,
        year,
        month: pending.month,
        amount: pending.amount,
      })
      toast.success("Invoice submitted")
      setPending(null)
      // Refresh invoices
      const invRes = await getInvoices(year)
      setInvoices(invRes)
    } catch (err) {
      toast.error("Failed to submit invoice")
    } finally {
      setIsSubmitting(false)
    }
  }

  const columnDefs = useMemo<ColDef<AccountsRow>[]>(() => {
    const base: ColDef<AccountsRow>[] = [
      { field: "company_name", headerName: "Company", minWidth: 220 },
      {
        headerName: "Monthly Subscription",
        colId: "monthly_subscription",
        minWidth: 170,
        valueGetter: (p) => formatGbp(p.data ? monthlyCharge(p.data) : 0),
      },
      {
        headerName: "per User rate",
        colId: "per_user_rate",
        minWidth: 140,
        sortable: false,
        filter: false,
        cellRenderer: (params: { data?: AccountsRow }) => {
          const row = params.data
          if (!row) return null
          return (
            <CurrencyInputCell
              value={row.per_user_rate}
              onCommit={(val) => handleUpdate(row.id, { per_user_rate: val === null ? "0.00" : val })}
            />
          )
        },
      },
      {
        field: "user",
        headerName: "Users",
        minWidth: 120,
        sortable: false,
        filter: false,
        cellRenderer: (params: { data?: AccountsRow }) => {
          const row = params.data
          if (!row) return null
          return (
            <NumberInputCell
              value={row.user}
              onCommit={(val) => handleUpdate(row.id, { user: val === null ? 0 : val })}
            />
          )
        },
      },
      {
        headerName: "Action",
        colId: "action",
        minWidth: 130,
        sortable: false,
        filter: false,
        cellRenderer: (params: { data?: AccountsRow }) => {
          const row = params.data
          if (!row) return null

          const start = firstBillableMonth(row, year)
          if (currentMonth < start) {
            return <span className="text-xs text-slate-500">Not billable</span>
          }

          const existingInvoice = invoices.find(
            (inv) =>
              String(inv.company_id) === String(row.id) &&
              inv.month === currentMonth &&
              inv.is_sent
          )

          if (existingInvoice) {
            return <span className="text-xs font-medium text-emerald-400">Invoice Sent</span>
          }

          const amount = monthlyCharge(row)
          const autoDate = row.auto_monthly_inv_date || 1
          let canSend = true
          let buttonTitle = "Send Invoice for current month"

          const today = new Date().getDate()
          if (today < autoDate) {
            canSend = false
            buttonTitle = `Available on the ${autoDate}th`
          }

          return (
            <Button
              variant="default"
              size="sm"
              disabled={!canSend}
              title={buttonTitle}
              className="h-7 text-xs"
              onClick={() => {
                if (!canSend) return
                const monthObj = months.find((m) => m.key === currentMonth)
                setPending({
                  companyId: row.id,
                  companyName: row.company_name || `Company ${row.id}`,
                  month: currentMonth as BillingMonth,
                  monthLabel: monthObj?.label || String(currentMonth),
                  amount,
                })
              }}
            >
              Send Invoice
            </Button>
          )
        },
      },
    ]

    if (!expanded) {
      base.push({
        headerName: String(year),
        colId: "annual",
        minWidth: 160,
        cellRenderer: (params: { data?: AccountsRow }) => {
          const row = params.data
          if (!row) return null

          const start = firstBillableMonth(row, year)
          // Billable months for this company in this year
          const billableMonthKeys = months.filter((m) => m.key >= start)

          const companyInvoices = invoices.filter(
            (inv) => String(inv.company_id) === String(row.id) && inv.is_sent && inv.month >= start
          )

          const allSent = billableMonthKeys.every(({ key }) =>
            companyInvoices.some((i) => i.month === key)
          )

          // Actual revenue: only from sent invoices
          const actualRevenue = companyInvoices.reduce(
            (sum, i) => sum + parseFloat(i.amount || "0"),
            0
          )

          // Projected revenue: from company creation month to Dec
          const projected = projectedAnnualCharge(row, year)

          return (
            <span
              className={
                allSent && billableMonthKeys.length > 0
                  ? "font-medium text-emerald-400"
                  : "text-slate-200"
              }
              title={`Projected: ${formatGbp(projected)} | Billed: ${formatGbp(actualRevenue)}`}
            >
              {formatGbp(actualRevenue)}
              {!allSent && projected > actualRevenue && (
                <span className="ml-1 text-xs text-slate-500">
                  /{formatGbp(projected)}
                </span>
              )}
            </span>
          )
        },
      })
      return base
    }

    for (const m of months) {
      base.push({
        headerName: m.label,
        colId: `m-${m.key}`,
        minWidth: 120,
        sortable: false,
        filter: false,
        cellRenderer: (params: { data?: AccountsRow }) => {
          const row = params.data
          if (!row) return null

          // Future months: never show anything
          if (m.key > currentMonth) {
            return <span className="text-slate-700">—</span>
          }

          // Months before the company was created: not billable
          const start = firstBillableMonth(row, year)
          if (m.key < start) {
            return <span className="text-slate-700">—</span>
          }

          const existingInvoice = invoices.find(
            (inv) =>
              String(inv.company_id) === String(row.id) &&
              inv.month === m.key &&
              inv.is_sent
          )

          // Past months: only show if an invoice was sent
          if (m.key < currentMonth) {
            if (!existingInvoice) {
              return <span className="text-slate-700">—</span>
            }
            return (
              <span className="font-medium text-emerald-400">
                {formatGbp(existingInvoice.amount || "0")}
              </span>
            )
          }

          // Current month: show sent invoice or allow action
          if (existingInvoice) {
            return (
              <span className="font-medium text-emerald-400">
                {formatGbp(existingInvoice.amount || "0")}
              </span>
            )
          }

          const amount = monthlyCharge(row)
          const auto = row.auto_monthly_inv
          const autoDate = row.auto_monthly_inv_date || 1
          
          let canSend = true
          let buttonTitle = "Send Invoice"

          // If current month, check if today is >= auto_monthly_inv_date
          if (m.key === currentMonth) {
            const today = new Date().getDate()
            if (today < autoDate) {
              canSend = false
              buttonTitle = `Available on the ${autoDate}th of the month`
            }
          }

          // Manual mode or fallback for automatic mode: clickable to send invoice
          return (
            <button
              type="button"
              disabled={!canSend}
              title={buttonTitle}
              className={`text-left font-medium ${
                canSend 
                  ? "text-slate-200 hover:underline" 
                  : "text-slate-500 cursor-not-allowed opacity-50"
              }`}
              onClick={() => {
                if (!canSend) return
                setPending({
                  companyId: row.id,
                  companyName: row.company_name || `Company ${row.id}`,
                  month: m.key,
                  monthLabel: m.label,
                  amount,
                })
              }}
            >
              {formatGbp(amount)}
            </button>
          )
        },
      })
    }

    return base
  }, [expanded, year, invoices])

  const defaultColDef = useMemo(
    () => ({ flex: 1, resizable: true, sortable: true, filter: true }),
    []
  )

  const stats = useMemo(() => {
    let totalRev = 0
    let monthlyRev = 0
    let projectedAnnual = 0

    rows.forEach((r) => {
      monthlyRev += monthlyCharge(r)
      projectedAnnual += projectedAnnualCharge(r, year)
    })

    // Total Revenue = sum of invoices that have actually been SENT to customers
    invoices.forEach((inv) => {
      if (
        inv.is_sent &&
        rows.some((r) => String(r.id) === String(inv.company_id))
      ) {
        totalRev += parseFloat(inv.amount || "0")
      }
    })

    return {
      total: formatGbp(totalRev),
      monthly: formatGbp(monthlyRev),
      projected: formatGbp(projectedAnnual),
    }
  }, [rows, invoices, year])

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-6">
      <header>
        <h1 className="mb-4 text-2xl font-bold">Accounts Overview</h1>
        <TableStat
          summaryRows={[
            { label: "Total Revenue (Invoiced)", value: stats.total },
            { label: "Monthly Charge", value: stats.monthly },
            { label: "Projected Annual", value: stats.projected },
          ]}
        />
      </header>

      <div className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b p-5">
          <h2 className="text-lg font-semibold tracking-tight">Subscriptions</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded((v) => !v)}
              className="min-w-[100px]"
            >
              {expanded ? "Collapse" : "Expand"} Year {year}
            </Button>
            <ExportCsvButton
              fileName={`accounts-overview-${year}.csv`}
              columns={columnDefs.map((col) => ({
                header: String(col.headerName),
                field: String(col.colId ?? col.field) as keyof AccountsRow,
              }))}
              rows={rows}
            />
          </div>
        </div>
        <div className="w-full">
          <AgTable
            rowData={rows}
            columnDefs={columnDefs}
            height="auto"
            pagination
            pageSize={10}
            defaultColDef={defaultColDef}
            suppressCellClickAction
          />
        </div>
      </div>

      <AlertDialog
        open={Boolean(pending)}
        onOpenChange={(o) => !o && !isSubmitting && setPending(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit invoice</AlertDialogTitle>
            <AlertDialogDescription>
              {pending
                ? `Submit ${pending.monthLabel} ${year} invoice for ${pending.companyName} (${formatGbp(pending.amount)})?`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitInvoice} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
