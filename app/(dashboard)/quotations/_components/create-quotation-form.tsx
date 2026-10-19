"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import {
  Plus,
  Send,
  Trash2,
  ChevronDown,
  Search as SearchIcon,
  X,
} from "lucide-react"

import { getProcurementProjects, ProcurementProject, createQuotation } from "@/lib/api/quotations"
import { getSuppliers } from "@/lib/api/suppliers"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import Search from "@/components/ui/search"
import DatePickr from "@/components/ui/date-picker"
import ErrorMessage from "@/components/shared/form-error-message"
import { Input } from "@/components/ui/input"
import { LineItemTable } from "./LineItemTable"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import FileUpload from "@/components/ui/file-uploader"

// ─── Static data ───────────────────────────────────────────────────────────────

// Folder structure now comes dynamically from projects

const VARIATION_REFS = [
  "VAR-001",
  "VAR-002",
  "VAR-003",
  "VAR-004",
  "VAR-005",
  "VAR-006",
  "VAR-007",
  "VAR-008",
  "VAR-009",
  "VAR-010",
  "VAR-011",
  "VAR-012",
]

const MAX_EMAILS = 5

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateQuoteRef() {
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `QR-${year}-${rand}`
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export type LineItem = {
  id: string
  description: string
  qty: string
  discount: string
  per: string
  each: string
  comments: string
}

export function makeRow(): LineItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    qty: "",
    discount: "",
    per: "",
    each: "",
    comments: "",
  }
}

const createQuotationSchema = z.object({
  project: z.string().min(1, "Select a project"),
  name: z.string().min(1, "Name is required"),
  variationRef: z.string().optional(),
  supplier: z.string().optional().or(z.literal("")),
  supplierName: z.string().optional().or(z.literal("")),
  supplierEmail: z.string().optional().or(z.literal("")),
  quoteTotal: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const parsed = Number(val.replace(/,/g, ""));
        return isNaN(parsed) ? val : parsed;
      }
      return val === "" ? undefined : Number(val);
    },
    z.number({ message: "Quote total is required" }).nonnegative("Must be ≥ 0")
  ),
  date: z.date({ message: "Date is required" }).optional(),
  attachments: z
    .instanceof(File)
    .refine((f) => f.type === "application/pdf", "Only PDF files are allowed")
    .optional(),
})

type CreateQuotationFormInput = z.input<typeof createQuotationSchema>
type CreateQuotationFormOutput = z.output<typeof createQuotationSchema>

interface CreateQuotationFormProps {
  initialProjectId?: string
  onSuccess?: (data: any) => void
  onCancel?: () => void
}

// Variation Ref searchable dropdown

function VariationRefSearch({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = VARIATION_REFS.filter((r) =>
    r.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs",
          "ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none",
          !value && "text-muted-foreground"
        )}
      >
        <span>{value || "Search variation reference…"}</span>
        <ChevronDown className="size-4 shrink-0 opacity-50" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-popover shadow-md">
          {/* Search input */}
          <div className="flex items-center border-b border-input px-3">
            <SearchIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button type="button" onClick={() => setQuery("")}>
                <X className="size-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto py-1">
            {/* None / clear option */}
            <button
              type="button"
              className="w-full px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent"
              onClick={() => {
                onChange("")
                setOpen(false)
                setQuery("")
              }}
            >
              — None —
            </button>

            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No results
              </p>
            ) : (
              filtered.map((ref) => (
                <button
                  key={ref}
                  type="button"
                  onClick={() => {
                    onChange(ref)
                    setOpen(false)
                    setQuery("")
                  }}
                  className={cn(
                    "w-full px-3 py-1.5 text-left text-sm hover:bg-accent",
                    value === ref && "bg-accent font-medium"
                  )}
                >
                  {ref}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main form ─────────────────────────────────────────────────────────────────

export default function CreateQuotationForm({
  initialProjectId,
  onSuccess,
  onCancel,
}: CreateQuotationFormProps) {
  const loggedInUserName = "Current User"

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateQuotationFormInput, unknown, CreateQuotationFormOutput>({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: {
      name: loggedInUserName,
      quoteTotal: 0,
      date: new Date(),
      project: initialProjectId || "",
      supplier: "",
      supplierName: "",
    },
  })

  // ── Data state ──
  const [projects, setProjects] = useState<ProcurementProject[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("")
  const [manualSupplierName, setManualSupplierName] = useState<string>("")

  useEffect(() => {
    getProcurementProjects().then(setProjects).catch(console.error)
    getSuppliers().then(setSuppliers).catch(console.error)
  }, [])

  // ── Folder state ──
  const [selectedProjectVal, setSelectedProjectVal] = useState<string>(initialProjectId || "")
  const [mainFolder, setMainFolder] = useState<string>("")
  const [subFolder, setSubFolder] = useState<string>("")

  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectVal(initialProjectId)
      setValue("project", initialProjectId)
    }
  }, [initialProjectId, setValue])

  const activeProject = projects.find(p => String(p.id) === selectedProjectVal)
  const mainFolders = activeProject?.folders || []
  const activeMainFolder = mainFolders.find(f => String(f.id) === mainFolder)
  const subFolders = activeMainFolder?.subfolders || []

  // ── Variation ref state ──
  const [variationRef, setVariationRef] = useState("")

  // ── Multi-email state ──
  const [supplierEmails, setSupplierEmails] = useState<string[]>([""])

  const addEmail = () => {
    if (supplierEmails.length < MAX_EMAILS) {
      setSupplierEmails((prev) => [...prev, ""])
    }
  }
  const removeEmail = (idx: number) => {
    setSupplierEmails((prev) => prev.filter((_, i) => i !== idx))
  }
  const updateEmail = (idx: number, val: string) => {
    setSupplierEmails((prev) => prev.map((e, i) => (i === idx ? val : e)))
  }

  // ── Line items ──
  const [lineItems, setLineItems] = useState<LineItem[]>(() => [
    makeRow(),
    makeRow(),
    makeRow(),
    makeRow(),
    makeRow(),
    makeRow(),
    makeRow(),
    makeRow(),
  ])

  const [submitError, setSubmitError] = useState<string | null>(null)

  const onSubmit = async (data: CreateQuotationFormOutput) => {
    try {
      setSubmitError(null)

      const validEmails = supplierEmails.map(e => e.trim()).filter(Boolean)
      const hasSupplierId = Boolean(data.supplier && data.supplier !== "unregistered")

      if (!hasSupplierId && validEmails.length === 0) {
        setSubmitError("Please select a registered supplier or provide at least one supplier email.")
        return
      }

      const computedTotal = lineItems.reduce((acc, row) => {
        const qty = parseFloat(row.qty) || 0
        const each = parseFloat(row.each) || 0
        const discount = parseFloat(row.discount) || 0
        return acc + qty * each * (1 - discount / 100)
      }, 0)

      const formattedDate = data.date ? format(data.date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")

      const payload = {
        quote_total: computedTotal,
        project: data.project,
        supplier: hasSupplierId ? data.supplier : null,
        supplier_name: manualSupplierName.trim() || undefined,
        supplier_email: validEmails.join(", ") || undefined,
        date_of_quote: formattedDate,
        main_folder: mainFolder || undefined,
        sub_folder: subFolder || undefined,
        variation_ref: variationRef || undefined,
        // quote_ref will be auto-generated by the backend
        line_items: lineItems
          .filter(item => item.description.trim() !== "")
          .map(item => ({
            description: item.description,
            qty: Number(item.qty) || 1,
            discount: Number(item.discount) || 0,
            per: item.per,
            each: Number(item.each) || 0,
            comments: item.comments
          }))
      }
      console.log("Creating quotation:", payload)
      await createQuotation(payload as any)
      onSuccess?.(payload as any)
      reset()
      setMainFolder("")
      setSubFolder("")
      setVariationRef("")
      setSelectedSupplierId("")
      setManualSupplierName("")
      setSupplierEmails([""])
      setLineItems([
        makeRow(),
        makeRow(),
        makeRow(),
        makeRow(),
        makeRow(),
        makeRow(),
        makeRow(),
        makeRow(),
      ])
    } catch (error: any) {
      let errorMessage = "Failed to create quotation. Please try again."
      if (error && typeof error === "object" && "data" in error && error.data) {
        if (typeof error.data === "object" && error.data !== null) {
          const errs = Object.entries(error.data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(", ") : val}`)
            .join(" | ")
          if (errs) errorMessage = errs
        } else if (typeof error.data === "string") {
          errorMessage = error.data
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      setSubmitError(errorMessage)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* ── Quote Ref ── */}
      <div className="flex items-center justify-between rounded-md border border-input bg-muted/40 px-4 py-2">
        <p className="text-xs text-muted-foreground">Quote Ref : <span className="italic">(Auto-generated upon save)</span></p>
      </div>

      {/* ── Row 1: Project + Name ── */}
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="project">Project</FieldLabel>
          <FieldContent>
            <Select
              value={selectedProjectVal}
              onValueChange={(v) => {
                setSelectedProjectVal(v)
                setMainFolder("")
                setSubFolder("")
                setValue("project", v, { shouldValidate: true })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.project_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register("project")} value={selectedProjectVal} />
            {errors.project && (
              <ErrorMessage message={errors.project.message} />
            )}
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <FieldContent>
            <Input
              id="name"
              {...register("name")}
              placeholder="Your name"
              readOnly
              className="cursor-default bg-muted/40 text-muted-foreground"
              title="Auto-filled from your profile when requesting a quote"
            />
            {errors.name && <ErrorMessage message={errors.name.message} />}
          </FieldContent>
        </Field>
      </div>

      {/* ── Row 2: Main Folder + Sub Folder ── */}
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel>Main Folder</FieldLabel>
          <FieldContent>
            <Select
              value={mainFolder}
              onValueChange={(v) => {
                setMainFolder(v)
                setSubFolder("")
              }}
              disabled={!activeProject || mainFolders.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select main folder" />
              </SelectTrigger>
              <SelectContent>
                {mainFolders.map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Sub Folder</FieldLabel>
          <FieldContent>
            <Select
              value={subFolder}
              onValueChange={setSubFolder}
              disabled={!mainFolder || subFolders.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    mainFolder
                      ? "Select sub folder"
                      : "Select main folder first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {subFolders.map((sf) => (
                  <SelectItem key={sf.id} value={String(sf.id)}>
                    {sf.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
      </div>

      {/* ── Row 3: Variation Ref + Date ── */}
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel>Variation Ref</FieldLabel>
          <FieldContent>
            <VariationRefSearch
              value={variationRef}
              onChange={setVariationRef}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="date">Date</FieldLabel>
          <FieldContent>
            <DatePickr
              id="date"
              value={watch("date")}
              onChange={(newDate) => setValue("date", newDate || new Date(), { shouldValidate: true })}
            />
            {errors.date && <ErrorMessage message={errors.date.message} />}
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="supplier">Registered Supplier</FieldLabel>
          <FieldContent>
            <Select
              value={selectedSupplierId}
              onValueChange={(v) => {
                setSelectedSupplierId(v)
                if (v === "unregistered") {
                  setValue("supplier", "")
                } else {
                  setValue("supplier", v)
                  const found = suppliers.find((s) => String(s.id) === v)
                  if (found) {
                    const name = found.supplier?.company_name || ""
                    setManualSupplierName(name)
                    setValue("supplierName", name)
                    if (found.supplier?.email) {
                      setSupplierEmails([found.supplier.email])
                    }
                  }
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={suppliers.length === 0 ? "No registered suppliers (Enter below)" : "Select supplier (optional)"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unregistered">
                  {suppliers.length === 0 ? "No registered suppliers (Unregistered)" : "— Unregistered / Enter Manually —"}
                </SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.supplier.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.supplier && <ErrorMessage message={errors.supplier.message} />}
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="supplierName">Supplier / Company Name</FieldLabel>
          <FieldContent>
            <Input
              id="supplierName"
              placeholder="Company name (or leave blank to use email)"
              value={manualSupplierName}
              onChange={(e) => {
                setManualSupplierName(e.target.value)
                setValue("supplierName", e.target.value)
              }}
            />
            {errors.supplierName && <ErrorMessage message={errors.supplierName.message} />}
          </FieldContent>
        </Field>
      </div>
      {/* ── Supplier Emails (multi) ── */}
      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel>
            Supplier Contact (Email / Name)
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (up to {MAX_EMAILS} contacts)
            </span>
          </FieldLabel>
          {supplierEmails.length < MAX_EMAILS && (
            <button
              type="button"
              onClick={addEmail}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="size-3.5" />
              Add email
            </button>
          )}
        </div>
        <FieldContent>
          <div className="space-y-2">
            {supplierEmails.map((email, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder={`supplier${idx + 1} contact (e.g. sales@supplier.com)`}
                  value={email}
                  onChange={(e) => updateEmail(idx, e.target.value)}
                  className="flex-1"
                />
                {supplierEmails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEmail(idx)}
                    className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </FieldContent>
      </Field>

      <FileUpload />

      {/* ── Line items table ── */}
      <LineItemTable items={lineItems} onChange={setLineItems} />

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          <Send className="size-4" />
          Submit Quotation
        </Button>
      </div>
    </form>
  )
}
