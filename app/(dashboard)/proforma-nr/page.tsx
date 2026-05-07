import type { ColumnDef } from "@tanstack/react-table"

import { DynamicTable } from "@/components/dynamic-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ProformaRow = {
  no: number
  invoiceNumber: string
  date: string
  nrProformaNo: string
  project: string
  workArea: string
  workSection: string
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

const summaryRows = [
  { label: "Proforma NR Invoice QTY", value: "1000", alert: false },
  { label: "Proforma NR Invoices Value", value: "400", alert: false },
  { label: "Approved Proforma NR Invoice", value: "200", alert: false },
  { label: "Approved Proforma NR Invoice Value", value: "200", alert: false },
  { label: "Proforma NR Invoice Awaiting approved", value: "200", alert: true },
  { label: "Awaiting approval proforma NR value", value: "200", alert: true },
  { label: "Proforma NR invoices due this week", value: "200", alert: false },
  { label: "Proforma NR invoices due value this week", value: "200", alert: false },
  { label: "Proforma NR invoices value due this week", value: "200", alert: false },
  { label: "Proforma NR invoices paid QTY", value: "200", alert: false },
  { label: "Proforma NR invoices paid value", value: "200", alert: false },
]

const rows: ProformaRow[] = [
  {
    no: 1,
    invoiceNumber: "you can click each invoice to expand the invoice",
    date: "2023-10-01",
    nrProformaNo: "NR-PF-1000",
    project: "Project A",
    workArea: "Main Site",
    workSection: "Main Site",
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
    invoiceNumber: "you can click each invoice to expand the invoice",
    date: "2023-10-02",
    nrProformaNo: "NR-PF-1001",
    project: "Project B",
    workArea: "Sub Site B",
    workSection: "Sub Site B",
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
    invoiceNumber: "you can click each invoice to expand the invoice",
    date: "2023-10-03",
    nrProformaNo: "NR-PF-1002",
    project: "Project C",
    workArea: "Main Site",
    workSection: "Main Site",
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
    invoiceNumber: "you can click each invoice to expand the invoice",
    date: "2023-10-04",
    nrProformaNo: "NR-PF-1003",
    project: "Project D",
    workArea: "Sub Site B",
    workSection: "Sub Site B",
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

const columns: ColumnDef<ProformaRow>[] = [
  { accessorKey: "no", header: "No." },
  { accessorKey: "invoiceNumber", header: "Invoice Number" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "nrProformaNo", header: "NR Proforma no." },
  { accessorKey: "project", header: "Project" },
  { accessorKey: "workArea", header: "Work area" },
  { accessorKey: "workSection", header: "Work section" },
  { accessorKey: "descriptionOfWorks", header: "Description of Works" },
  { accessorKey: "createdBy", header: "Created by" },
  { accessorKey: "approvedBy", header: "Approved by" },
  { accessorKey: "approved", header: "Approved" },
  { accessorKey: "total", header: "TOTAL" },
  { accessorKey: "paid", header: "Paid" },
  { accessorKey: "datePaid", header: "Date paid" },
  { accessorKey: "paidBy", header: "Paid by" },
  { accessorKey: "financeComments", header: "Finance team comments" },
  { accessorKey: "commercialComments", header: "Commercial team Comments" },
]

export default function Page() {
  return (
    <div className="w-full min-w-0 space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Proforma NR List</h1>

      <div className="max-w-[420px] space-y-2">
        <p className="text-sm font-medium">Select Project</p>
        <Select defaultValue="project-a">
          <SelectTrigger className="bg-[#1a2842]">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="project-a">Project A</SelectItem>
            <SelectItem value="project-b">Project B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="max-w-[420px] overflow-hidden border border-[#1e3a5f]">
        {summaryRows.map((item) => (
          <div key={item.label} className="grid grid-cols-2 border-b border-[#1e3a5f] last:border-b-0">
            <div className={item.alert ? "bg-[#ff003d] px-4 py-3 text-sm font-medium text-white" : "bg-[#166534] px-4 py-3 text-sm font-medium text-white"}>
              {item.label}
            </div>
            <div className="bg-[#166534] px-4 py-3 text-sm font-semibold text-white">{item.value}</div>
          </div>
        ))}
      </div>

      <DynamicTable columns={columns} data={rows} initialSortId="no" />
    </div>
  )
}
