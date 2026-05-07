"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ColumnDef } from "@tanstack/react-table"
import { DynamicTable } from "@/components/dynamic-table"

type InvoiceItem = {
  id: number
  description: string
  qty: string
  discount: string
  per: string
  each: string
  totalValue: string
  comments: string
}

type Invoice = {
  id: number
  project: string
  name: string
  invoiceNo: string
  poRef: string
  callOffRef: string
  variationRef: string
  otherRef: string
  paymentDueDate: string
  invoiceTotal: string
  items: InvoiceItem[]
}

const invoiceItemColumns: ColumnDef<InvoiceItem>[] = [
  {
    accessorKey: "description",
    header: "Description",
    size: 250,
    cell: ({ row }) => (
      <Input
        value={row.original.description}
        className="border-white/10 bg-slate-900"
        placeholder="Paste from excel sheet"
      />
    ),
  },
  {
    accessorKey: "qty",
    header: "QTY",
    size: 80,
    cell: ({ row }) => (
      <Input
        value={row.original.qty}
        className="border-white/10 bg-slate-900"
        placeholder="QTY"
      />
    ),
  },
  {
    accessorKey: "discount",
    header: "Discount",
    size: 80,
    cell: ({ row }) => (
      <Input
        value={row.original.discount}
        className="border-white/10 bg-slate-900"
        placeholder="0.00"
      />
    ),
  },
  {
    accessorKey: "per",
    header: "Per",
    size: 70,
    cell: ({ row }) => (
      <Input
        value={row.original.per}
        className="border-white/10 bg-slate-900"
        placeholder="Unit"
      />
    ),
  },
  {
    accessorKey: "each",
    header: "Each",
    size: 80,
    cell: ({ row }) => (
      <Input
        value={row.original.each}
        className="border-white/10 bg-slate-900"
        placeholder="0.00"
      />
    ),
  },
  {
    accessorKey: "totalValue",
    header: "Total Value",
    size: 100,
    cell: ({ row }) => (
      <Input
        value={row.original.totalValue}
        className="border-white/10 bg-slate-900"
        placeholder="$"
      />
    ),
  },
  {
    accessorKey: "comments",
    header: "Comments",
    size: 180,
    cell: ({ row }) => (
      <Input
        value={row.original.comments}
        className="border-white/10 bg-slate-900"
        placeholder="Supplier comments"
      />
    ),
  },
]

export default function Page() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 1,
      project: "",
      name: "",
      invoiceNo: "",
      poRef: "",
      callOffRef: "",
      variationRef: "",
      otherRef: "",
      paymentDueDate: "",
      invoiceTotal: "",
      items: [
        {
          id: 1,
          description: "Paste from excel sheet",
          qty: "QTY",
          discount: "0.30",
          per: "Unit",
          each: "0.00",
          totalValue: "$",
          comments: "Supplier comments",
        },
        {
          id: 2,
          description: "Paste from excel sheet",
          qty: "QTY",
          discount: "0.30",
          per: "Unit",
          each: "0.00",
          totalValue: "$",
          comments: "Supplier comments",
        },
        {
          id: 3,
          description: "Paste from excel sheet",
          qty: "QTY",
          discount: "0.30",
          per: "Unit",
          each: "0.00",
          totalValue: "$",
          comments: "Supplier comments",
        },
        {
          id: 4,
          description: "Paste from excel sheet",
          qty: "QTY",
          discount: "0.30",
          per: "Unit",
          each: "0.00",
          totalValue: "$",
          comments: "Supplier comments",
        },
        {
          id: 5,
          description: "Paste from excel sheet",
          qty: "QTY",
          discount: "0.30",
          per: "Unit",
          each: "0.00",
          totalValue: "$",
          comments: "Supplier comments",
        },
        {
          id: 6,
          description: "Paste from excel sheet",
          qty: "QTY",
          discount: "0.30",
          per: "Unit",
          each: "0.00",
          totalValue: "$",
          comments: "Supplier comments",
        },
        {
          id: 7,
          description: "Paste from excel sheet",
          qty: "QTY",
          discount: "0.30",
          per: "Unit",
          each: "0.00",
          totalValue: "$",
          comments: "Supplier comments",
        },
        {
          id: 8,
          description: "Paste from excel sheet",
          qty: "QTY",
          discount: "0.30",
          per: "Unit",
          each: "0.00",
          totalValue: "$",
          comments: "Supplier comments",
        },
      ],
    },
  ])

  const addInvoice = () => {
    const newInvoice: Invoice = {
      id: Math.max(...invoices.map((i) => i.id)) + 1,
      project: "",
      name: "",
      invoiceNo: "",
      poRef: "",
      callOffRef: "",
      variationRef: "",
      otherRef: "",
      paymentDueDate: "",
      invoiceTotal: "",
      items: [
        {
          id: 1,
          description: "Paste from excel sheet",
          qty: "QTY",
          discount: "0.00",
          per: "Unit",
          each: "0.00",
          totalValue: "$",
          comments: "Supplier comments",
        },
      ],
    }
    setInvoices([...invoices, newInvoice])
  }

  const addItemToInvoice = (invoiceId: number) => {
    setInvoices(
      invoices.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            items: [
              ...inv.items,
              {
                id: Math.max(...inv.items.map((i) => i.id)) + 1,
                description: "Paste from excel sheet",
                qty: "QTY",
                discount: "0.00",
                per: "Unit",
                each: "0.00",
                totalValue: "$",
                comments: "Supplier comments",
              },
            ],
          }
        }
        return inv
      })
    )
  }

  return (
    <div className="w-full space-y-8 p-6">
      <h2 className="text-2xl font-semibold">Supplier Invoices</h2>

      {invoices.map((invoice) => (
        <div
          key={invoice.id}
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Project</Label>
              <div className="relative">
                <Input
                  placeholder="Search projects..."
                  className="border-white/10 bg-slate-900 pr-10"
                />
                <svg
                  className="absolute top-2.5 right-3 size-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Name</Label>
              <Input
                placeholder="Name or Auto-Fill url"
                className="border-white/10 bg-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Invoice No.</Label>
              <Input
                placeholder="Enter Invoice Number"
                className="border-white/10 bg-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-slate-300">PO Ref</Label>
              <div className="relative">
                <Input
                  placeholder="Search PO reference..."
                  className="border-white/10 bg-slate-900 pr-10"
                />
                <svg
                  className="absolute top-2.5 right-3 size-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Call Off Ref</Label>
              <div className="relative">
                <Input
                  placeholder="Search call off references..."
                  className="border-white/10 bg-slate-900 pr-10"
                />
                <svg
                  className="absolute top-2.5 right-3 size-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Variation Ref</Label>
              <div className="relative">
                <Input
                  placeholder="Search variation references..."
                  className="border-white/10 bg-slate-900 pr-10"
                />
                <svg
                  className="absolute top-2.5 right-3 size-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Other Ref</Label>
              <Input
                placeholder="Enter other reference"
                className="border-white/10 bg-slate-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Date</Label>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Payment Due Date</Label>
              <Input type="date" className="border-white/10 bg-slate-900" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Invoice Total</Label>
            <Input
              placeholder="Enter amount"
              className="border-white/10 bg-slate-900"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Attachments</Label>
            <div className="flex min-h-32 items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-slate-900/50">
              <div className="text-center">
                <Upload className="mx-auto mb-2 size-6 text-slate-400" />
                <p className="text-sm text-slate-400">
                  Attach PDFs (multiple allowed)
                </p>
                <p className="text-xs text-slate-500">
                  Drag & drop or click to browse
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="overflow-x-auto">
              <DynamicTable columns={invoiceItemColumns} data={invoice.items} />
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => addItemToInvoice(invoice.id)}
              >
                + Add Row
              </Button>
              <div className="text-right">
                <p className="text-sm text-slate-400">TOTAL</p>
                <p className="text-xl font-semibold text-emerald-400">$</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addInvoice} className="w-full">
        + Add another Invoice
      </Button>

      <Button className="w-full bg-blue-600 hover:bg-blue-700">
        Submit Invoice
      </Button>
    </div>
  )
}
