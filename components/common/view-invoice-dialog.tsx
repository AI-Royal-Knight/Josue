"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type InvoicePreviewData = {
  invoiceNumber: string
  date: string
  project?: string
  statusLabel?: string
  statusValue?: string
  amount: string
  description?: string
}

function buildInvoiceDocHtml(invoice: InvoicePreviewData) {
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
        <div><strong>Date:</strong> ${invoice.date}</div>
        ${invoice.project ? `<div><strong>Project:</strong> ${invoice.project}</div>` : ""}
        ${invoice.statusLabel ? `<div><strong>${invoice.statusLabel}:</strong> ${invoice.statusValue || "-"}</div>` : ""}
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
            <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${invoice.amount}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 12px 4px; text-align: right;"><strong>Total</strong></td>
            <td style="padding: 12px 4px; text-align: right;"><strong>${invoice.amount}</strong></td>
          </tr>
        </tfoot>
      </table>

      <p style="margin-top: 16px; font-size: 11px; color: #444;">
        This is a generated invoice document.
      </p>
    </div>
  </body>
</html>`
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: InvoicePreviewData | null
}

export default function ViewInvoiceDialog({ open, onOpenChange, invoice }: Props) {
  if (!invoice) return null

  function downloadDoc() {
    if (!invoice) return
    const html = buildInvoiceDocHtml(invoice)
    const blob = new Blob([html], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${invoice.invoiceNumber}.doc`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Invoice preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="border border-input bg-slate-900 p-6 text-sm text-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">INVOICE</h2>
                {invoice.project && <p className="text-slate-400">{invoice.project}</p>}
              </div>
              <div className="text-right">
                <div><span className="font-medium text-slate-400">Date:</span> {invoice.date}</div>
                {invoice.statusLabel && (
                  <div><span className="font-medium text-slate-400">{invoice.statusLabel}:</span> {invoice.statusValue}</div>
                )}
              </div>
            </div>

            <div className="my-4 h-px bg-white/10" />

            <div className="mb-4">
              <span className="font-medium text-slate-400">Description:</span>
              <p className="mt-1">{invoice.description || "Work completed"}</p>
            </div>

            <div className="mb-4">
              <span className="font-medium text-slate-400">Subtotal:</span>
               <p className="mt-1 text-lg font-semibold text-white">{invoice.amount}</p>
               <span className="font-medium text-slate-400">Vat :</span>
              <p className="mt-1 text-lg font-semibold text-white">0.00</p>
              <span className="font-medium text-slate-400">Total Amount:</span>
              <p className="mt-1 text-lg font-semibold text-white">{invoice.amount}</p>
            </div>

            <Button variant="outline" onClick={downloadDoc}>
              Download Document
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
