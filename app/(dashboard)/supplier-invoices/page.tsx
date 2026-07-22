"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
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
import { getQuotations, patchQuotation, Quotation } from "@/lib/api/quotations"
import { format } from "date-fns"

type ApprovalStatus = "Approved" | "Rejected" | "Pending"

type SupplierInvoiceRow = {
  id: string
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
  id: string
  no: string
  invoiceNumber: string
  nextApproved: boolean
}

const summaryRows = [
  { label: "Invoices", qty: "0", value: "0" },
  { label: "Approved invoices", qty: "0", value: "0" },
  { label: "Invoices awaiting approval", qty: "0", value: "0" },
  {
    label: "Invoices due this month",
    qty: "0",
    value: "0",
  },
  { label: "Invoices paid", qty: "0", value: "0" },
]

export default function Page() {
  const [rows, setRows] = useState<SupplierInvoiceRow[]>([])
  const [pending, setPending] = useState<PendingToggle | null>(null)
  const [summary, setSummary] = useState(summaryRows)

  const loadData = useCallback(async () => {
    try {
      const data = await getQuotations()
      const mapped: SupplierInvoiceRow[] = data.map((q, i) => ({
        id: q.id,
        no: String(i + 1).padStart(3, "0"),
        invoiceNumber: q.quote_ref,
        date: q.date_of_quote ? format(new Date(q.date_of_quote), "dd MMM yyyy") : "-",
        poDate: q.date_po_created ? format(new Date(q.date_po_created), "dd MMM yyyy") : "-",
        poRef: q.po_created ? "Yes" : "No",
        callOffDate: "-",
        callOffRef: "-",
        variationRef: q.variation_ref || "-",
        otherRef: "-",
        project: q.project_name || "-",
        supplierName: q.supplier_name || "-",
        invoiceTotal: `£${Number(q.quote_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        expectedCost: `£${Number(q.quote_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        paymentDueDate: "-",
        approvedBy: q.status === "Approved" ? "Finance Dept" : "Pending",
        approved: q.status as ApprovalStatus,
        financeComments: q.finance_comments || null,
        procurementComments: q.procurement_comments || null,
        commercialComments: q.commercial_comments || null,
      }))
      
      setRows(mapped)

      const approvedCount = data.filter(d => d.status === "Approved").length
      const pendingCount = data.filter(d => d.status === "Pending").length
      
      setSummary([
        { label: "Invoices", qty: String(data.length), value: "0" },
        { label: "Approved invoices", qty: String(approvedCount), value: "0" },
        { label: "Invoices awaiting approval", qty: String(pendingCount), value: "0" },
        { label: "Invoices due this month", qty: "0", value: "0" },
        { label: "Invoices paid", qty: "0", value: "0" },
      ])
      
    } catch (err) {
      console.error("Failed to load supplier invoices:", err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

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
    async (no: string, invoiceNumber: string, nextApproved: boolean) => {
      // Find the ID. Here invoiceNumber acts as the ID/quote_ref, but to use patchQuotation we need the actual UUID if possible.
      // Wait, getQuotations returns UUID. If we just patch using quote_ref it might fail if the backend expects UUID.
      // Let's pass the real ID in `no` or in `otherRef` temporarily. I will add `id` to SupplierInvoiceRow.
      const row = rows.find(r => r.invoiceNumber === invoiceNumber)
      if (row) {
        setPending({ id: row.id, no, invoiceNumber, nextApproved })
      }
    },
    [rows]
  )

  // Confirmed — commit the change
  const confirmToggle = useCallback(async () => {
    if (!pending) return
    try {
      const status = pending.nextApproved ? "Approved" : "Pending"
      // Find the actual Quotation ID. We stored quote_ref in invoiceNumber.
      // Let's use patchQuotation. To make this work smoothly, we should ensure we have the UUID.
      const row = rows.find(r => r.no === pending.no)
      const qId = row?.id || pending.id 

      await patchQuotation(qId, { status })
      
      setRows((prev) =>
        prev.map((r) =>
          r.no === pending.no
            ? {
              ...r,
              approved: status as ApprovalStatus,
              approvedBy: pending.nextApproved
                ? "Finance Department"
                : "Pending",
            }
            : r
        )
      )
    } catch (err) {
      console.error("Failed to update status", err)
    } finally {
      setPending(null)
    }
  }, [pending, rows])

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
    async (params: CellValueChangedEvent<SupplierInvoiceRow>) => {
      const field = params.colDef.field
      const newValue = params.newValue

      const row = params.data
      const qId = row.id

      try {
        if (field === "financeComments") {
          await patchQuotation(qId, { finance_comments: newValue })
        } else if (field === "procurementComments") {
          await patchQuotation(qId, { procurement_comments: newValue })
        } else if (field === "commercialComments") {
          await patchQuotation(qId, { commercial_comments: newValue })
        }
      } catch (err) {
        console.error("Failed to save comment", err)
      }

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
        <TableStat summaryRows={summary} />
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
