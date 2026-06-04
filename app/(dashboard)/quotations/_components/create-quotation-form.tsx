"use client"

import {
  useMemo,
  useState,
} from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import FileUpload from "@/components/ui/file-uploader"
import Search from "@/components/ui/search"
import DatePickr from "@/components/ui/date-picker"
import ErrorMessage from "@/components/shared/form-error-message"
import { Input } from "@/components/ui/input"
import { LineItemTable } from "./LineItemTable"

function generateQuoteRef() {
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `QR-${year}-${rand}`
}

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
      const payload = { ...data, quoteRef, lineItems }
      console.log("Creating quotation:", payload)
      onSuccess?.(payload)
      reset()
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
      {/* ── Quote Ref ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-md border border-input bg-muted/40 px-4 py-2">
        <p className="text-xs text-muted-foreground">Quote Ref : {quoteRef}</p>
      </div>

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

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="supplierName">Supplier Name</FieldLabel>
          <FieldContent>
            <Input
              id="supplierName"
              {...register("supplierName")}
              placeholder="Enter supplier name"
            />
            {errors.supplierName && (
              <ErrorMessage message={errors.supplierName.message} />
            )}
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="supplierEmail">Supplier Email</FieldLabel>
          <FieldContent>
            <Input
              id="supplierEmail"
              {...register("supplierEmail")}
              placeholder="supplier@example.com"
              type="email"
            />
            {errors.supplierEmail && (
              <ErrorMessage message={errors.supplierEmail.message} />
            )}
          </FieldContent>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* <Field>
          <FieldLabel htmlFor="variationRef">Variation Ref</FieldLabel>
          <FieldContent>
            <Input
              id="variationRef"
              {...register("variationRef")}
              placeholder="Search variation reference..."
            />
            {errors.variationRef && (
              <ErrorMessage message={errors.variationRef.message} />
            )}
          </FieldContent>
        </Field> */}

        {/* <Field>
          <FieldLabel htmlFor="quoteTotal">Quote Total</FieldLabel>
          <FieldContent>
            <Input
              id="quoteTotal"
              type="number"
              step="0.01"
              min="0"
              {...register("quoteTotal" as never)}
              placeholder="0.00"
            />
            {errors.quoteTotal && (
              <ErrorMessage message={errors.quoteTotal.message} />
            )}
          </FieldContent>
        </Field> */}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="date">Date</FieldLabel>
          <FieldContent>
            <DatePickr />
            {errors.date && <ErrorMessage message={errors.date.message} />}
          </FieldContent>
        </Field>
        <div />
      </div>

      {/* ── Line items table  */}
      <LineItemTable items={lineItems} onChange={setLineItems} />

      {/* <FileUpload /> */}

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
