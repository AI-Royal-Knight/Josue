"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DynamicTable } from "@/components/dynamic-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

type PurchaseOrderRow = {
  no: string
  quotationRef: string
  project: string
  mainFolder: string
  subFolder: string
  variationRef: string
  supplierName: string
  supplierEmail: string
  dateOfQuoteApproved: string
  quoteTotal: string
  createPo: string
  datePOCreated: string
  sendReminder: string
  procurementComments: string
  requestToReQuote: string
  approvalQuotation: string
  approvalRelatedRequests: string
}

const summaryMetrics = [
  { label: "Approved Quotes", value: "£2,550,000" },
  { label: "Created PO", value: "£845,200" },
  { label: "Approved Quote Value", value: "£1,854,800" },
  { label: "PO", value: "164" },
  { label: "Chased PO", value: "158" },
]

const data: PurchaseOrderRow[] = [
  {
    no: "1",
    quotationRef: "QR-2023-0891",
    project: "Downtown Tower A",
    mainFolder: "Structural",
    subFolder: "Concrete",
    variationRef: "VAR-001",
    supplierName: "BuildMat Supplies Ltd",
    supplierEmail: "sales@buildmat.com",
    dateOfQuoteApproved: "2023-10-12",
    quoteTotal: "£45,000.00",
    createPo: "PO Created",
    datePOCreated: "2023-10-14",
    sendReminder: "Reminder",
    procurementComments: "Type here",
    requestToReQuote: "Re-quote",
    approvalQuotation: "Approved",
    approvalRelatedRequests: "Lowest bidder. Meets all specs.",
  },
  {
    no: "2",
    quotationRef: "QR-2023-0892",
    project: "Downtown Tower A",
    mainFolder: "Structural",
    subFolder: "Steel",
    variationRef: "-",
    supplierName: "IronWorks Inc.",
    supplierEmail: "quotes@ironworks.net",
    dateOfQuoteApproved: "",
    quoteTotal: "£125,500.50",
    createPo: "Create PO",
    datePOCreated: "",
    sendReminder: "Reminder",
    procurementComments: "Type here",
    requestToReQuote: "Re-quote",
    approvalQuotation: "Pending",
    approvalRelatedRequests: "-",
  },
  {
    no: "3",
    quotationRef: "QR-2023-0895",
    project: "Riverside Complex",
    mainFolder: "MEP",
    subFolder: "HVAC",
    variationRef: "VAR-012",
    supplierName: "CoolAir Systems",
    supplierEmail: "info@coolaircom",
    dateOfQuoteApproved: "2023-10-19",
    quoteTotal: "£89,200.00",
    createPo: "PO Created",
    datePOCreated: "2023-10-16",
    sendReminder: "Reminder",
    procurementComments: "Type here",
    requestToReQuote: "Re-quote",
    approvalQuotation: "Approved",
    approvalRelatedRequests: "Preferred vendor, lead time ok",
  },
  {
    no: "4",
    quotationRef: "QR-2023-0898",
    project: "Riverside Complex",
    mainFolder: "MEP",
    subFolder: "Electrical",
    variationRef: "-",
    supplierName: "VoltTech Solutions",
    supplierEmail: "contact@volttech.com",
    dateOfQuoteApproved: "",
    quoteTotal: "£67,450.00",
    createPo: "Create PO",
    datePOCreated: "",
    sendReminder: "Reminder",
    procurementComments: "Type here",
    requestToReQuote: "Re-quote",
    approvalQuotation: "Pending",
    approvalRelatedRequests: "-",
  },
  {
    no: "5",
    quotationRef: "QR-2023-0901",
    project: "Westside Mall",
    mainFolder: "Finishes",
    subFolder: "Flooring",
    variationRef: "VAR-003",
    supplierName: "Premium Tiles Co.",
    supplierEmail: "orders@premiumtiles.com",
    dateOfQuoteApproved: "2023-10-20",
    quoteTotal: "£112,000.00",
    createPo: "PO Created",
    datePOCreated: "2023-10-22",
    sendReminder: "Reminder",
    procurementComments: "Type here",
    requestToReQuote: "Re-quote",
    approvalQuotation: "Approved",
    approvalRelatedRequests: "Rejected due to budget constraints.",
  },
  {
    no: "6",
    quotationRef: "QR-2023-0905",
    project: "Westside Mall",
    mainFolder: "Finishes",
    subFolder: "Paint",
    variationRef: "-",
    supplierName: "ColorPro Paints",
    supplierEmail: "sales@colorpro.com",
    dateOfQuoteApproved: "2023-10-18",
    quoteTotal: "£18,600.00",
    createPo: "PO Created",
    datePOCreated: "2023-10-18",
    sendReminder: "Reminder",
    procurementComments: "Type here",
    requestToReQuote: "Re-quote",
    approvalQuotation: "Approved",
    approvalRelatedRequests: "Within budget, good quality.",
  },
]

const columns: ColumnDef<PurchaseOrderRow>[] = [
  {
    accessorKey: "no",
    header: "No.",
    size: 50,
  },
  {
    accessorKey: "quotationRef",
    header: "Quotation Ref",
    size: 120,
  },
  {
    accessorKey: "project",
    header: "Project",
    size: 140,
  },
  {
    accessorKey: "mainFolder",
    header: "Main Folder",
    size: 120,
  },
  {
    accessorKey: "subFolder",
    header: "Sub Folder",
    size: 120,
  },
  {
    accessorKey: "variationRef",
    header: "Variation Ref",
    size: 110,
  },
  {
    accessorKey: "supplierName",
    header: "Supplier Name",
    size: 150,
  },
  {
    accessorKey: "supplierEmail",
    header: "Supplier Email address",
    size: 180,
  },
  {
    accessorKey: "dateOfQuoteApproved",
    header: "Date of Quote Approved",
    size: 150,
  },
  {
    accessorKey: "quoteTotal",
    header: "Quote Total",
    size: 120,
  },
  {
    accessorKey: "createPo",
    header: "Create PO",
    size: 110,
    cell: ({ row }) => (
      <Button
        size="sm"
        variant={row.original.createPo === "PO Created" ? "default" : "outline"}
      >
        {row.original.createPo}
      </Button>
    ),
  },
  {
    accessorKey: "datePOCreated",
    header: "Date PO was Created",
    size: 150,
  },
  {
    accessorKey: "sendReminder",
    header: "Send Reminder",
    size: 110,
    cell: ({ row }) => (
      <Button size="sm" variant="ghost">
        🔔 {row.original.sendReminder}
      </Button>
    ),
  },
  {
    accessorKey: "procurementComments",
    header: "Procurement Comments",
    size: 150,
  },
  {
    accessorKey: "requestToReQuote",
    header: "Request to Re-quote",
    size: 140,
    cell: ({ row }) => (
      <Button size="sm" variant="outline">
        {row.original.requestToReQuote}
      </Button>
    ),
  },
  {
    accessorKey: "approvalQuotation",
    header: "Approval Quotation",
    size: 130,
    cell: ({ row }) => {
      const status = row.original.approvalQuotation
      return (
        <Badge variant={status === "Approved" ? "default" : "secondary"}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "approvalRelatedRequests",
    header: "Quote Approval Related Requests",
    size: 200,
  },
]

export default function Page() {
  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Purchase Order List</h2>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {summaryMetrics.map((metric) => (
          <Card
            key={metric.label}
            className="border-white/10 bg-gradient-to-b from-[#182842] to-[#0e1728] p-4"
          >
            <p className="text-xs text-slate-400">{metric.label}</p>
            <p className="mt-2 text-lg font-semibold text-emerald-400">
              {metric.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto">
        <DynamicTable columns={columns} data={data} />
      </div>
    </div>
  )
}
