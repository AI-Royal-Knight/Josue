"use client"
import type { ColumnDef } from "@tanstack/react-table"
import { BellRing, FileText, RotateCcw } from "lucide-react"

import { DynamicTable } from "@/components/dynamic-table"
import { Button } from "@/components/ui/button"

type QuotationListRow = {
  no: number
  quotesRef: string
  project: string
  mainFolder: string
  subFolder: string
  variationRef: string
  supplierName: string
  supplierEmailAddress: string
  dateOfQuoteApproved: string
  quoteTotal: string
  createPoStatus: "PO Created" | "Create PO"
  datePoWasCreated: string
  procurementComments: string
  requestRequote: string
  approveQuotesStatus: "Approved" | "Rejected" | "Pending"
  quoteApprovalReasons: string
}

const rows: QuotationListRow[] = [
  {
    no: 1,
    quotesRef: "QR-2023-0891",
    project: "Downtown Tower A",
    mainFolder: "Structural",
    subFolder: "Concrete",
    variationRef: "VAR-001",
    supplierName: "BuildMat Supplies Ltd",
    supplierEmailAddress: "sales@buildmat.com",
    dateOfQuoteApproved: "2023-10-12",
    quoteTotal: "$45,000.00",
    createPoStatus: "PO Created",
    datePoWasCreated: "2023-10-14",
    procurementComments: "Type here",
    requestRequote: "Re-quote",
    approveQuotesStatus: "Approved",
    quoteApprovalReasons: "Lowest bidder, meets all specs.",
  },
  {
    no: 2,
    quotesRef: "QR-2023-0892",
    project: "Downtown Tower A",
    mainFolder: "Structural",
    subFolder: "Steel",
    variationRef: "-",
    supplierName: "IronWorks Inc.",
    supplierEmailAddress: "quotes@ironworks.net",
    dateOfQuoteApproved: "-",
    quoteTotal: "$125,500.50",
    createPoStatus: "Create PO",
    datePoWasCreated: "-",
    procurementComments: "Type here",
    requestRequote: "Re-quote",
    approveQuotesStatus: "Pending",
    quoteApprovalReasons: "-",
  },
  {
    no: 3,
    quotesRef: "QR-2023-0895",
    project: "Riverside Complex",
    mainFolder: "MEP",
    subFolder: "HVAC",
    variationRef: "VAR-012",
    supplierName: "CoolAir Systems",
    supplierEmailAddress: "bids@coolair.com",
    dateOfQuoteApproved: "2023-10-15",
    quoteTotal: "$89,200.00",
    createPoStatus: "PO Created",
    datePoWasCreated: "2023-10-16",
    procurementComments: "Type here",
    requestRequote: "Re-quote",
    approveQuotesStatus: "Approved",
    quoteApprovalReasons: "Preferred vendor, fast lead time.",
  },
  {
    no: 4,
    quotesRef: "QR-2023-0898",
    project: "Riverside Complex",
    mainFolder: "MEP",
    subFolder: "Electrical",
    variationRef: "-",
    supplierName: "VoltTech Solutions",
    supplierEmailAddress: "contact@volttech.com",
    dateOfQuoteApproved: "-",
    quoteTotal: "$67,400.00",
    createPoStatus: "Create PO",
    datePoWasCreated: "-",
    procurementComments: "Type here",
    requestRequote: "Re-quote",
    approveQuotesStatus: "Pending",
    quoteApprovalReasons: "-",
  },
  {
    no: 5,
    quotesRef: "QR-2023-0901",
    project: "Westside Mall",
    mainFolder: "Finishes",
    subFolder: "Flooring",
    variationRef: "VAR-003",
    supplierName: "Premium Tiles Co.",
    supplierEmailAddress: "orders@premiumtiles.com",
    dateOfQuoteApproved: "-",
    quoteTotal: "$112,000.00",
    createPoStatus: "Create PO",
    datePoWasCreated: "-",
    procurementComments: "Type here",
    requestRequote: "Re-quote",
    approveQuotesStatus: "Rejected",
    quoteApprovalReasons: "Rejected due to budget constraints.",
  },
]

const columns: ColumnDef<QuotationListRow>[] = [
  { accessorKey: "no", header: "No." },
  { accessorKey: "quotesRef", header: "Quotes Ref" },
  { accessorKey: "project", header: "Project" },
  { accessorKey: "mainFolder", header: "Main Folder" },
  { accessorKey: "subFolder", header: "Sub Folder" },
  { accessorKey: "variationRef", header: "Variation Ref" },
  { accessorKey: "supplierName", header: "Supplier Name" },
  { accessorKey: "supplierEmailAddress", header: "Supplier Email address" },
  { accessorKey: "dateOfQuoteApproved", header: "Date of Quote Approved" },
  { accessorKey: "quoteTotal", header: "Quote Total" },
  {
    accessorKey: "createPoStatus",
    header: "Create PO",
    cell: ({ row }) => {
      const status = row.original.createPoStatus
      return status === "PO Created" ? (
        <span className="inline-flex rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-200">PO Created</span>
      ) : (
        <Button className="h-7 rounded-none bg-[#3467df] px-3 text-xs text-white hover:bg-[#2d59c2]">
          <FileText className="size-3.5" />
          Create PO
        </Button>
      )
    },
  },
  { accessorKey: "datePoWasCreated", header: "Date PO was created" },
  {
    id: "sendReminder",
    header: "Send Reminder",
    cell: () => (
      <Button variant="outline" className="h-7 rounded-none border-white/10 bg-transparent px-2 text-xs text-slate-200 hover:bg-white/5">
        <BellRing className="size-3.5" />
        Reminder
      </Button>
    ),
  },
  { accessorKey: "procurementComments", header: "Procurement Comments" },
  {
    accessorKey: "requestRequote",
    header: "Request to Re-quote",
    cell: () => (
      <Button variant="outline" className="h-7 rounded-none border-white/10 bg-slate-700 px-2 text-xs text-slate-200 hover:bg-slate-600">
        <RotateCcw className="size-3.5" />
        Re-quote
      </Button>
    ),
  },
  {
    accessorKey: "approveQuotesStatus",
    header: "Approve Quotes",
    cell: ({ row }) => {
      const status = row.original.approveQuotesStatus
      if (status === "Approved") {
        return <span className="inline-flex rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">Approved</span>
      }
      if (status === "Rejected") {
        return <span className="inline-flex rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-300">Rejected</span>
      }
      return (
        <div className="flex gap-1">
          <Button className="h-7 rounded-none bg-emerald-500 px-2 text-xs text-white hover:bg-emerald-400">Approve</Button>
          <Button className="h-7 rounded-none bg-red-500 px-2 text-xs text-white hover:bg-red-400">Reject</Button>
        </div>
      )
    },
  },
  { accessorKey: "quoteApprovalReasons", header: "Quote approval / denial Reasons" },
]

export default function Page() {
  return (
    <div className="w-full min-w-0 p-6">
      <DynamicTable columns={columns} data={rows} initialSortId="no" />
    </div>
  )
}
