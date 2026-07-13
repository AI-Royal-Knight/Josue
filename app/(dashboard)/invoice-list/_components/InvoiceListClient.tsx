"use client"

import { useState, useEffect } from "react"
import type { ColDef } from "ag-grid-community"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AgTable } from "@/components/common/AgTable"
import ConfirmPaymentDialog from "@/components/common/confirm-payment"
import TableStat from "@/components/common/table-stat"
import { useRoleStore } from "@/lib/role-store"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getUserInvoices, payUserInvoice, UserInvoiceApi } from "@/lib/api/user-invoices"
import { toast } from "sonner"

function buildInvoiceDocHtml(invoice: UserInvoiceApi) {
  const paidText = invoice.paid ? "Yes" : "No"
  const confirmedDate = invoice.releaseDate || "-"
  const value = invoice.total || "-"

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${invoice.invoiceNumber}</title>
  </head>
  <body style="font-family: Arial, Helvetica, sans-serif; color: #111;">
    <div style="max-width: 720px; margin: 0 auto; padding: 24px;">
      <h1 style="margin: 0 0 8px;">INVOICE</h1>
      <div style="margin: 0 0 16px; font-size: 12px;">
        <div><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</div>
        <div><strong>Invoice Date:</strong> ${invoice.date}</div>
        <div><strong>Project:</strong> ${invoice.project}</div>
        <div><strong>Description:</strong> ${invoice.description}</div>
        <div><strong>Paid:</strong> ${paidText}</div>
        <div><strong>Date of confirmed payment:</strong> ${confirmedDate}</div>
      </div>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px 4px;">Description</th>
            <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px 4px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0;">${invoice.description || "Work completed"}</td>
            <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${value}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 12px 4px; text-align: right;"><strong>Total</strong></td>
            <td style="padding: 12px 4px; text-align: right;"><strong>${value}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </body>
</html>`
}

export default function InvoiceListPage() {
  const [projectFilter, setProjectFilter] = useState("all")
  const [rows, setRows] = useState<UserInvoiceApi[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingRowId, setPendingRowId] = useState<string | null>(null)
  const [nextPaid, setNextPaid] = useState(false)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<UserInvoiceApi | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const role = useRoleStore((s) => s.role)
  const canTogglePaid = role === "finance_department"

  // Fetch only fully-approved invoices for the finance list
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await getUserInvoices({ finance_view: true })
        setRows(res.invoices)
      } catch (e) {
        console.error("Failed to load invoices", e)
        toast.error("Failed to load invoice list")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function openInvoice(invoice: UserInvoiceApi) {
    setSelectedInvoice(invoice)
    setInvoiceDialogOpen(true)
  }

  function downloadInvoiceDoc(invoice: UserInvoiceApi) {
    const html = buildInvoiceDocHtml(invoice)
    const blob = new Blob([html], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${invoice.invoiceNumber}.doc`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function openPaymentConfirm(rowId: string, checked: boolean) {
    setPendingRowId(rowId)
    setNextPaid(checked)
    setConfirmOpen(true)
  }

  async function handleConfirmPaymentChange() {
    if (!pendingRowId) return
    setSubmitting(true)
    try {
      const res = await payUserInvoice(pendingRowId, nextPaid)
      setRows((current) =>
        current.map((row) => (row.id === pendingRowId ? res.invoice : row))
      )
      toast.success(nextPaid ? "Invoice marked as paid!" : "Invoice marked as unpaid.")
    } catch (e) {
      toast.error("Failed to update payment status.")
      console.error(e)
    } finally {
      setSubmitting(false)
      setConfirmOpen(false)
      setPendingRowId(null)
    }
  }

  // Build unique project list from invoices
  const projectOptions = Array.from(new Set(rows.map((r) => r.project))).filter(Boolean)

  const filteredRows =
    projectFilter === "all"
      ? rows
      : rows.filter((r) => r.project === projectFilter)

  // Summary stats
  const paidCount = rows.filter((r) => r.paid).length
  const unpaidCount = rows.length - paidCount
  const moneyOnHold = rows
    .filter((r) => !r.paid)
    .reduce((sum, r) => sum + r.totalRaw, 0)

  const summaryRows = [
    { label: "Approved Invoices", qty: String(rows.length), value: "" },
    { label: "Invoices Paid", qty: String(paidCount), value: "" },
    { label: "Pending Payment", qty: String(unpaidCount), value: `£${moneyOnHold.toLocaleString("en-GB", { minimumFractionDigits: 2 })}` },
  ]

  const columnDefs: ColDef<UserInvoiceApi>[] = [
    { headerName: "No", field: "no", minWidth: 60, filter: false },
    {
      headerName: "Invoice Number",
      field: "invoiceNumber",
      cellRenderer: (params: { data?: UserInvoiceApi; value: string }) => (
        <button
          type="button"
          className={`hover:underline ${params.data?.paid ? "text-green-500" : "text-red-500"}`}
          onClick={(event) => {
            event.stopPropagation()
            if (!params.data) return
            openInvoice(params.data)
          }}
        >
          {params.value}
        </button>
      ),
      minWidth: 160,
    },
    { headerName: "Date", field: "date", minWidth: 120 },
    { headerName: "Project", field: "project", minWidth: 140 },
    { headerName: "Name-USER", field: "userName", minWidth: 160 },
    { headerName: "Sort code", field: "sortCode", minWidth: 140 },
    { headerName: "Account number", field: "accountNumber", minWidth: 160 },
    { headerName: "Total", field: "total", minWidth: 120 },
    {
      headerName: "Paid",
      field: "paid",
      type: "",
      cellRenderer: (params: { data?: UserInvoiceApi; value: boolean }) => {
        if (canTogglePaid) {
          if (!params.data?.fullyApproved) {
            return (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex cursor-not-allowed opacity-50">
                      <Switch
                        checked={params.value}
                        disabled
                        aria-label="Invoice must be fully approved first"
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Invoice must be fully approved by all roles before payment can be processed.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          }

          return (
            <Switch
              checked={params.value}
              onCheckedChange={(checked) => {
                if (!params.data) return
                openPaymentConfirm(params.data.id, checked)
              }}
            />
          )
        }
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex cursor-not-allowed opacity-50">
                  <Switch
                    checked={params.value}
                    disabled
                    aria-label="Only Finance Department can change paid status"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                Only Finance Department can toggle paid status
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    { headerName: "Date scheduled", field: "dateScheduled" },
    { headerName: "Release date", field: "releaseDate" },
    { 
      headerName: "Comments", 
      field: "comments",
      tooltipField: "comments",
      editable: canTogglePaid,
      cellEditor: "agLargeTextCellEditor",
      cellEditorPopup: true,
      onCellValueChanged: async (params) => {
        if (!params.data) return
        try {
          const res = await payUserInvoice(params.data.id, params.data.paid, params.newValue)
          setRows((current) => current.map(r => r.id === params.data?.id ? res.invoice : r))
          toast.success("Comment updated")
        } catch (e) {
          toast.error("Failed to update comment")
          params.node?.setDataValue("comments", params.oldValue)
        }
      },
    },
  ]

  return (
    <div className="w-full space-y-6 bg-white p-6">
      <h1 className="text-primary">Invoice List</h1>

      <TableStat summaryRows={summaryRows} />

      <div className="max-w-[220px]">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="bg-primary">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projectOptions.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ConfirmPaymentDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        supplierName={
          rows.find((row) => row.id === pendingRowId)?.userName ??
          "this user"
        }
        nextPaid={nextPaid}
        onConfirm={handleConfirmPaymentChange}
      />

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading invoices...</div>
      ) : (
        <AgTable
          columnDefs={columnDefs}
          rowData={filteredRows}
          defaultColDef={{ flex: 1, minWidth: 140, resizable: true }}
          suppressCellClickAction={true}
        />
      )}

      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Invoice preview</DialogTitle>
          </DialogHeader>

          {selectedInvoice ? (
            <div className="max-h-[70vh] overflow-auto border border-input bg-white p-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-lg font-semibold">INVOICE</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvoice.description}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <div>
                    <span className="font-medium">Invoice Number:</span>{" "}
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div>
                    <span className="font-medium">Invoice Date:</span>{" "}
                    {selectedInvoice.date}
                  </div>
                  <div>
                    <span className="font-medium">Project:</span>{" "}
                    {selectedInvoice.project}
                  </div>
                  <div>
                    <span className="font-medium">Paid:</span>{" "}
                    {selectedInvoice.paid ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="font-medium">
                      Date of confirmed payment:
                    </span>{" "}
                    {selectedInvoice.releaseDate || "-"}
                  </div>
                </div>
              </div>

              <div className="my-6 h-px bg-border" />

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium">Description</th>
                    <th className="py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/60">
                    <td className="py-3">{selectedInvoice.description || "Work completed"}</td>
                    <td className="py-3 text-right">{selectedInvoice.total}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-3 text-right font-semibold">Total</td>
                    <td className="py-3 text-right font-semibold">
                      {selectedInvoice.total}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setInvoiceDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!selectedInvoice) return
                downloadInvoiceDoc(selectedInvoice)
              }}
              disabled={!selectedInvoice}
            >
              Download Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
