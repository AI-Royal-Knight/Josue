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

const summaryRows = [
  { label: "Total Credit", value: "£2,500,000" },
  { label: "Credit Used", value: "£845,200" },
  { label: "Available Credit", value: "£1,654,800" },
  { label: "Total Suppliers", value: "184" },
  { label: "Active Suppliers", value: "156" },
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
    { headerName: "Invoice Number", field: "invoiceNumber" },
    { headerName: "Date", field: "date" },
    { headerName: "Project", field: "project" },
    { headerName: "Supplier name", field: "supplierName" },
    { headerName: "Sort code", field: "sortCode" },
    { headerName: "Account number", field: "accountNumber" },
    { headerName: "Total", field: "total" },
    { headerName: "Payment due date", field: "paymentDueDate" },
    { headerName: "Paid by", field: "paidBy" },
    {
      headerName: "Payment Scheduled",
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
    <div className="w-full min-w-0 space-y-6 p-6 bg-white">
      <h1 className="text-primary">Supplier List</h1>

      <div className="max-w-[500px] overflow-hidden border border-[#0a5f4d]">
        {summaryRows.map((item) => (
          <div
            key={item.label}
            className="grid grid-cols-[1fr_190px] border-b border-[#0a5f4d] last:border-b-0"
          >
            <div className="bg-[#2f67d9] px-3 py-2 text-xs font-semibold text-slate-100">
              {item.label}
            </div>
            <div className="bg-[#16663f] px-3 py-2 text-xs font-semibold text-slate-100">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <InviteSupplierDialog />
        <Filters />
      </div>

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
          minWidth: 100,
          resizable: true,
        }}
      />
    </div>
  )
}
