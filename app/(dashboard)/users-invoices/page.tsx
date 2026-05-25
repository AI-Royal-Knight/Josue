"use client"

import { useMemo, useState, useCallback } from "react"
import type { ColDef } from "ag-grid-community"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import TableStat from "@/components/common/table-stat"
import { AgTable } from "@/components/common/AgTable"
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

type InvoiceRow = {
  no: string
  invoiceNumber: string
  date: string
  variationSheetNo: string
  nfiProformaNo: string
  project: string
  workArea: string
  workSection: string
  description: string
  createdBy: string
  approvedBy: string
  approved: boolean
  total: string
  datePaid: string
  paidBy: string
  financeComments: string
  commercialComments: string
}

type PendingToggle = {
  no: string
  invoiceNumber: string
  nextValue: boolean
}

const initialRows: InvoiceRow[] = [
  {
    no: "1",
    invoiceNumber: "INV-2024-003",
    date: "15/03/2024",
    variationSheetNo: "VS-012",
    nfiProformaNo: "NFI-045",
    project: "Al Barsha Tower",
    workArea: "Zone B",
    workSection: "Structural",
    description: "Concrete pouring for Level 5",
    createdBy: "Ahmed K.",
    approvedBy: "Mohammad R.",
    approved: true,
    total: "£145,000.00",
    datePaid: "22/03/2024",
    paidBy: "Sarah L.",
    financeComments: "Cleared",
    commercialComments: "Approved",
  },
  {
    no: "2",
    invoiceNumber: "INV-2024-004",
    date: "20/03/2024",
    variationSheetNo: "VS-015",
    nfiProformaNo: "NFI-048",
    project: "Dubai Marina Plaza",
    workArea: "Zone C",
    workSection: "",
    description: "",
    createdBy: "",
    approvedBy: "",
    approved: false,
    total: "",
    datePaid: "",
    paidBy: "",
    financeComments: "",
    commercialComments: "",
  },
  {
    no: "3",
    invoiceNumber: "INV-2024-005",
    date: "28/03/2024",
    variationSheetNo: "VS-018",
    nfiProformaNo: "NFI-052",
    project: "Dubai Marina Plaza",
    workArea: "Zone A",
    workSection: "MEP",
    description: "HVAC installation Phase 2",
    createdBy: "Omar S.",
    approvedBy: "Fatima H.",
    approved: true,
    total: "£89,500.00",
    datePaid: "05/04/2024",
    paidBy: "Sarah L.",
    financeComments: "Processed",
    commercialComments: "Verified",
  },
  {
    no: "4",
    invoiceNumber: "INV-2024-006",
    date: "01/04/2024",
    variationSheetNo: "VS-020",
    nfiProformaNo: "NFI-058",
    project: "Al Barsha Tower",
    workArea: "Zone C",
    workSection: "Electrical",
    description: "Main distribution board installation",
    createdBy: "Khalid M.",
    approvedBy: "",
    approved: false,
    total: "£62,000.00",
    datePaid: "",
    paidBy: "",
    financeComments: "",
    commercialComments: "",
  },
  {
    no: "5",
    invoiceNumber: "INV-2024-007",
    date: "05/04/2024",
    variationSheetNo: "VS-022",
    nfiProformaNo: "NFI-061",
    project: "Dubai Marina Plaza",
    workArea: "Zone B",
    workSection: "Civil",
    description: "Foundation works Block D",
    createdBy: "Yusuf A.",
    approvedBy: "",
    approved: false,
    total: "£110,000.00",
    datePaid: "",
    paidBy: "",
    financeComments: "",
    commercialComments: "",
  },
]

export default function Page() {
  const [selectedProject, setSelectedProject] = useState("project-a")
  const [rows, setRows] = useState<InvoiceRow[]>(initialRows)
  const [pending, setPending] = useState<PendingToggle | null>(null)

  // Stage toggle — opens confirmation dialog
  const requestToggle = useCallback(
    (no: string, invoiceNumber: string, nextValue: boolean) => {
      setPending({ no, invoiceNumber, nextValue })
    },
    []
  )

  // Confirmed — commit
  const confirmToggle = useCallback(() => {
    if (!pending) return
    const today = new Date().toLocaleDateString("en-GB")
    setRows((prev) =>
      prev.map((r) =>
        r.no === pending.no
          ? {
              ...r,
              approved: pending.nextValue,
              approvedBy: pending.nextValue ? "Finance Department" : "",
              datePaid: pending.nextValue ? today : "",
              paidBy: pending.nextValue ? "Finance Department" : "",
            }
          : r
      )
    )
    setPending(null)
  }, [pending])

  const approvedCount = rows.filter((r) => r.approved && r.invoiceNumber).length
  const pendingCount = rows.filter((r) => !r.approved && r.invoiceNumber).length

  const columns = useMemo<ColDef<InvoiceRow>[]>(
    () => [
      { headerName: "No.", field: "no", minWidth: 70, maxWidth: 80, filter: false },

      // ── Invoice Number — green if approved, red if not (when populated) ──
      {
        headerName: "Invoice Number",
        field: "invoiceNumber",
        minWidth: 160,
        cellRenderer: (params: { data?: InvoiceRow; value: string }) => {
          if (!params.value) return null
          const approved = params.data?.approved
          return (
            <span
              className={
                approved
                  ? "font-medium text-emerald-400"
                  : "font-medium text-red-400"
              }
            >
              {params.value}
            </span>
          )
        },
      },

      { headerName: "Date", field: "date", minWidth: 120 },
      { headerName: "Variation Sheet No.", field: "variationSheetNo", minWidth: 160 },
      { headerName: "NFI Proforma No.", field: "nfiProformaNo", minWidth: 150 },
      { headerName: "Project", field: "project", minWidth: 160 },
      { headerName: "Description of Work", field: "description", minWidth: 220 },
      { headerName: "Created By", field: "createdBy", minWidth: 140 },
      { headerName: "Approved By", field: "approvedBy", minWidth: 140 },

      // ── Approved — toggle switch ──────────────────────────────────────────
      {
        headerName: "Approved",
        field: "approved",
        minWidth: 140,
        cellRenderer: (params: { data?: InvoiceRow }) => {
          const row = params.data
          if (!row) return null
          const approved = row.approved
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={approved}
                onCheckedChange={(checked) =>
                  requestToggle(
                    row.no,
                    row.invoiceNumber || `Row ${row.no}`,
                    checked
                  )
                }
              />
              <span
                className={
                  approved
                    ? "text-xs font-medium text-emerald-400"
                    : "text-xs font-medium text-slate-400"
                }
              >
                {approved ? "Yes" : "No"}
              </span>
            </div>
          )
        },
      },

      {
        headerName: "Total",
        field: "total",
        minWidth: 130,
        cellStyle: { textAlign: "right" },
      },

      // ── Paid — derived from approved ──────────────────────────────────────
      {
        headerName: "Paid",
        field: "approved",
        colId: "paid",
        minWidth: 90,
        cellRenderer: (params: { data?: InvoiceRow }) => {
          const approved = params.data?.approved
          if (!params.data?.invoiceNumber) return null
          return (
            <span
              className={
                approved
                  ? "font-medium text-emerald-400"
                  : "font-medium text-slate-400"
              }
            >
              {approved ? "Yes" : "No"}
            </span>
          )
        },
      },

      { headerName: "Date Paid", field: "datePaid", minWidth: 120 },
      { headerName: "Paid By", field: "paidBy", minWidth: 140 },
      { headerName: "Finance Comments", field: "financeComments", minWidth: 200 },
      { headerName: "Commercial Comments", field: "commercialComments", minWidth: 200 },
    ],
    [requestToggle]
  )

  return (
    <div className="w-full space-y-6 p-6">
      <h2 className="text-2xl font-semibold">User Invoices</h2>

      <div className="max-w-[440px] space-y-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Select Project
          </label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="border-white/10 bg-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900">
              <SelectItem value="project-a">Project A</SelectItem>
              <SelectItem value="project-b">Project B</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TableStat
          summaryRows={[
            { label: "Invoices", value: String(rows.filter((r) => r.invoiceNumber).length) },
            { label: "Approved Invoices", value: String(approvedCount), valueColor: "green" },
            { label: "Awaiting Approval", value: String(pendingCount), valueColor: pendingCount > 0 ? "red" : undefined },
            { label: "Invoices Paid", value: String(approvedCount) },
          ]}
        />
      </div>

      <div className="overflow-x-auto border border-white/10">
        <div className="min-w-[1400px]">
          <AgTable
            rowData={rows}
            columnDefs={columns}
            suppressCellClickAction
            height="auto"
            gridOptions={{ rowHeight: 48 }}
          />
        </div>
      </div>

      {/* Confirmation dialog */}
      <AlertDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.nextValue ? "Approve invoice?" : "Revoke approval?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.nextValue
                ? `Approving ${pending.invoiceNumber} will mark it as paid. Are you sure?`
                : `Revoking approval for ${pending?.invoiceNumber} will mark it as unpaid.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPending(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>
              {pending?.nextValue ? "Approve" : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
