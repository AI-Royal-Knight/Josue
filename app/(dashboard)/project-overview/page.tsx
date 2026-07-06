"use client"

import { useRef, useCallback, useEffect, useState } from "react"
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
import { getMyProjects, getProjectFinancialBreakdown, type FinancialBreakdownRow } from "@/lib/api/project-admin"
import type { ProjectItem } from "@/constants/projects"


const columns: ColDef<FinancialBreakdownRow>[] = [
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
      const data = params.data as FinancialBreakdownRow
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
          {value.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}
        </span>
      )
    },
  },
  { headerName: "Labour Target", field: "labourTarget", headerClass: "text-green-400" },
  {
    headerName: "Overspend",
    field: "overspend",
    headerClass: "text-red-500",
    cellRenderer: (params: { value: number }) => {
      const value = params.value as number
      return (
        <span className="text-red-500">
          {value.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}
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
          {value.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}
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
          {value.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}
        </span>
      )
    },
  },
  { headerName: "PO Called off", field: "poCalledOff", headerClass: "text-green-500" },
  { headerName: "Loading and clearing", field: "loadingAndClearing", headerClass: "text-green-500" },
  { headerName: "Management prelims", field: "managementPrelims", headerClass: "text-green-500" },
  { headerName: "Plant Hire", field: "plantHire", headerClass: "text-green-500" },
  {
    headerName: "Proforma NR",
    field: "proformaNR",
    headerClass: "text-red-500",
    cellRenderer: (params: { value: number }) => {
      const value = params.value as number
      return (
        <span className="text-red-500">
          {value.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}
        </span>
      )
    },
  },
  { headerName: "Variation Value", field: "variationValue", headerClass: "text-orange-400" },
  { headerName: "Variations Labour Value", field: "variationLabourValue", headerClass: "text-orange-400" },
  { headerName: "Variation Labour Target", field: "variationLabourTarget", headerClass: "text-orange-400" },
  { headerName: "Variation PO Called Off", field: "variationPoCalledOff", headerClass: "text-orange-400" },
  { headerName: "Variation Claimed", field: "variationClaimed", headerClass: "text-orange-400" },
]

function fmt(value: number | string | undefined): string {
  if (value === undefined || value === null) return "£0"
  let num: number;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]+/g, "");
    num = parseFloat(cleaned);
  } else {
    num = value as number;
  }
  if (isNaN(num)) return "£0"
  return num.toLocaleString("en-GB", { style: "currency", currency: "GBP" })
}

export default function Page() {
  const gridApiRef = useRef<GridApi<FinancialBreakdownRow> | null>(null)
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [breakdownData, setBreakdownData] = useState<FinancialBreakdownRow[]>([])
  const [loadingBreakdown, setLoadingBreakdown] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getMyProjects()
        setProjects(result.projects)
        if (result.projects.length > 0) {
          setSelectedId(result.projects[0].id)
        }
      } catch (err) {
        console.error("Failed to load projects:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (selectedId) {
      setLoadingBreakdown(true)
      getProjectFinancialBreakdown(selectedId)
        .then((res) => {
          setBreakdownData(res.breakdown)
        })
        .catch((err) => console.error("Failed to fetch breakdown:", err))
        .finally(() => setLoadingBreakdown(false))
    } else {
      setBreakdownData([])
    }
  }, [selectedId])

  const selectedProject = projects.find((p) => p.id === selectedId)

  const handleDownload = useCallback(() => {
    if (!gridApiRef.current) return
    const rows: FinancialBreakdownRow[] = []
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
            return csvEscape((row as unknown as Record<string, unknown>)[String(c.field)])
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
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-[240px] border-white/10 bg-slate-900">
              <SelectValue placeholder={loading ? "Loading projects…" : "Select Project"} />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900">
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.projectName}
                </SelectItem>
              ))}
              {!loading && projects.length === 0 && (
                <SelectItem value="none" disabled>
                  No projects available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          {selectedProject ? (
            <>
              <h2 className="text-2xl font-semibold">{selectedProject.projectName}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedProject.jobCode}
                {selectedProject.address ? ` • ${selectedProject.address}` : ""}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading…" : "Select a project to view details"}
            </p>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-6 md:flex-row md:items-start md:justify-start">
        <TableStat
          summaryRows={[
            { label: "Project Value", value: selectedProject ? fmt(selectedProject.projectValue) : "—" },
            { label: "Material Estimate", value: selectedProject ? fmt(selectedProject.materialEstimate) : "—" },
            { label: "Labour Estimate", value: selectedProject ? fmt(selectedProject.labourEstimate) : "—" },
            { label: "Prelims Estimate", value: selectedProject ? fmt(selectedProject.prelimsEstimate) : "—" },
            { label: "Estimate Profit", value: selectedProject ? fmt(selectedProject.estimateProfit) : "—" },
            { label: "Total Invoiced", value: fmt(breakdownData.reduce((acc, r) => acc + r.applicationValue, 0)) },
            { label: "Total Spend", value: fmt(breakdownData.reduce((acc, r) => {
                const rowSpend = r.projectValue + r.overspend + r.poCalledOff + r.managementPrelims + r.loadingAndClearing + r.proformaNR;
                return acc + rowSpend;
              }, 0)) 
            },
          ]}
        />
        <TableStat
          summaryRows={[
            { label: "Total PO Raised", value: fmt(breakdownData.reduce((acc, r) => acc + r.poCalledOff, 0)) },
            { label: "Proforma NR", value: fmt(breakdownData.reduce((acc, r) => acc + r.proformaNR, 0)), valueColor: "red" },
            { label: "Total Unclaimed", value: fmt(breakdownData.reduce((acc, r) => acc + r.unclaimed, 0)), valueColor: "green" },
            { label: "Total Overspend", value: fmt(breakdownData.reduce((acc, r) => acc + r.overspend, 0)), valueColor: "red" },
          ]}
        />
        <TableStat
          summaryRows={[
            { label: "Variations Value", value: fmt(breakdownData.reduce((acc, r) => acc + r.variationValue, 0)) },
            { label: "Variation Labour value", value: fmt(breakdownData.reduce((acc, r) => acc + r.variationLabourValue, 0)) },
            { label: "Variation Labour target", value: fmt(breakdownData.reduce((acc, r) => acc + r.variationLabourTarget, 0)) },
            { label: "Variations Total PO", value: fmt(breakdownData.reduce((acc, r) => acc + r.variationPoCalledOff, 0)) },
            { label: "Variations Claimed", value: fmt(breakdownData.reduce((acc, r) => acc + r.variationClaimed, 0)), valueColor: "red" },
          ]}
        />
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
          loading={loadingBreakdown}
          rowData={breakdownData}
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
