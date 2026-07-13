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

function annualCharge(row: AccountsRow): number {
  return monthlyCharge(row) * 12
}

type PendingInvoice = {
  companyId: string
  companyName: string
  month: BillingMonth
  monthLabel: string
  amount: number
}

export default function AccountsOverviewPage() {
  const year = new Date().getFullYear() // Default to current year as requested
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

  const handleToggleAutoInvoice = async (companyId: string, checked: boolean) => {
    try {
      await updateCompany(companyId, { auto_monthly_inv: checked })
      setRows((prev) =>
        prev.map((r) =>
          r.id === companyId ? { ...r, auto_monthly_inv: checked } : r
        )
      )
      toast.success("Settings updated")
    } catch (err) {
      toast.error("Failed to update settings")
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
        valueGetter: (p) => formatGbp(p.data?.monthly_subscription || "0"),
      },
      {
        headerName: "per User rate",
        colId: "per_user_rate",
        minWidth: 140,
        valueGetter: (p) => formatGbp(p.data?.per_user_rate || "0"),
      },
      { field: "user", headerName: "Users", minWidth: 90 },
      {
        headerName: "Automatic",
        colId: "auto_monthly_inv",
        minWidth: 140,
        sortable: false,
        filter: false,
        cellRenderer: (params: { data?: AccountsRow }) => {
          const row = params.data
          if (!row) return null
          return (
            <div className="flex items-center gap-2 py-1">
              <Switch
                checked={row.auto_monthly_inv}
                onCheckedChange={(checked) => handleToggleAutoInvoice(row.id, checked)}
              />
            </div>
          )
        },
      },
    ]

    if (!expanded) {
      base.push({
        headerName: String(year),
        colId: "annual",
        minWidth: 120,
        cellRenderer: (params: { data?: AccountsRow }) => {
          const row = params.data
          if (!row) return null
          const auto = row.auto_monthly_inv
          const companyInvoices = invoices.filter(
            (inv) => inv.company_id === row.id && inv.is_sent
          )

          const allSent = months.every(({ key }) =>
            auto ? true : companyInvoices.some((i) => i.month === key)
          )

          const displayAmount = auto
            ? annualCharge(row)
            : companyInvoices.reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0)

          return (
            <span
              className={
                allSent ? "font-medium text-emerald-400" : "text-slate-200"
              }
            >
              {formatGbp(displayAmount)}
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

          const amount = monthlyCharge(row)
          const auto = row.auto_monthly_inv
          const isSent = auto || invoices.some(
            (inv) => inv.company_id === row.id && inv.month === m.key && inv.is_sent
          )

          if (isSent) {
            return (
              <span className="font-medium text-emerald-400">
                {formatGbp(amount)}
              </span>
            )
          }

          // Manual mode: allow click to submit invoice
          return (
            <button
              type="button"
              className="text-left font-medium text-slate-200 hover:underline"
              onClick={() =>
                setPending({
                  companyId: row.id,
                  companyName: row.company_name || `Company ${row.id}`,
                  month: m.key,
                  monthLabel: m.label,
                  amount,
                })
              }
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
    () => ({ flex: 0, resizable: true, sortable: true, filter: true }),
    []
  )

  const stats = useMemo(() => {
    let totalRev = 0
    let monthlyRev = 0
    rows.forEach((r) => {
      const mc = monthlyCharge(r)
      monthlyRev += mc
      totalRev += mc * 12
    })
    return {
      total: formatGbp(totalRev),
      monthly: formatGbp(monthlyRev),
    }
  }, [rows])

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
            { label: "Total Revenue", value: stats.total },
            { label: "Monthly Revenue", value: stats.monthly },
          ]}
        />
      </header>

      <div className="flex flex-1 flex-col rounded-lg bg-card">
        <div className="flex items-center justify-end gap-2 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? String(year) : String(year)}
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
        <AgTable
          rowData={rows}
          columnDefs={columnDefs}
          height="70vh"
          pagination
          pageSize={10}
          defaultColDef={defaultColDef}
        />
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
