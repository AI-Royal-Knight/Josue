"use client"

import { useMemo, useState } from "react"
import type { ColDef, RowClassParams } from "ag-grid-community"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import TableStat from "@/components/common/table-stat"
import { AgTable } from "@/components/common/AgTable"

type InvoiceRow = {
  no: string
  invoiceNumber: string
  date: string
  variationSheetNo: string
  nfiProformaNo: string
  project: string
  workArea: string
  workSection: string
  description: string
  createdBy: string
  approvedBy: string
  approved: string
  total: string
  paid: string
  datePaid: string
  paidBy: string
  financeComments: string
  commercialComments: string
  highlight?: boolean
}

const summaryRows = [
  { label: "Invoices QTY", value: "1000", alert: false },
  { label: "Invoices Value", value: "400", alert: false },
  { label: "Approved Invoices", value: "200", alert: false },
  { label: "Approved Invoices Value", value: "200", alert: false },
  { label: "Invoices Awaiting Approval", value: "200", alert: true },
  { label: "Awaiting Approval Value", value: "200", alert: true },
  { label: "Invoices Due this Week", value: "200", alert: false },
  { label: "Invoices Due this Week", value: "200", alert: false },
  { label: "Invoices Paid QTY", value: "200", alert: false },
  { label: "Invoices Paid Value", value: "200", alert: false },
]

const rows: InvoiceRow[] = [
  {
    no: "1",
    invoiceNumber: "",
    date: "",
    variationSheetNo: "",
    nfiProformaNo: "",
    project: "",
    workArea: "",
    workSection: "",
    description: "",
    createdBy: "",
    approvedBy: "",
    approved: "",
    total: "",
    paid: "",
    datePaid: "",
    paidBy: "",
    financeComments: "",
    commercialComments: "",
  },
  {
    no: "2",
    invoiceNumber: "",
    date: "",
    variationSheetNo: "",
    nfiProformaNo: "",
    project: "",
    workArea: "",
    workSection: "",
    description: "",
    createdBy: "",
    approvedBy: "",
    approved: "",
    total: "",
    paid: "",
    datePaid: "",
    paidBy: "",
    financeComments: "",
    commercialComments: "",
  },
  {
    no: "3",
    invoiceNumber: "INV-2024-003",
    date: "15/03/2024",
    variationSheetNo: "VS-012",
    nfiProformaNo: "NFI-045",
    project: "Al Barsha Tower",
    workArea: "Zone B",
    workSection: "Structural",
    description: "Concrete pouring for Level 5",
    createdBy: "Ahmed K.",
    approvedBy: "Mohammad R.",
    approved: "Yes",
    total: "145,000.00",
    paid: "145,000.00",
    datePaid: "22/03/2024",
    paidBy: "Sarah L.",
    financeComments: "Cleared",
    commercialComments: "Approved",
    highlight: true,
  },
  {
    no: "4",
    invoiceNumber: "",
    date: "",
    variationSheetNo: "",
    nfiProformaNo: "",
    project: "",
    workArea: "",
    workSection: "",
    description: "",
    createdBy: "",
    approvedBy: "",
    approved: "",
    total: "",
    paid: "",
    datePaid: "",
    paidBy: "",
    financeComments: "",
    commercialComments: "",
  },
  {
    no: "5",
    invoiceNumber: "INV-2024-005",
    date: "28/03/2024",
    variationSheetNo: "VS-018",
    nfiProformaNo: "NFI-052",
    project: "Dubai Marina Plaza",
    workArea: "Zone A",
    workSection: "MEP",
    description: "HVAC installation Phase 2",
    createdBy: "Omar S.",
    approvedBy: "Fatima H.",
    approved: "Yes",
    total: "89,500.00",
    paid: "89,500.00",
    datePaid: "05/04/2024",
    paidBy: "Sarah L.",
    financeComments: "Processed",
    commercialComments: "Verified",
    highlight: true,
  },
  {
    no: "6",
    invoiceNumber: "",
    date: "",
    variationSheetNo: "",
    nfiProformaNo: "",
    project: "",
    workArea: "",
    workSection: "",
    description: "",
    createdBy: "",
    approvedBy: "",
    approved: "",
    total: "",
    paid: "",
    datePaid: "",
    paidBy: "",
    financeComments: "",
    commercialComments: "",
  },
  {
    no: "7",
    invoiceNumber: "",
    date: "",
    variationSheetNo: "",
    nfiProformaNo: "",
    project: "",
    workArea: "",
    workSection: "",
    description: "",
    createdBy: "",
    approvedBy: "",
    approved: "",
    total: "",
    paid: "",
    datePaid: "",
    paidBy: "",
    financeComments: "",
    commercialComments: "",
  },
]

export default function Page() {
  const [selectedProject, setSelectedProject] = useState("project-a")
  const columns = useMemo<ColDef<InvoiceRow>[]>(
    () => [
      { headerName: "No.", field: "no", minWidth: 70, filter: false },
      { headerName: "Invoice Number", field: "invoiceNumber", minWidth: 160 },
      { headerName: "Date", field: "date", minWidth: 120 },
      {
        headerName: "Variation sheet no.",
        field: "variationSheetNo",
        minWidth: 140,
      },
      { headerName: "NFI Proforma no.", field: "nfiProformaNo", minWidth: 140 },
      { headerName: "Project", field: "project", minWidth: 160 },
      { headerName: "Work area", field: "workArea", minWidth: 120 },
      { headerName: "Work section", field: "workSection", minWidth: 140 },
      {
        headerName: "Description of Work",
        field: "description",
        minWidth: 200,
      },
      { headerName: "Created by", field: "createdBy", minWidth: 140 },
      { headerName: "Approved by", field: "approvedBy", minWidth: 140 },
      { headerName: "Approved", field: "approved", minWidth: 100 },
      {
        headerName: "TOTAL",
        field: "total",
        minWidth: 120,
        cellStyle: { textAlign: "right" },
      },
      {
        headerName: "Paid",
        field: "paid",
        minWidth: 120,
        cellStyle: { textAlign: "right" },
      },
      { headerName: "Date paid", field: "datePaid", minWidth: 120 },
      { headerName: "Paid by", field: "paidBy", minWidth: 140 },
      {
        headerName: "Finance team comments",
        field: "financeComments",
        minWidth: 200,
      },
      {
        headerName: "Commercial team comments",
        field: "commercialComments",
        minWidth: 200,
      },
    ],
    []
  )

//   const gridOptions = useMemo(
//     () => ({
//       getRowStyle: (params: RowClassParams) =>
//         params.data?.highlight
//           ? { background: "#1ea84d", color: "#ffffff" }
//           : undefined,
//     }),
//     []
//   )

  return (
    <div className="w-full space-y-6 p-6">
      <h2 className="text-2xl font-semibold">User Invoices</h2>

      <div className="max-w-[440px] space-y-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Select Project
          </label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="border-white/10 bg-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900">
              <SelectItem value="project-a">Project A</SelectItem>
              <SelectItem value="project-b">Project B</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TableStat summaryRows={summaryRows} />
      </div>

      <div className="overflow-x-auto border border-white/10">
        <div className="min-w-[1200px]">
          <AgTable
            rowData={rows}
            columnDefs={columns}
            height="auto"
            // gridOptions={gridOptions}
          />
        </div>
      </div>
    </div>
  )
}
