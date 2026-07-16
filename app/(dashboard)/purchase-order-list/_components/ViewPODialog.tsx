"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Download, Eye, FileText } from "lucide-react"
import PdfViewerDialog from "@/components/common/pdf-viewer-dialog"
import { generateBrandedPOPDF, type ParsedPOData } from "@/lib/api/purchase-order-pdf"
import type { QuotationLineItem } from "@/lib/api/quotations"

export type POPreviewData = {

    quotationRef: string
    project: string
    mainFolder: string
    subFolder: string
    variationRef: string
    supplierName: string
    supplierEmail: string
    dateOfQuoteApproved: string
    quoteTotal: string
    datePOCreated: string
    procurementComments: string
    approvalQuotation: string
    approvalRelatedRequests: string
    lineItems?: QuotationLineItem[]
}

function buildPODocHtml(po: POPreviewData) {
    const statusColor =
        po.approvalQuotation === "Approved"
            ? "#22c55e"
            : po.approvalQuotation === "Rejected"
                ? "#ef4444"
                : "#f59e0b"

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>PO ${po.quotationRef}</title>
  </head>
  <body style="font-family: Arial, Helvetica, sans-serif; color: #111;">
    <div style="max-width: 720px; margin: 0 auto; padding: 24px;">
      <h1 style="margin: 0 0 8px;">PURCHASE ORDER</h1>
      <div style="margin: 0 0 16px; font-size: 12px; color: #555;">
        <div><strong>PO Ref:</strong> ${po.quotationRef}</div>
        <div><strong>Project:</strong> ${po.project || "-"}</div>
        <div><strong>Status:</strong> <span style="color:${statusColor}">${po.approvalQuotation}</span></div>
        <div><strong>Date PO Created:</strong> ${po.datePOCreated || "-"}</div>
        <div><strong>Date Quote Approved:</strong> ${po.dateOfQuoteApproved || "-"}</div>
      </div>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />

      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <tr><td style="padding: 4px 8px; font-weight: 600; width: 180px;">Main Folder</td><td style="padding: 4px 8px;">${po.mainFolder || "-"}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">Sub Folder</td><td style="padding: 4px 8px;">${po.subFolder || "-"}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">Variation Ref</td><td style="padding: 4px 8px;">${po.variationRef || "-"}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">Supplier Name</td><td style="padding: 4px 8px;">${po.supplierName}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">Supplier Email</td><td style="padding: 4px 8px;">${po.supplierEmail}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">PO Total</td><td style="padding: 4px 8px;">${po.quoteTotal}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">Approval</td><td style="padding: 4px 8px;">${po.approvalQuotation}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">Approval Reasons</td><td style="padding: 4px 8px;">${po.approvalRelatedRequests || "-"}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: 600;">Procurement Comments</td><td style="padding: 4px 8px;">${po.procurementComments || "-"}</td></tr>
      </table>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />

      <p style="margin-top: 16px; font-size: 11px; color: #444;">
        This is a generated purchase order document.
      </p>
    </div>
  </body>
</html>`
}

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    po: POPreviewData | null
}

export default function ViewPODialog({ open, onOpenChange, po }: Props) {
    if (!po) return null

    const [showPdf, setShowPdf] = useState(false)

    const getPdf = useCallback(() => {
        if (!po) throw new Error("No PO data")
        const fakeParsed: ParsedPOData = {
            supplier_name: po.supplierName,
            supplier_address: "",
            fao: "",
            quotation_number: po.quotationRef,
            your_ref: "",
            job_site_ref: po.project,
            quotation_date: po.dateOfQuoteApproved,
            grand_total: String(po.quoteTotal),
            raw_text: "",
            line_items: po.lineItems?.map(li => ({
                cat_no: "",
                description: li.description,
                discount: String(li.discount),
                quantity: String(li.qty),
                unit_price: String(li.each),
                total_value: String((li.qty || 0) * (li.each || 0))
            })) || []
        }
        return generateBrandedPOPDF(fakeParsed)
    }, [po])

    function downloadDoc() {
        if (!po) return
        const html = buildPODocHtml(po)
        const blob = new Blob([html], { type: "application/msword" })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement("a")
        anchor.href = url
        anchor.download = `po-${po.quotationRef}.doc`
        anchor.click()
        URL.revokeObjectURL(url)
    }

    const statusBadge = () => {
        switch (po.approvalQuotation) {
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
                        {po.approvalQuotation}
                    </span>
                )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <FileText className="size-5 text-blue-400" />
                        Purchase Order {po.quotationRef}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="rounded-lg border border-white/10 bg-slate-900 p-5 text-sm text-slate-200">
                        {/* Header row */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Project
                                </p>
                                <p className="font-medium text-white">{po.project || "-"}</p>
                            </div>
                            <div className="text-right">{statusBadge()}</div>
                        </div>

                        <div className="my-4 h-px bg-white/10" />

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <DetailItem label="Main Folder" value={po.mainFolder || "-"} />
                            <DetailItem label="Sub Folder" value={po.subFolder || "-"} />
                            <DetailItem label="Variation Ref" value={po.variationRef || "-"} />
                            <DetailItem label="Date Quote Approved" value={po.dateOfQuoteApproved || "-"} />
                            <DetailItem label="Date PO Created" value={po.datePOCreated || "-"} />
                            <DetailItem label="Supplier" value={po.supplierName} />
                            <DetailItem label="Supplier Email" value={po.supplierEmail} />
                            <DetailItem label="Approval Reasons" value={po.approvalRelatedRequests || "-"} />
                            <div className="col-span-2">
                                <DetailItem label="Procurement Comments" value={po.procurementComments || "-"} />
                            </div>
                        </div>

                        <div className="my-4 h-px bg-white/10" />

                        {/* Total */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                PO Total
                            </span>
                            <span className="text-xl font-bold text-emerald-400 tabular-nums">
                                {po.quoteTotal}
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
                </div>
            </DialogContent>

            <PdfViewerDialog
                open={showPdf}
                onOpenChange={setShowPdf}
                title={`PO ${po.quotationRef}`}
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
