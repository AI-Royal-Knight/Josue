"use client"

import type { ColDef } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import { ExportCsvButton } from "@/components/common/export-csv-button"

type TimesheetRow = {
  no: string
  date: string
  name: string
  surname: string
  position: string
  total: string
}

type RoleAssignment = {
  role: string
  users: Array<{ id: string; name: string; checked: boolean }>
}

const initialTimesheets: TimesheetRow[] = [
  {
    no: "1",
    date: "15/04/2026",
    name: "Richard",
    surname: "Branson",
    position: "Managing Director",
    total: "40h",
  },
  {
    no: "2",
    date: "15/04/2026",
    name: "Elon",
    surname: "Musk",
    position: "Project Director",
    total: "38h",
  },
  {
    no: "3",
    date: "16/04/2026",
    name: "Tim",
    surname: "Cook",
    position: "Commercial Manager",
    total: "42h",
  },
  {
    no: "4",
    date: "16/04/2026",
    name: "Alex",
    surname: "Jonson",
    position: "Project Director",
    total: "37h",
  },
  {
    no: "5",
    date: "17/04/2026",
    name: "Joshu",
    surname: "Pro",
    position: "Procurement Manager",
    total: "40h",
  },
]

const initialAssignments: RoleAssignment[] = [
  {
    role: "Project Director",
    users: [
      { id: "1", name: "Alex Jonson", checked: false },
      { id: "2", name: "Jon Alison", checked: false },
    ],
  },
  {
    role: "Commercial Department",
    users: [{ id: "5", name: "Evana Hani", checked: false }],
  },
  {
    role: "Procurement Department",
    users: [
      { id: "3", name: "Joshu Pro", checked: false },
      { id: "4", name: "Diana Eva", checked: false },
    ],
  },
  {
    role: "Document Controller",
    users: [{ id: "6", name: "Hanny Emterson", checked: false }],
  },
  {
    role: "Finance Department",
    users: [{ id: "7", name: "Evana Hani", checked: false }],
  },
]

const columns: ColDef<TimesheetRow>[] = [
  { headerName: "No.", field: "no", width: 70 },
  { headerName: "Date", field: "date", minWidth: 120 },
  { headerName: "Name", field: "name", minWidth: 120 },
  { headerName: "Surname", field: "surname", minWidth: 140 },
  { headerName: "Position", field: "position", minWidth: 180 },
  {
    headerName: "Total",
    field: "total",
    minWidth: 100,
    cellStyle: { textAlign: "right", fontWeight: 600 },
  },
]

export default function ManagementTimesheetsPage() {

  return (
    <div className="w-full space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Management Timesheets</h2>
        <ExportCsvButton
          rows={initialTimesheets}
          columns={columns.map((col) => ({
            headerName: col.headerName!,
            field: col.field!,
          }))}
          fileName="management_timesheets.csv"
        />
      </div>
      <AgTable
        rowData={initialTimesheets}
        columnDefs={columns}
        height="auto"
        gridOptions={{
          headerHeight: 40,
          rowHeight: 42,
          suppressCellFocus: true,
          defaultColDef: {
            flex: 1,
            minWidth: 100,
          },
        }}
      />
    </div>
  )
}
