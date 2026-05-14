"use client"

import { useState, useCallback } from "react"
import type {
  CellValueChangedEvent,
  ColDef,
  ICellRendererParams,
  ValueParserParams,
} from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import Filters from "@/components/shared/filters"
import { Switch } from "@/components/ui/switch"

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

export default function Page() {
  const [rows, setRows] = useState(supplierRows)

  const columnDefs: ColDef<SupplierInvoiceRow>[] = [
    { field: "no", headerName: "No", editable: false, minWidth: 80 },
    { field: "invoiceNumber", headerName: "Invoice Number", editable: true },
    { field: "sentDate", headerName: "Date (Supplier sent)", editable: true },
    { field: "project", headerName: "Project", editable: true },
    { field: "supplier", headerName: "Supplier name", editable: true },
    { field: "sortCode", headerName: "Sort code", editable: true },
    { field: "accountNumber", headerName: "Account number", editable: true },
    { field: "total", headerName: "Total", editable: true },
    { field: "paidBy", headerName: "Paid by", editable: true },
    {
      field: "paid",
      headerName: "Paid",
      editable: true,
      minWidth: 100,
      cellRenderer: (
        params: ICellRendererParams<SupplierInvoiceRow, boolean>
      ) => (params.value ? "Yes" : "No"),
      valueParser: (
        params: ValueParserParams<SupplierInvoiceRow, string | boolean>
      ) => {
        // normalize checkbox input
        const normalizedValue = String(params.newValue).toLowerCase()
        return normalizedValue === "true" || normalizedValue === "yes"
      },
    },
    { field: "scheduledDate", headerName: "Date scheduled", editable: true },
    { field: "releaseDate", headerName: "Release date", editable: true },
    {
      field: "financeComments",
      headerName: "Finance comments",
      editable: true,
    },
    {
      field: "procurementComments",
      headerName: "Procurement comments",
      editable: true,
    },
    {
      field: "commercialComments",
      headerName: "Commercial comments",
      editable: true,
    },
  ]

  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent<SupplierInvoiceRow>) => {
      const updated = rows.map((r) =>
        r.no === params.data.no ? params.data : r
      )
      setRows(updated)
    },
    [rows]
  )

  return (
    <div className="w-full min-w-0 space-y-8 p-4">
      <div className="grid grid-cols-2 overflow-hidden">
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
      <Filters />

      <AgTable
        rowData={rows}
        columnDefs={columnDefs}
        onCellValueChanged={handleCellValueChanged}
        height={400}
      />
    </div>
  )
}
