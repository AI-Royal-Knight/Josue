"use client"

import { useCallback, useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Eye, Download, FileText, FileSpreadsheet, Save, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import PdfViewerDialog from "@/components/common/pdf-viewer-dialog"
import { generateApplicationPdf } from "@/lib/generate-application-pdf"
import { generateApplicationExcel } from "@/lib/generate-application-excel"
import { getProfile } from "@/lib/api/profile"
import { getMonthlyApplications, CurrentDraft, MonthlyApplicationApi, createMonthlyApplication, updateMonthlyApplication } from "@/lib/api/monthly-application"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

export default function ApplicationView({ projectId }: { projectId: string }) {
  const [appDialogOpen, setAppDialogOpen] = useState(false)
  const [appPdfOpen, setAppPdfOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<MonthlyApplicationApi | null>(null)

  const [companyName, setCompanyName] = useState("COMPANY NAME")
  const [addressLine1, setAddressLine1] = useState("7-8 Stratford Place, London, W1C 1AY")
  const [addressLine2, setAddressLine2] = useState("Tel: 0203922477")

  const [draft, setDraft] = useState<CurrentDraft | null>(null)
  const [applications, setApplications] = useState<MonthlyApplicationApi[]>([])
  
  const [clientAmounts, setClientAmounts] = useState<Record<string, string>>({})
  const [invoices, setInvoices] = useState<Record<string, File | null>>({})

  const handleClientAmountChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation()
    setClientAmounts(prev => ({ ...prev, [id]: e.target.value }))
  }

  const handleInvoiceUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation()
    if (e.target.files && e.target.files.length > 0) {
      setInvoices(prev => ({ ...prev, [id]: e.target.files![0] }))
    }
  }

  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({})

  const handleSaveApp = async (e: React.MouseEvent, app: MonthlyApplicationApi) => {
    e.stopPropagation()
    const amt = clientAmounts[app.id] || "0"
    const file = invoices[app.id]
    
    setSavingRows(prev => ({ ...prev, [app.id]: true }))
    try {
      const formData = new FormData()
      formData.append("certified_amount", amt)
      if (file) {
        formData.append("payment_certificate", file)
      }
      
      const updatedApp = await updateMonthlyApplication(app.id, formData)
      
      setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a))
      toast.success(`Application ${app.application_number} updated successfully`)
      
      // Clear local file state after successful upload to reset input visual if needed
      setInvoices(prev => ({ ...prev, [app.id]: null }))
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message || "Unknown error"}`)
    } finally {
      setSavingRows(prev => ({ ...prev, [app.id]: false }))
    }
  }
  
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile()
        if (data.company) {
          const c = data.company
          if (c.company_name) setCompanyName(c.company_name)
          const parts = [c.building_number, c.street, c.town, c.city, c.postcode].filter(Boolean)
          if (parts.length > 0) setAddressLine1(parts.join(", "))
          if (c.phone) setAddressLine2(`Tel: ${c.phone}`)
        }
      } catch (e) {
        console.error("Failed to load profile for company info", e)
      }
    }
    loadProfile()
  }, [])

  useEffect(() => {
    if (!projectId) return
    async function loadData() {
      try {
        const res = await getMonthlyApplications(projectId)
        setApplications(res.monthly_applications || [])
        setDraft(res.current_draft || null)
        
        // Initialize client amounts state
        const initialClientAmounts: Record<string, string> = {}
        res.monthly_applications?.forEach(app => {
          if (parseFloat(app.client_certified_amount) > 0) {
            initialClientAmounts[app.id] = app.client_certified_amount
          }
        })
        setClientAmounts(initialClientAmounts)
      } catch (e) {
        console.error("Failed to load monthly applications", e)
      }
    }
    loadData()
  }, [projectId])

  const [worksValuedToDate, setWorksValuedToDate] = useState("")
  const [paymentNoticeDate, setPaymentNoticeDate] = useState("")
  const [finalDateForPayment, setFinalDateForPayment] = useState("")

  const [lessRetention, setLessRetention] = useState("2.5")
  const [lessDiscount, setLessDiscount] = useState("0.0")

  // Calculations based on the user's logic
  const contractWorks = draft?.contract_works_total || 0
  const variations = draft?.variations_total || 0
  const originalProjectValue = draft?.original_project_value || 0
  const orderNo = draft?.order_no || "—"
  const orderValue = draft?.order_value || 0
  
  const grossTotal = contractWorks + variations
  const projectedFinalAccount = originalProjectValue + variations
  
  const retentionVal = (parseFloat(lessRetention) || 0) / 100
  const discountVal = (parseFloat(lessDiscount) || 0) / 100
  
  const retentionAmount = grossTotal * retentionVal
  const discountAmount = grossTotal * discountVal
  
  const cumulativeNetApplication = grossTotal + retentionAmount + discountAmount

  const { totalNetDue, totalClientPayments } = useMemo(() => {
    let tNetDue = 0
    let tClientPayments = 0

    applications.forEach(app => {
      const cw = parseFloat(app.contract_works_total) || 0
      const varTotal = parseFloat(app.variations_total) || 0
      const gross = cw + varTotal
      const retention = gross * (parseFloat(app.retention_percentage) / 100)
      const discount = gross * (parseFloat(app.discount_percentage) / 100)
      const net = gross + retention + discount
      
      const clientAmt = parseFloat(clientAmounts[app.id]) || parseFloat(app.client_certified_amount) || 0
      
      tClientPayments += clientAmt
      tNetDue += (net - clientAmt)
    })

    return { totalNetDue: tNetDue, totalClientPayments: tClientPayments }
  }, [applications, clientAmounts])

  const grossMovement = grossTotal - totalNetDue
  const netPaymentDue = cumulativeNetApplication - totalClientPayments

  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!projectId || !worksValuedToDate || !paymentNoticeDate || !finalDateForPayment) return
    
    setIsGenerating(true)
    try {
      const res = await createMonthlyApplication({
        project_id: projectId,
        retention_percentage: parseFloat(lessRetention) || 2.5,
        discount_percentage: parseFloat(lessDiscount) || 0.0,
      })
      setApplications(prev => [...prev, res])
      setWorksValuedToDate("")
      setPaymentNoticeDate("")
      setFinalDateForPayment("")
    } catch (e) {
      console.error("Failed to generate application", e)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleOpenApp = (app: MonthlyApplicationApi) => {
    setSelectedApp(app)
    setAppDialogOpen(true)
  }

  const getAppPdf = useCallback(() => {
    if (!selectedApp) return new Blob()
    return generateApplicationPdf({
      companyName,
      addressLine1,
      addressLine2,
      application: selectedApp,
    })
  }, [selectedApp, companyName, addressLine1, addressLine2])

  const handleExportExcel = useCallback(() => {
    if (!selectedApp) return
    generateApplicationExcel({
      companyName,
      addressLine1,
      addressLine2,
      application: selectedApp,
    })
  }, [selectedApp, companyName, addressLine1, addressLine2])

  const downloadAppDoc = useCallback(() => {
    if (!selectedApp) return
    const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>Application for Payment</title></head>
  <body style="font-family: Arial, sans-serif; color: #111; padding: 24px;">
    <h1>APPLICATION FOR PAYMENT</h1>
    <p><strong>Application:</strong> ${selectedApp.application_number}</p>
    <p><strong>Date:</strong> ${selectedApp.date}</p>
    <hr style="border: none; border-top: 1px solid #ddd;" />
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px;">
      <thead>
        <tr>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px 4px;">Application No.</th>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px 4px;">Date</th>
          <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px 4px;">Contract Works</th>
          <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px 4px;">Variations</th>
          <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px 4px;">Amount Claimed</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0;">${selectedApp.application_number}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0;">${selectedApp.date}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${formatCurrency(parseFloat(selectedApp.contract_works_total))}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${formatCurrency(parseFloat(selectedApp.variations_total))}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;"><strong>${formatCurrency(parseFloat(selectedApp.amount_claimed))}</strong></td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`
    const blob = new Blob([html], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `application-${selectedApp.application_number}.doc`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [selectedApp])

  if (!projectId) {
    return <div className="p-8 text-center text-slate-400">Please select a project first.</div>
  }

  return (
    <div className="w-full space-y-6 text-slate-200">
      {/* ── Previous Applications Summary Table ── */}
      <div className="w-full overflow-hidden rounded-lg border border-white/10 bg-[#0a1730]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#070f1e]/40">
                <th className="px-3 py-2.5 text-left font-medium text-slate-400">No.</th>
                <th className="px-3 py-2.5 text-left font-medium text-slate-400">Date</th>
                <th className="px-3 py-2.5 text-left font-medium text-slate-400">Ref No.</th>
                <th className="px-3 py-2.5 text-right font-medium text-slate-400">Contract Works</th>
                <th className="px-3 py-2.5 text-right font-medium text-slate-400">Variations</th>
                <th className="px-3 py-2.5 text-right font-medium text-slate-400">Gross Total</th>
                <th className="px-3 py-2.5 text-right font-medium text-slate-400">Net Claimed</th>
                <th className="px-3 py-2.5 text-center font-medium text-slate-400">Invoice</th>
                <th className="px-3 py-2.5 text-right font-medium text-slate-400">Client Amount</th>
                <th className="px-3 py-2.5 text-right font-medium text-slate-400">Net Due</th>
                <th className="px-3 py-2.5 text-center font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-4 text-center text-slate-500 italic">No applications yet.</td>
                </tr>
              )}
              {applications.map((app) => {
                const cw = parseFloat(app.contract_works_total) || 0
                const varTotal = parseFloat(app.variations_total) || 0
                const gross = cw + varTotal
                const retention = gross * (parseFloat(app.retention_percentage) / 100)
                const discount = gross * (parseFloat(app.discount_percentage) / 100)
                const net = gross + retention + discount
                
                const clientAmt = parseFloat(clientAmounts[app.id]) || parseFloat(app.client_certified_amount) || 0
                const netDue = net - clientAmt

                return (
                  <tr
                    key={app.id}
                    className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/[0.04]"
                    onClick={() => handleOpenApp(app)}
                  >
                    <td className="px-3 py-3 text-slate-200">{app.application_number}</td>
                    <td className="px-3 py-3 font-medium text-slate-200">{app.date}</td>
                    <td className="px-3 py-3 text-slate-200">{app.ref_no}</td>
                    <td className="px-3 py-3 text-right text-slate-200">{formatCurrency(cw)}</td>
                    <td className="px-3 py-3 text-right text-slate-200">{formatCurrency(varTotal)}</td>
                    <td className="px-3 py-3 text-right text-slate-200">{formatCurrency(gross)}</td>
                    <td className="px-3 py-3 text-right font-semibold text-emerald-400">{formatCurrency(net)}</td>
                    <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-center gap-1">
                        <input 
                          type="file" 
                          accept="application/pdf" 
                          className="text-[10px] w-48 text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-[#1f3571] file:text-white hover:file:bg-[#204cb3] cursor-pointer" 
                          onChange={(e) => handleInvoiceUpload(e, app.id)} 
                        />
                        {app.payment_certificate_url && (
                          <a href={app.payment_certificate_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline">
                            View Uploaded Invoice
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="number" 
                        className="w-24 bg-transparent border-b border-white/20 focus:border-white/50 outline-none text-right text-slate-200 transition-colors" 
                        placeholder="0.00" 
                        value={clientAmounts[app.id] ?? (parseFloat(app.client_certified_amount) > 0 ? parseFloat(app.client_certified_amount) : "")} 
                        onChange={(e) => handleClientAmountChange(e, app.id)} 
                      />
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-rose-400">{formatCurrency(netDue)}</td>
                    <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleSaveApp(e, app)}
                        disabled={savingRows[app.id]}
                        className="h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                      >
                        {savingRows[app.id] ? <span className="animate-spin text-lg leading-none">⟳</span> : <Save className="size-4" />}
                      </Button>
                    </td>
                  </tr>
                )
              })}
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
          {selectedApp && (
            <div className="space-y-4">
              <div className="rounded border border-white/10 bg-slate-900 p-4 text-sm text-slate-200">
                <h4 className="mb-3 text-base font-semibold text-white">APPLICATION FOR PAYMENT</h4>
                <div className="mb-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div>
                    <span className="text-slate-500">Application No.</span>
                    <p className="font-medium text-slate-200">{selectedApp.application_number}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Date</span>
                    <p className="font-medium text-slate-200">{selectedApp.date}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Contract Works</span>
                    <p className="font-medium text-slate-200">{formatCurrency(parseFloat(selectedApp.contract_works_total))}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Variations</span>
                    <p className="font-medium text-slate-200">{formatCurrency(parseFloat(selectedApp.variations_total))}</p>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <span className="text-xs text-slate-500">Amount Claimed</span>
                  <p className="mt-0.5 text-lg font-semibold text-emerald-400">{formatCurrency(parseFloat(selectedApp.amount_claimed))}</p>
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
                <Button variant="outline" onClick={handleExportExcel} className="gap-2">
                  <FileSpreadsheet className="size-4" />
                  Export Excel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PdfViewerDialog
        open={appPdfOpen}
        onOpenChange={setAppPdfOpen}
        title={selectedApp ? `Application ${selectedApp.application_number}` : ""}
        getPdf={getAppPdf}
      />

      {/* Top Box: Company Header & Client Info */}
      <div className="border border-white/10 bg-[#0a1730] overflow-hidden">
        <div className="border-b border-white/10 px-6 py-5 text-center bg-[#070f1e]/40">
          <input
            type="text"
            className="text-3xl font-bold tracking-wider text-white bg-transparent border-none outline-none text-center w-full"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <input
            type="text"
            className="mt-1.5 text-xs text-slate-400 bg-transparent border-none outline-none text-center w-full"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
          />
          <input
            type="text"
            className="text-xs text-slate-400 bg-transparent border-none outline-none text-center w-full"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
          />
        </div>

        <div className="bg-[#1f3571] px-6 py-2.5 text-center text-sm font-semibold tracking-wide text-white uppercase">
          Application For Payment
        </div>

        <div className="grid grid-cols-3 border-b border-white/10 text-xs bg-[#070f1e]/80">
          <div className="border-r border-white/10 px-4 py-2.5 text-slate-300">
            <span className="text-slate-500 font-medium">Application Number:</span> {applications.length + 1} (Draft)
          </div>
          <div className="border-r border-white/10 px-4 py-2.5 text-slate-300">
            <span className="text-slate-500 font-medium">Date:</span> {new Date().toLocaleDateString()}
          </div>
          <div className="px-4 py-2.5 text-slate-300 flex items-center">
            <span className="text-slate-500 font-medium mr-2">Ref No:</span>
            <input type="text" className="bg-transparent border-none outline-none text-white w-full" placeholder="Enter Ref No" />
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
                {formatCurrency(grossTotal)}
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Previous Cumulative
              </div>
              <div className="px-4 py-2.5 text-right text-slate-400 h-9 flex items-center justify-end">
                {formatCurrency(totalNetDue)}
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center font-bold bg-[#111c35]/20">
              <div className="px-4 py-2.5 text-slate-200 border-r border-white/10 h-9 flex items-center">
                Gross Movement in Period
              </div>
              <div className="px-4 py-2.5 text-right text-slate-100 h-9 flex items-center justify-end">
                {formatCurrency(grossMovement)}
              </div>
            </div>

            {/* Separator border */}
            <div className="grid grid-cols-[2fr_1fr] items-center border-t-2 border-white/20">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Projected Final Account
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                {formatCurrency(projectedFinalAccount)}
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Order No
              </div>
              <div className="px-4 py-2.5 text-right text-slate-400 h-9 flex items-center justify-end">
                {orderNo}
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Order Value
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                {formatCurrency(orderValue)}
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Works Valued to Date
              </div>
              <div className="px-4 py-1 text-right text-slate-200 h-9 flex items-center justify-end">
                <input type="date" className="text-right bg-transparent border-none outline-none w-full h-full [&::-webkit-calendar-picker-indicator]:invert" value={worksValuedToDate} onChange={(e) => setWorksValuedToDate(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Payment Notice Date
              </div>
              <div className="px-4 py-1 text-right text-slate-200 h-9 flex items-center justify-end">
                <input type="date" className="text-right bg-transparent border-none outline-none w-full h-full [&::-webkit-calendar-picker-indicator]:invert" value={paymentNoticeDate} onChange={(e) => setPaymentNoticeDate(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Final Date for Payment
              </div>
              <div className="px-4 py-1 text-right text-slate-200 h-9 flex items-center justify-end">
                <input type="date" className="text-right bg-transparent border-none outline-none w-full h-full [&::-webkit-calendar-picker-indicator]:invert" value={finalDateForPayment} onChange={(e) => setFinalDateForPayment(e.target.value)} />
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
                {formatCurrency(contractWorks)}
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
                {formatCurrency(variations)}
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
                {formatCurrency(grossTotal)}
              </div>
            </div>

            {/* Less Retention */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center border-t-2 border-white/20">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Less Retention (%)
              </div>
              <div className="px-4 py-1 text-center text-slate-200 border-r border-white/10 h-9 flex items-center justify-center font-medium bg-[#111c35]/15">
                <input type="text" className="text-center bg-transparent border-none outline-none w-full h-full" value={lessRetention} onChange={(e) => setLessRetention(e.target.value)} />
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                {formatCurrency(retentionAmount)}
              </div>
            </div>

            {/* Less Discount */}
            <div className="grid grid-cols-[2fr_0.6fr_1fr] items-center">
              <div className="px-4 py-2.5 text-slate-300 border-r border-white/10 h-9 flex items-center">
                Less Discount (%)
              </div>
              <div className="px-4 py-1 text-center text-slate-200 border-r border-white/10 h-9 flex items-center justify-center font-medium bg-[#111c35]/15">
                <input type="text" className="text-center bg-transparent border-none outline-none w-full h-full" value={lessDiscount} onChange={(e) => setLessDiscount(e.target.value)} />
              </div>
              <div className="px-4 py-2.5 text-right font-medium text-slate-100 h-9 flex items-center justify-end">
                {formatCurrency(discountAmount)}
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
                {formatCurrency(cumulativeNetApplication)}
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
                {formatCurrency(totalClientPayments)}
              </div>
            </div>

            {/* Net Payment Due */}
            <div className="grid grid-cols-[2.6fr_1fr] items-center font-bold bg-[#1d3571] text-white">
              <div className="px-4 py-2.5 border-r border-white/10 h-9 flex items-center">
                Net Payment Due
              </div>
              <div className="px-4 py-2.5 text-right h-9 flex items-center justify-end">
                {formatCurrency(netPaymentDue)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button 
          className="bg-[#2a61d8] hover:bg-[#204cb3] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!worksValuedToDate || !paymentNoticeDate || !finalDateForPayment || isGenerating}
          onClick={handleGenerate}
        >
          {isGenerating ? "Generating..." : "Generate Application"}
        </Button>
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
