"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Download, Eye, FileText, RotateCcw } from "lucide-react"
import PdfViewerDialog from "@/components/common/pdf-viewer-dialog"
import { generateSimplePdf } from "@/lib/generate-pdf"

type ApprovalStatus = "Approved" | "Rejected" | "Pending"

export type QuotePreviewData = {
    quotesRef: string
    project: string
    mainFolder: string
    subFolder: string
    variationRef: string
    supplierName: string
    supplierEmailAddress: string
    dateOfQuoteApproved: string
    quoteTotal: string
    poCreated: boolean
    datePoWasCreated: string
    approveQuotesStatus: ApprovalStatus
    quoteApprovalReasons: string
    procurementComments: string
    lineItems?: any[]
    history?: any[]
}

function buildQuoteDocHtml(quote: QuotePreviewData) {
    const statusColor =
        quote.approveQuotesStatus === "Approved"
            ? "#22c55e"
            : quote.approveQuotesStatus === "Rejected"
                ? "#ef4444"
                : "#f59e0b"

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Quote ${quote.quotesRef}</title>
  </head>
  <body style="font-family: Arial, Helvetica, sans-serif; color: #111;">
    <div style="max-width: 720px; margin: 0 auto; padding: 24px;">
      <h1 style="margin: 0 0 8px;">QUOTATION</h1>
      <div style="margin: 0 0 16px; font-size: 12px; color: #555;">
        <div><strong>Quote Ref:</strong> ${quote.quotesRef}</div>
        <div><strong>Project:</strong> ${quote.project}</div>
        <div><strong>Status:</strong> <span style="color:${statusColor}">${quote.approveQuotesStatus}</span></div>
        <div><strong>Date Approved:</strong> ${quote.dateOfQuoteApproved}</div>
      </div>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />

      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <tr><td style="padding: 4px 8px; font-weight: 600; width: 180px;">Main Folder</td><td style="padding: 4px 8px;">${quote.mainFolder || "-"}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">Sub Folder</td><td style="padding: 4px 8px;">${quote.subFolder || "-"}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">Variation Ref</td><td style="padding: 4px 8px;">${quote.variationRef || "-"}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">Supplier Name</td><td style="padding: 4px 8px;">${quote.supplierName}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">Supplier Email</td><td style="padding: 4px 8px;">${quote.supplierEmailAddress}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">Quote Total</td><td style="padding: 4px 8px;">${quote.quoteTotal}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">PO Created</td><td style="padding: 4px 8px;">${quote.poCreated ? `Yes (${quote.datePoWasCreated})` : "No"}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">Approval Reasons</td><td style="padding: 4px 8px;">${quote.quoteApprovalReasons || "-"}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">Comments</td><td style="padding: 4px 8px;">${quote.procurementComments || "-"}</td></tr>
      </table>

      ${quote.lineItems && quote.lineItems.length > 0 ? `
      <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
      <h3 style="font-size: 14px; margin-bottom: 8px;">Line Items</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
        <thead>
          <tr style="background-color: #f5f5f5; text-align: left;">
            <th style="padding: 6px 8px; border: 1px solid #ddd;">Description</th>
            <th style="padding: 6px 8px; border: 1px solid #ddd; width: 60px; text-align: right;">Qty</th>
            <th style="padding: 6px 8px; border: 1px solid #ddd; width: 100px; text-align: right;">Supplier Price</th>
          </tr>
        </thead>
        <tbody>
          ${quote.lineItems.map(item => `
          <tr>
            <td style="padding: 6px 8px; border: 1px solid #ddd;">${item.description}</td>
            <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: right;">${item.qty} ${item.per || ''}</td>
            <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: right;">${item.supplier_price ? '£' + Number(item.supplier_price).toLocaleString("en-US", { minimumFractionDigits: 2 }) : '-'}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}

      <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />

      <p style="margin-top: 16px; font-size: 11px; color: #444;">
        This is a generated quotation document.
      </p>
    </div>
  </body>
</html>`
}

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    quote: QuotePreviewData | null
}

export default function ViewQuoteDialog({ open, onOpenChange, quote }: Props) {
    if (!quote) return null

    const [showPdf, setShowPdf] = useState(false)

    const getPdf = useCallback(() => {
        if (!quote) throw new Error("No quote data")
        return generateSimplePdf({
            title: "QUOTATION",
            subtitle: `Quote Ref: ${quote.quotesRef}`,
            headerFields: [
                { label: "Project", value: quote.project },
                { label: "Status", value: quote.approveQuotesStatus },
                { label: "Date Approved", value: quote.dateOfQuoteApproved || "-" },
            ],
            detailFields: [
                { label: "Main Folder", value: quote.mainFolder || "-" },
                { label: "Sub Folder", value: quote.subFolder || "-" },
                { label: "Variation Ref", value: quote.variationRef || "-" },
                { label: "Supplier Name", value: quote.supplierName },
                { label: "Supplier Email", value: quote.supplierEmailAddress },
                { label: "Approval Reasons", value: quote.quoteApprovalReasons || "-" },
                { label: "Procurement Comments", value: quote.procurementComments || "-" },
                { label: "PO Created", value: quote.poCreated ? `Yes (${quote.datePoWasCreated || "-"})` : "No" },
            ],
            totalLabel: "Quote Total",
            totalValue: quote.quoteTotal,
            footer: "This is a generated quotation document.",
        })
    }, [quote])

    function downloadDoc() {
        if (!quote) return
        const html = buildQuoteDocHtml(quote)
        const blob = new Blob([html], { type: "application/msword" })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement("a")
        anchor.href = url
        anchor.download = `quote-${quote.quotesRef}.doc`
        anchor.click()
        URL.revokeObjectURL(url)
    }

    const statusBadge = () => {
        switch (quote.approveQuotesStatus) {
            case "Approved":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                        Approved
                    </span>
                )
            case "Rejected":
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-300">
                        Rejected
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                        Pending
                    </span>
                )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[640px] flex flex-col max-h-[90vh] overflow-hidden">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="flex items-center gap-3">
                        <FileText className="size-5 text-blue-400" />
                        Quotation {quote.quotesRef}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                    <div className="rounded-lg border border-white/10 bg-slate-900 p-5 text-sm text-slate-200">
                        {/* Header row */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Project
                                </p>
                                <p className="font-medium text-white">{quote.project}</p>
                            </div>
                            <div className="text-right">{statusBadge()}</div>
                        </div>

                        <div className="my-4 h-px bg-white/10" />

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <DetailItem label="Main Folder" value={quote.mainFolder || "-"} />
                            <DetailItem label="Sub Folder" value={quote.subFolder || "-"} />
                            <DetailItem label="Variation Ref" value={quote.variationRef || "-"} />
                            <DetailItem label="Date Approved" value={quote.dateOfQuoteApproved || "-"} />
                            <DetailItem label="Supplier" value={quote.supplierName} />
                            <DetailItem label="Email" value={quote.supplierEmailAddress} />
                            {quote.poCreated && (
                                <DetailItem label="PO Created" value={quote.datePoWasCreated || "Yes"} />
                            )}
                            <DetailItem label="Approval Reasons" value={quote.quoteApprovalReasons || "-"} />
                            <div className="col-span-2">
                                <DetailItem label="Procurement Comments" value={quote.procurementComments || "-"} />
                            </div>
                        </div>

                        <div className="my-4 h-px bg-white/10" />

                        {/* Line Items */}
                        {quote.lineItems && quote.lineItems.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-xs font-semibold tracking-wide text-slate-400 uppercase mb-3">Line Items</h4>
                                <div className="rounded-md border border-white/10 overflow-hidden">
                                    <table className="w-full text-left text-xs text-slate-300">
                                        <thead className="bg-slate-800/50">
                                            <tr>
                                                <th className="px-3 py-2 font-medium">Description</th>
                                                <th className="px-3 py-2 font-medium text-right">Qty</th>
                                                <th className="px-3 py-2 font-medium text-right">Supplier Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {quote.lineItems.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-800/30">
                                                    <td className="px-3 py-2">{item.description}</td>
                                                    <td className="px-3 py-2 text-right">{item.qty} {item.per || ''}</td>
                                                    <td className="px-3 py-2 text-right">
                                                        {item.supplier_price ? `£${Number(item.supplier_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="my-4 h-px bg-white/10" />
                            </div>
                        )}

                        {/* Total */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Quote Total
                            </span>
                            <span className="text-xl font-bold text-emerald-400 tabular-nums">
                                {quote.quoteTotal}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowPdf(true)}
                            className="flex-1 border-white/10 text-xs text-slate-300 hover:bg-white/5"
                        >
                            <Eye className="size-4" />
                            View PDF
                        </Button>
                        <Button
                            variant="outline"
                            onClick={downloadDoc}
                            className="flex-1 border-white/10 text-xs text-slate-300 hover:bg-white/5"
                        >
                            <Download className="size-4" />
                            Download (.doc)
                        </Button>
                    </div>

                    {/* History Section */}
                    {quote.history && quote.history.length > 0 && (
                        <div className="mt-6 border-t border-white/10 pt-6">
                            <h4 className="text-xs font-semibold tracking-wide text-slate-400 uppercase mb-4 flex items-center gap-2">
                                <RotateCcw className="size-4" />
                                Re-quote History
                            </h4>
                            <div className="space-y-4">
                                {quote.history.map((h, i) => (
                                    <div key={h.id || i} className="rounded-lg border border-white/10 bg-slate-800/30 p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs text-slate-500">
                                                {new Date(h.date_recorded).toLocaleString()}
                                            </span>
                                            <span className="text-xs font-medium text-amber-500 tabular-nums">
                                                Previous Total: £{Number(h.previous_total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-300 mb-3 whitespace-pre-wrap">
                                            <span className="text-xs font-medium text-slate-500 block mb-1">Procurement Feedback:</span>
                                            {h.message || "-"}
                                        </div>
                                        {h.previous_line_items && h.previous_line_items.length > 0 && (
                                            <div className="mt-2 mb-3">
                                                <span className="text-xs font-medium text-slate-500 block mb-1.5">Previous Line Items:</span>
                                                <div className="rounded border border-white/5 overflow-hidden">
                                                    <table className="w-full text-left text-[11px] text-slate-300">
                                                        <thead className="bg-slate-800/30">
                                                            <tr>
                                                                <th className="px-2 py-1 font-medium">Description</th>
                                                                <th className="px-2 py-1 font-medium text-right">Qty</th>
                                                                <th className="px-2 py-1 font-medium text-right">Price</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                            {h.previous_line_items.map((item: any, idx: number) => (
                                                                <tr key={idx} className="hover:bg-slate-800/20">
                                                                    <td className="px-2 py-1">{item.description}</td>
                                                                    <td className="px-2 py-1 text-right text-slate-400">{item.qty} {item.per || ''}</td>
                                                                    <td className="px-2 py-1 text-right font-medium">
                                                                        {item.supplier_price ? `£${Number(item.supplier_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "-"}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                        {h.previous_pdf && (
                                            <a 
                                                href={h.previous_pdf.startsWith('http') ? h.previous_pdf : `http://localhost:8000${h.previous_pdf}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2"
                                            >
                                                <FileText className="size-3.5" />
                                                View Previous PDF
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>

            <PdfViewerDialog
                open={showPdf}
                onOpenChange={setShowPdf}
                title={`Quote ${quote.quotesRef}`}
                getPdf={getPdf}
            />
        </Dialog>
    )
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-0.5 text-sm text-slate-200">{value}</p>
        </div>
    )
}
