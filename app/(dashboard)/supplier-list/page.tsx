"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { DynamicTable } from "@/components/dynamic-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

type SupplierRow = {
  no: string
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

const data: SupplierRow[] = [
  {
    no: "SUP-001",
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
    supplierName: "BuildRight Materials",
    creditLimit: "",
    eomPaymentTerms: "",
    monthCreditUsed: "",
    availableCredit: "",
    previousMonth: "",
    invoiceDueThisMonth: "",
  },
  {
    no: "SUP-003",
    supplierName: "SteelWorks Ltd",
    creditLimit: "",
    eomPaymentTerms: "",
    monthCreditUsed: "",
    availableCredit: "",
    previousMonth: "",
    invoiceDueThisMonth: "",
  },
  {
    no: "SUP-004",
    supplierName: "Cement Bros",
    creditLimit: "",
    eomPaymentTerms: "",
    monthCreditUsed: "",
    availableCredit: "",
    previousMonth: "",
    invoiceDueThisMonth: "",
  },
  {
    no: "SUP-005",
    supplierName: "Timber & Co",
    creditLimit: "",
    eomPaymentTerms: "",
    monthCreditUsed: "",
    availableCredit: "",
    previousMonth: "",
    invoiceDueThisMonth: "",
  },
  {
    no: "SUP-006",
    supplierName: "ElecPro Supplies",
    creditLimit: "",
    eomPaymentTerms: "",
    monthCreditUsed: "",
    availableCredit: "",
    previousMonth: "",
    invoiceDueThisMonth: "",
  },
]

const columns: ColumnDef<SupplierRow>[] = [
  { accessorKey: "no", header: "No" },
  { accessorKey: "supplierName", header: "Supplier Name" },
  { accessorKey: "creditLimit", header: "Credit Limit" },
  { accessorKey: "eomPaymentTerms", header: "EOM payments terms" },
  { accessorKey: "monthCreditUsed", header: "This month credit used" },
  { accessorKey: "availableCredit", header: "Available credit" },
  { accessorKey: "previousMonth", header: "Previous month" },
  {
    accessorKey: "invoiceDueThisMonth",
    header: "Invoice duo for payment this month",
  },
]

function InviteSupplierDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Invite Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[420px]
      ">
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
  return (
    <div className="w-full min-w-0 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Supplier List</h1>
        <InviteSupplierDialog />
      </div>

      <div className="max-w-[560px] overflow-hidden border border-[#1e3a5f]">
        {summaryRows.map((item) => (
          <div
            className="grid grid-cols-2 border-b border-[#1e3a5f] last:border-b-0"
            key={item.label}
          >
            <div className="bg-[#166534] px-4 py-3 text-sm font-medium text-white">
              {item.label}
            </div>
            <div className="bg-[#166534] px-4 py-3 text-sm font-semibold text-white">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <DynamicTable columns={columns} data={data} initialSortId="no" />
    </div>
  )
}
