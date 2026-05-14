"use client"
import { useCallback, useState } from "react"
import { AgTable } from "@/components/common/AgTable"
import Filters from "@/components/shared/filters"
import { Input } from "@/components/ui/input"
import type {
  CellValueChangedEvent,
  ColDef,
  ICellRendererParams,
} from "ag-grid-community"

type SupplierInvoiceRow = {
  no: string
  invoiceNumber: string
  date: string
  poDate: string
  poRef: string
  callOffDate: string
  callOffRef: string
  variationRef: string
  otherRef: string
  project: string
  supplierName: string
  invoiceTotal: string
  expectedCost: string
  paymentDueDate: string
  approvedBy: string
  approved: string
  financeComments: string | null
  procurementComments: string | null
  commercialComments: string | null
}

type CommentField =
  | "financeComments"
  | "procurementComments"
  | "commercialComments"

const summaryRows = [
  { label: "Invoices QTY", value: "0000000" },
  { label: "Invoices Value", value: "0000000" },
  { label: "Approved invoices", value: "0000000" },
  { label: "Approved invoices value", value: "0000000" },
  { label: "Invoices awaiting approval", value: "0000000" },
  { label: "Awaiting approval value", value: "0000000" },
  { label: "Invoices due this month", value: "0000000" },
  { label: "Invoices value due this month", value: "0000000" },
  { label: "Invoices paid QTY", value: "0000000" },
  { label: "Invoices paid value", value: "0000000" },
]

const supplierRows: SupplierInvoiceRow[] = [
  {
    no: "001",
    invoiceNumber: "INV-88-2024-089",
    date: "12 Oct 2024",
    poDate: "01 Sep 2024",
    poRef: "PO-45002",
    callOffDate: "15 Sep 2024",
    callOffRef: "CO-5921",
    variationRef: "VAR-001",
    otherRef: "-",
    project: "M25 Junction 10",
    supplierName: "Balfour Beatty",
    invoiceTotal: "£145,000.00",
    expectedCost: "£145,000.00",
    paymentDueDate: "31 Oct 2024",
    approvedBy: "Sarah Jenkins",
    approved: "✓ Approved",
    financeComments: "Matched to PO",
    procurementComments: "Rates verified",
    commercialComments: "Approved for payment",
  },
  {
    no: "002",
    invoiceNumber: "KER-99281-A",
    date: "14 Oct 2024",
    poDate: "10 Aug 2024",
    poRef: "PO-45311",
    callOffDate: "20 Aug 2024",
    callOffRef: "CO-8544",
    variationRef: "-",
    otherRef: "REF-A3",
    project: "HS2 Phase 2A",
    supplierName: "Kier Group",
    invoiceTotal: "£89,450.00",
    expectedCost: "£89,450.00",
    paymentDueDate: "31 Oct 2024",
    approvedBy: "Marcus Thorne",
    approved: "✓ Approved",
    financeComments: "Clear",
    procurementComments: "All good",
    commercialComments: null,
  },
  {
    no: "003",
    invoiceNumber: "MS-2024-1102",
    date: "18 Oct 2024",
    poDate: "09 Oct 2024",
    poRef: "PO-48012",
    callOffDate: "10 Oct 2024",
    callOffRef: "CO-1002",
    variationRef: "VAR-004",
    otherRef: "-",
    project: "Thames Tideway",
    supplierName: "Morgan Sindall",
    invoiceTotal: "£210,000.00",
    expectedCost: "£205,000.00",
    paymentDueDate: "20 Nov 2024",
    approvedBy: "Pending",
    approved: "⊙ Pending",
    financeComments: "Awaiting commercial review",
    procurementComments: "Checking variation",
    commercialComments: "Reviewing EBR variance",
  },
  {
    no: "004",
    invoiceNumber: "SK-LDN-449",
    date: "02 Sep 2024",
    poDate: "10 Jul 2024",
    poRef: "PO-44100",
    callOffDate: "01 Aug 2024",
    callOffRef: "CO-4820",
    variationRef: "-",
    otherRef: "-",
    project: "Holday Point C",
    supplierName: "Skanska",
    invoiceTotal: "£78,500.00",
    expectedCost: "£78,500.00",
    paymentDueDate: "30 Sep 2024",
    approvedBy: "David Chen",
    approved: "✗ Rejected",
    financeComments: "Overdue - On hold",
    procurementComments: "Disputed hours",
    commercialComments: "Awaiting revised timesheet",
  },
  {
    no: "005",
    invoiceNumber: "CDS-892-B",
    date: "20 Oct 2024",
    poDate: "01 Oct 2024",
    poRef: "PO-45699",
    callOffDate: "05 Oct 2024",
    callOffRef: "CO-8988",
    variationRef: "-",
    otherRef: "-",
    project: "A14 Cambridge",
    supplierName: "Costain",
    invoiceTotal: "£45,200.00",
    expectedCost: "£45,200.00",
    paymentDueDate: "30 Nov 2024",
    approvedBy: "Sarah Jenkins",
    approved: "✓ Approved",
    financeComments: "Processed",
    procurementComments: "Processed",
    commercialComments: "Approved",
  },
  {
    no: "006",
    invoiceNumber: "INV-88-2024-090",
    date: "22 Oct 2024",
    poDate: "01 Sep 2024",
    poRef: "PO-45002",
    callOffDate: "15 Sep 2024",
    callOffRef: "CO-8932",
    variationRef: "-",
    otherRef: "-",
    project: "M25 Junction 10",
    supplierName: "Balfour Beatty",
    invoiceTotal: "£112,000.00",
    expectedCost: "£112,000.00",
    paymentDueDate: "30 Nov 2024",
    approvedBy: "Pending",
    approved: "⊙ Pending",
    financeComments: "In queue",
    procurementComments: "Reviewing",
    commercialComments: null,
  },
  {
    no: "007",
    invoiceNumber: "VIN-2024-001",
    date: "25 Sep 2024",
    poDate: "10 Sep 2024",
    poRef: "PO-45970",
    callOffDate: "12 Sep 2024",
    callOffRef: "CO-9930",
    variationRef: "VAR-002",
    otherRef: "-",
    project: "HS2 Phase 1",
    supplierName: "Vinci Construction",
    invoiceTotal: "£125,400.00",
    expectedCost: "£125,400.00",
    paymentDueDate: "31 Oct 2024",
    approvedBy: "Marcus Thorne",
    approved: "✓ Approved",
    financeComments: "Paid Due - Processing today",
    procurementComments: "Approved",
    commercialComments: "Approved",
  },
  {
    no: "008",
    invoiceNumber: "BAM-NW-882",
    date: "24 Oct 2024",
    poDate: "25 Sep 2024",
    poRef: "PO-45960",
    callOffDate: "25 Sep 2024",
    callOffRef: "CO-9960",
    variationRef: "-",
    otherRef: "-",
    project: "Transpennine Route",
    supplierName: "BAM Nuttall",
    invoiceTotal: "£97,800.00",
    expectedCost: "£97,800.00",
    paymentDueDate: "30 Nov 2024",
    approvedBy: "Pending",
    approved: "⊙ Pending",
    financeComments: null,
    procurementComments: null,
    commercialComments: null,
  },
]

export default function Page() {
  const [rows, setRows] = useState(supplierRows)

  function CommentCellRenderer(
    params: ICellRendererParams<SupplierInvoiceRow, string> & {
      fieldName: CommentField
    }
  ) {
    return (
      <Input
        value={params.value ?? ""}
        placeholder="add comment"
        className="h-7 border-[#253046] bg-[#101012] text-xs text-slate-200 placeholder:text-slate-500"
        onChange={(event) =>
          params.node.setDataValue(params.fieldName, event.target.value)
        }
      />
    )
  }

  const columnDefs: ColDef<SupplierInvoiceRow>[] = [
    { field: "no", headerName: "No", editable: false, minWidth: 70 },
    {
      field: "invoiceNumber",
      headerName: "Invoice Number",
      editable: true,
      minWidth: 140,
    },
    { field: "date", headerName: "DATE", editable: true, minWidth: 110 },
    { field: "poDate", headerName: "PO Date", editable: true, minWidth: 110 },
    { field: "poRef", headerName: "PO Ref", editable: true, minWidth: 110 },
    {
      field: "callOffDate",
      headerName: "Call Off Date",
      editable: true,
      minWidth: 120,
    },
    {
      field: "callOffRef",
      headerName: "Call Off Ref",
      editable: true,
      minWidth: 120,
    },
    {
      field: "variationRef",
      headerName: "Variation Ref",
      editable: true,
      minWidth: 120,
    },
    {
      field: "otherRef",
      headerName: "Other Ref",
      editable: true,
      minWidth: 110,
    },
    { field: "project", headerName: "Project", editable: true, minWidth: 140 },
    {
      field: "supplierName",
      headerName: "Supplier Name",
      editable: true,
      minWidth: 140,
    },
    {
      field: "invoiceTotal",
      headerName: "Invoice Total",
      editable: true,
      minWidth: 130,
    },
    {
      field: "expectedCost",
      headerName: "Expected Cost",
      editable: true,
      minWidth: 130,
    },
    {
      field: "paymentDueDate",
      headerName: "Payment Due Date",
      editable: true,
      minWidth: 140,
    },
    {
      field: "approvedBy",
      headerName: "Approved By",
      editable: true,
      minWidth: 130,
    },
    {
      field: "approved",
      headerName: "Approved",
      editable: true,
      minWidth: 110,
    },
    {
      field: "financeComments",
      headerName: "Finance Comments",
      editable: true,
      minWidth: 150,
      cellRenderer: CommentCellRenderer,
      cellRendererParams: { fieldName: "financeComments" },
    },
    {
      field: "procurementComments",
      headerName: "Procurement Comments",
      editable: true,
      minWidth: 160,
      cellRenderer: CommentCellRenderer,
      cellRendererParams: { fieldName: "procurementComments" },
    },
    {
      field: "commercialComments",
      headerName: "Commercial Comments",
      editable: true,
      minWidth: 160,
      cellRenderer: CommentCellRenderer,
      cellRendererParams: { fieldName: "commercialComments" },
    },
  ]

  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent<SupplierInvoiceRow>) => {
      const updatedRows = rows.map((row) =>
        row.no === params.data.no ? params.data : row
      )
      setRows(updatedRows)
    },
    [rows]
  )

  return (
    <div className="w-full min-w-0 space-y-8 p-4">
      <div className="overflow-x-auto border border-[#0a5f4d]">
        <div className="grid min-w-full grid-cols-2">
          {summaryRows.map((row) => (
            <div
              className="grid grid-cols-[1fr_200px] border-r border-b border-[#0a5f4d] last:border-b-0"
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
      </div>
      <Filters />

      <AgTable
        rowData={rows}
        columnDefs={columnDefs}
        onCellValueChanged={handleCellValueChanged}
        height={500}
        pageSize={50}
      />
    </div>
  )
}
