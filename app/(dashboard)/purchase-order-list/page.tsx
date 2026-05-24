"use client"

import type { ColDef } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import TableStat from "@/components/common/table-stat"

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
//   { label: "Approved Quotes", value: "£2,550,000" },
  { label: "Created PO", value: "£845,200" },
//   { label: "Approved Quote Value", value: "£1,854,800" },
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

const columns: ColDef<PurchaseOrderRow>[] = [
  { headerName: "No.", field: "no", maxWidth: 60, filter: false },
  { headerName: "PO Ref", field: "quotationRef" },
  { headerName: "Project", field: "project" },
  { headerName: "Main Folder", field: "mainFolder" },
  { headerName: "Sub Folder", field: "subFolder" },
  { headerName: "Variation Ref", field: "variationRef" },
  { headerName: "Supplier Name", field: "supplierName" },
  { headerName: "Supplier Email address", field: "supplierEmail" },
  { headerName: "Date of Quote Approved", field: "dateOfQuoteApproved" },
  { headerName: "Date PO was Created", field: "datePOCreated" },
  {
    headerName: "Send Reminder",
    field: "sendReminder",
    cellRenderer: (params: { data?: PurchaseOrderRow }) => (
      <Button size="sm" variant="ghost">
        🔔 {params.data?.sendReminder}
      </Button>
    ),
  },
  { headerName: "Procurement Comments", field: "procurementComments" },
]

export default function Page() {
  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Purchase Order List</h2>
      </div>

      <TableStat summaryRows={summaryMetrics} />

      <div className="mt-8 overflow-x-auto">
        <AgTable rowData={data} columnDefs={columns} height="auto" defaultColDef={{ flex: 1, minWidth: 150 }} />
      </div>
    </div>
  )
}
