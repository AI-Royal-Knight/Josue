"use client"

import { useState } from "react"
import type { ColDef } from "ag-grid-community"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AgTable } from "@/components/common/AgTable"
import ConfirmPaymentDialog from "@/components/common/confirm-payment"
import TableStat from "@/components/common/table-stat"

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
  scheduledBy: string
}

const summaryRows = [
  { label: "Approved Invoices", value: "1000" },
  { label: "Approved Invoices Value", value: "£400" },
  { label: "Invoices Due This Week", value: "200" },
  { label: "Invoices Value Due This Week", value: "£200" },
  { label: "Invoices Paid QTY", value: "200" },
  { label: "Invoices Paid Value", value: "£200" },
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
    scheduledBy: "John Smith",
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
    scheduledBy: "Sarah Johnson",
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
    scheduledBy: "Michael Brown",
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
    scheduledBy: "Emma Wilson",
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
    scheduledBy: "James Davis",
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
    scheduledBy: "Olivia Martinez",
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
    scheduledBy: "William Taylor",
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
    scheduledBy: "Sophia Anderson",
  },
]

export default function InvoiceListClient() {
  const [project, setProject] = useState("all")
  const [rows, setRows] = useState<InvoiceListRow[]>(data)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingRowId, setPendingRowId] = useState<string | null>(null)
  const [nextPaid, setNextPaid] = useState(false)

  function openPaymentConfirm(rowId: string, checked: boolean) {
    setPendingRowId(rowId)
    setNextPaid(checked)
    setConfirmOpen(true)
  }

  function handleConfirmPaymentChange() {
    if (!pendingRowId) return

    setRows((currentRows) =>
      currentRows.map((row) =>
        row.no === pendingRowId ? { ...row, paid: nextPaid } : row
      )
    )
    setConfirmOpen(false)
    setPendingRowId(null)
  }

  const columnDefs: ColDef<InvoiceListRow>[] = [
    { headerName: "No", field: "no" },
    {
      headerName: "Invoice Number",
      field: "invoiceNumber",
      cellRenderer: (params: { value: string }) => (
        <a className="text-green-500 hover:underline">{params.value}</a>
      ),
    },
    { headerName: "Date", field: "date" },
    { headerName: "Project", field: "project" },
    { headerName: "Name-USER", field: "userName" },
    { headerName: "Sort code", field: "sortCode" },
    { headerName: "Account number", field: "accountNumber" },
    { headerName: "Total", field: "total" },
    {
      headerName: "Payment Scheduled",
      field: "paid",
      cellRenderer: (params: { data?: InvoiceListRow; value: boolean }) => (
        <Switch
          checked={params.value}
          onCheckedChange={(checked) => {
            if (!params.data) return
            openPaymentConfirm(params.data.no, checked)
          }}
        />
      ),
      type: "",
    },
    { headerName: "Date scheduled", field: "dateScheduled" },
    { headerName: "Release date", field: "releaseDate" },
    { headerName: "Scheduled by", field: "scheduledBy" },
    { headerName: "Comments", field: "comments" },
  ]

  return (
    <div className="w-full space-y-6 bg-white p-6">
      <h1 className="text-primary">Invoice List</h1>

      <TableStat summaryRows={summaryRows} />

      <div className="max-w-[220px]">
        <Select value={project} onValueChange={setProject}>
          <SelectTrigger className="bg-primary">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="alpha">Project Alpha</SelectItem>
            <SelectItem value="beta">Project Beta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ConfirmPaymentDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        supplierName={
          rows.find((row) => row.no === pendingRowId)?.userName ??
          "this supplier"
        }
        nextPaid={nextPaid}
        onConfirm={handleConfirmPaymentChange}
      />

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
