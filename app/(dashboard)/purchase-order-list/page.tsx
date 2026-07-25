"use client"

import { useState, useCallback, useEffect } from "react"
import { parsePOPDF, generateBrandedPOPDF } from "@/lib/api/purchase-order-pdf"
import type { ParsedPOData } from "@/lib/api/purchase-order-pdf"
import type { ColDef } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import TableStat from "@/components/common/table-stat"
import SelectProject from "@/components/shared/select-project"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFileUpload } from "@/hooks/use-file-upload"
import ViewPODialog from "./_components/ViewPODialog"
import type { POPreviewData } from "./_components/ViewPODialog"
import { cn } from "@/lib/utils"
import {
  PlusCircle,
  UploadIcon,
  FileTextIcon,
  Loader2,
  CheckCircle2,
  AlertCircleIcon,
  XIcon,
  Download,
  Eye,
} from "lucide-react"
import { useRoleStore } from "@/lib/role-store"
import { ExportCsvButton } from "@/components/common/export-csv-button"
import { getQuotations, ProcurementProject, createQuotation, approveQuotation, toggleQuotationSignature, type QuotationLineItem } from "@/lib/api/quotations"
import { getApprovalConfigs, type ApprovalConfigurationData } from "@/lib/api/project-admin"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
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

// ─── Types ────────────────────────────────────────────────────────────────────

type PurchaseOrderRow = {
  id: string
  no: string
  quotationRef: string
  project: string
  mainFolder: string
  subFolder: string
  variationRef: string
  supplierName: string
  supplierEmail: string
  dateOfQuoteApproved: string
  quoteTotal: string
  createPo: string
  datePOCreated: string
  sendReminder: string
  procurementComments: string
  requestToReQuote: string
  approvalQuotation: string
  approvalRelatedRequests: string
  sourceFile?: string
  sourceFileUrl?: string
  lineItems?: QuotationLineItem[]

  // Approval chain
  sigProcurementDepartment?: boolean
  sigProcurementDepartmentDate?: string
  sigContractsManager?: boolean
  sigContractsManagerDate?: string
  sigProjectDirector?: boolean
  sigProjectDirectorDate?: string
  sigManagingDirector?: boolean
  sigManagingDirectorDate?: string
  sigCommercialDepartment?: boolean
  sigCommercialDepartmentDate?: string
  fullyApproved?: boolean
}

type ApprovalField =
  | "sigProcurementDepartment"
  | "sigContractsManager"
  | "sigProjectDirector"
  | "sigManagingDirector"
  | "sigCommercialDepartment"

type PendingToggle = {
  id: string
  ref: string
  field: ApprovalField
  nextValue: boolean
  label: string
}

function ApprovalToggleCell({
  row,
  field,
  dateField,
  canToggle,
  isDisabled,
  disabledReason,
  onRequest,
}: {
  row: PurchaseOrderRow
  field: ApprovalField
  dateField: keyof PurchaseOrderRow
  canToggle: boolean
  isDisabled: boolean
  disabledReason?: string
  onRequest: (field: ApprovalField, nextValue: boolean) => void
}) {
  const checked = row[field] as boolean
  const date = row[dateField] as string

  return (
    <div className="flex flex-col justify-center gap-0.5 py-1">
      <div className="flex items-center gap-2">
        <Switch
          checked={checked}
          disabled={!canToggle || isDisabled}
          title={isDisabled ? disabledReason : undefined}
          onCheckedChange={(next) => onRequest(field, next)}
        />
        <span
          className={
            checked
              ? "text-xs font-medium text-emerald-400"
              : "text-xs font-medium text-slate-400"
          }
        >
          {checked ? "Yes" : "No"}
        </span>
      </div>
      {date && (
        <span className="text-[10px] text-slate-500 leading-none">{date}</span>
      )}
    </div>
  )
}

type POFormData = {
  supplierName: string
  supplierEmail: string
  project: string
  mainFolder: string
  subFolder: string
  variationRef: string
  quoteTotal: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10)

const nextRef = (rows: PurchaseOrderRow[]) => {
  const year = new Date().getFullYear()
  const max = rows
    .map((r) =>
      parseInt(r.quotationRef.replace(/\D/g, "").slice(-4) || "0", 10)
    )
    .reduce((a, b) => Math.max(a, b), 900)
  return `QR-${year}-${max + 1}`
}

const nextNo = (rows: PurchaseOrderRow[]) =>
  String(rows.reduce((m, r) => Math.max(m, parseInt(r.no, 10) || 0), 0) + 1)

/** Calls the real backend to parse a supplier PDF. */
async function parsePDFQuote(file: File): Promise<POFormData & { _parsed?: ParsedPOData }> {
  const data = await parsePOPDF(file)
  return {
    supplierName: data.supplier_name || "",
    supplierEmail: "",
    project: data.job_site_ref || "",
    mainFolder: "",
    subFolder: "",
    variationRef: data.quotation_number || "",
    quoteTotal: data.grand_total || "",
    _parsed: data,
  }
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const INITIAL_DATA: PurchaseOrderRow[] = [
  {
    id: "po-1",
    no: "1",
    quotationRef: "QR-2023-0891",
    project: "Downtown Tower A",
    mainFolder: "Structural",
    subFolder: "Concrete",
    variationRef: "VAR-001",
    supplierName: "BuildMat Supplies Ltd",
    supplierEmail: "sales@buildmat.com",
    dateOfQuoteApproved: "2023-10-12",
    quoteTotal: "£45,000.00",
    createPo: "PO Created",
    datePOCreated: "2023-10-14",
    sendReminder: "Reminder",
    procurementComments: "Type here",
    requestToReQuote: "Re-quote",
    approvalQuotation: "Approved",
    approvalRelatedRequests: "Lowest bidder. Meets all specs.",
  },
  {
    id: "po-2",
    no: "2",
    quotationRef: "QR-2023-0892",
    project: "Downtown Tower A",
    mainFolder: "Structural",
    subFolder: "Steel",
    variationRef: "-",
    supplierName: "IronWorks Inc.",
    supplierEmail: "quotes@ironworks.net",
    dateOfQuoteApproved: "",
    quoteTotal: "£125,500.50",
    createPo: "Create PO",
    datePOCreated: "",
    sendReminder: "Reminder",
    procurementComments: "Type here",
    requestToReQuote: "Re-quote",
    approvalQuotation: "Pending",
    approvalRelatedRequests: "-",
  },
  {
    id: "po-3",
    no: "3",
    quotationRef: "QR-2023-0895",
    project: "Riverside Complex",
    mainFolder: "MEP",
    subFolder: "HVAC",
    variationRef: "VAR-012",
    supplierName: "CoolAir Systems",
    supplierEmail: "info@coolair.com",
    dateOfQuoteApproved: "2023-10-19",
    quoteTotal: "£89,200.00",
    createPo: "PO Created",
    datePOCreated: "2023-10-16",
    sendReminder: "Reminder",
    procurementComments: "Type here",
    requestToReQuote: "Re-quote",
    approvalQuotation: "Approved",
    approvalRelatedRequests: "Preferred vendor, lead time ok",
  },
  {
    id: "po-4",
    no: "4",
    quotationRef: "QR-2023-0898",
    project: "Riverside Complex",
    mainFolder: "MEP",
    subFolder: "Electrical",
    variationRef: "-",
    supplierName: "VoltTech Solutions",
    supplierEmail: "contact@volttech.com",
    dateOfQuoteApproved: "",
    quoteTotal: "£67,450.00",
    createPo: "Create PO",
    datePOCreated: "",
    sendReminder: "Reminder",
    procurementComments: "Type here",
    requestToReQuote: "Re-quote",
    approvalQuotation: "Pending",
    approvalRelatedRequests: "-",
  },
  {
    id: "po-5",
    no: "5",
    quotationRef: "QR-2023-0901",
    project: "Westside Mall",
    mainFolder: "Finishes",
    subFolder: "Flooring",
    variationRef: "VAR-003",
    supplierName: "Premium Tiles Co.",
    supplierEmail: "orders@premiumtiles.com",
    dateOfQuoteApproved: "2023-10-20",
    quoteTotal: "£112,000.00",
    createPo: "PO Created",
    datePOCreated: "2023-10-22",
    sendReminder: "Reminder",
    procurementComments: "Type here",
    requestToReQuote: "Re-quote",
    approvalQuotation: "Approved",
    approvalRelatedRequests: "Rejected due to budget constraints.",
  },
  {
    id: "po-6",
    no: "6",
    quotationRef: "QR-2023-0905",
    project: "Westside Mall",
    mainFolder: "Finishes",
    subFolder: "Paint",
    variationRef: "-",
    supplierName: "ColorPro Paints",
    supplierEmail: "sales@colorpro.com",
    dateOfQuoteApproved: "2023-10-18",
    quoteTotal: "£18,600.00",
    createPo: "PO Created",
    datePOCreated: "2023-10-18",
    sendReminder: "Reminder",
    procurementComments: "Type here",
    requestToReQuote: "Re-quote",
    approvalQuotation: "Approved",
    approvalRelatedRequests: "Within budget, good quality.",
  },
]

// ─── Create PO Dialog ─────────────────────────────────────────────────────────

type Step = "drop" | "parsing" | "review"

function CreatePODialog({
  rows,
  onCreated,
  onClose,
  selectedProject,
}: {
  rows: PurchaseOrderRow[]
  onCreated: () => void
  onClose: () => void
  selectedProject: ProcurementProject | null
}) {
  const [step, setStep] = useState<Step>("drop")
  const [parseError, setParseError] = useState<string | null>(null)
  const [sourceFile, setSourceFile] = useState("")
  const [sourceFileUrl, setSourceFileUrl] = useState("")
  const [parsedData, setParsedData] = useState<ParsedPOData | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [form, setForm] = useState<POFormData>({
    supplierName: "",
    supplierEmail: "",
    project: selectedProject?.project_name || "",
    mainFolder: "",
    subFolder: "",
    variationRef: "",
    quoteTotal: "",
  })

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    accept: ".pdf,application/pdf",
    maxSize: 20 * 1024 * 1024,
  })

  const droppedFile =
    files[0]?.file instanceof File ? (files[0].file as File) : null

  const handleParse = useCallback(async () => {
    if (!droppedFile) return
    setStep("parsing")
    setParseError(null)
    try {
      const extracted = await parsePDFQuote(droppedFile)
      const { _parsed, ...formFields } = extracted as POFormData & { _parsed?: ParsedPOData }
      setForm(prev => ({ ...formFields, project: prev.project }))
      if (_parsed) setParsedData(_parsed)
      setSourceFile(droppedFile.name)
      setSourceFileUrl(URL.createObjectURL(droppedFile))
      setStep("review")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not extract data — please fill in the fields manually."
      setParseError(msg)
      setSourceFile(droppedFile.name)
      setSourceFileUrl(URL.createObjectURL(droppedFile))
      setStep("review")
    }
  }, [droppedFile])

  const handleViewBrandedPDF = useCallback(async () => {
    if (!parsedData) return
    setGeneratingPdf(true)
    try {
      const blob = await generateBrandedPOPDF(parsedData)
      const url = URL.createObjectURL(blob)
      window.open(url, "_blank")
    } catch (err) {
      console.error("Failed to generate branded PDF:", err)
    } finally {
      setGeneratingPdf(false)
    }
  }, [parsedData])

  const handleDownloadBrandedPDF = useCallback(async () => {
    if (!parsedData) return
    setGeneratingPdf(true)
    try {
      const blob = await generateBrandedPOPDF(parsedData)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `PO_${parsedData.quotation_number || "export"}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to generate branded PDF:", err)
    } finally {
      setGeneratingPdf(false)
    }
  }, [parsedData])

  const handleCreate = async () => {
    if (!selectedProject) return
    const mainFolderId = selectedProject.folders.find(f => f.name === form.mainFolder)?.id
    const subFolderId = selectedProject.folders.find(f => f.name === form.mainFolder)?.subfolders.find(sf => sf.name === form.subFolder)?.id

    try {
      await createQuotation({
        project: selectedProject.id,
        main_folder: mainFolderId,
        sub_folder: subFolderId,
        variation_ref: form.variationRef,
        supplier_name: form.supplierName,
        supplier_email: form.supplierEmail,
        quote_total: parseFloat(form.quoteTotal.replace(/[^0-9.-]+/g, "")) || 0,
        status: "Pending",
        po_created: true,
        line_items: parsedData?.line_items.map((li) => {
          const qty = parseFloat(li.quantity.replace(/[^0-9.-]+/g, "")) || 0
          const discount = parseFloat(li.discount.replace(/[^0-9.-]+/g, "")) || 0
          const each = parseFloat(li.unit_price.replace(/[^0-9.-]+/g, "")) || 0
          return {
            description: li.description,
            qty: Number(qty.toFixed(2)),
            discount: Number(discount.toFixed(2)),
            per: "EA",
            each: Number(each.toFixed(2)),
            comments: ""
          }
        }) || []
      } as any) // as any since we pass supplier_name to the backend to resolve
      onCreated()
      onClose()
    } catch (err) {
      console.error("Failed to create PO:", err)
      alert("Failed to create PO. Check console for details.")
    }
  }

  const field = (
    label: string,
    key: keyof POFormData,
    placeholder = "",
    half = false
  ) => (
    <div className={cn("flex flex-col gap-1", half ? "" : "col-span-2")}>
      <label>{label}</label>
      <Input
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, [key]: e.target.value }))
        }
      />
    </div>
  )

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[92vh] w-[600px] max-w-none flex-col gap-0 overflow-hidden p-0"
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-base font-semibold text-slate-100">
                Create Purchase Order
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[12px] text-slate-500">
                {step === "drop" &&
                  "Drop a PDF quote — fields will be extracted automatically."}
                {step === "parsing" && "Reading your PDF quote…"}
                {step === "review" &&
                  "Review the extracted details then confirm to add to the table."}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="-mt-1 -mr-1"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Step pill indicators */}
          <div className="mt-3 flex items-center gap-3 text-[11px]">
            {(["drop", "parsing", "review"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                    step === s
                      ? "bg-blue-600 text-white"
                      : i <
                        (["drop", "parsing", "review"] as Step[]).indexOf(
                          step
                        )
                        ? "bg-emerald-600 text-white"
                        : "bg-[#1e3a5f] text-slate-500"
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    "capitalize",
                    step === s ? "text-slate-200" : "text-slate-600"
                  )}
                >
                  {s === "drop"
                    ? "Upload PDF"
                    : s === "parsing"
                      ? "Reading"
                      : "Review & Create"}
                </span>
                {i < 2 && <span className="text-slate-700">›</span>}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Step 1 — drop zone */}
          {step === "drop" && (
            <div className="flex flex-col gap-4">
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload PDF quote"
                className={cn(
                  "flex min-h-52 cursor-pointer flex-col items-center justify-center gap-3 rounded border-2 border-dashed transition-colors",
                  isDragging
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-[#2d4060] bg-[#0a1428] hover:border-blue-600/60 hover:bg-[#0e1a30]"
                )}
                onClick={openFileDialog}
                onKeyDown={(e) => e.key === "Enter" && openFileDialog()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input {...getInputProps()} className="sr-only" />
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2d4060] bg-[#0e1929]">
                  {droppedFile ? (
                    <FileTextIcon className="h-6 w-6 text-blue-400" />
                  ) : (
                    <UploadIcon className="h-6 w-6 text-slate-500" />
                  )}
                </div>
                {droppedFile ? (
                  <div className="text-center">
                    <p className="text-[13px] font-medium text-slate-200">
                      {droppedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {(droppedFile.size / 1024).toFixed(1)} KB — ready to read
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-[13px] font-medium text-slate-300">
                      Drop PDF quote here
                    </p>
                    <p className="text-[11px] text-slate-500">
                      or click to browse · max 20 MB
                    </p>
                  </div>
                )}
              </div>

              {errors.length > 0 && (
                <div className="flex items-center gap-1.5 text-[12px] text-red-400">
                  <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
                  {errors[0]}
                </div>
              )}
            </div>
          )}

          {/* Step 2 — parsing */}
          {step === "parsing" && (
            <div className="flex flex-col items-center justify-center gap-4 py-14">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <p className="text-[13px] text-slate-300">
                Reading{" "}
                <span className="font-medium text-slate-100">
                  {droppedFile?.name}
                </span>
                …
              </p>
              <p className="text-[12px] text-slate-500">
                Extracting supplier, quote total, and line items
              </p>
            </div>
          )}

          {/* Step 3 — review */}
          {step === "review" && (
            <div className="flex flex-col gap-4">
              {parseError ? (
                <div className="flex items-start gap-2 rounded border border-yellow-800/50 bg-yellow-900/15 px-3 py-2 text-[12px] text-yellow-400">
                  <AlertCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {parseError}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded border border-emerald-800/50 bg-emerald-900/15 px-3 py-2 text-[12px] text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  PDF read successfully — edit any field before creating.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {field(
                  "Supplier Name",
                  "supplierName",
                  "e.g. BuildMat Ltd",
                  true
                )}
                {field(
                  "Supplier Email",
                  "supplierEmail",
                  "e.g. sales@supplier.com",
                  true
                )}
                <div className="flex flex-col gap-1 col-span-2">
                  <label>Project</label>
                  <Input value={form.project} readOnly className="bg-[#0e1a30] text-slate-400 cursor-not-allowed" />
                </div>
                {field("Quote Total", "quoteTotal", "e.g. £45,000.00", true)}
                <div className="flex flex-col gap-1">
                  <label>Main Folder</label>
                  <Select value={form.mainFolder} onValueChange={(val) => setForm(prev => ({ ...prev, mainFolder: val, subFolder: "" }))}>
                    <SelectTrigger className="bg-[#0a1428]">
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProject?.folders?.map(f => (
                        <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label>Sub Folder</label>
                  <Select value={form.subFolder} onValueChange={(val) => setForm(prev => ({ ...prev, subFolder: val }))}>
                    <SelectTrigger className="bg-[#0a1428]">
                      <SelectValue placeholder="Select sub folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProject?.folders?.find(f => f.name === form.mainFolder)?.subfolders?.map(sf => (
                        <SelectItem key={sf.id} value={sf.name}>{sf.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {field(
                  "Variation Ref",
                  "variationRef",
                  "e.g. VAR-001 (optional)",
                  true
                )}
              </div>

              <div className="flex items-center gap-2 rounded bg-[#0a1428] px-3 py-2 text-[11px] text-slate-500">
                <FileTextIcon className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                Source:{" "}
                <span className="ml-1 text-slate-400">{sourceFile}</span>
              </div>

              {parsedData && parsedData.line_items.length > 0 && (
                <div className="rounded border border-[#1e3a5f]/50 bg-[#071020] p-3">
                  <p className="mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    Extracted Line Items ({parsedData.line_items.length})
                  </p>
                  <div className="max-h-36 overflow-y-auto">
                    <table className="w-full text-[10px] text-slate-300">
                      <thead>
                        <tr className="border-b border-[#1e3a5f]/60">
                          <th className="py-1 text-left text-slate-500">Cat No</th>
                          <th className="py-1 text-left text-slate-500">Description</th>
                          <th className="py-1 text-right text-slate-500">Qty</th>
                          <th className="py-1 text-right text-slate-500">Unit £</th>
                          <th className="py-1 text-right text-slate-500">Total £</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.line_items.map((item, i) => (
                          <tr key={i} className="border-b border-[#1e3a5f]/30">
                            <td className="py-0.5 font-mono text-[9px] text-slate-500">{item.cat_no}</td>
                            <td className="py-0.5">{item.description}</td>
                            <td className="py-0.5 text-right tabular-nums">{item.quantity}</td>
                            <td className="py-0.5 text-right tabular-nums">{item.unit_price}</td>
                            <td className="py-0.5 text-right tabular-nums text-emerald-400">{item.total_value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-[#1e3a5f]/60 pt-1.5">
                    <span className="text-[10px] text-slate-500">Grand Total</span>
                    <span className="text-[12px] font-bold text-emerald-400">{parsedData.grand_total}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4">
          {step === "drop" && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => void handleParse()}
                disabled={!droppedFile}
              >
                <FileTextIcon className="mr-2 h-4 w-4" />
                Read PDF & Continue
              </Button>
            </>
          )}
          {step === "parsing" && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          {step === "review" && (
            <>
              <Button variant="outline" onClick={() => setStep("drop")}>
                ← Back
              </Button>
              {parsedData && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => void handleViewBrandedPDF()}
                    disabled={generatingPdf}
                    className="border-blue-800/60 text-blue-300 hover:bg-blue-900/20"
                  >
                    {generatingPdf
                      ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      : <Eye className="mr-2 h-4 w-4" />}
                    {generatingPdf ? "Generating…" : "View PDF"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void handleDownloadBrandedPDF()}
                    disabled={generatingPdf}
                    className="border-blue-800/60 text-blue-300 hover:bg-blue-900/20"
                  >
                    {generatingPdf
                      ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      : <Download className="mr-2 h-4 w-4" />}
                    {generatingPdf ? "Generating…" : "Download PDF"}
                  </Button>
                </>
              )}
              <Button
                onClick={handleCreate}
                disabled={!form.supplierName.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create PO
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────


export default function Page() {
  const [data, setData] = useState<PurchaseOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewPO, setViewPO] = useState<POPreviewData | null>(null)
  
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false)
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(null)
  
  const [config, setConfig] = useState<ApprovalConfigurationData | null>(null)
  const [pendingToggle, setPendingToggle] = useState<PendingToggle | null>(null)
  const [submittingToggle, setSubmittingToggle] = useState(false)

  const handleApprovePO = async () => {
    if (!pendingApprovalId) return
    try {
      setLoading(true)
      await approveQuotation(pendingApprovalId)
      await fetchData() // refresh
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setApproveConfirmOpen(false)
      setPendingApprovalId(null)
    }
  }
  const [selectedProject, setSelectedProject] = useState<ProcurementProject | null>(null)

  const role = useRoleStore((state) => state.role)
  
  const isProcurement = role === "procurement_department"
  const isContractsManager = role === "contracts_manager"
  const isProjectDirector = role === "project_director"
  const isManagingDirector = role === "managing_director"
  const isCommercial = role === "commercial_department"

  useEffect(() => {
    async function loadConfig() {
      if (!selectedProject?.id) {
        setConfig(null)
        return
      }
      try {
        const configs = await getApprovalConfigs(selectedProject.id)
        const poConfig = configs.find(c => c.action_type === "purchase_order") || null
        setConfig(poConfig)
      } catch (e) {
        console.error(e)
      }
    }
    loadConfig()
  }, [selectedProject])

  const requestSignatureToggle = useCallback(
    (
      row: PurchaseOrderRow,
      field: ApprovalField,
      nextValue: boolean,
      label: string
    ) => {
      setPendingToggle({
        id: row.id,
        ref: row.quotationRef || `Row ${row.no}`,
        field,
        nextValue,
        label,
      })
    },
    []
  )

  const confirmToggle = useCallback(async () => {
    if (!pendingToggle || submittingToggle) return
    setSubmittingToggle(true)
    try {
      await toggleQuotationSignature(pendingToggle.id, pendingToggle.nextValue)
      await fetchData() // refresh
      toast.success(
        pendingToggle.nextValue
          ? `Signed as ${pendingToggle.label}`
          : `Revoked ${pendingToggle.label} signature`
      )
    } catch (e) {
      toast.error("Failed to update approval.")
      console.error(e)
    } finally {
      setSubmittingToggle(false)
      setPendingToggle(null)
    }
  }, [pendingToggle, submittingToggle])

  const isRoleConfigured = useCallback((roleKey: string) => {
    if (!config) return false // fallback
    return config.required_roles.split(',').includes(roleKey)
  }, [config])

  const isRoleRequired = useCallback((roleKey: string, row: PurchaseOrderRow) => {
    if (!config) return false // fallback to required if no config
    if (!config.required_roles.split(',').includes(roleKey)) return false

    let threshold = config.role_thresholds?.[roleKey]
    if (threshold === undefined) threshold = 0 // default to 0 if no budget set

    if (threshold === 0) return true
    const totalRaw = parseFloat(row.quoteTotal.replace(/[^0-9.-]+/g, "")) || 0
    return totalRaw > threshold
  }, [config])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getQuotations()
      const mapped: PurchaseOrderRow[] = res.map((q, index) => ({
        id: q.id,
        no: String(index + 1),
        quotationRef: q.quote_ref || "",
        project: q.project_name || "",
        mainFolder: q.main_folder_name || "-",
        subFolder: q.sub_folder_name || "-",
        variationRef: q.variation_ref || "-",
        supplierName: q.supplier_name || "",
        supplierEmail: q.supplier_email || "",
        dateOfQuoteApproved: q.date_of_quote || "",
        quoteTotal: `£${q.quote_total}`,
        createPo: q.po_created ? "PO Created" : "Create PO",
        datePOCreated: q.date_po_created || "-",
        sendReminder: "Reminder",
        procurementComments: q.procurement_comments || "",
        requestToReQuote: "Re-quote",
        approvalQuotation: q.status || "Pending",
        approvalRelatedRequests: q.quote_approval_reasons || "-",
        lineItems: q.line_items || [],
        sigProcurementDepartment: q.sig_procurement_department || false,
        sigProcurementDepartmentDate: q.sig_procurement_department_date || "",
        sigContractsManager: q.sig_contracts_manager || false,
        sigContractsManagerDate: q.sig_contracts_manager_date || "",
        sigProjectDirector: q.sig_project_director || false,
        sigProjectDirectorDate: q.sig_project_director_date || "",
        sigManagingDirector: q.sig_managing_director || false,
        sigManagingDirectorDate: q.sig_managing_director_date || "",
        sigCommercialDepartment: q.sig_commercial_department || false,
        sigCommercialDepartmentDate: q.sig_commercial_department_date || "",
        fullyApproved: q.fully_approved || false,
      }))
      setData(mapped)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const columns: ColDef<PurchaseOrderRow>[] = [
    { headerName: "No.", field: "no", maxWidth: 60, filter: false },
    {
      headerName: "PO Ref",
      field: "quotationRef",
      cellRenderer: (params: { data?: PurchaseOrderRow; value: string }) => {
        const row = params.data
        const ref = params.value || ""
        return (
          <span
            className="cursor-pointer font-medium text-blue-400 hover:underline"
            onClick={() => row && setViewPO(row)}
          >
            {ref}
          </span>
        )
      },
    },
    { headerName: "Project", field: "project" },
    { headerName: "Main Folder", field: "mainFolder" },
    { headerName: "Sub Folder", field: "subFolder" },
    { headerName: "Variation Ref", field: "variationRef" },
    { headerName: "Supplier Name", field: "supplierName" },
    { headerName: "Supplier Email", field: "supplierEmail" },
    { headerName: "Date Quote Approved", field: "dateOfQuoteApproved" },
    { headerName: "PO Total", field: "quoteTotal" },
    
    // -- Signatures --
    {
      headerName: "Procurement",
      colId: "sig_procurement",
      minWidth: 150,
      hide: !isRoleConfigured("procurement_department"),
      cellRenderer: (params: { data?: PurchaseOrderRow }) => {
        const row = params.data
        if (!row) return null
        return (
          <ApprovalToggleCell
            row={row}
            field="sigProcurementDepartment"
            dateField="sigProcurementDepartmentDate"
            canToggle={isProcurement}
            isDisabled={false}
            onRequest={(field, next) => requestSignatureToggle(row, field, next, "Procurement")}
          />
        )
      },
    },
    {
      headerName: "Contracts Manager",
      colId: "sig_contracts_manager",
      minWidth: 170,
      hide: !isRoleConfigured("contracts_manager"),
      cellRenderer: (params: { data?: PurchaseOrderRow }) => {
        const row = params.data
        if (!row) return null
        if (!isRoleRequired("contracts_manager", row)) return <span className="text-[11px] italic text-slate-500">N/A</span>
        return (
          <ApprovalToggleCell
            row={row}
            field="sigContractsManager"
            dateField="sigContractsManagerDate"
            canToggle={isContractsManager}
            isDisabled={false}
            onRequest={(field, next) => requestSignatureToggle(row, field, next, "Contracts Manager")}
          />
        )
      },
    },
    {
      headerName: "Project Director",
      colId: "sig_project_director",
      minWidth: 160,
      hide: !isRoleConfigured("project_director"),
      cellRenderer: (params: { data?: PurchaseOrderRow }) => {
        const row = params.data
        if (!row) return null
        if (!isRoleRequired("project_director", row)) return <span className="text-[11px] italic text-slate-500">N/A</span>
        return (
          <ApprovalToggleCell
            row={row}
            field="sigProjectDirector"
            dateField="sigProjectDirectorDate"
            canToggle={isProjectDirector}
            isDisabled={false}
            onRequest={(field, next) => requestSignatureToggle(row, field, next, "Project Director")}
          />
        )
      },
    },
    {
      headerName: "Managing Director",
      colId: "sig_managing_director",
      minWidth: 170,
      hide: !isRoleConfigured("managing_director"),
      cellRenderer: (params: { data?: PurchaseOrderRow }) => {
        const row = params.data
        if (!row) return null
        if (!isRoleRequired("managing_director", row)) return <span className="text-[11px] italic text-slate-500">N/A</span>
        return (
          <ApprovalToggleCell
            row={row}
            field="sigManagingDirector"
            dateField="sigManagingDirectorDate"
            canToggle={isManagingDirector}
            isDisabled={false}
            onRequest={(field, next) => requestSignatureToggle(row, field, next, "Managing Director")}
          />
        )
      },
    },
    {
      headerName: "Commercial",
      colId: "sig_commercial",
      minWidth: 150,
      hide: !isRoleConfigured("commercial_department"),
      cellRenderer: (params: { data?: PurchaseOrderRow }) => {
        const row = params.data
        if (!row) return null
        if (!isRoleRequired("commercial_department", row)) return <span className="text-[11px] italic text-slate-500">N/A</span>
        return (
          <ApprovalToggleCell
            row={row}
            field="sigCommercialDepartment"
            dateField="sigCommercialDepartmentDate"
            canToggle={isCommercial}
            isDisabled={false}
            onRequest={(field, next) => requestSignatureToggle(row, field, next, "Commercial")}
          />
        )
      },
    },
    // ----------------
    
    { headerName: "Date PO Created", field: "datePOCreated" },
    {
      headerName: "Procurement Comments",
      field: "procurementComments",
      editable: true,
    },
    {
      headerName: "Source PDF",
      field: "sourceFile",
      cellRenderer: (params: { data?: PurchaseOrderRow }) =>
        params.data?.sourceFile ? (
          <a
            href={params.data.sourceFileUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[12px] text-blue-400 underline-offset-2 hover:text-blue-300 hover:underline"
          >
            <FileTextIcon className="h-3 w-3 shrink-0" />
            {params.data.sourceFile}
          </a>
        ) : null,
    },
    {
      headerName: "Action",
      field: "id",
      cellRenderer: (params: { data?: PurchaseOrderRow }) => {
        if (!params.data) return null
        
        // If it's already approved, just show text or nothing
        if (params.data.approvalQuotation === "Approved") {
          return <span className="text-emerald-400 text-xs font-medium">Approved</span>
        }
        
        // Show Approve button for any unapproved Purchase Order
        return (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              setPendingApprovalId(params.data!.id)
              setApproveConfirmOpen(true)
            }}
          >
            Approve
          </Button>
        )
      }
    }
  ]

  const handleCreated = (row: PurchaseOrderRow) => {
    setData((prev) => [...prev, row])
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Purchase Order List</h2>

        {role === "procurement_department" && (
          <Button onClick={() => setDialogOpen(true)} disabled={!selectedProject}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create PO
          </Button>
        )}
      </div>

      <SelectProject
        onProjectSelect={(p) => setSelectedProject(p)}
      />

      {/* FILTER DATA BY SELECTED PROJECT */}
      {(() => {
        const filteredData = selectedProject 
          ? data.filter(r => r.project === selectedProject.project_name)
          : []
          
        return (
          <>
            <div className="flex items-end justify-between">
              <TableStat
                summaryRows={[
                  {
                    label: "PO",
                    value: `£${filteredData
                      .reduce((acc, row) => {
                        const val = parseFloat(row.quoteTotal.replace(/[^0-9.-]+/g, ""))
                        return acc + (isNaN(val) ? 0 : val)
                      }, 0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  },
                ]}
              />

              <ExportCsvButton
                rows={filteredData}
                columns={columns.map((col) => ({
                  header: col.headerName || String(col.field) || "",
                  field: col.field as keyof PurchaseOrderRow,
                }))}
                fileName="purchase_orders.csv"
              />
            </div>
            
            <AgTable
              rowData={filteredData}
              columnDefs={columns.filter(c => !c.hide)}
              height="auto"
              defaultColDef={{ flex: 1, minWidth: 150 }}
              suppressCellClickAction
              loading={loading}
            />

            {/* Toggle Confirmation */}
            <AlertDialog
              open={!!pendingToggle}
              onOpenChange={(open) => !open && setPendingToggle(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {pendingToggle?.nextValue
                      ? `Sign as ${pendingToggle?.label}?`
                      : `Revoke ${pendingToggle?.label} signature?`}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {pendingToggle?.nextValue
                      ? `You are adding your signature as ${pendingToggle?.label} to PO ${pendingToggle?.ref}.`
                      : `This will remove your ${pendingToggle?.label} signature from PO ${pendingToggle?.ref}.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setPendingToggle(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={confirmToggle} disabled={submittingToggle}>
                    {submittingToggle ? "Saving..." : pendingToggle?.nextValue ? "Confirm" : "Revoke"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )
      })()}

      {/* View PO details dialog */}
      <ViewPODialog
        open={!!viewPO}
        onOpenChange={(open: boolean) => !open && setViewPO(null)}
        po={viewPO}
      />

      {dialogOpen && (
        <CreatePODialog
          rows={data}
          onCreated={fetchData}
          onClose={() => setDialogOpen(false)}
          selectedProject={selectedProject}
        />
      )}

      {/* Approval Confirmation */}
      <AlertDialog open={approveConfirmOpen} onOpenChange={setApproveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve the Purchase Order and send its line items to the Call Off List. This action cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleApprovePO()
              }}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Approving..." : "Yes, Approve PO"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
