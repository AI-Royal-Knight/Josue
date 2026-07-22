"use client"
import { useState, useEffect, useCallback } from "react"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import { Switch } from "@/components/ui/switch"
import { ColDef } from "ag-grid-community"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { getAllInvoices, updateInvoicePayment, type MonthlyInvoice } from "@/lib/api/super-admin"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

type InvoiceRow = {
  id: string
  invoiceNumber: string
  companyName: string
  date: string
  value: string
  paid: boolean
  paymentDate: string
}

function mapToInvoiceRow(inv: MonthlyInvoice): InvoiceRow {
  return {
    id: inv.id,
    invoiceNumber: inv.invoice_number || "N/A",
    companyName: inv.company_name || "Unknown",
    date: inv.created_at ? format(new Date(inv.created_at), "yyyy-MM-dd") : `${inv.year}-${String(inv.month).padStart(2, '0')}-01`,
    value: inv.amount ? `£${parseFloat(inv.amount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : "£0.00",
    paid: inv.is_paid,
    paymentDate: inv.payment_date ? format(new Date(inv.payment_date), "yyyy-MM-dd") : "",
  }
}

function buildInvoiceDocHtml(invoice: InvoiceRow) {
  const paidText = invoice.paid ? "Yes" : "No"
  const confirmedDate = invoice.paymentDate || "-"

  // Word can open HTML saved as .doc; keep it simple and self-contained.
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
            <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0;">Work completed (sample)</td>
            <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${invoice.value}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 12px 4px; text-align: right;"><strong>Total</strong></td>
            <td style="padding: 12px 4px; text-align: right;"><strong>${invoice.value}</strong></td>
          </tr>
        </tfoot>
      </table>

      <p style="margin-top: 16px; font-size: 11px; color: #444;">
        This is a sample invoice document generated from the invoice list.
      </p>
    </div>
  </body>
</html>`
}

export default function Page() {
  const [rows, setRows] = useState<InvoiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(
    null
  )

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAllInvoices()
      setRows(data.map(mapToInvoiceRow))
    } catch (err) {
      console.error(err)
      toast.error("Failed to load invoices")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function openInvoice(invoice: InvoiceRow) {
    setSelectedInvoice(invoice)
    setInvoiceDialogOpen(true)
  }

  function downloadInvoiceDoc(invoice: InvoiceRow) {
    const html = buildInvoiceDocHtml(invoice)
    const blob = new Blob([html], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${invoice.invoiceNumber}.doc`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const columnDefs: ColDef<InvoiceRow>[] = [
    {
      field: "invoiceNumber",
      headerName: "Invoice Number",
      cellRenderer: (params: { data?: InvoiceRow; value: string }) => (
        <button
          type="button"
          className={`${params.data?.paid ? "text-green-500" : "text-red-500"} hover:underline`}
          onClick={(event) => {
            event.stopPropagation()
            if (!params.data) return
            openInvoice(params.data)
          }}
        >
          {params.value}
        </button>
      ),
    },
    { field: "companyName", headerName: "Company" },
    { field: "date", headerName: "Date" },
    { field: "value", headerName: "Amount" },
    {
      field: "paid",
      headerName: "Paid",
      cellRenderer: (params: { data?: InvoiceRow; value: boolean }) => (
        <Switch
          checked={Boolean(params.value)}
          onCheckedChange={async (checked) => {
            const invoice = params.data
            if (!invoice) return

            try {
              const updated = await updateInvoicePayment(invoice.id, checked)
              setRows((currentRows) =>
                currentRows.map((row) =>
                  row.id === invoice.id ? mapToInvoiceRow(updated) : row
                )
              )
              toast.success("Payment status updated")
            } catch (err) {
              console.error(err)
              toast.error("Failed to update payment status")
            }
          }}
        />
      ),
      type: "",
      minWidth: 120,
      maxWidth: 140,
    },
    {
      field: "paymentDate",
      headerName: "Date of confirmed payment",
    },
  ]

  const totalInvoices = rows.length
  const confirmedCount = rows.filter(r => r.paid).length
  const outstandingCount = totalInvoices - confirmedCount

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1>Invoice List</h1>
        {loading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
      </div>
      <TableStat
        summaryRows={[
          { label: "Invoices", qty: totalInvoices.toString(), value: totalInvoices.toString() },
          { label: "Confirmed Payments", qty: confirmedCount.toString(), value: confirmedCount.toString() },
          { label: "Outstanding Payments", qty: outstandingCount.toString(), value: outstandingCount.toString() },
        ]}
      />

      <AgTable
        rowData={rows}
        columnDefs={columnDefs}
        height="70vh"
        pagination
        pageSize={10}
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
                  <p className="text-sm text-muted-foreground">
                    Sample document preview
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
                    <span className="font-medium">Paid:</span>{" "}
                    {selectedInvoice.paid ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="font-medium">
                      Date of confirmed payment:
                    </span>{" "}
                    {selectedInvoice.paymentDate || "-"}
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
                    <td className="py-3">Work completed (sample)</td>
                    <td className="py-3 text-right">{selectedInvoice.value}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-3 text-right font-semibold">Total</td>
                    <td className="py-3 text-right font-semibold">
                      {selectedInvoice.value}
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
