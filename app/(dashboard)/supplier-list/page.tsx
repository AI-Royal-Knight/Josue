"use client"

import { useState, useEffect, useCallback } from "react"
import type { ColDef } from "ag-grid-community"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AgTable } from "@/components/common/AgTable"
import { Switch } from "@/components/ui/switch"
import ConfirmPaymentDialog from "@/components/common/confirm-payment"
import TableStat from "@/components/common/table-stat"
import { getFinanceSupplierInvoices, patchFinanceSupplierInvoice } from "@/lib/api/finance"
import type { FinanceSupplierInvoice } from "@/lib/api/finance"
import { getMediaUrl } from "@/lib/api/client"
import { MessageSquarePlus, Pencil, FileText } from "lucide-react"

type SupplierRow = {
  id: string
  no: string
  invoiceNumber: string
  date: string
  project: string
  userName: string
  sortCode: string
  accountNumber: string
  total: string
  paymentDueDate: string
  paidBy: string
  paid: boolean
  dateScheduled: string
  releaseDate: string
  financeComments: string
  procurementComments: string
  commercialComments: string
  supplierName: string
  creditLimit: string
  eomPaymentTerms: string
  monthCreditUsed: string
  availableCredit: string
  previousMonth: string
  invoiceDueThisMonth: string
  supplierQuotePdfUrl: string | null
}

function fmt(n: number | null | undefined) {
  return `£${Number(n ?? 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "-"
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return d
  }
}

function mapToRow(inv: FinanceSupplierInvoice, index: number): SupplierRow {
  return {
    id: inv.id,
    no: String(index + 1).padStart(3, "0"),
    invoiceNumber: inv.quote_ref,
    date: fmtDate(inv.date_of_quote),
    project: inv.project_name || "-",
    userName: inv.user_name || "-",
    sortCode: inv.sort_code || "-",
    accountNumber: inv.account_number || "-",
    total: fmt(inv.quote_total),
    paymentDueDate: "-",
    paidBy: inv.paid_by_name || "-",
    paid: inv.paid,
    dateScheduled: fmtDate(inv.date_scheduled),
    releaseDate: fmtDate(inv.release_date),
    financeComments: inv.finance_comments || "",
    procurementComments: inv.procurement_comments || "",
    commercialComments: inv.commercial_comments || "",
    supplierName: inv.supplier_name || "-",
    creditLimit: fmt(inv.credit_limit),
    eomPaymentTerms: `${inv.eom_payment_terms ?? 30} days`,
    monthCreditUsed: fmt(inv.month_credit_used),
    availableCredit: fmt(inv.available_credit),
    previousMonth: fmt(inv.previous_month),
    invoiceDueThisMonth: fmt(inv.invoice_due_this_month),
    supplierQuotePdfUrl: inv.supplier_quote_pdf_url || null,
  }
}

function buildInvoiceDocHtml(invoice: SupplierRow) {
  const paidText = invoice.paid ? "Yes" : "No"
  const confirmedDate = invoice.releaseDate !== "-" ? invoice.releaseDate : invoice.paymentDueDate

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
        <div><strong>Supplier:</strong> ${invoice.supplierName}</div>
        <div><strong>Invoice Date:</strong> ${invoice.date}</div>
        <div><strong>Project:</strong> ${invoice.project}</div>
        <div><strong>Paid:</strong> ${paidText}</div>
        <div><strong>Date of confirmed payment:</strong> ${confirmedDate}</div>
        <div><strong>Sort Code:</strong> ${invoice.sortCode}</div>
        <div><strong>Account Number:</strong> ${invoice.accountNumber}</div>
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
            <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0;">Work completed</td>
            <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${invoice.total}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 12px 4px; text-align: right;"><strong>Total</strong></td>
            <td style="padding: 12px 4px; text-align: right;"><strong>${invoice.total}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </body>
</html>`
}

export default function Page() {
  const [rows, setRows] = useState<SupplierRow[]>([])
  const [loading, setLoading] = useState(true)
  const [summaryRows, setSummaryRows] = useState([
    { label: "Approved Invoices", qty: "0", value: "£0" },
    { label: "Invoices Due This Month", qty: "0", value: "£0" },
    { label: "Invoices Paid", qty: "0", value: "£0" },
  ])

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingRowId, setPendingRowId] = useState<string | null>(null)
  const [nextPaid, setNextPaid] = useState(false)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierRow | null>(null)

  // Finance comment dialog
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [commentRow, setCommentRow] = useState<SupplierRow | null>(null)
  const [commentDraft, setCommentDraft] = useState("")
  const [commentSaving, setCommentSaving] = useState(false)

  function openCommentDialog(row: SupplierRow) {
    setCommentRow(row)
    setCommentDraft(row.financeComments ?? "")
    setCommentDialogOpen(true)
  }

  async function saveComment() {
    if (!commentRow) return
    setCommentSaving(true)
    try {
      await patchFinanceSupplierInvoice(commentRow.id, { finance_comments: commentDraft })
      setRows((current) =>
        current.map((r) =>
          r.id === commentRow.id ? { ...r, financeComments: commentDraft } : r
        )
      )
      setCommentDialogOpen(false)
    } catch (err) {
      console.error("Failed to save comment", err)
    } finally {
      setCommentSaving(false)
    }
  }

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getFinanceSupplierInvoices()
      const mapped = data.map(mapToRow)
      setRows(mapped)

      const paidCount = data.filter((d) => d.paid).length
      const paidTotal = data.filter((d) => d.paid).reduce((s, d) => s + Number(d.quote_total ?? 0), 0)
      const totalCount = data.length

      setSummaryRows([
        { label: "Approved Invoices", qty: String(totalCount), value: fmt(data.reduce((s, d) => s + Number(d.quote_total ?? 0), 0)) },
        { label: "Invoices Due This Month", qty: String(data.filter((d) => !d.paid).length), value: fmt(data.filter((d) => !d.paid).reduce((s, d) => s + Number(d.quote_total ?? 0), 0)) },
        { label: "Invoices Paid", qty: String(paidCount), value: fmt(paidTotal) },
      ])
    } catch (err) {
      console.error("Failed to load finance invoices", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function openInvoice(invoice: SupplierRow) {
    setSelectedInvoice(invoice)
    setInvoiceDialogOpen(true)
  }

  function downloadInvoiceDoc(invoice: SupplierRow) {
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
    try {
      await patchFinanceSupplierInvoice(pendingRowId, { paid: nextPaid })
      setRows((current) =>
        current.map((row) => (row.id === pendingRowId ? { ...row, paid: nextPaid } : row))
      )
      // Refresh summary
      await loadData()
    } catch (err) {
      console.error("Failed to update paid status", err)
    } finally {
      setConfirmOpen(false)
      setPendingRowId(null)
    }
  }


  const columnDefs: ColDef<SupplierRow>[] = [
    { headerName: "No", field: "no", maxWidth: 70 },
    {
      headerName: "Invoice Number",
      field: "invoiceNumber",
      minWidth: 160,
      cellRenderer: (params: { data?: SupplierRow; value: string }) => (
        <button
          type="button"
          className={`hover:underline font-medium ${params.data?.paid ? "text-green-600" : "text-red-500"}`}
          onClick={(e) => {
            e.stopPropagation()
            if (params.data) openInvoice(params.data)
          }}
        >
          {params.value}
        </button>
      ),
    },
    {
      headerName: "Invoice File",
      field: "supplierQuotePdfUrl",
      minWidth: 120,
      cellRenderer: (params: { data?: SupplierRow; value: string | null }) => {
        if (!params.value) return <span className="text-slate-500 text-xs italic">-</span>
        return (
          <a
            href={getMediaUrl(params.value) as string}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[#3467df] hover:underline text-xs font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="size-3.5" /> View
          </a>
        )
      },
    },
    { headerName: "Date (Supplier sent)", field: "date", minWidth: 150 },
    { headerName: "Project", field: "project" },
    { headerName: "Supplier name", field: "supplierName", minWidth: 200 },
    { headerName: "Sort code", field: "sortCode" },
    { headerName: "Account number", field: "accountNumber" },
    { headerName: "Total", field: "total" },
    { headerName: "EOM Payment Terms", field: "eomPaymentTerms" },
    { headerName: "Credit Limit", field: "creditLimit" },
    { headerName: "Month Credit Used", field: "monthCreditUsed" },
    { headerName: "Available Credit", field: "availableCredit" },
    { headerName: "Previous Month", field: "previousMonth" },
    { headerName: "Due This Month", field: "invoiceDueThisMonth" },
    { headerName: "Paid by", field: "paidBy" },
    {
      headerName: "Paid",
      field: "paid",
      maxWidth: 90,
      cellRenderer: (params: { data?: SupplierRow; value: boolean }) => (
        <Switch
          checked={params.value}
          onCheckedChange={(checked) => {
            if (params.data?.id) openPaymentConfirm(params.data.id, checked)
          }}
        />
      ),
    },
    { headerName: "Date scheduled", field: "dateScheduled" },
    { headerName: "Release date", field: "releaseDate" },
    {
      headerName: "Finance comments",
      field: "financeComments",
      minWidth: 200,
            cellRenderer: (params: { data?: SupplierRow; value: string }) => {
        const hasComment = !!params.value
        return (
          <button
            type="button"
            data-cell-click-ignore="true"
            onClick={(e) => {
              e.stopPropagation()
              if (params.data) openCommentDialog(params.data)
            }}
            className="group flex h-full w-full items-center gap-2 py-1 text-left"
            title={params.value || "Add comment"}
          >
            {hasComment ? (
              <>
                <Pencil className="h-3 w-3 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="truncate text-sm text-foreground">{params.value}</span>
              </>
            ) : (
              <>
                <MessageSquarePlus className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm text-muted-foreground italic group-hover:text-primary transition-colors">Add comment...</span>
              </>
            )}
          </button>
        )
      },
    },
    { headerName: "Procurement Comments", field: "procurementComments", minWidth: 180 },
    { headerName: "Commercial comments", field: "commercialComments", minWidth: 180 },
  ]

  return (
    <div className="w-full min-w-0 space-y-6 bg-white p-6">
      <h1 className="text-primary">Supplier List</h1>

      <TableStat summaryRows={summaryRows} />

      <ConfirmPaymentDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        supplierName={rows.find((r) => r.id === pendingRowId)?.supplierName ?? "this supplier"}
        nextPaid={nextPaid}
        onConfirm={handleConfirmPaymentChange}
      />

      {/* Finance Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4" />
              Finance Comment
            </DialogTitle>
            {commentRow && (
              <DialogDescription className="text-xs text-muted-foreground">
                {commentRow.supplierName} — {commentRow.invoiceNumber}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Textarea
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              placeholder="Type your finance comment here..."
              className="min-h-[140px] resize-y text-sm leading-relaxed"
              autoFocus
            />
            {commentRow?.financeComments && commentDraft !== commentRow.financeComments && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Previous:</span> {commentRow.financeComments}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCommentDialogOpen(false)}
              disabled={commentSaving}
            >
              Cancel
            </Button>
            <Button onClick={saveComment} disabled={commentSaving}>
              {commentSaving ? "Saving..." : "Save Comment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AgTable
        columnDefs={columnDefs}
        rowData={rows}
        defaultColDef={{
          flex: 1,
          minWidth: 130,
          resizable: true,
        }}
      />

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
                  <p className="text-sm text-muted-foreground">{selectedInvoice.supplierName}</p>
                </div>
                <div className="text-right text-sm space-y-1">
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
                    {selectedInvoice.paid ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-red-500 font-semibold">No</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Date of confirmed payment:</span>{" "}
                    {selectedInvoice.releaseDate !== "-" ? selectedInvoice.releaseDate : "-"}
                  </div>
                  <div>
                    <span className="font-medium">Sort Code:</span>{" "}
                    {selectedInvoice.sortCode}
                  </div>
                  <div>
                    <span className="font-medium">Account Number:</span>{" "}
                    {selectedInvoice.accountNumber}
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
                    <td className="py-3">Work completed</td>
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

              <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div className="space-y-1 rounded border p-3">
                  <div className="font-medium text-muted-foreground">Credit Limit</div>
                  <div className="font-semibold">{selectedInvoice.creditLimit}</div>
                </div>
                <div className="space-y-1 rounded border p-3">
                  <div className="font-medium text-muted-foreground">Month Credit Used</div>
                  <div className="font-semibold">{selectedInvoice.monthCreditUsed}</div>
                </div>
                <div className="space-y-1 rounded border p-3">
                  <div className="font-medium text-muted-foreground">Available Credit</div>
                  <div className={`font-semibold ${Number(selectedInvoice.availableCredit.replace(/[^0-9.-]/g, "")) < 0 ? "text-red-500" : "text-green-600"}`}>
                    {selectedInvoice.availableCredit}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setInvoiceDialogOpen(false)}>
              Close
            </Button>
            <Button
              type="button"
              onClick={() => selectedInvoice && downloadInvoiceDoc(selectedInvoice)}
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
