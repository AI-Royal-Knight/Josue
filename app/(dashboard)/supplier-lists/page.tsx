"use client"

import { useState, useEffect } from "react"
import type { ColDef } from "ag-grid-community"
import { toast } from "sonner"
import { getSuppliers, inviteSupplier, type CompanySupplier } from "@/lib/api/suppliers"

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

// We will compute summaryRows dynamically now

const initialData: SupplierRow[] = [
  {
    no: "SUP-001",
    supplierName: "BuildCo Ltd",
    creditLimit: "£500,000",
    eomPaymentTerms: "30 days",
    monthCreditUsed: "£120,000",
    availableCredit: "£380,000",
    previousMonth: "£100,000",
    invoiceDueThisMonth: "£50,000",
    paid: false,
  },
  {
    no: "SUP-002",
    supplierName: "Sparky Bros",
    creditLimit: "£300,000",
    eomPaymentTerms: "45 days",
    monthCreditUsed: "£80,000",
    availableCredit: "£220,000",
    previousMonth: "£60,000",
    invoiceDueThisMonth: "£30,000",
    paid: true,
  },
  {
    no: "SUP-003",
    supplierName: "Concrete Solutions",
    creditLimit: "£400,000",
    eomPaymentTerms: "60 days",
    monthCreditUsed: "£150,000",
    availableCredit: "£250,000",
    previousMonth: "£120,000",
    invoiceDueThisMonth: "£70,000",
    paid: false,
  },
  {
    no: "SUP-004",
    supplierName: "SteelWorks Inc",
    creditLimit: "£600,000",
    eomPaymentTerms: "30 days",
    monthCreditUsed: "£200,000",
    availableCredit: "£400,000",
    previousMonth: "£180,000",
    invoiceDueThisMonth: "£90,000",
    paid: true,
  },
  {
    no: "SUP-005",
    supplierName: "Timber Traders",
    creditLimit: "£350,000",
    eomPaymentTerms: "45 days",
    monthCreditUsed: "£90,000",
    availableCredit: "£260,000",
    previousMonth: "£70,000",
    invoiceDueThisMonth: "£40,000",
    paid: false,
  },
  {
    no: "SUP-006",
    supplierName: "Masonry Masters",
    creditLimit: "£450,000",
    eomPaymentTerms: "60 days",
    monthCreditUsed: "£130,000",
    availableCredit: "£320,000",
    previousMonth: "£110,000",
    invoiceDueThisMonth: "£60,000",
    paid: true,
  },
  {
    no: "SUP-007",
    supplierName: "Glass & Glazing Co",
    creditLimit: "£250,000",
    eomPaymentTerms: "30 days",
    monthCreditUsed: "£70,000",
    availableCredit: "£180,000",
    previousMonth: "£50,000",
    invoiceDueThisMonth: "£20,000",
    paid: false,
  },
  {
    no: "SUP-008",
    supplierName: "Roofing Experts Ltd",
    creditLimit: "£550,000",
    eomPaymentTerms: "45 days",
    monthCreditUsed: "£160,000",
    availableCredit: "£390,000",
    previousMonth: "£130,000",
    invoiceDueThisMonth: "£80,000",
    paid: true,
  },
]

function InviteSupplierDialog({ onInvited }: { onInvited: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleInvite = async () => {
    if (!name || !email) return
    setLoading(true)
    try {
      await inviteSupplier({ email, company_name: name })
      toast.success("Supplier invited successfully")
      setOpen(false)
      setName("")
      setEmail("")
      onInvited()
    } catch (err: any) {
      toast.error(err.message || "Failed to invite supplier")
    } finally {
      setLoading(false)
    }
  }

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
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Supplier Email</Label>
            <Input 
              type="email" 
              className="border-white/10 bg-[#182742]"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          {/* <div className="space-y-2">
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
          </div> */}

          <div className="pt-2">
            <Button className="w-full" onClick={handleInvite} disabled={loading}>
              {loading ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function Page() {
  const [rows, setRows] = useState<SupplierRow[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCredit: 0,
    creditUsed: 0,
    availableCredit: 0,
    totalSuppliers: 0
  })

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const data = await getSuppliers()
      let totalCredit = 0
      
      const formattedRows: SupplierRow[] = data.map((cs, i) => {
        const credit = parseFloat(cs.credit_limit) || 0
        totalCredit += credit
        
        return {
          no: String(i + 1),
          supplierName: cs.supplier.company_name,
          creditLimit: `£${credit.toLocaleString()}`,
          eomPaymentTerms: `${cs.eom_payment_terms} days`,
          monthCreditUsed: "£0.00",
          availableCredit: `£${credit.toLocaleString()}`,
          previousMonth: "£0.00",
          invoiceDueThisMonth: "£0.00",
          paid: false
        }
      })
      setRows(formattedRows)
      setStats({
        totalCredit,
        creditUsed: 0, // Need to implement invoice fetching for accurate credit used
        availableCredit: totalCredit, // Total Credit - Credit Used
        totalSuppliers: data.length
      })
    } catch (err: any) {
      toast.error("Failed to load suppliers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const columnDefs: ColDef<SupplierRow>[] = [
    { headerName: "No", field: "no", maxWidth: 100, filter: false },
    { headerName: "Supplier name", field: "supplierName" },
    { headerName: "Credit Limit", field: "creditLimit" },
    { headerName: "EOM payment terms", field: "eomPaymentTerms" },
    { headerName: "Month Credit Used", field: "monthCreditUsed" },
    { headerName: "Available Credit", field: "availableCredit" },
    { headerName: "Previous Month", field: "previousMonth" },
    { headerName: "Invoice Due For Payment This Month", field: "invoiceDueThisMonth" },
  ]

  return (
    <div className="w-full min-w-0 space-y-6 bg-white p-6">
      <h1 className="text-primary">Supplier List</h1>

      {/* <div className="flex justify-between"> */}
      <InviteSupplierDialog onInvited={fetchSuppliers} />
      <TableStat summaryRows={[
        { label: "Total Credit", value: `£${stats.totalCredit.toLocaleString()}` },
        { label: "Credit Used", value: `£${stats.creditUsed.toLocaleString()}` },
        { label: "Available Credit", value: `£${stats.availableCredit.toLocaleString()}` },
        { label: "Total Suppliers", value: String(stats.totalSuppliers) },
      ]} />

      {/* <Filters /> */}
      {/* </div> */}

      <AgTable
        columnDefs={columnDefs}
        rowData={rows}
        defaultColDef={{
          flex: 1,
          minWidth: 130,
          resizable: true,
        }}
      />
    </div>
  )
}
