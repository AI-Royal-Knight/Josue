"use client"

import type { ColDef } from "ag-grid-community"

import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import SelectProject from "@/components/shared/select-project"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { InvoiceListRow } from "../invoice-list/types/invoice"

type ProformaRow = {
  no: number
  invoiceNumber: string
  date: string
  nrProformaNo: string
  project: string
  descriptionOfWorks: string
  createdBy: string
  approvedBy: string
  approved: string
  total: string
  paid: string
  datePaid: string
  paidBy: string
  financeComments: string
  commercialComments: string
}

type InvoiceRow = {
  invoiceNumber: string
  date: string
  value: string
  paid: boolean
  paymentDate: string
}

const initialRows: InvoiceRow[] = [
  {
    invoiceNumber: "INV-001",
    date: "2024-06-01",
    value: "$1,000.00",
    paid: true,
    paymentDate: "2024-06-05",
  },
  {
    invoiceNumber: "INV-002",
    date: "2024-06-03",
    value: "$2,500.00",
    paid: false,
    paymentDate: "",
  },
  {
    invoiceNumber: "INV-003",
    date: "2024-06-05",
    value: "$750.00",
    paid: true,
    paymentDate: "2024-06-10",
  },
  {
    invoiceNumber: "INV-004",
    date: "2024-06-07",
    value: "$1,200.00",
    paid: false,
    paymentDate: "",
  },
  {
    invoiceNumber: "INV-005",
    date: "2024-06-10",
    value: "$3,000.00",
    paid: true,
    paymentDate: "2024-06-15",
  },
  {
    invoiceNumber: "INV-006",
    date: "2024-06-12",
    value: "$500.00",
    paid: false,
    paymentDate: "",
  },
]

function buildInvoiceDocHtml(invoice: InvoiceRow) {
  const paidText = invoice.paid ? "Yes" : "No"
  const confirmedDate = invoice.paymentDate || "-"

  // Word can open HTML saved as .doc; keep it simple and self-contained.
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${invoice.invoiceNumber}</title>
  </head>
  <body style="font-family: Arial, Helvetica, sans-serif; color: #111;">
    <div style="max-width: 720px; margin: 0 auto; padding: 24px;">
      <h1 style="margin: 0 0 8px;">INVOICE</h1>
      <div style="margin: 0 0 16px; font-size: 12px;">
        <div><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</div>
        <div><strong>Invoice Date:</strong> ${invoice.date}</div>
        <div><strong>Paid:</strong> ${paidText}</div>
        <div><strong>Date of confirmed payment:</strong> ${confirmedDate}</div>
      </div>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />

      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px 4px;">Description</th>
            <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px 4px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0;">Work completed (sample)</td>
            <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${invoice.value}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 12px 4px; text-align: right;"><strong>Total</strong></td>
            <td style="padding: 12px 4px; text-align: right;"><strong>${invoice.value}</strong></td>
          </tr>
        </tfoot>
      </table>

      <p style="margin-top: 16px; font-size: 11px; color: #444;">
        This is a sample invoice document generated from the invoice list.
      </p>
    </div>
  </body>
</html>`
}

const summaryRows = [
  { label: "Proforma NR Invoice", qty: 50, value: "1000", alert: false },
  {
    label: "Approved Proforma NR Invoice",
    qty: 200,
    value: "200",
    alert: false,
  },
  {
    label: "Proforma NR Invoice Awaiting approved",
    qty: 200,
    value: "200",
    alert: true,
  },
  {
    label: "Proforma NR invoices due this week",
    qty: 200,
    value: "200",
    alert: false,
  },
  { label: "Proforma NR invoices paid", qty: 200, value: "200", alert: false },
]

const rows: ProformaRow[] = [
  {
    no: 1,
    invoiceNumber: "INV-001",
    date: "2023-10-01",
    nrProformaNo: "NR-PF-1000",
    project: "Project A",
    descriptionOfWorks: "General contracting works",
    createdBy: "John Doe",
    approvedBy: "Jane Smith",
    approved: "Yes",
    total: "$6150.75",
    paid: "Yes",
    datePaid: "2023-10-10",
    paidBy: "Finance Team A",
    financeComments: "Processed",
    commercialComments: "Approved for payment",
  },
  {
    no: 2,
    invoiceNumber: "INV-002",
    date: "2023-10-02",
    nrProformaNo: "NR-PF-1001",
    project: "Project B",
    descriptionOfWorks: "General contracting works",
    createdBy: "John Doe",
    approvedBy: "Pending",
    approved: "No",
    total: "$5521.86",
    paid: "No",
    datePaid: "-",
    paidBy: "-",
    financeComments: "-",
    commercialComments: "Awaiting review",
  },
  {
    no: 3,
    invoiceNumber: "INV-003",
    date: "2023-10-03",
    nrProformaNo: "NR-PF-1002",
    project: "Project C",
    descriptionOfWorks: "General contracting works",
    createdBy: "John Doe",
    approvedBy: "Jane Smith",
    approved: "Yes",
    total: "$7960.08",
    paid: "No",
    datePaid: "-",
    paidBy: "-",
    financeComments: "-",
    commercialComments: "Approved for payment",
  },
  {
    no: 4,
    invoiceNumber: "INV-004",
    date: "2023-10-04",
    nrProformaNo: "NR-PF-1003",
    project: "Project D",
    descriptionOfWorks: "General contracting works",
    createdBy: "John Doe",
    approvedBy: "Pending",
    approved: "No",
    total: "$4125.51",
    paid: "Yes",
    datePaid: "2023-10-13",
    paidBy: "Finance Team A",
    financeComments: "Processed",
    commercialComments: "Awaiting review",
  },
]

export default function Page() {
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(
    null
  )

  function openInvoice(invoice: InvoiceRow) {
    setSelectedInvoice(invoice)
    setInvoiceDialogOpen(true)
  }

  function downloadInvoiceDoc(invoice: InvoiceRow) {
    const html = buildInvoiceDocHtml(invoice)
    const blob = new Blob([html], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${invoice.invoiceNumber}.doc`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const columns: ColDef<ProformaRow>[] = [
    //   { headerName: "No.", field: "no" },
    {
      headerName: "Invoice Number",
      field: "invoiceNumber",
      cellRenderer: (params: { data?: InvoiceRow; value: string }) => (
        <button
          type="button"
          className={`${params.data?.paid ? "text-green-500" : "text-red-500"} hover:underline`}
          onClick={(event) => {
            event.stopPropagation()
            if (!params.data) return
            openInvoice(params.data)
          }}
        >
          {params.value}
        </button>
      ),
    },
    { headerName: "Date", field: "date" },
    { headerName: "NR Proforma no.", field: "nrProformaNo" },
    { headerName: "Project", field: "project" },
    { headerName: "Description of Works", field: "descriptionOfWorks" },
    { headerName: "Created by", field: "createdBy" },
    { headerName: "Approved by", field: "approvedBy" },
    {
      headerName: "Approved",
      field: "approved",
      cellRenderer: (params: { value: string }) => (
        <span
          className={params.value === "Yes" ? "text-green-500" : "text-red-500"}
        >
          {params.value}
        </span>
      ),
    },
    { headerName: "TOTAL", field: "total" },
    {
      headerName: "Paid",
      field: "paid",
      cellRenderer: (params: { value: string }) => (
        <span
          className={params.value === "Yes" ? "text-green-500" : "text-red-500"}
        >
          {params.value}
        </span>
      ),
    },
    { headerName: "Date paid", field: "datePaid" },
    { headerName: "Paid by", field: "paidBy" },
    { headerName: "Finance team comments", field: "financeComments" },
    { headerName: "Commercial team Comments", field: "commercialComments" },
  ]
  
  return (
    <div className="w-full min-w-0 space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Proforma NR List</h1>

      <SelectProject />
      <TableStat summaryRows={summaryRows} />

      <AgTable rowData={rows} columnDefs={columns} height="auto" />

      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Invoice preview</DialogTitle>
          </DialogHeader>

          {selectedInvoice ? (
            <div className="max-h-[70vh] overflow-auto border border-input bg-white p-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-lg font-semibold">INVOICE</h2>
                  <p className="text-sm text-muted-foreground">
                    Sample document preview
                  </p>
                </div>
                <div className="text-right text-sm">
                  <div>
                    <span className="font-medium">Invoice Number:</span>{" "}
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div>
                    <span className="font-medium">Invoice Date:</span>{" "}
                    {selectedInvoice.date}
                  </div>
                  <div>
                    <span className="font-medium">Paid:</span>{" "}
                    {selectedInvoice.paid ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="font-medium">
                      Date of confirmed payment:
                    </span>{" "}
                    {selectedInvoice.paymentDate || "-"}
                  </div>
                </div>
              </div>

              <div className="my-6 h-px bg-border" />

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium">Description</th>
                    <th className="py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/60">
                    <td className="py-3">Work completed (sample)</td>
                    <td className="py-3 text-right">{selectedInvoice.value}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-3 text-right font-semibold">Total</td>
                    <td className="py-3 text-right font-semibold">
                      {selectedInvoice.value}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setInvoiceDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!selectedInvoice) return
                downloadInvoiceDoc(selectedInvoice)
              }}
              disabled={!selectedInvoice}
            >
              Download Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
