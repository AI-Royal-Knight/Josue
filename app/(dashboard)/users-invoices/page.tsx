"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import TableStat from "@/components/common/table-stat"

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
        <table className="w-full min-w-[1950px] border-collapse text-xs text-slate-300">
          <thead>
            <tr className="bg-[#0f1d36] text-[10px] text-slate-400">
              <th
                colSpan={2}
                className="border border-[#1d3150] px-2 py-1 text-left"
              >
                INFORMATION AUTOMATIC WHEN USER SUBMITS INVOICE
              </th>
              <th
                colSpan={4}
                className="border border-[#1d3150] px-2 py-1 text-left"
              >
                name of managing staff
              </th>
              <th
                colSpan={4}
                className="border border-[#1d3150] px-2 py-1 text-left"
              >
                times given when invoice is approved and it also gets added to
                finance invoice list
              </th>
              <th
                colSpan={2}
                className="border border-[#1d3150] px-2 py-1 text-left"
              >
                finance team initials invoice person
              </th>
              <th
                colSpan={2}
                className="border border-[#1d3150] px-2 py-1 text-left"
              >
                when finance team decides
              </th>
              <th
                colSpan={2}
                className="border border-[#1d3150] px-2 py-1 text-left"
              >
                Name of finance team staff initials
              </th>
              <th
                colSpan={2}
                className="border border-[#1d3150] px-2 py-1 text-left"
              >
                comments
              </th>
            </tr>
            <tr className="bg-[#1f3571] text-[11px] text-slate-100">
              <th className="border border-[#1d3150] px-2 py-1.5 text-left">
                No.
              </th>
              <th className="border border-[#1d3150] bg-[#e3b000] px-2 py-1.5 text-left text-black">
                Invoice Number
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-left">
                Date
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-left">
                Variation sheet no.
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-left">
                NFI Proforma no.
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-left">
                Project
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-left">
                Work area
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-left">
                Work section
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-left">
                Description of Work
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-left">
                Created by
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-left">
                Approved by
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-left">
                Approved
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-right">
                TOTAL
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-right">
                Paid
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-left">
                Date paid
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-left">
                Paid by
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-left">
                Finance team comments
              </th>
              <th className="border border-[#1d3150] px-2 py-1.5 text-left">
                Commercial team comments
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.no}
                className={
                  row.highlight
                    ? "bg-[#1ea84d]/90 text-slate-100"
                    : "bg-[#0a1730] even:bg-[#0a1a33]"
                }
              >
                <td className="border border-[#1d3150] px-2 py-1.5">
                  {row.no}
                </td>
                <td className="border border-[#1d3150] bg-[#e3b000] px-2 py-1.5 font-semibold text-black">
                  {row.invoiceNumber}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5">
                  {row.date}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5">
                  {row.variationSheetNo}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5">
                  {row.nfiProformaNo}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5">
                  {row.project}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5">
                  {row.workArea}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5">
                  {row.workSection}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5">
                  {row.description}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5">
                  {row.createdBy}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5">
                  {row.approvedBy}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5">
                  {row.approved}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5 text-right">
                  {row.total}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5 text-right">
                  {row.paid}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5">
                  {row.datePaid}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5">
                  {row.paidBy}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5">
                  {row.financeComments}
                </td>
                <td className="border border-[#1d3150] px-2 py-1.5">
                  {row.commercialComments}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
