"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, Download, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import PdfViewerDialog from "@/components/common/pdf-viewer-dialog"
import { generateSimplePdf } from "@/lib/generate-pdf"

export default function ApplicationView() {
  const [appDialogOpen, setAppDialogOpen] = useState(false)
  const [appPdfOpen, setAppPdfOpen] = useState(false)

  const previousApplication = {
    no: 1,
    applicationNumber: "APP-001",
    dateRange: "15/03/2026 to 15/04/2026",
    refNo: "REF-2026-001",
    lessRetention: "£440.00",
    cumulativeNetApplication: "£17,160.00",
    cumulativeNetPaymentReceived: "—",
    netPaymentDue: "£17,160.00",
  }

  const getAppPdf = useCallback(() => {
    return generateSimplePdf({
      title: "APPLICATION FOR PAYMENT",
      subtitle: `Application ${previousApplication.applicationNumber}`,
      headerFields: [
        { label: "Application No.", value: previousApplication.applicationNumber },
        { label: "Date Range", value: previousApplication.dateRange },
        { label: "Ref No.", value: previousApplication.refNo },
        { label: "Less Retention", value: previousApplication.lessRetention },
        { label: "Cumulative Net Application", value: previousApplication.cumulativeNetApplication },
        { label: "Cumulative Net Payment Received", value: previousApplication.cumulativeNetPaymentReceived },
        { label: "Net Payment Due", value: previousApplication.netPaymentDue },
      ],
      detailFields: [
        { label: "Contract Works", value: "£5,000.00" },
        { label: "Variations", value: "£12,000.00" },
        { label: "Cumulative Gross Total", value: "£17,600.00" },
      ],
      totalLabel: "Net Payment Due",
      totalValue: previousApplication.netPaymentDue,
      footer: "Previous month application summary.",
    })
  }, [])

  const downloadAppDoc = useCallback(() => {
    const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>Application for Payment</title></head>
  <body style="font-family: Arial, sans-serif; color: #111; padding: 24px;">
    <h1>APPLICATION FOR PAYMENT</h1>
    <p><strong>Application:</strong> ${previousApplication.applicationNumber}</p>
    <p><strong>Period:</strong> ${previousApplication.dateRange}</p>
    <hr style="border: none; border-top: 1px solid #ddd;" />
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px;">
      <thead>
        <tr>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px 4px;">No.</th>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px 4px;">Application No.</th>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px 4px;">Date Range</th>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px 4px;">Ref No.</th>
          <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px 4px;">Less Retention</th>
          <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px 4px;">Cum. Net App.</th>
          <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px 4px;">Cum. Net Paid</th>
          <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px 4px;">Net Due</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0;">${previousApplication.no}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0;">${previousApplication.applicationNumber}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0;">${previousApplication.dateRange}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0;">${previousApplication.refNo}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${previousApplication.lessRetention}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${previousApplication.cumulativeNetApplication}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${previousApplication.cumulativeNetPaymentReceived}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;"><strong>${previousApplication.netPaymentDue}</strong></td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="7" style="padding: 12px 4px; text-align: right;"><strong>Net Payment Due</strong></td>
          <td style="padding: 12px 4px; text-align: right;"><strong>${previousApplication.netPaymentDue}</strong></td>
        </tr>
      </tfoot>
    </table>
  </body>
</html>`
    const blob = new Blob([html], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `application-${previousApplication.applicationNumber}.doc`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [])

  return (
    <div className="w-full space-y-6 text-slate-200">
      {/* ── Previous Applications Summary Table ── */}
      <div className="w-2/3 overflow-hidden rounded-lg border border-white/10 bg-[#0a1730]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#070f1e]/40">
                <th className="px-3 py-2.5 text-left font-medium text-slate-400">No.</th>
                <th className="px-3 py-2.5 text-left font-medium text-slate-400">Application No.</th>
                <th className="px-3 py-2.5 text-left font-medium text-slate-400">Date Range</th>
                <th className="px-3 py-2.5 text-left font-medium text-slate-400">Ref No.</th>
                <th className="px-3 py-2.5 text-right font-medium text-slate-400">Less Retention</th>
                <th className="px-3 py-2.5 text-right font-medium text-slate-400">Cum. Net App.</th>
                <th className="px-3 py-2.5 text-right font-medium text-slate-400">Cum. Net Paid</th>
                <th className="px-3 py-2.5 text-right font-medium text-slate-400">Net Due</th>
              </tr>
            </thead>
            <tbody>
              <tr
                className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/[0.04]"
                onClick={() => setAppDialogOpen(true)}
              >
                <td className="px-3 py-3 text-slate-200">{previousApplication.no}</td>
                <td className="px-3 py-3 font-medium text-slate-200">{previousApplication.applicationNumber}</td>
                <td className="px-3 py-3 text-slate-200">{previousApplication.dateRange}</td>
                <td className="px-3 py-3 text-slate-200">{previousApplication.refNo}</td>
                <td className="px-3 py-3 text-right text-slate-200">{previousApplication.lessRetention}</td>
                <td className="px-3 py-3 text-right text-slate-200">{previousApplication.cumulativeNetApplication}</td>
                <td className="px-3 py-3 text-right text-slate-400">{previousApplication.cumulativeNetPaymentReceived}</td>
                <td className="px-3 py-3 text-right font-semibold text-emerald-400">{previousApplication.netPaymentDue}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Previous Application Dialog ── */}
      <Dialog open={appDialogOpen} onOpenChange={setAppDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Previous Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded border border-white/10 bg-slate-900 p-4 text-sm text-slate-200">
              <h4 className="mb-3 text-base font-semibold text-white">APPLICATION FOR PAYMENT</h4>
              <div className="mb-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <div>
                  <span className="text-slate-500">Application No.</span>
                  <p className="font-medium text-slate-200">{previousApplication.applicationNumber}</p>
                </div>
                <div>
                  <span className="text-slate-500">Date Range</span>
                  <p className="font-medium text-slate-200">{previousApplication.dateRange}</p>
                </div>
                <div>
                  <span className="text-slate-500">Ref No.</span>
                  <p className="font-medium text-slate-200">{previousApplication.refNo}</p>
                </div>
                <div>
                  <span className="text-slate-500">Less Retention</span>
                  <p className="font-medium text-slate-200">{previousApplication.lessRetention}</p>
                </div>
                <div>
                  <span className="text-slate-500">Cumulative Net Application</span>
                  <p className="font-medium text-slate-200">{previousApplication.cumulativeNetApplication}</p>
                </div>
                <div>
                  <span className="text-slate-500">Cumulative Net Payment Received</span>
                  <p className="font-medium text-slate-200">{previousApplication.cumulativeNetPaymentReceived}</p>
                </div>
              </div>
              <div className="border-t border-white/10 pt-3">
                <span className="text-xs text-slate-500">Net Payment Due</span>
                <p className="mt-0.5 text-lg font-semibold text-emerald-400">{previousApplication.netPaymentDue}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setAppPdfOpen(true)} className="gap-2">
                <Eye className="size-4" />
                View PDF
              </Button>
              <Button variant="outline" onClick={downloadAppDoc} className="gap-2">
                <Download className="size-4" />
                Download Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PdfViewerDialog
        open={appPdfOpen}
        onOpenChange={setAppPdfOpen}
        title={`Application ${previousApplication.applicationNumber}`}
        getPdf={getAppPdf}
      />

      {/* Top Box: Company Header & Client Info */}
      <div className="border border-white/10 bg-[#0a1730] overflow-hidden">
        <div className="border-b border-white/10 px-6 py-5 text-center bg-[#070f1e]/40">
          <h3 className="text-3xl font-bold tracking-wider text-white">
            COMPANY NAME
          </h3>
          <p className="mt-1.5 text-xs text-slate-400">
            7-8 Stratford Place, London, W1C 1AY
          </p>
          <p className="text-xs text-slate-400">Tel: 0203922477</p>
        </div>

        <div className="bg-[#1f3571] px-6 py-2.5 text-center text-sm font-semibold tracking-wide text-white uppercase">
          Application For Payment
        </div>

        <div className="grid grid-cols-3 border-b border-white/10 text-xs bg-[#070f1e]/80">
          <div className="border-r border-white/10 px-4 py-2.5 text-slate-300">
            <span className="text-slate-500 font-medium">Application Number:</span>
          </div>
          <div className="border-r border-white/10 px-4 py-2.5 text-slate-300">
            <span className="text-slate-500 font-medium">Date:</span> 15/01/2026
          </div>
          <div className="px-4 py-2.5 text-slate-300">
            <span className="text-slate-500 font-medium">Ref No:</span>
          </div>
        </div>

        <div className="grid grid-cols-[1.3fr_0.7fr_0.7fr] border-b border-white/10 text-xs font-semibold bg-[#111c35]/40 text-slate-200">
          <div className="border-r border-white/10 px-4 py-2.5">Client</div>
          <div className="border-r border-white/10 px-4 py-2.5">Contract Site</div>
          <div className="px-4 py-2.5">Contacts</div>
        </div>

        <div className="grid grid-cols-[1.3fr_0.7fr_0.7fr] text-xs bg-[#070f1e]/20">
          <div className="h-24 border-r border-white/10 px-4 py-3"></div>
          <div className="h-24 border-r border-white/10 px-4 py-3"></div>
          <div className="h-24 px-4 py-3"></div>
        </div>
      </div>

      {/* Middle Box: Movement Calculations & Details of Application */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
        {/* Left Table: Movement Calculations */}
        <div className="border border-white/10 bg-[#0a1730] overflow-hidden">
          <div className="bg-[#111c35]/60 border-b border-white/10 px-4 py-2.5 font-semibold text-slate-100 text-sm">
            Movement Calculations
          </div>
          <div className="divide-y divide-white/10 text-xs bg-[#070f1e]/20">
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Current Cumulative
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                £ 17,600.00
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Previous Cumulative
              </div>
              <div className="px-4 py-2.5 text-right text-slate-400 h-9 flex items-center justify-end">
                —
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center font-bold bg-[#111c35]/20">
              <div className="px-4 py-2.5 text-slate-200 border-r border-white/10 h-9 flex items-center">
                Gross Movement in Period
              </div>
              <div className="px-4 py-2.5 text-right text-slate-100 h-9 flex items-center justify-end">
                £ 17,600.00
              </div>
            </div>

            {/* Separator border */}
            <div className="grid grid-cols-[2fr_1fr] items-center border-t-2 border-white/20">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Projected Final Account
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                £ 10,600.00
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Order No
              </div>
              <div className="px-4 py-2.5 text-right text-slate-400 h-9 flex items-center justify-end">
                —
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Order Value
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                £ 5,600.00
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Works Valued to Date
              </div>
              <div className="px-4 py-2.5 text-right text-slate-200 h-9 flex items-center justify-end">
                15-Jan-26
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Payment Notice Date
              </div>
              <div className="px-4 py-2.5 text-right text-slate-200 h-9 flex items-center justify-end">
                8-Feb-26
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Final Date for Payment
              </div>
              <div className="px-4 py-2.5 text-right text-slate-200 h-9 flex items-center justify-end">
                22-Feb-26
              </div>
            </div>
          </div>
        </div>

        {/* Right Table: Details of Application */}
        <div className="border border-white/10 bg-[#0a1730] overflow-hidden">
          <div className="bg-[#111c35]/60 border-b border-white/10 px-4 py-2.5 font-semibold text-slate-100 text-sm">
            Details of Application
          </div>
          <div className="divide-y divide-white/10 text-xs bg-[#070f1e]/20">
            <div className="bg-[#070f1e]/40 px-4 py-1.5 italic text-slate-400 text-[10px] h-7 flex items-center">
              Breakdown of Application
            </div>

            {/* Contract Works */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Contract Works
              </div>
              <div className="px-4 py-2.5 text-center text-slate-400 border-r border-white/10 h-9 flex items-center justify-center">
                —
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                £ 5,000.00
              </div>
            </div>

            {/* Variations */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Variations
              </div>
              <div className="px-4 py-2.5 text-center text-slate-400 border-r border-white/10 h-9 flex items-center justify-center">
                —
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                £ 12,000.00
              </div>
            </div>

            {/* Cumulative Gross Total */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center font-bold bg-[#111c35]/20">
              <div className="px-4 py-2.5 text-slate-200 border-r border-white/10 h-9 flex items-center">
                Cumulative Gross Total
              </div>
              <div className="px-4 py-2.5 text-center text-slate-400 border-r border-white/10 h-9 flex items-center justify-center">
                —
              </div>
              <div className="px-4 py-2.5 text-right text-slate-100 h-9 flex items-center justify-end">
                £ 17,600.00
              </div>
            </div>

            {/* Less Retention */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center border-t-2 border-white/20">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Less Retention
              </div>
              <div className="px-4 py-2.5 text-center text-slate-200 border-r border-white/10 h-9 flex items-center justify-center font-medium bg-[#111c35]/15">
                2.5%
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                £ 440.00
              </div>
            </div>

            {/* Less Discount */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Less Discount
              </div>
              <div className="px-4 py-2.5 text-center text-slate-200 border-r border-white/10 h-9 flex items-center justify-center font-medium bg-[#111c35]/15">
                0.0%
              </div>
              <div className="px-4 py-2.5 text-right text-slate-400 h-9 flex items-center justify-end">
                —
              </div>
            </div>

            {/* Cumulative Net Application */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center font-medium border-t-2 border-white/20">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Cumulative Net Application
              </div>
              <div className="px-4 py-2.5 text-center text-slate-400 border-r border-white/10 h-9 flex items-center justify-center">
                —
              </div>
              <div className="px-4 py-2.5 text-right font-semibold text-slate-100 h-9 flex items-center justify-end">
                £ 17,160.00
              </div>
            </div>

            {/* Cumulative Net Payment Received */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Cumulative Net Payment Received
              </div>
              <div className="px-4 py-2.5 text-center text-slate-400 border-r border-white/10 h-9 flex items-center justify-center">
                —
              </div>
              <div className="px-4 py-2.5 text-right text-slate-400 h-9 flex items-center justify-end">
                —
              </div>
            </div>

            {/* Net Payment Due */}
            <div className="grid grid-cols-[2.6fr_1fr] items-center font-bold bg-[#1d3571] text-white">
              <div className="px-4 py-2.5 border-r border-white/10 h-9 flex items-center">
                Net Payment Due
              </div>
              <div className="px-4 py-2.5 text-right h-9 flex items-center justify-end">
                £ 17,160.00
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Box: Legal Notes Footer */}
      <div className="border border-white/10 bg-[#0a1730] p-4 text-[10px] md:text-[11px] leading-relaxed text-slate-400 space-y-3">
        <p>
          If you do not agree with any items within our application, please forward
          full details within five days of the date of this Application.
        </p>
        <p>
          Please note that in compliance with the Housing Grants Construction and
          Regeneration Act 1996, it is a statutory requirement that you advise us
          within a period of 5 days from the due date of the Application of any
          amount proposed to be withheld from the gross value applied for, and the
          ground for withholding. If there are more than one ground, each ground
          and the amount attributable to it must be detailed.
        </p>
      </div>
    </div>
  )
}
