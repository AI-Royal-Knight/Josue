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
import { InvoiceListRow, SummaryRow } from "../types/invoice"

type Props = {
  initialRows: InvoiceListRow[]
  summaryRows: SummaryRow[]
}

export default function InvoiceListClient({ initialRows, summaryRows }: Props) {
  const [project, setProject] = useState("all")
  const [rows, setRows] = useState<InvoiceListRow[]>(initialRows)
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
    setRows((current) =>
      current.map((row) =>
        row.no === pendingRowId ? { ...row, paid: nextPaid } : row
      )
    )
    setConfirmOpen(false)
    setPendingRowId(null)
  }

  const filteredRows =
    project === "all"
      ? rows
      : rows.filter((r) => r.project.toLowerCase().includes(project))

  const columnDefs: ColDef<InvoiceListRow>[] = [
    { headerName: "No", field: "no", minWidth: 60, filter: false },
    {
      headerName: "Invoice Number",
      field: "invoiceNumber",
      cellRenderer: (params: { data?: InvoiceListRow; value: string }) => (
        <a
          className={`hover:underline ${params.data?.paid ? "text-green-500" : "text-red-500"}`}
        >
          {params.value}
        </a>
      ),
      minWidth: 160,
    },
    { headerName: "Date", field: "date", minWidth: 120 },
    { headerName: "Project", field: "project", minWidth: 140 },
    { headerName: "Name-USER", field: "userName", minWidth: 160 },
    { headerName: "Sort code", field: "sortCode", minWidth: 140 },
    { headerName: "Account number", field: "accountNumber", minWidth: 160 },
    { headerName: "Total", field: "total", minWidth: 120 },
    {
      headerName: "Paid",
      field: "paid",
      type: "",
      cellRenderer: (params: { data?: InvoiceListRow; value: boolean }) => (
        <Switch
          checked={params.value}
          onCheckedChange={(checked) => {
            if (!params.data) return
            openPaymentConfirm(params.data.no, checked)
          }}
        />
      ),
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
        rowData={filteredRows}
        defaultColDef={{ flex: 1, minWidth: 140, resizable: true }}
      />
    </div>
  )
}
