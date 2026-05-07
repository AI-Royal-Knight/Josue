"use client"

import { useState } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type InvoiceListRow = {
  no: string
  invoiceNumber: string
  date: string
  project: string
  userName: string
  sortCode: string
  accountNumber: string
  total: string
  paid: boolean
  dateScheduled: string
  releaseDate: string
  comments: string
}

const summaryRows = [
  { label: "Approved Invoices", value: "1000" },
  { label: "Approved Invoices Value", value: "400" },
  { label: "Invoices Due This Week", value: "200" },
  { label: "Invoices Value Due This Week", value: "200" },
  { label: "Invoices Paid QTY", value: "200" },
  { label: "Invoices Paid Value", value: "200" },
]

const data: InvoiceListRow[] = [
  {
    no: "1",
    invoiceNumber: "INV-2024-001",
    date: "2024-01-15",
    project: "Project Alpha",
    userName: "John Smith",
    sortCode: "12-34-56",
    accountNumber: "12345678",
    total: "£2,500",
    paid: true,
    dateScheduled: "2024-01-20",
    releaseDate: "2024-01-22",
    comments: "Approved by manager",
  },
  {
    no: "2",
    invoiceNumber: "INV-2024-002",
    date: "2024-01-16",
    project: "Project Beta",
    userName: "Sarah Johnson",
    sortCode: "23-45-67",
    accountNumber: "23456789",
    total: "£3,750",
    paid: false,
    dateScheduled: "2024-01-25",
    releaseDate: "2024-01-27",
    comments: "Pending review",
  },
  {
    no: "3",
    invoiceNumber: "INV-2024-003",
    date: "2024-01-17",
    project: "Project Gamma",
    userName: "Michael Brown",
    sortCode: "34-56-78",
    accountNumber: "34567890",
    total: "£1,850",
    paid: true,
    dateScheduled: "2024-01-21",
    releaseDate: "2024-01-23",
    comments: "Completed",
  },
  {
    no: "4",
    invoiceNumber: "INV-2024-004",
    date: "2024-01-18",
    project: "Project Delta",
    userName: "Emma Wilson",
    sortCode: "45-67-89",
    accountNumber: "45678901",
    total: "£4,200",
    paid: false,
    dateScheduled: "2024-01-26",
    releaseDate: "2024-01-28",
    comments: "Awaiting approval",
  },
  {
    no: "5",
    invoiceNumber: "INV-2024-005",
    date: "2024-01-19",
    project: "Project Epsilon",
    userName: "James Davis",
    sortCode: "56-78-90",
    accountNumber: "56789012",
    total: "£3,100",
    paid: true,
    dateScheduled: "2024-01-22",
    releaseDate: "2024-01-24",
    comments: "Processed",
  },
  {
    no: "6",
    invoiceNumber: "INV-2024-006",
    date: "2024-01-20",
    project: "Project Zeta",
    userName: "Olivia Martinez",
    sortCode: "67-89-01",
    accountNumber: "67890123",
    total: "£2,900",
    paid: false,
    dateScheduled: "2024-01-27",
    releaseDate: "2024-01-29",
    comments: "In progress",
  },
  {
    no: "7",
    invoiceNumber: "INV-2024-007",
    date: "2024-01-21",
    project: "Project Eta",
    userName: "William Taylor",
    sortCode: "78-90-12",
    accountNumber: "78901234",
    total: "£5,500",
    paid: true,
    dateScheduled: "2024-01-23",
    releaseDate: "2024-01-25",
    comments: "Finalized",
  },
  {
    no: "8",
    invoiceNumber: "INV-2024-008",
    date: "2024-01-22",
    project: "Project Theta",
    userName: "Sophia Anderson",
    sortCode: "89-01-23",
    accountNumber: "89012345",
    total: "£1,650",
    paid: false,
    dateScheduled: "2024-01-28",
    releaseDate: "2024-01-30",
    comments: "Under review",
  },
]

function PaidToggle({ checked }: { checked: boolean }) {
  return (
    <button
      type="button"
      className={`relative h-6 w-11 rounded-full border transition ${
        checked
          ? "border-emerald-400 bg-emerald-500/90"
          : "border-slate-500 bg-slate-600"
      }`}
      aria-label={checked ? "Paid" : "Not paid"}
    >
      <span
        className={`absolute top-[2px] size-5 rounded-full bg-white transition ${
          checked ? "right-[2px]" : "left-[2px]"
        }`}
      />
    </button>
  )
}

export default function Page() {
  const [project, setProject] = useState("all")

  return (
    <div className="w-full space-y-6 bg-gradient-to-b from-[#011f1c] to-[#031e1a] p-6">
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

      <div className="max-w-[220px]">
        <Select value={project} onValueChange={setProject}>
          <SelectTrigger className="border-[#0a5f4d] bg-[#062724] text-slate-200">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent className="border-[#0a5f4d] bg-[#062724] text-slate-200">
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="alpha">Project Alpha</SelectItem>
            <SelectItem value="beta">Project Beta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto border border-[#0a3b35]">
        <table className="w-full min-w-[1450px] border-collapse text-xs text-slate-300">
          <thead>
            <tr className="bg-[#0b3b33] text-slate-200">
              <th className="border border-[#11473f] px-3 py-2 text-left">
                No
              </th>
              <th className="border border-[#11473f] bg-[#2b2d20] px-3 py-2 text-left">
                Invoice Number
              </th>
              <th className="border border-[#11473f] px-3 py-2 text-left">
                Date
              </th>
              <th className="border border-[#11473f] px-3 py-2 text-left">
                Project
              </th>
              <th className="border border-[#11473f] px-3 py-2 text-left">
                Name-USER
              </th>
              <th className="border border-[#11473f] px-3 py-2 text-left">
                Sort code
              </th>
              <th className="border border-[#11473f] px-3 py-2 text-left">
                Account number
              </th>
              <th className="border border-[#11473f] px-3 py-2 text-left">
                Total
              </th>
              <th className="border border-[#11473f] px-3 py-2 text-center">
                Paid
              </th>
              <th className="border border-[#11473f] px-3 py-2 text-left">
                Date scheduled
              </th>
              <th className="border border-[#11473f] px-3 py-2 text-left">
                Release date
              </th>
              <th className="border border-[#11473f] px-3 py-2 text-left">
                Comments
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.no}
                className={
                  index % 2 === 0 ? "bg-[#073d2d]/75" : "bg-[#052f25]/75"
                }
              >
                <td className="border border-[#11473f] px-3 py-2">{row.no}</td>
                <td className="border border-[#11473f] bg-[#2b2d20] px-3 py-2 text-[#2ea2ff]">
                  {row.invoiceNumber}
                </td>
                <td className="border border-[#11473f] px-3 py-2">
                  {row.date}
                </td>
                <td className="border border-[#11473f] px-3 py-2">
                  {row.project}
                </td>
                <td className="border border-[#11473f] px-3 py-2">
                  {row.userName}
                </td>
                <td className="border border-[#11473f] px-3 py-2">
                  {row.sortCode}
                </td>
                <td className="border border-[#11473f] px-3 py-2">
                  {row.accountNumber}
                </td>
                <td className="border border-[#11473f] px-3 py-2">
                  {row.total}
                </td>
                <td className="border border-[#11473f] px-3 py-2 text-center">
                  <PaidToggle checked={row.paid} />
                </td>
                <td className="border border-[#11473f] px-3 py-2">
                  {row.dateScheduled}
                </td>
                <td className="border border-[#11473f] px-3 py-2">
                  {row.releaseDate}
                </td>
                <td className="border border-[#11473f] px-3 py-2">
                  {row.comments}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
