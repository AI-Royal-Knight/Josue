"use client"

import type { ColDef } from "ag-grid-community"

import { AgTable } from "@/components/common/AgTable"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import TableStat from "@/components/common/table-stat"

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

const summaryRows = [
  { label: "Proforma NR Invoice QTY", value: "1000", alert: false },
  { label: "Proforma NR Invoices Value", value: "400", alert: false },
  { label: "Approved Proforma NR Invoice", value: "200", alert: false },
  { label: "Approved Proforma NR Invoice Value", value: "200", alert: false },
  { label: "Proforma NR Invoice Awaiting approved", value: "200", alert: true },
  { label: "Awaiting approval proforma NR value", value: "200", alert: true },
  { label: "Proforma NR invoices due this week", value: "200", alert: false },
  {
    label: "Proforma NR invoices due value this week",
    value: "200",
    alert: false,
  },
  {
    label: "Proforma NR invoices value due this week",
    value: "200",
    alert: false,
  },
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

const columns: ColDef<ProformaRow>[] = [
  { headerName: "No.", field: "no" },
  { headerName: "Invoice Number", field: "invoiceNumber" },
  { headerName: "Date", field: "date" },
  { headerName: "NR Proforma no.", field: "nrProformaNo" },
  { headerName: "Project", field: "project" },
  { headerName: "Description of Works", field: "descriptionOfWorks" },
  { headerName: "Created by", field: "createdBy" },
  { headerName: "Approved by", field: "approvedBy" },
  { headerName: "Approved", field: "approved" },
  { headerName: "TOTAL", field: "total" },
  { headerName: "Paid", field: "paid" },
  { headerName: "Date paid", field: "datePaid" },
  { headerName: "Paid by", field: "paidBy" },
  { headerName: "Finance team comments", field: "financeComments" },
  { headerName: "Commercial team Comments", field: "commercialComments" },
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

      <TableStat summaryRows={summaryRows} />

      <AgTable rowData={rows} columnDefs={columns} height="auto" />
    </div>
  )
}
