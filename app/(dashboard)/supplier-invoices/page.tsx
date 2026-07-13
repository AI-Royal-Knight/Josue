"use client"

import { useCallback, useMemo, useState } from "react"
import { AgTable } from "@/components/common/AgTable"
import { Input } from "@/components/ui/input"
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
import type {
  CellValueChangedEvent,
  ColDef,
  ICellRendererParams,
} from "ag-grid-community"
import TableStat from "@/components/common/table-stat"
import { useRoleStore } from "@/lib/role-store"
import ViewInvoiceDialog, { InvoicePreviewData } from "@/components/common/view-invoice-dialog"

type ApprovalStatus = "Approved" | "Rejected" | "Pending"

type SupplierInvoiceRow = {
  no: string
  invoiceNumber: string
  date: string
  poDate: string
  poRef: string
  callOffDate: string
  callOffRef: string
  variationRef: string
  otherRef: string
  project: string
  supplierName: string
  invoiceTotal: string
  expectedCost: string
  paymentDueDate: string
  approvedBy: string
  approved: ApprovalStatus
  financeComments: string | null
  procurementComments: string | null
  commercialComments: string | null
}

type CommentField =
  | "financeComments"
  | "procurementComments"
  | "commercialComments"

type PendingToggle = {
  no: string
  invoiceNumber: string
  nextApproved: boolean
}

const summaryRows = [
  { label: "Invoices", qty: "1", value: "2" },
  { label: "Approved invoices", qty: "1", value: "2" },
  { label: "Invoices awaiting approval", qty: "1", value: "2" },
  {
    label: "Invoices due this month",
    qty: "1",
    value: "2",
  },
  { label: "Invoices paid", qty: "1", value: "2" },
]

const initialRows: SupplierInvoiceRow[] = [
  {
    no: "001",
    invoiceNumber: "INV-88-2024-089",
    date: "12 Oct 2024",
    poDate: "01 Sep 2024",
    poRef: "PO-45002",
    callOffDate: "15 Sep 2024",
    callOffRef: "CO-5921",
    variationRef: "VAR-001",
    otherRef: "-",
    project: "M25 Junction 10",
    supplierName: "Balfour Beatty",
    invoiceTotal: "£145,000.00",
    expectedCost: "£145,000.00",
    paymentDueDate: "31 Oct 2024",
    approvedBy: "Sarah Jenkins",
    approved: "Approved",
    financeComments: "Matched to PO",
    procurementComments: "Rates verified",
    commercialComments: "Approved for payment",
  },
  {
    no: "002",
    invoiceNumber: "KER-99281-A",
    date: "14 Oct 2024",
    poDate: "10 Aug 2024",
    poRef: "PO-45311",
    callOffDate: "20 Aug 2024",
    callOffRef: "CO-8544",
    variationRef: "-",
    otherRef: "REF-A3",
    project: "HS2 Phase 2A",
    supplierName: "Kier Group",
    invoiceTotal: "£89,450.00",
    expectedCost: "£89,450.00",
    paymentDueDate: "31 Oct 2024",
    approvedBy: "Marcus Thorne",
    approved: "Approved",
    financeComments: "Clear",
    procurementComments: "All good",
    commercialComments: null,
  },
  {
    no: "003",
    invoiceNumber: "MS-2024-1102",
    date: "18 Oct 2024",
    poDate: "09 Oct 2024",
    poRef: "PO-48012",
    callOffDate: "10 Oct 2024",
    callOffRef: "CO-1002",
    variationRef: "VAR-004",
    otherRef: "-",
    project: "Thames Tideway",
    supplierName: "Morgan Sindall",
    invoiceTotal: "£210,000.00",
    expectedCost: "£205,000.00",
    paymentDueDate: "20 Nov 2024",
    approvedBy: "Pending",
    approved: "Pending",
    financeComments: "Awaiting commercial review",
    procurementComments: "Checking variation",
    commercialComments: "Reviewing EBR variance",
  },
  {
    no: "004",
    invoiceNumber: "SK-LDN-449",
    date: "02 Sep 2024",
    poDate: "10 Jul 2024",
    poRef: "PO-44100",
    callOffDate: "01 Aug 2024",
    callOffRef: "CO-4820",
    variationRef: "-",
    otherRef: "-",
    project: "Holday Point C",
    supplierName: "Skanska",
    invoiceTotal: "£78,500.00",
    expectedCost: "£78,500.00",
    paymentDueDate: "30 Sep 2024",
    approvedBy: "David Chen",
    approved: "Rejected",
    financeComments: "Overdue - On hold",
    procurementComments: "Disputed hours",
    commercialComments: "Awaiting revised timesheet",
  },
  {
    no: "005",
    invoiceNumber: "CDS-892-B",
    date: "20 Oct 2024",
    poDate: "01 Oct 2024",
    poRef: "PO-45699",
    callOffDate: "05 Oct 2024",
    callOffRef: "CO-8988",
    variationRef: "-",
    otherRef: "-",
    project: "A14 Cambridge",
    supplierName: "Costain",
    invoiceTotal: "£45,200.00",
    expectedCost: "£45,200.00",
    paymentDueDate: "30 Nov 2024",
    approvedBy: "Sarah Jenkins",
    approved: "Approved",
    financeComments: "Processed",
    procurementComments: "Processed",
    commercialComments: "Approved",
  },
  {
    no: "006",
    invoiceNumber: "INV-88-2024-090",
    date: "22 Oct 2024",
    poDate: "01 Sep 2024",
    poRef: "PO-45002",
    callOffDate: "15 Sep 2024",
    callOffRef: "CO-8932",
    variationRef: "-",
    otherRef: "-",
    project: "M25 Junction 10",
    supplierName: "Balfour Beatty",
    invoiceTotal: "£112,000.00",
    expectedCost: "£112,000.00",
    paymentDueDate: "30 Nov 2024",
    approvedBy: "Pending",
    approved: "Pending",
    financeComments: "In queue",
    procurementComments: "Reviewing",
    commercialComments: null,
  },
  {
    no: "007",
    invoiceNumber: "VIN-2024-001",
    date: "25 Sep 2024",
    poDate: "10 Sep 2024",
    poRef: "PO-45970",
    callOffDate: "12 Sep 2024",
    callOffRef: "CO-9930",
    variationRef: "VAR-002",
    otherRef: "-",
    project: "HS2 Phase 1",
    supplierName: "Vinci Construction",
    invoiceTotal: "£125,400.00",
    expectedCost: "£125,400.00",
    paymentDueDate: "31 Oct 2024",
    approvedBy: "Marcus Thorne",
    approved: "Approved",
    financeComments: "Paid Due - Processing today",
    procurementComments: "Approved",
    commercialComments: "Approved",
  },
  {
    no: "008",
    invoiceNumber: "BAM-NW-882",
    date: "24 Oct 2024",
    poDate: "25 Sep 2024",
    poRef: "PO-45960",
    callOffDate: "25 Sep 2024",
    callOffRef: "CO-9960",
    variationRef: "-",
    otherRef: "-",
    project: "Transpennine Route",
    supplierName: "BAM Nuttall",
    invoiceTotal: "£97,800.00",
    expectedCost: "£97,800.00",
    paymentDueDate: "30 Nov 2024",
    approvedBy: "Pending",
    approved: "Pending",
    financeComments: null,
    procurementComments: null,
    commercialComments: null,
  },
]

export default function Page() {
  const [rows, setRows] = useState(initialRows)
  const [pending, setPending] = useState<PendingToggle | null>(null)

  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoicePreviewData | null>(null)

  const openInvoice = useCallback((row: SupplierInvoiceRow) => {
    setSelectedInvoice({
      invoiceNumber: row.invoiceNumber,
      date: row.date,
      project: row.project,
      statusLabel: "Approved Status",
      statusValue: row.approved,
      amount: row.invoiceTotal || "£0.00",
      description: `Supplier: ${row.supplierName}`,
    })
    setInvoiceDialogOpen(true)
  }, [])

  const role = useRoleStore((state) => state.role)

  // Stage the toggle — opens confirmation dialog
  const requestToggle = useCallback(
    (no: string, invoiceNumber: string, nextApproved: boolean) => {
      setPending({ no, invoiceNumber, nextApproved })
    },
    []
  )

  // Confirmed — commit the change
  const confirmToggle = useCallback(() => {
    if (!pending) return
    setRows((prev) =>
      prev.map((r) =>
        r.no === pending.no
          ? {
            ...r,
            approved: pending.nextApproved ? "Approved" : "Pending",
            approvedBy: pending.nextApproved
              ? "Finance Department"
              : "Pending",
          }
          : r
      )
    )
    setPending(null)
  }, [pending])

  function CommentCellRenderer(
    params: ICellRendererParams<SupplierInvoiceRow, string> & {
      fieldName: CommentField
    }
  ) {
    return (
      <Input
        value={params.value ?? ""}
        placeholder="add comment"
        className="h-7 border-[#253046] bg-[#101012] text-xs text-slate-200 placeholder:text-slate-500"
        onChange={(e) =>
          params.node.setDataValue(params.fieldName, e.target.value)
        }
      />
    )
  }

  const columnDefs = useMemo<ColDef<SupplierInvoiceRow>[]>(() => {
    const base: ColDef<SupplierInvoiceRow>[] = [
      { field: "no", headerName: "No", minWidth: 70, filter: false },
      {
        field: "invoiceNumber",
        headerName: "Invoice Number",
        minWidth: 160,
        cellRenderer: (params: {
          data?: SupplierInvoiceRow
          value: string
        }) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (params.data) openInvoice(params.data)
            }}
            className={`${params.data?.approved === "Approved" ? "text-green-400" : "text-red-500"} text-sm font-medium hover:underline`}
          >
            {params.value}
          </button>
        ),
      },
      { field: "poDate", headerName: "PO Date" },
      { field: "poRef", headerName: "PO Ref" },
      { field: "callOffDate", headerName: "Call Off Date" },
      { field: "callOffRef", headerName: "Call Off Ref" },
      { field: "variationRef", headerName: "Variation Ref" },
      { field: "otherRef", headerName: "Other Ref" },
      { field: "project", headerName: "Project", minWidth: 140 },
      { field: "supplierName", headerName: "Supplier Name" },
      { field: "invoiceTotal", headerName: "Invoice Total" },
      { field: "expectedCost", headerName: "Expected Cost" },
      {
        field: "paymentDueDate",
        headerName: "Payment Due Date",
        minWidth: 180,
      },
    ]

    if (role === "procurement_department") {
      base.push({
        field: "approved",
        headerName: "Approved",
        minWidth: 160,
        sortable: true,
        filter: true,
        cellRenderer: (params: { data?: SupplierInvoiceRow }) => {
          const row = params.data
          if (!row) return null
          const isApproved = row.approved === "Approved"
          const isRejected = row.approved === "Rejected"

          return (
            <div className="flex items-center justify-center gap-2 py-2">
              <Switch
                checked={isApproved}
                // Rejected rows are locked — can't re-toggle
                disabled={isRejected}
                onCheckedChange={(checked) =>
                  requestToggle(row.no, row.invoiceNumber, checked)
                }
              />
              <span
                className={
                  isApproved
                    ? "text-xs font-medium text-emerald-400"
                    : isRejected
                      ? "text-xs font-medium text-red-400"
                      : "text-xs font-medium text-amber-400"
                }
              >
                {row.approved}
              </span>
            </div>
          )
        },
      })
    }

    base.push(
      { field: "approvedBy", headerName: "Approved By" },
      {
        field: "financeComments",
        headerName: "Finance Comments",
        editable: true,
        cellRenderer: CommentCellRenderer,
        cellRendererParams: { fieldName: "financeComments" },
      },
      {
        field: "procurementComments",
        headerName: "Procurement Comments",
        editable: true,
        minWidth: 160,
        cellRenderer: CommentCellRenderer,
        cellRendererParams: { fieldName: "procurementComments" },
      },
      {
        field: "commercialComments",
        headerName: "Commercial Comments",
        editable: true,
        minWidth: 160,
        cellRenderer: CommentCellRenderer,
        cellRendererParams: { fieldName: "commercialComments" },
      }
    )

    return base
  }, [role, requestToggle])

  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent<SupplierInvoiceRow>) => {
      setRows((prev) =>
        prev.map((r) => (r.no === params.data.no ? params.data : r))
      )
    },
    []
  )

  return (
    <div className="w-full min-w-0 space-y-8 p-4">
      <h2 className="text-xl font-semibold">Supplier Invoices</h2>

      <div className="flex-1">
        <TableStat summaryRows={summaryRows} />
      </div>

      <AgTable
        rowData={rows}
        columnDefs={columnDefs}
        suppressCellClickAction
        onCellValueChanged={handleCellValueChanged}
        height={500}
        pageSize={50}
        gridOptions={{ rowHeight: 48 }}
      />

      {/* Confirmation dialog */}
      <AlertDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.nextApproved
                ? "Approve this invoice?"
                : "Revoke approval?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.nextApproved
                ? `This will approve invoice ${pending.invoiceNumber}. Are you sure?`
                : `This will revoke approval for invoice ${pending?.invoiceNumber} and set it back to Pending.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPending(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>
              {pending?.nextApproved ? "Approve" : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ViewInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        invoice={selectedInvoice}
      />
    </div>
  )
}
