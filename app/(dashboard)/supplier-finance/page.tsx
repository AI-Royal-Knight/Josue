"use client"

import { useState } from "react"
import { Download, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SupplierInvoiceRow = {
  no: string
  invoiceNumber: string
  sentDate: string
  project: string
  supplier: string
  sortCode: string
  accountNumber: string
  total: string
  paidBy: string
  paid: boolean
  scheduledDate: string
  releaseDate: string
  financeComments: string
  procurementComments: string
  commercialComments: string
}

const summaryRows = [
  { label: "Approved Invoices", value: "1000" },
  { label: "Approved Invoices Value", value: "400" },
  { label: "Invoices Due This Week", value: "200" },
  { label: "Invoices Value Due This Week", value: "200" },
  { label: "Invoices Paid QTY", value: "200" },
  { label: "Invoices Paid Value", value: "200" },
]

const supplierRows: SupplierInvoiceRow[] = [
  {
    no: "1",
    invoiceNumber: "SUP-2024-001",
    sentDate: "2024-01-10",
    project: "Project",
    supplier: "Tech Solutions",
    sortCode: "20-30-40",
    accountNumber: "98765432",
    total: "£15,000",
    paidBy: "Finance Team",
    paid: true,
    scheduledDate: "2024-02-05",
    releaseDate: "2024-02-08",
    financeComments: "Type here",
    procurementComments: "Type here",
    commercialComments: "Type here",
  },
  {
    no: "2",
    invoiceNumber: "SUP-2024-002",
    sentDate: "2024-01-12",
    project: "Project",
    supplier: "Office",
    sortCode: "30-40-50",
    accountNumber: "87654321",
    total: "£3,500",
    paidBy: "-",
    paid: false,
    scheduledDate: "2024-02-07",
    releaseDate: "2024-02-10",
    financeComments: "Type here",
    procurementComments: "Type here",
    commercialComments: "Type here",
  },
  {
    no: "3",
    invoiceNumber: "SUP-2024-003",
    sentDate: "2024-01-14",
    project: "Project",
    supplier: "Construction",
    sortCode: "40-50-60",
    accountNumber: "76543210",
    total: "£28,000",
    paidBy: "Finance Team",
    paid: true,
    scheduledDate: "2024-02-09",
    releaseDate: "2024-02-12",
    financeComments: "Type here",
    procurementComments: "Type here",
    commercialComments: "Type here",
  },
  {
    no: "4",
    invoiceNumber: "SUP-2024-004",
    sentDate: "2024-01-16",
    project: "Project",
    supplier: "IT Services",
    sortCode: "50-60-70",
    accountNumber: "65432109",
    total: "£12,500",
    paidBy: "-",
    paid: false,
    scheduledDate: "2024-02-11",
    releaseDate: "2024-02-14",
    financeComments: "Type here",
    procurementComments: "Type here",
    commercialComments: "Type here",
  },
  {
    no: "5",
    invoiceNumber: "SUP-2024-005",
    sentDate: "2024-01-18",
    project: "Project",
    supplier: "Agency Ltd",
    sortCode: "60-70-80",
    accountNumber: "54321098",
    total: "£8,900",
    paidBy: "-",
    paid: false,
    scheduledDate: "2024-02-13",
    releaseDate: "2024-02-16",
    financeComments: "Type here",
    procurementComments: "Type here",
    commercialComments: "Type here",
  },
  {
    no: "6",
    invoiceNumber: "SUP-2024-006",
    sentDate: "2024-01-20",
    project: "Project",
    supplier: "Logistics",
    sortCode: "70-80-90",
    accountNumber: "43210987",
    total: "£6,200",
    paidBy: "Finance Team",
    paid: true,
    scheduledDate: "2024-02-15",
    releaseDate: "2024-02-18",
    financeComments: "Type here",
    procurementComments: "Type here",
    commercialComments: "Type here",
  },
]

function PaidToggle({ checked }: { checked: boolean }) {
  return (
    <button
      type="button"
      className={`relative h-5 w-10 rounded-full border transition ${
        checked
          ? "border-emerald-400 bg-emerald-500/90"
          : "border-slate-500 bg-slate-600"
      }`}
      aria-label={checked ? "Paid" : "Not paid"}
    >
      <span
        className={`absolute top-[1px] size-4 rounded-full bg-white transition ${
          checked ? "right-[1px]" : "left-[1px]"
        }`}
      />
    </button>
  )
}

export default function Page() {
  const [projectFilter, setProjectFilter] = useState("all-projects")
  const [supplierFilter, setSupplierFilter] = useState("all-suppliers")

  return (
    <div className="w-full min-w-0 space-y-8 bg-gradient-to-b from-[#011f1c] to-[#031e1a] p-6">
      <div className="max-w-[500px] overflow-hidden border border-[#0a5f4d]">
        {summaryRows.map((row) => (
          <div
            className="grid grid-cols-[1fr_190px] border-b border-[#0a5f4d] last:border-b-0"
            key={row.label}
          >
            <div className="bg-[#2f67d9] px-3 py-2 text-xs font-semibold text-slate-100">
              {row.label}
            </div>
            <div className="bg-[#16663f] px-3 py-2 text-xs font-semibold text-slate-100">
              {row.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="size-3.5" />
          Filters :
        </div>

        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="h-9 w-[130px] border-[#2d2d2d] bg-[#101012] text-xs text-slate-200">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent className="border-[#2d2d2d] bg-[#101012] text-slate-200">
            <SelectItem value="all-projects">All Projects</SelectItem>
            <SelectItem value="project-a">Project A</SelectItem>
            <SelectItem value="project-b">Project B</SelectItem>
          </SelectContent>
        </Select>

        <Select value={supplierFilter} onValueChange={setSupplierFilter}>
          <SelectTrigger className="h-9 w-[130px] border-[#2d2d2d] bg-[#101012] text-xs text-slate-200">
            <SelectValue placeholder="All Suppliers" />
          </SelectTrigger>
          <SelectContent className="border-[#2d2d2d] bg-[#101012] text-slate-200">
            <SelectItem value="all-suppliers">All Suppliers</SelectItem>
            <SelectItem value="office">Office</SelectItem>
            <SelectItem value="construction">Construction</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-9 border-[#2d2d2d] bg-[#101012] text-xs text-slate-200 hover:bg-[#1a1a1e]"
            >
              <Download className="mr-1.5 size-3.5" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44 border-[#2d2d2d] bg-[#101012] text-slate-200">
            <DropdownMenuItem className="text-xs">
              Export as Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">
              Export as CSV (.csv)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-x-auto border border-[#0a3b35]">
        <table className="w-full min-w-[1650px] border-collapse text-xs text-slate-300">
          <thead>
            <tr className="bg-[#0b7345] text-slate-100">
              <th className="border border-[#11473f] px-2 py-2 text-left">
                No
              </th>
              <th className="border border-[#11473f] px-2 py-2 text-left">
                Invoice Number
              </th>
              <th className="border border-[#11473f] px-2 py-2 text-left">
                Date (Supplier sent)
              </th>
              <th className="border border-[#11473f] px-2 py-2 text-left">
                Project
              </th>
              <th className="border border-[#11473f] px-2 py-2 text-left">
                Supplier name
              </th>
              <th className="border border-[#11473f] px-2 py-2 text-left">
                Sort code
              </th>
              <th className="border border-[#11473f] px-2 py-2 text-left">
                Account number
              </th>
              <th className="border border-[#11473f] px-2 py-2 text-left">
                Total
              </th>
              <th className="border border-[#11473f] px-2 py-2 text-left">
                Paid by
              </th>
              <th className="border border-[#11473f] px-2 py-2 text-center">
                Paid
              </th>
              <th className="border border-[#11473f] px-2 py-2 text-left">
                Date scheduled
              </th>
              <th className="border border-[#11473f] px-2 py-2 text-left">
                Release date
              </th>
              <th className="border border-[#11473f] px-2 py-2 text-left">
                Finance comments
              </th>
              <th className="border border-[#11473f] px-2 py-2 text-left">
                Procurement comments
              </th>
              <th className="border border-[#11473f] px-2 py-2 text-left">
                Commercial comments
              </th>
            </tr>
          </thead>
          <tbody>
            {supplierRows.map((row, index) => (
              <tr
                key={row.no}
                className={index % 2 === 0 ? "bg-[#181818]" : "bg-[#141414]"}
              >
                <td className="border border-[#252525] px-2 py-2">{row.no}</td>
                <td className="border border-[#252525] px-2 py-2">
                  {row.invoiceNumber}
                </td>
                <td className="border border-[#252525] px-2 py-2">
                  {row.sentDate}
                </td>
                <td className="border border-[#252525] px-2 py-2">
                  {row.project}
                </td>
                <td className="border border-[#252525] px-2 py-2">
                  {row.supplier}
                </td>
                <td className="border border-[#252525] px-2 py-2">
                  {row.sortCode}
                </td>
                <td className="border border-[#252525] px-2 py-2">
                  {row.accountNumber}
                </td>
                <td className="border border-[#252525] px-2 py-2">
                  {row.total}
                </td>
                <td className="border border-[#252525] px-2 py-2">
                  {row.paidBy}
                </td>
                <td className="border border-[#252525] px-2 py-2 text-center">
                  <PaidToggle checked={row.paid} />
                </td>
                <td className="border border-[#252525] px-2 py-2">
                  {row.scheduledDate}
                </td>
                <td className="border border-[#252525] px-2 py-2">
                  {row.releaseDate}
                </td>
                <td className="border border-[#252525] px-2 py-2">
                  {row.financeComments}
                </td>
                <td className="border border-[#252525] px-2 py-2">
                  {row.procurementComments}
                </td>
                <td className="border border-[#252525] px-2 py-2">
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
