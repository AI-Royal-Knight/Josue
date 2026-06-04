"use client"

import { useState } from "react"
import type { ColDef } from "ag-grid-community"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AgTable } from "@/components/common/AgTable"
import Filters from "@/components/shared/filters"
import { Switch } from "@/components/ui/switch"
import ConfirmPaymentDialog from "@/components/common/confirm-payment"
import TableStat from "@/components/common/table-stat"

type SupplierRow = {
  no: string
  invoiceNumber?: string
  date?: string
  project?: string
  userName?: string
  sortCode?: string
  accountNumber?: string
  total?: string
  paymentDueDate?: string
  paidBy?: string
  paid: boolean
  dateScheduled?: string
  releaseDate?: string
  financeComments?: string
  procurementComments?: string
  commercialComments?: string
  supplierName: string
  creditLimit: string
  eomPaymentTerms: string
  monthCreditUsed: string
  availableCredit: string
  previousMonth: string
  invoiceDueThisMonth: string
}

function buildInvoiceDocHtml(invoice: any) {
  const paidText = invoice.paid ? "Yes" : "No"
  const confirmedDate = invoice.releaseDate || invoice.paymentDueDate || "-"
  const value = invoice.total || "-"
  const invoiceNumber = invoice.invoiceNumber || invoice.no

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${invoiceNumber}</title>
  </head>
  <body style="font-family: Arial, Helvetica, sans-serif; color: #111;">
    <div style="max-width: 720px; margin: 0 auto; padding: 24px;">
      <h1 style="margin: 0 0 8px;">INVOICE</h1>
      <div style="margin: 0 0 16px; font-size: 12px;">
        <div><strong>Invoice Number:</strong> ${invoiceNumber}</div>
        <div><strong>Invoice Date:</strong> ${invoice.date || "-"}</div>
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
            <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${value}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 12px 4px; text-align: right;"><strong>Total</strong></td>
            <td style="padding: 12px 4px; text-align: right;"><strong>${value}</strong></td>
          </tr>
        </tfoot>
      </table>

      <p style="margin-top: 16px; font-size: 11px; color: #444;">
        This is a sample invoice document generated from the supplier list.
      </p>
    </div>
  </body>
</html>`
}

const summaryRows = [
  { label: "Approved Invoices", qty: "1000", value: "£400" },
  { label: "Invoices Due This Week", qty: "184", value: "£200" },
  { label: "Invoices Paid", qty: "156", value: "£200" },
]

const initialData: SupplierRow[] = [
  {
    no: "SUP-001",
    invoiceNumber: "INV-2024-001",
    date: "2024-01-15",
    project: "Project Alpha",
    userName: "John Smith",
    sortCode: "12-34-56",
    accountNumber: "12345678",
    total: "£2,500",
    paymentDueDate: "2024-02-15",
    paidBy: "John Smith",
    paid: false,
    dateScheduled: "2024-01-20",
    releaseDate: "2024-02-15",
    financeComments: "Urgent payment required",
    procurementComments: "Invoice matches PO #12345",
    commercialComments: "Approved for payment",
    supplierName: "Hilti Supply Co",
    creditLimit: "",
    eomPaymentTerms: "",
    monthCreditUsed: "",
    availableCredit: "",
    previousMonth: "",
    invoiceDueThisMonth: "",
  },
  {
    no: "SUP-002",
    invoiceNumber: "INV-2024-002",
    date: "2024-01-20",
    project: "Project Beta",
    userName: "Jane Doe",
    sortCode: "65-43-21",
    accountNumber: "87654321",
    total: "£5,000",
    paymentDueDate: "2024-02-20",
    paidBy: "Jane Doe",
    paid: true,
    dateScheduled: "2024-01-25",
    releaseDate: "2024-02-20",
    financeComments: "Payment processed on time",
    procurementComments: "Invoice matches PO #54321",
    commercialComments: "Approved for payment",
    supplierName: "BuildRight Materials",
    creditLimit: "",
    eomPaymentTerms: "",
    monthCreditUsed: "",
    availableCredit: "",
    previousMonth: "",
    invoiceDueThisMonth: "",
  },
  {
    no: "SUP-004",
    invoiceNumber: "INV-2024-003",
    date: "2024-01-20",
    project: "Project Beta",
    userName: "Jane Doe",
    sortCode: "65-43-21",
    accountNumber: "87654321",
    total: "£5,000",
    paymentDueDate: "2024-02-20",
    paidBy: "Jane Doe",
    paid: true,
    dateScheduled: "2024-01-25",
    releaseDate: "2024-02-20",
    financeComments: "Payment processed on time",
    procurementComments: "Invoice matches PO #54321",
    commercialComments: "Approved for payment",
    supplierName: "Cement Bros",
    creditLimit: "",
    eomPaymentTerms: "",
    monthCreditUsed: "",
    availableCredit: "",
    previousMonth: "",
    invoiceDueThisMonth: "",
  },
]

function InviteSupplierDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Invite Supplier</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-semibold">
            Supplier Invitation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Name</Label>
            <Input />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Supplier Email</Label>
            <Input type="email" className="border-white/10 bg-[#182742]" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Credit Limit</Label>
            <Input className="border-white/10 bg-[#182742]" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">EOM payment terms</Label>
            <Input className="border-white/10 bg-[#182742]" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Password</Label>
            <Input type="password" className="border-white/10 bg-[#182742]" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Confirm Password</Label>
            <Input type="password" className="border-white/10 bg-[#182742]" />
          </div>

          <div className="pt-2">
            <Button className="w-full bg-[#1fb656] text-white hover:bg-[#18a34b]">
              Send Invite
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function Page() {
  const [rows, setRows] = useState<SupplierRow[]>(initialData)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingRowId, setPendingRowId] = useState<string | null>(null)
  const [nextPaid, setNextPaid] = useState(false)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierRow | null>(null)

  function openInvoice(invoice: SupplierRow) {
    setSelectedInvoice(invoice)
    setInvoiceDialogOpen(true)
  }

  function downloadInvoiceDoc(invoice: SupplierRow) {
    const html = buildInvoiceDocHtml(invoice)
    const blob = new Blob([html], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${invoice.invoiceNumber || invoice.no}.doc`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function openPaymentConfirm(rowId: string, checked: boolean) {
    setPendingRowId(rowId)
    setNextPaid(checked)
    setConfirmOpen(true)
  }

  function handleConfirmPaymentChange() {
    if (!pendingRowId) return

    setRows((currentRows) =>
      currentRows.map((row) =>
        row.no === pendingRowId ? { ...row, paid: nextPaid } : row
      )
    )
    setConfirmOpen(false)
    setPendingRowId(null)
  }

  const columnDefs: ColDef<SupplierRow>[] = [
    { headerName: "No", field: "no" },
    {
      headerName: "Invoice Number",
      field: "invoiceNumber",
      cellRenderer: (params: { data?: SupplierRow; value: string }) => (
        <button
          type="button"
          className={`hover:underline ${params.data?.paid ? "text-green-500" : "text-red-500"}`}
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
    { headerName: "Date(Supplier sent)", field: "date", minWidth: 150 },
    { headerName: "Project", field: "project" },
    { headerName: "Supplier name", field: "supplierName" },
    { headerName: "Sort code", field: "sortCode" },
    { headerName: "Account number", field: "accountNumber" },
    { headerName: "Total", field: "total" },
    { headerName: "Payment due date", field: "paymentDueDate" },
    { headerName: "Paid by", field: "paidBy" },
    {
      headerName: "Paid",
      field: "paid",
      cellRenderer: (params: { data?: SupplierRow; value: boolean }) => (
        <Switch
          checked={params.value}
          onCheckedChange={(checked) => {
            if (!params.data) return
            openPaymentConfirm(params.data.no, checked)
          }}
        />
      ),
    },
    { headerName: "Date scheduled", field: "dateScheduled" },
    { headerName: "Release date", field: "releaseDate" },
    { headerName: "Finance comments", field: "financeComments" },
    { headerName: "Procurement Comments", field: "procurementComments" },
    { headerName: "Commercial comments", field: "commercialComments" },
  ]

  return (
    <div className="w-full min-w-0 space-y-6 bg-white p-6">
      <h1 className="text-primary">Supplier List</h1>

      <TableStat summaryRows={summaryRows} />

      {/* <div className="flex justify-between"> */}
      {/* <InviteSupplierDialog /> */}
      {/* <Filters /> */}
      {/* </div> */}

      <ConfirmPaymentDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        supplierName={
          rows.find((row) => row.no === pendingRowId)?.supplierName ??
          "this supplier"
        }
        nextPaid={nextPaid}
        onConfirm={handleConfirmPaymentChange}
      />

      <AgTable
        columnDefs={columnDefs}
        rowData={rows}
        defaultColDef={{
          flex: 1,
          minWidth: 130,
          resizable: true,
        }}
      />

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
                    {selectedInvoice.invoiceNumber || selectedInvoice.no}
                  </div>
                  <div>
                    <span className="font-medium">Invoice Date:</span>{" "}
                    {selectedInvoice.date || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Paid:</span>{" "}
                    {selectedInvoice.paid ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="font-medium">
                      Date of confirmed payment:
                    </span>{" "}
                    {selectedInvoice.releaseDate || selectedInvoice.paymentDueDate || "-"}
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
                    <td className="py-3 text-right">{selectedInvoice.total || "-"}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-3 text-right font-semibold">Total</td>
                    <td className="py-3 text-right font-semibold">
                      {selectedInvoice.total || "-"}
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
