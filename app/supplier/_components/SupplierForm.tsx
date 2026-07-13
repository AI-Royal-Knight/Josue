"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDown, ChevronUp, Plus, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import FileUpload from "@/components/ui/file-uploader"
import Search from "@/components/ui/search"
import DatePickr from "@/components/ui/date-picker"
import ErrorMessage from "@/components/shared/form-error-message"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/lib/auth-store"
import { useSupplierStore } from "@/lib/supplier-store"
import { addInvoice, type UserInvoice } from "@/lib/invoice-store"

const supplierInvoiceSchema = z.object({
  project: z.string().min(1, "Select a project"),
  name: z.string().min(1, "Name is required"),
  invoiceNo: z.string().min(1, "Invoice number is required"),
  poRef: z.string().min(1, "PO reference is required"),
  callOffRef: z.string().min(1, "Call off reference is required"),
  variationRef: z.string().min(1, "Variation reference is required"),
  otherRef: z.string().optional(),
  date: z.date({ error: "Date is required" }),
  paymentDueDate: z.date({ error: "Payment due date is required" }),
  invoiceTotal: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        return val === "" ? undefined : Number(val)
      }
      return val
    },
    z.number().nonnegative({ message: "Must be a positive number" })
  ),
  attachments: z.object({
    pdf: z.instanceof(File).refine((file) => file.type === "application/pdf", {
      message: "Only PDF files are allowed",
    }),
  }),
})

type SupplierInvoiceFormInput = z.input<typeof supplierInvoiceSchema>
type SupplierInvoiceForm = z.output<typeof supplierInvoiceSchema>

type InvoiceCard = {
  id: string
  isOpen: boolean
}

const createInvoiceCard = (index: number, isOpen = false): InvoiceCard => ({
  id: `invoice-${index + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  isOpen,
})

function InvoiceSection({
  invoiceLabel,
  isOpen,
  onToggle,
}: {
  invoiceLabel: string
  isOpen: boolean
  onToggle: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SupplierInvoiceFormInput, unknown, SupplierInvoiceForm>({
    resolver: zodResolver(supplierInvoiceSchema),
    defaultValues: { invoiceTotal: 0 },
  })

  const { user } = useAuthStore()
  const activeCompanyId = useSupplierStore((state) => state.activeCompanyId)

  const [message, setMessage] = useState<string | null>(null)

  const onSubmit = async (data: SupplierInvoiceForm) => {
    try {
      if (!activeCompanyId) {
        setMessage("Please select a company first")
        return
      }

      console.log("Submitting invoice", data)

      const newInvoice: UserInvoice = {
        no: Math.random().toString(36).slice(2, 8),
        invoiceNumber: data.invoiceNo,
        date: data.date.toLocaleDateString("en-GB"),
        variationSheetNo: data.variationRef,
        nfiProformaNo: data.otherRef || "",
        project: data.project,
        workArea: "",
        workSection: "",
        description: "",
        createdBy: data.name,
        managerApproved: false,
        managerApprovedBy: "",
        managerApprovedDate: "",
        financeApproved: false,
        approvedBy: "",
        total: `£${data.invoiceTotal?.toLocaleString("en-US", { minimumFractionDigits: 2 }) ?? "0.00"}`,
        datePaid: "",
        paidBy: "",
        financeComments: "",
        commercialComments: "",
        companyId: activeCompanyId,
        supplierEmail: user?.email || "",
      }

      addInvoice(newInvoice)
      setMessage("Invoice submitted successfully")
      reset()
    } catch {
      setMessage("Failed to submit invoice")
    }
  }

  return (
    <section className="border border-input">
      <div className="flex items-center justify-between gap-3 border-b border-input px-4 py-3">
        <div>
          <h3 className="font-medium text-foreground">{invoiceLabel}</h3>
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={onToggle}>
          {isOpen ? (
            <>
              <ChevronUp />
            </>
          ) : (
            <>
              <ChevronDown />
            </>
          )}
        </Button>
      </div>

      {isOpen && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4 p-4"
        >
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
                placeholder="Enter your name"
              />
              {errors.name && <ErrorMessage message={errors.name.message} />}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="invoiceNo">Invoice No.</FieldLabel>
            <FieldContent>
              <Input
                id="invoiceNo"
                {...register("invoiceNo")}
                placeholder="Enter invoice number"
              />
              {errors.invoiceNo && (
                <ErrorMessage message={errors.invoiceNo.message} />
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="poRef">PO ref</FieldLabel>
            <FieldContent>
              <Input
                id="poRef"
                {...register("poRef")}
                placeholder="Search PO reference..."
              />
              {errors.poRef && <ErrorMessage message={errors.poRef.message} />}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="callOffRef">Call off ref</FieldLabel>
            <FieldContent>
              <Input
                id="callOffRef"
                {...register("callOffRef")}
                placeholder="Search call off reference..."
              />
              {errors.callOffRef && (
                <ErrorMessage message={errors.callOffRef.message} />
              )}
            </FieldContent>
          </Field>

          <Field>
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
          </Field>

          <Field>
            <FieldLabel htmlFor="paymentDueDate">Payment Due date</FieldLabel>
            <FieldContent>
              <DatePickr />
              {errors.paymentDueDate && (
                <ErrorMessage message={errors.paymentDueDate.message} />
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="date">Date</FieldLabel>
            <FieldContent>
              <DatePickr />
              {errors.date && <ErrorMessage message={errors.date.message} />}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="otherRef">Other Ref</FieldLabel>
            <FieldContent>
              <Input
                id="otherRef"
                {...register("otherRef")}
                placeholder="Enter other reference"
              />
              {errors.otherRef && (
                <ErrorMessage message={errors.otherRef.message} />
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="invoiceTotal">Invoice total</FieldLabel>
            <FieldContent>
              <Input
                id="invoiceTotal"
                type="number"
                step="0.01"
                {...register("invoiceTotal" as never)}
              />
              {errors.invoiceTotal && (
                <ErrorMessage message={errors.invoiceTotal.message} />
              )}
            </FieldContent>
          </Field>

          <div className="col-span-full space-y-6">
            <FileUpload />

            <div className="flex items-center justify-end gap-3">
              <Button type="submit" disabled={isSubmitting}>
                <Send />
                Submit Invoice
              </Button>
            </div>

            {message && <p className="text-sm text-green-600">{message}</p>}
          </div>
        </form>
      )}
    </section>
  )
}

export default function SupplierForm() {
  const [cards, setCards] = useState<InvoiceCard[]>([
    { id: "invoice-1", isOpen: true },
  ])

  const handleToggle = (id: string) => {
    setCards((current) =>
      current.map((card) =>
        card.id === id ? { ...card, isOpen: !card.isOpen } : card
      )
    )
  }

  const handleAddAnother = () => {
    setCards((current) => {
      const nextCards = current.map((card) => ({ ...card, isOpen: false }))
      return [...nextCards, createInvoiceCard(current.length, true)]
    })
  }

  return (
    <div className="space-y-4">
      {cards.map((card, index) => (
        <InvoiceSection
          key={card.id}
          invoiceLabel={`Invoice #${index + 1}`}
          isOpen={card.isOpen}
          onToggle={() => handleToggle(card.id)}
        />
      ))}

        <Button type="button" variant="outline" onClick={handleAddAnother}>
          <Plus />
          Add another invoice
        </Button>
    </div>
  )
}
