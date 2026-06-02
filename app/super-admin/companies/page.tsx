"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
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
  subscribeCompanies,
  updateCompany,
  type CompanyRecord,
} from "@/lib/company-store"

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
  status: CompanyRecord["status"]
}

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
  const inputKey = initialValue

  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-xs text-slate-400">
        £
      </span>
      <Input
        className="h-8 pl-6"
        inputMode="decimal"
        disabled={disabled}
        key={inputKey}
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

function InviteAdminDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Invite Admin</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Invite Admin</DialogTitle>
          <DialogDescription>
            Add a new company admin by entering the required details.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 py-4">
          <Field>
            <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
            <FieldContent>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Enter company name"
              />
            </FieldContent>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="adminFirstName">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="adminFirstName"
                  name="adminFirstName"
                  placeholder="Enter name"
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="adminSurname">Surname</FieldLabel>
              <FieldContent>
                <Input
                  id="adminSurname"
                  name="adminSurname"
                  placeholder="Enter surname"
                />
              </FieldContent>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <FieldContent>
              <Input id="email" name="email" placeholder="Enter email" />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
            <FieldContent>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Enter phone number"
              />
            </FieldContent>
          </Field>
        </form>
        <DialogFooter>
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button>Send Invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function CompaniesPage() {
  const [rows, setRows] = useState<CompanyRow[]>(() => getCompanies())

  useEffect(() => {
    return subscribeCompanies(() => setRows(getCompanies()))
  }, [])

  function ActionsCell(params: ICellRendererParams<CompanyRow>) {
    const id = params.data?.id || ""
    return (
      <Button
        className="mt-0.5 flex items-center gap-3"
        variant="outline"
        size="sm"
      >
        <Link href={`/super-admin/companies/${id}`}>View</Link>
      </Button>
    )
  }

  const columnDefs: ColDef<CompanyRow>[] = [
    { field: "name", headerName: "Company" },
    { field: "adminFirstName", headerName: "name" },
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
              onCheckedChange={(checked) =>
                updateCompany(row.id, { activated: checked })
              }
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
            onCommit={(next) =>
              updateCompany(row.id, { monthlySubscriptionGbp: next })
            }
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
            onCommit={(next) => updateCompany(row.id, { perUserRateGbp: next })}
          />
        )
      },
    },
    {
      headerName: "Automatic monthly invoices",
      colId: "automaticMonthlyInvoices",
      minWidth: 210,
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<CompanyRow>) => {
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
        const status = (params.value ?? "Suspended") as CompanyRow["status"]
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>
      },
    },
    { headerName: "Actions", cellRenderer: ActionsCell, minWidth: 120 },
  ]

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
        <div>
          <InviteAdminDialog />
        </div>
      </header>

      {/* <StatCards stats={data} /> */}
      <TableStat
        summaryRows={[
          { label: "Admin users", value: "123" },
          { label: "Users", value: "456" },
          { label: "Projects", value: "789" },
          { label: "Active", value: "12" },
          { label: "Suspended", value: "3" },
        ]}
      />

      <div className="flex flex-1 flex-col rounded-lg bg-card">
        <AgTable
          rowData={rows}
          columnDefs={columnDefs}
          height="100%"
          pagination
          pageSize={10}
          defaultColDef={defaultColDef}
        />
      </div>
    </div>
  )
}
