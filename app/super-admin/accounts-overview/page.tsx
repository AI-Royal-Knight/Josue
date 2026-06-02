"use client"

import React, { useEffect, useMemo, useState } from "react"
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
  subscribeCompanies,
  updateCompany,
  type CompanyRecord,
} from "@/lib/company-store"
import {
  isMonthSent,
  setMonthSent,
  subscribeAccountsOverview,
  type BillingMonth,
} from "@/lib/accounts-overview-store"
import TableStat from "@/components/common/table-stat"
import { ExportCsvButton } from "@/components/common/export-csv-button"

type AccountsRow = CompanyRecord

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

function formatGbp(amount: number) {
  const hasDecimals = Math.round(amount * 100) % 100 !== 0
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(amount)
}

function monthlyCharge(row: AccountsRow): number {
  const monthly = row.monthlySubscriptionGbp ?? 0
  const perUser = row.perUserRateGbp ?? 0
  return monthly + perUser * row.users
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
  // Default to previous year (matches the mockups using 2025)
  const year = new Date().getFullYear() - 1
  const [expanded, setExpanded] = useState(false)

  const [rows, setRows] = useState<AccountsRow[]>(() =>
    getCompanies().filter((c) => c.activated)
  )
  const [billingTick, setBillingTick] = useState(0)
  const [pending, setPending] = useState<PendingInvoice | null>(null)

  useEffect(() => {
    return subscribeCompanies(() =>
      setRows(getCompanies().filter((c) => c.activated))
    )
  }, [])

  useEffect(() => {
    return subscribeAccountsOverview(() => setBillingTick((n) => n + 1))
  }, [])

  const columnDefs = useMemo<ColDef<AccountsRow>[]>(() => {
    const base: ColDef<AccountsRow>[] = [
      { field: "name", headerName: "Company", minWidth: 220 },
      {
        headerName: "Monthly Subscription",
        colId: "monthlySubscriptionGbp",
        minWidth: 170,
        valueGetter: (p) =>
          formatGbp((p.data?.monthlySubscriptionGbp ?? 0) as number),
      },
      {
        headerName: "per User rate",
        colId: "perUserRateGbp",
        minWidth: 140,
        valueGetter: (p) => formatGbp((p.data?.perUserRateGbp ?? 0) as number),
      },
      { field: "users", headerName: "Users", minWidth: 90 },
      {
        headerName: "Automatic",
        colId: "automaticMonthlyInvoices",
        minWidth: 140,
        sortable: false,
        filter: false,
        cellRenderer: (params: { data?: AccountsRow }) => {
          const row = params.data
          if (!row) return null
          return (
            <div className="flex items-center gap-2 py-1">
              <Switch
                checked={row.automaticMonthlyInvoices}
                onCheckedChange={(checked) =>
                  updateCompany(row.id, { automaticMonthlyInvoices: checked })
                }
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
          const auto = row.automaticMonthlyInvoices
          const allSent = months.every(({ key }) =>
            auto ? true : isMonthSent(row.id, year, key)
          )
          return (
            <span
              className={
                allSent ? "font-medium text-emerald-400" : "text-slate-200"
              }
            >
              {formatGbp(annualCharge(row))}
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
          const auto = row.automaticMonthlyInvoices
          const sent = auto ? true : isMonthSent(row.id, year, m.key)

          if (sent) {
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
                  companyName: row.name,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, year, billingTick])

  const defaultColDef = useMemo(
    () => ({ flex: 0, resizable: true, sortable: true, filter: true }),
    []
  )

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-6">
      <header>
        <h1 className="mb-4 text-2xl font-bold">Accounts Overview</h1>
        <TableStat
          summaryRows={[
            { label: "Total Revenue", value: "£0.00" },
            { label: "Monthly Revenue", value: "£0.00" },
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
            filename={`accounts-overview-${year}.csv`}
            columns={columnDefs.map((col) => ({
              header: String(col.headerName),
              field: String(col.colId ?? col.field),
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
        onOpenChange={(o) => !o && setPending(null)}
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pending) return
                setMonthSent(pending.companyId, year, pending.month, true)
                setPending(null)
              }}
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
