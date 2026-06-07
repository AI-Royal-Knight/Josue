"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Plus,
  Send,
  Trash2,
  ChevronDown,
  Search as SearchIcon,
  X,
} from "lucide-react"

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

const FOLDER_STRUCTURE: Record<string, string[]> = {
  APARTMENTS: [
    "Electrical",
    "Electrical First Fix",
    "Plumbing",
    "Joinery",
    "Finishes",
  ],
  CORRIDORS: ["Electrical", "Electrical First Fix", "Mechanical", "Painting"],
  "COMMON AREAS": ["Tiling", "Ceilings", "HVAC", "Fire Protection"],
  BASEMENT: ["Structural", "Waterproofing", "Drainage", "Mechanical"],
  ROOF: ["Roofing", "Insulation", "Drainage", "Solar"],
}

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
  supplierName: z.string().min(1, "Supplier name is required"),
  supplierEmail: z.string().email("Enter a valid email"),
  quoteTotal: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
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
  onSuccess?: (data: CreateQuotationFormOutput & { quoteRef: string }) => void
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
  onSuccess,
  onCancel,
}: CreateQuotationFormProps) {
  const quoteRef = useMemo(() => generateQuoteRef(), [])
  const loggedInUserName = "Current User"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateQuotationFormInput, unknown, CreateQuotationFormOutput>({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: {
      name: loggedInUserName,
      quoteTotal: 0,
    },
  })

  // ── Folder state ──
  const [mainFolder, setMainFolder] = useState("")
  const [subFolder, setSubFolder] = useState("")
  const subFolders = mainFolder ? (FOLDER_STRUCTURE[mainFolder] ?? []) : []

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
      const payload = {
        ...data,
        quoteRef,
        lineItems,
        mainFolder,
        subFolder,
        variationRef,
        supplierEmails: supplierEmails.filter(Boolean),
        // Keep first valid email as supplierEmail for backward compat
        supplierEmail: supplierEmails.find(Boolean) ?? data.supplierEmail,
      }
      console.log("Creating quotation:", payload)
      onSuccess?.(payload as CreateQuotationFormOutput & { quoteRef: string })
      reset()
      setMainFolder("")
      setSubFolder("")
      setVariationRef("")
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
    } catch {
      setSubmitError("Failed to create quotation. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* ── Quote Ref ── */}
      <div className="flex items-center justify-between rounded-md border border-input bg-muted/40 px-4 py-2">
        <p className="text-xs text-muted-foreground">Quote Ref : {quoteRef}</p>
      </div>

      {/* ── Row 1: Project + Name ── */}
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="project">Project</FieldLabel>
          <FieldContent>
            <Search label="Project" />
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
                setSubFolder("") // reset sub when main changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select main folder" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(FOLDER_STRUCTURE).map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
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
              disabled={!mainFolder}
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
                  <SelectItem key={sf} value={sf}>
                    {sf}
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
            <DatePickr />
            {errors.date && <ErrorMessage message={errors.date.message} />}
          </FieldContent>
        </Field>
      </div>

      {/* ── Supplier Emails (multi) ── */}
      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel>
            Supplier Email
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (up to {MAX_EMAILS} recipients)
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
                  type="email"
                  placeholder={`supplier${idx + 1}@example.com`}
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

      {/* site contact */}
      <div className="grid grid-cols-2 gap-4">
        <span className="col-span-full text-sm font-medium text-muted-foreground">
          Site Contact Information
        </span>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <FieldContent>
            <Input
              type="email"
              //   placeholder={`supplier${idx + 1}@example.com`}
              //   value={email}
              //   onChange={(e) => updateEmail(idx, e.target.value)}
              className="flex-1"
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel>Phone</FieldLabel>
          <FieldContent>
            <Input
              type="email"
              //   placeholder={`supplier${idx + 1}@example.com`}
              //   value={email}
              //   onChange={(e) => updateEmail(idx, e.target.value)}
              className="flex-1"
            />
          </FieldContent>
        </Field>
      </div>

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
