"use client"

import { useState, useCallback } from "react"
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
import { useFileUpload } from "@/hooks/use-file-upload"
import { cn } from "@/lib/utils"
import {
  PlusCircle,
  UploadIcon,
  FileTextIcon,
  Loader2,
  CheckCircle2,
  AlertCircleIcon,
  XIcon,
} from "lucide-react"
import { useRoleStore } from "@/lib/role-store"

// ─── Types ────────────────────────────────────────────────────────────────────

type PurchaseOrderRow = {
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

/** Simulates reading a PDF quote. Replace with a real AI/OCR call in production. */
async function parsePDFQuote(file: File): Promise<POFormData> {
  await new Promise((r) => setTimeout(r, 1800))
  const hint = file.name
    .replace(/\.(pdf)$/i, "")
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
  return {
    supplierName: hint || "Supplier Ltd",
    supplierEmail: "",
    project: "",
    mainFolder: "",
    subFolder: "",
    variationRef: "",
    quoteTotal: "",
  }
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const INITIAL_DATA: PurchaseOrderRow[] = [
  {
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

const summaryMetrics = [
  { label: "PO", value: "£2,550,000" },
]

// ─── Create PO Dialog ─────────────────────────────────────────────────────────

type Step = "drop" | "parsing" | "review"

function CreatePODialog({
  rows,
  onCreated,
  onClose,
}: {
  rows: PurchaseOrderRow[]
  onCreated: (row: PurchaseOrderRow) => void
  onClose: () => void
}) {
  const [step, setStep] = useState<Step>("drop")
  const [parseError, setParseError] = useState<string | null>(null)
  const [sourceFile, setSourceFile] = useState("")
  const [sourceFileUrl, setSourceFileUrl] = useState("")
  const [form, setForm] = useState<POFormData>({
    supplierName: "",
    supplierEmail: "",
    project: "",
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
      setForm(extracted)
      setSourceFile(droppedFile.name)
      setSourceFileUrl(URL.createObjectURL(droppedFile))
      setStep("review")
    } catch {
      setParseError(
        "Could not extract data — please fill in the fields manually."
      )
      setSourceFile(droppedFile.name)
      setSourceFileUrl(URL.createObjectURL(droppedFile))
      setStep("review")
    }
  }, [droppedFile])

  const handleCreate = () => {
    const newRow: PurchaseOrderRow = {
      no: nextNo(rows),
      quotationRef: nextRef(rows),
      project: form.project,
      mainFolder: form.mainFolder,
      subFolder: form.subFolder,
      variationRef: form.variationRef || "-",
      supplierName: form.supplierName,
      supplierEmail: form.supplierEmail,
      dateOfQuoteApproved: today(),
      quoteTotal: form.quoteTotal,
      createPo: "PO Created",
      datePOCreated: today(),
      sendReminder: "Reminder",
      procurementComments: "",
      requestToReQuote: "Re-quote",
      approvalQuotation: "Pending",
      approvalRelatedRequests: "-",
      sourceFile,
      sourceFileUrl,
    }
    onCreated(newRow)
    onClose()
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
                {field("Project", "project", "e.g. Downtown Tower A", true)}
                {field("Quote Total", "quoteTotal", "e.g. £45,000.00", true)}
                {field("Main Folder", "mainFolder", "e.g. Structural", true)}
                {field("Sub Folder", "subFolder", "e.g. Concrete", true)}
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

const columns: ColDef<PurchaseOrderRow>[] = [
  { headerName: "No.", field: "no", maxWidth: 60, filter: false },
  { headerName: "PO Ref", field: "quotationRef" },
  { headerName: "Project", field: "project" },
  { headerName: "Main Folder", field: "mainFolder" },
  { headerName: "Sub Folder", field: "subFolder" },
  { headerName: "Variation Ref", field: "variationRef" },
  { headerName: "Supplier Name", field: "supplierName" },
  { headerName: "Supplier Email", field: "supplierEmail" },
  { headerName: "Date Quote Approved", field: "dateOfQuoteApproved" },
  { headerName: "PO Total", field: "quoteTotal" },
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
]

export default function Page() {
  const [data, setData] = useState<PurchaseOrderRow[]>(INITIAL_DATA)
  const [dialogOpen, setDialogOpen] = useState(false)

  const role = useRoleStore((state) => state.role)

  const handleCreated = (row: PurchaseOrderRow) => {
    setData((prev) => [...prev, row])
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Purchase Order List</h2>

        {role === "procurement_department" && (
          <Button onClick={() => setDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create PO
          </Button>
        )}
      </div>

      <SelectProject />
      <TableStat summaryRows={summaryMetrics} />

      <AgTable
        rowData={data}
        columnDefs={columns}
        height="auto"
        defaultColDef={{ flex: 1, minWidth: 150 }}
      />

      {dialogOpen && (
        <CreatePODialog
          rows={data}
          onCreated={handleCreated}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  )
}
