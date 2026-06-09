"use client"
import type { ColDef } from "ag-grid-community"

import { AgTable } from "@/components/common/AgTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRef, useState } from "react"
import SelectProject from "@/components/shared/select-project"
import TableStat from "@/components/common/table-stat"
import AssignUsersDialog from "../variations/_components/AssignUsersDialog"

type LoadingClearingRow = {
  invoiceNo: string
  name: string
  surname: string
  date: string
  value: string
  moneyOnHold: string
}

const rows: LoadingClearingRow[] = [
  {
    invoiceNo: "1",
    name: "John",
    surname: "Doe",
    date: "2023-01-01",
    value: "$100.00",
    moneyOnHold: "$50.00",
  },
  {
    invoiceNo: "2",
    name: "Jane",
    surname: "Smith",
    date: "2023-01-02",
    value: "$200.00",
    moneyOnHold: "$100.00",
  },
  {
    invoiceNo: "3",
    name: "Alice",
    surname: "Johnson",
    date: "2023-01-03",
    value: "$300.00",
    moneyOnHold: "$150.00",
  },
  {
    invoiceNo: "4",
    name: "Bob",
    surname: "Brown",
    date: "2023-01-04",
    value: "$400.00",
    moneyOnHold: "$200.00",
  },
  {
    invoiceNo: "5",
    name: "Charlie",
    surname: "Davis",
    date: "2023-01-05",
    value: "$500.00",
    moneyOnHold: "$250.00",
  },
]

const columnDefs: ColDef<LoadingClearingRow>[] = [
  { headerName: "Invoice No.", field: "invoiceNo" },
  { headerName: "Name", field: "name" },
  { headerName: "Surname", field: "surname" },
  { headerName: "Date", field: "date" },
  { headerName: "Value", field: "value" },
  { headerName: "Money on Hold", field: "moneyOnHold" },
]

export default function Page() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assignedUsers, setAssignedUsers] = useState<string[]>([])

  const handleUploadFile = () => {
    fileRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSelectedFileName(file ? file.name : null)
  }

  return (
    <div className="w-full min-w-0 space-y-6 p-6 text-slate-100">
      <h2>Loading and Clearing</h2>
      <SelectProject />

      <TableStat
        summaryRows={[
          { label: "Loading and clearing Invoices", qty: "", value: "0" },
          { label: "Money on Hold", qty: "", value: "0" },
        ]}
      />

      <Button onClick={() => setAssignDialogOpen(true)}>Assign User</Button>

      <AssignUsersDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        initialSelected={assignedUsers}
        onAssign={(ids) => {
          setAssignedUsers(ids)
          setAssignDialogOpen(false)
        }}
      />

      <AgTable
        rowData={rows}
        columnDefs={columnDefs}
        rowSelection="multiple"
        height={60}
        defaultColDef={{
         //  filter: false,
         //  sortable: false,
          resizable: true,
          flex: 1,
        }}
        gridOptions={{
          suppressCellFocus: false,
          rowHeight: 28,
        }}
      />
    </div>
  )
}
