"use client"

import type { ColDef } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import { ExportCsvButton } from "@/components/common/export-csv-button"
import { useState } from "react"

export type ManagementTimesheetRow = {
  id: string
  date: string
  name: string
  surname: string
  position: string
  total: string
}

const columns: ColDef<ManagementTimesheetRow>[] = [
  { headerName: "No.", valueGetter: "node.rowIndex + 1", maxWidth: 80, filter: false },
  { headerName: "Date", field: "date" },
  { headerName: "Name", field: "name" },
  { headerName: "Surname", field: "surname" },
  { headerName: "Position", field: "position" },
  { headerName: "Total", field: "total" },
]

const MOCK_DATA: ManagementTimesheetRow[] = [
  { id: "1", date: "15/04/2026", name: "Richard", surname: "Branson", position: "Managing Director", total: "40h" },
  { id: "2", date: "15/04/2026", name: "Elon", surname: "Musk", position: "Project Director", total: "38h" },
  { id: "3", date: "16/04/2026", name: "Tim", surname: "Cook", position: "Commercial Manager", total: "42h" },
  { id: "4", date: "16/04/2026", name: "Alex", surname: "Jonson", position: "Project Director", total: "37h" },
  { id: "5", date: "17/04/2026", name: "Joshu", surname: "Pro", position: "Procurement Manager", total: "40h" },
]

export default function ManagementTimesheetsPage() {
  const [rows] = useState<ManagementTimesheetRow[]>(MOCK_DATA)

  return (
    <div className="w-full min-w-0 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Management Timesheets</h1>
        
        <ExportCsvButton
          columns={columns.map((c) => ({
            header: c.headerName ?? "",
            field: typeof c.field === "string" ? c.field : undefined,
          }))}
          rows={rows}
          fileName="management-timesheets.csv"
        />
      </div>

      <AgTable rowData={rows} columnDefs={columns} height="auto" />
    </div>
  )
}
