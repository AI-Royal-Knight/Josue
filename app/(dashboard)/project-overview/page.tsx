"use client"

import { useRef, useCallback } from "react"
import type { ColDef, GridApi } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import TableStat from "@/components/common/table-stat"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useRoleStore } from "@/lib/role-store"

type BreakdownRow = {
  period: string
  applicationValue: number
  totalSpent?: number
  projectValue: number
  labourTarget: number
  overspend: number
  unclaimed: number
  moneyOnHold: number
  poCalledOff: number
  loadingAndClearing: number
  managementPrelims: number
  plantHire: number
  proformaNR: number
  proformaNRMaterialEstimate: number
  variationValue: number
  variationLabourValue: number
  variationLabourTarget: number
  variationPoCalledOff: number
  variationClaimed: number
}

const data: BreakdownRow[] = [
  {
    period: "January",
    applicationValue: 100000,
    projectValue: 100000,
    labourTarget: 25000,
    overspend: 40000,
    unclaimed: 1500,
    moneyOnHold: 2000,
    poCalledOff: 3000,
    loadingAndClearing: 5000,
    managementPrelims: 2000,
    plantHire: 3000,
    proformaNR: 4000,
    proformaNRMaterialEstimate: 3500,
    variationValue: 5000,
    variationLabourValue: 2000,
    variationLabourTarget: 1500,
    variationPoCalledOff: 1000,
    variationClaimed: 2500,
  },
  {
    period: "February",
    applicationValue: 120000,
    projectValue: 120000,
    labourTarget: 28000,
    overspend: 45000,
    unclaimed: 1500,
    moneyOnHold: 2000,
    poCalledOff: 3000,
    loadingAndClearing: 5000,
    managementPrelims: 2000,
    plantHire: 3000,
    proformaNR: 4000,
    proformaNRMaterialEstimate: 3500,
    variationValue: 5000,
    variationLabourValue: 2000,
    variationLabourTarget: 1500,
    variationPoCalledOff: 1000,
    variationClaimed: 2500,
  },
  {
    period: "March",
    applicationValue: 140000,
    projectValue: 130000,
    labourTarget: 30000,
    overspend: 50000,
    unclaimed: 1500,
    moneyOnHold: 2000,
    poCalledOff: 3000,
    loadingAndClearing: 5000,
    managementPrelims: 2000,
    plantHire: 3000,
    proformaNR: 4000,
    proformaNRMaterialEstimate: 3500,
    variationValue: 5000,
    variationLabourValue: 2000,
    variationLabourTarget: 1500,
    variationPoCalledOff: 1000,
    variationClaimed: 2500,
  },
  {
    period: "April",
    applicationValue: 140000,
    projectValue: 130000,
    labourTarget: 30000,
    overspend: 50000,
    unclaimed: 1500,
    moneyOnHold: 2000,
    poCalledOff: 3000,
    loadingAndClearing: 5000,
    managementPrelims: 2000,
    plantHire: 3000,
    proformaNR: 4000,
    proformaNRMaterialEstimate: 3500,
    variationValue: 5000,
    variationLabourValue: 2000,
    variationLabourTarget: 1500,
    variationPoCalledOff: 1000,
    variationClaimed: 2500,
  },
]

const columns: ColDef<BreakdownRow>[] = [
  { headerName: "Date 15th to 15th", field: "period", minWidth: 180 },
  {
    headerName: "Application Value",
    field: "applicationValue",
    headerClass: "text-green-500",
  },
  {
    headerName: "Total Spent",
    field: "totalSpent",
    headerClass: "text-green-500",
    valueGetter: (params) => {
      const data = params.data as BreakdownRow
      return (
        data.projectValue +
        data.overspend +
        data.poCalledOff +
        data.managementPrelims +
        data.loadingAndClearing +
        data.proformaNR
      )
    },
    cellRenderer: (params: { value: number }) => {
      const value = params.value as number
      return (
        <span className="text-green-400">
          {value.toLocaleString("en-GB", {
            style: "currency",
            currency: "GBP",
          })}
        </span>
      )
    },
  },
  {
    headerName: "Project Value",
    field: "projectValue",
    headerClass: "text-green-400",
  },
  {
    headerName: "Labour Target",
    field: "labourTarget",
    headerClass: "text-green-400",
  },
  {
    headerName: "Overspend",
    field: "overspend",
    headerClass: "text-red-500",
    cellRenderer: (params: { value: number }) => {
      const value = params.value as number
      return (
        <span className="text-red-500">
          {value.toLocaleString("en-GB", {
            style: "currency",
            currency: "GBP",
          })}
        </span>
      )
    },
  },
  {
    headerName: "Unclaimed",
    field: "unclaimed",
    headerClass: "text-green-400",
    cellRenderer: (params: { value: number }) => {
      const value = params.value as number
      return (
        <span className="text-green-400">
          {value.toLocaleString("en-GB", {
            style: "currency",
            currency: "GBP",
          })}
        </span>
      )
    },
  },
  {
    headerName: "Money on Hold",
    field: "moneyOnHold",
    headerClass: "text-red-500",
    cellRenderer: (params: { value: number }) => {
      const value = params.value as number
      return (
        <span className="text-red-500">
          {value.toLocaleString("en-GB", {
            style: "currency",
            currency: "GBP",
          })}
        </span>
      )
    },
  },
  {
    headerName: "PO Called off",
    field: "poCalledOff",
    headerClass: "text-green-500",
  },
  {
    headerName: "Loading and clearing",
    field: "loadingAndClearing",
    headerClass: "text-green-500",
  },
  {
    headerName: "Management prelims",
    field: "managementPrelims",
    headerClass: "text-green-500",
  },
  {
    headerName: "Plant Hire",
    field: "plantHire",
    headerClass: "text-green-500",
  },
  {
    headerName: "Proforma NR",
    field: "proformaNR",
    headerClass: "text-red-500",
    cellRenderer: (params: { value: number }) => {
      const value = params.value as number
      return (
        <span className="text-red-500">
          {value.toLocaleString("en-GB", {
            style: "currency",
            currency: "GBP",
          })}
        </span>
      )
    },
  },
  {
    headerName: "Proforma NR Material Estimate",
    field: "proformaNRMaterialEstimate",
    headerClass: "text-red-500",
    cellRenderer: (params: { value: number }) => {
      const value = params.value as number
      return (
        <span className="text-red-500">
          {value.toLocaleString("en-GB", {
            style: "currency",
            currency: "GBP",
          })}
        </span>
      )
    },
  },
  {
    headerName: "Variation Value",
    field: "variationValue",
    headerClass: "text-orange-400",
  },
  {
    headerName: "Variation Labour Value",
    field: "variationLabourValue",
    headerClass: "text-orange-400",
  },
  {
    headerName: "Variation Labour Target",
    field: "variationLabourTarget",
    headerClass: "text-orange-400",
  },
  {
    headerName: "Variation PO Called Off",
    field: "variationPoCalledOff",
    headerClass: "text-orange-400",
  },
  {
    headerName: "Variation Claimed",
    field: "variationClaimed",
    headerClass: "text-orange-400",
  },
]

export default function Page() {
  const gridApiRef = useRef<GridApi<BreakdownRow> | null>(null)
  const role = useRoleStore((s) => s.role)
  const handleDownload = useCallback(() => {
    if (!gridApiRef.current) return
    const rows: BreakdownRow[] = []
    gridApiRef.current.forEachNode((node) => {
      if (node.data) rows.push(node.data)
    })

    const exportableColumns = columns.filter((c) => c.field && !c.hide)
    const csvEscape = (value: unknown) => {
      const text = value === null || value === undefined ? "" : String(value)
      return `"${text.replaceAll('"', '""')}"`
    }

    const headers = exportableColumns
      .map((c) => csvEscape(c.headerName || String(c.field || "")))
      .join(",")

    const body = rows
      .map((row) =>
        exportableColumns
          .map((c) => {
            if (!c.field) return csvEscape("")
            // Compute totalSpent for the calculated column
            if (c.field === "totalSpent") {
              const total =
                row.projectValue +
                row.overspend +
                row.poCalledOff +
                row.managementPrelims +
                row.loadingAndClearing +
                row.proformaNR
              return csvEscape(`£${total.toLocaleString("en-GB")}`)
            }
            return csvEscape((row as Record<string, unknown>)[String(c.field)])
          })
          .join(",")
      )
      .join("\n")

    const csv = [headers, body].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `financial-breakdown-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [])

  return (
    <div className="w-full p-6">
      <h2 className="mb-4">Project Overview</h2>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Select>
            <SelectTrigger className="w-[240px] border-white/10 bg-slate-900">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900">
              <SelectItem value="project-a">
                Riverside Tower Development
              </SelectItem>
              <SelectItem value="project-b">Project B</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">
            Riverside Tower Development
          </h2>
          <p className="text-sm text-muted-foreground">
            RT-2024-001 • 123 Thames Street, London
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6 md:flex-row md:items-start md:justify-start">
        <TableStat
          summaryRows={[
            { label: "Project Value", value: "£1,000,000" },
            { label: "Material Estimate", value: "£300" },
            { label: "Labour Estimate", value: "£320" },
            { label: "Prelims Estimate", value: "£50,000" },
            { label: "Estimate Profit", value: "£150,000" },
          ]}
        />
        <TableStat
          summaryRows={[
            { label: "Total PO Raised", value: "£1,000,000" },
            { label: "Total Variation PO Raised", value: "£300" },
            { label: "Proforma NR", value: "£320", valueColor: "red" },
            {
              label: "Proforma NR Material Estimate",
              value: "£50,000",
              valueColor: "red",
            },
            {
              label: "Total Unclaimed",
              value: "£150,000",
              valueColor: "green",
            },
            {
              label: "Total Overspend",
              value: "£150,000",
              valueColor: "red",
            },
          ]}
        />
        {/* {role === "project_admin" && ( */}
          <TableStat
            summaryRows={[
              { label: "Variations Value", value: "£250,000" },
              { label: "Variation Labour value", value: "£150,000" },
              { label: "Variation Labour target", value: "£150,000" },
              { label: "Variations Total PO", value: "£150,000" },
              { label: "Variations PO Call off", value: "£150,000" },
              { label: "Variations Claimed", value: "£320", valueColor: "red" },
            ]}
          />
        {/* )} */}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Financial Breakdown</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </div>
        <AgTable
          rowData={data}
          columnDefs={columns}
          height="auto"
          suppressCellClickAction
          onGridReady={(api) => {
            gridApiRef.current = api
          }}
          defaultColDef={{
            minWidth: 160,
          }}
        />
      </div>
    </div>
  )
}
