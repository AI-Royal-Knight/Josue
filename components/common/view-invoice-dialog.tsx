"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, Download } from "lucide-react"
import PdfViewerDialog from "@/components/common/pdf-viewer-dialog"
import { generateSimplePdf } from "@/lib/generate-pdf"

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
  const [showPdf, setShowPdf] = useState(false)

  const getPdf = useCallback(() => {
    if (!invoice) throw new Error("No invoice data")
    return generateSimplePdf({
      title: "INVOICE",
      subtitle: `Invoice Number: ${invoice.invoiceNumber}`,
      headerFields: [
        { label: "Date", value: invoice.date },
        ...(invoice.statusLabel ? [{ label: invoice.statusLabel, value: invoice.statusValue || "-" }] : []),
        ...(invoice.project ? [{ label: "Project", value: invoice.project }] : []),
      ],
      detailFields: [
        { label: "Description", value: invoice.description || "Work completed" },
      ],
      totalLabel: "Total Amount",
      totalValue: invoice.amount,
      footer: "This is a generated invoice document.",
    })
  }, [invoice])

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
      <DialogContent className="sm:max-w-[640px] border-slate-800 bg-[#0f172a] text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-white">Invoice preview</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-6">
          <div className="rounded-md border border-slate-800 bg-[#151c2f] p-6 text-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-wide text-white">INVOICE</h2>
                {invoice.project && <p className="text-slate-400">{invoice.project}</p>}
              </div>
              <div className="space-y-1 text-right">
                <div className="text-slate-300">
                  <span className="mr-1 text-slate-400">Date:</span> 
                  {invoice.date}
                </div>
                {invoice.statusLabel && (
                  <div className="text-slate-300">
                    <span className="mr-1 text-slate-400">{invoice.statusLabel}:</span> 
                    {invoice.statusValue}
                  </div>
                )}
              </div>
            </div>

            <div className="my-6 h-px bg-slate-800" />

            <div className="space-y-6">
              <div>
                <div className="mb-1 text-slate-400">Description:</div>
                <div className="font-medium text-slate-300">{invoice.description || "Work completed"}</div>
              </div>
              
              <div>
                <div className="mb-1 text-slate-400">Subtotal:</div>
                <div className="text-base font-medium text-white">{invoice.amount}</div>
              </div>

              <div>
                <div className="mb-1 text-slate-400">Vat :</div>
                <div className="text-base font-medium text-white">0.00</div>
              </div>

              <div>
                <div className="mb-1 text-slate-400">Total Amount:</div>
                <div className="text-base font-medium text-white">{invoice.amount}</div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowPdf(true)}
                className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Eye className="mr-2 h-4 w-4" />
                View PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={downloadDoc} 
                className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Document
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      <PdfViewerDialog
        open={showPdf}
        onOpenChange={setShowPdf}
        title={`Invoice ${invoice.invoiceNumber}`}
        getPdf={getPdf}
      />
    </Dialog>
  )
}
