"use client"
import type { ColDef } from "ag-grid-community"

import { AgTable } from "@/components/common/AgTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRef, useState } from "react"

type LoadingClearingRow = {
  no: string
  refNo: string
  descriptionOfWorks: string
  workArea: string
  workSection: string
  labourTarget: string
  qty: string
  total: string
}

const rows: LoadingClearingRow[] = [
  {
    no: "1",
    refNo: "LC-001",
    descriptionOfWorks: "USER TYPE",
    workArea: "USER TYPE",
    workSection: "USER TYPE",
    labourTarget: "USER TYPES AMOUNT UNITS",
    qty: "-",
    total: "Labour X QTY",
  },
  {
    no: "2",
    refNo: "LC-002",
    descriptionOfWorks: "USER TYPE",
    workArea: "USER TYPE",
    workSection: "USER TYPE",
    labourTarget: "USER TYPES AMOUNT UNITS",
    qty: "-",
    total: "Labour X QTY",
  },
  {
    no: "3",
    refNo: "LC-003",
    descriptionOfWorks: "USER TYPE",
    workArea: "USER TYPE",
    workSection: "USER TYPE",
    labourTarget: "USER TYPES AMOUNT UNITS",
    qty: "-",
    total: "Labour X QTY",
  },
  {
    no: "4",
    refNo: "LC-004",
    descriptionOfWorks: "USER TYPE",
    workArea: "USER TYPE",
    workSection: "USER TYPE",
    labourTarget: "USER TYPES AMOUNT UNITS",
    qty: "-",
    total: "Labour X QTY",
  },
  {
    no: "5",
    refNo: "LC-005",
    descriptionOfWorks: "USER TYPE",
    workArea: "USER TYPE",
    workSection: "USER TYPE",
    labourTarget: "USER TYPES AMOUNT UNITS",
    qty: "-",
    total: "Labour X QTY",
  },
  {
    no: "6",
    refNo: "LC-006",
    descriptionOfWorks: "USER TYPE",
    workArea: "USER TYPE",
    workSection: "USER TYPE",
    labourTarget: "USER TYPES AMOUNT UNITS",
    qty: "-",
    total: "Labour X QTY",
  },
  {
    no: "7",
    refNo: "LC-007",
    descriptionOfWorks: "USER TYPE",
    workArea: "USER TYPE",
    workSection: "USER TYPE",
    labourTarget: "USER TYPES AMOUNT UNITS",
    qty: "-",
    total: "Labour X QTY",
  },
]

const columnDefs: ColDef<LoadingClearingRow>[] = [
  { headerName: "No.", field: "no", maxWidth: 70 },
  { headerName: "Ref. No.", field: "refNo", maxWidth: 120 },
  {
    headerName: "Description of works",
    field: "descriptionOfWorks",
    minWidth: 240,
  },
  { headerName: "Work area", field: "workArea", minWidth: 180 },
  { headerName: "Work section", field: "workSection", minWidth: 180 },
  { headerName: "Labour target", field: "labourTarget", minWidth: 220 },
  { headerName: "QTY", field: "qty", maxWidth: 90 },
  { headerName: "TOTAL", field: "total", minWidth: 140 },
]

export default function Page() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const handleUploadFile = () => {
    fileRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSelectedFileName(file ? file.name : null)
  }

  return (
    <div className="w-full min-w-0 space-y-6 p-6 text-slate-100">
      <Select>
        <SelectTrigger className="bg-[#1a2842] w-[240px]">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="project-a">Project A</SelectItem>
          <SelectItem value="project-b">Project B</SelectItem>
        </SelectContent>
      </Select>
      <Card>
        <CardContent>
          <div>
            <div className="text-xs tracking-[0.2em] text-slate-400 uppercase">
              Invoice No.
            </div>
            <div className="text-xs tracking-[0.2em] text-slate-400 uppercase">
              NR No.
            </div>
            <div className="text-xs tracking-[0.2em] text-slate-400 uppercase">
              User:
            </div>
          </div>
        </CardContent>
      </Card>

      {/* <Card className="border-white/10 bg-[#0b1328]/90 text-slate-100"> */}
        {/* <CardContent> */}
          <AgTable
            rowData={rows}
            columnDefs={columnDefs}
            rowSelection="multiple"
            height={60}
            defaultColDef={{
              filter: false,
              sortable: false,
              resizable: true,
              flex: 1,
            }}
            gridOptions={{
              suppressCellFocus: false,
              rowHeight: 28,
            }}
          />
        {/* </CardContent> */}
      {/* </Card> */}

      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <div>Other Instructions / Clarifications :</div>
            <div>Total NR : </div>
          </div>
          <div>
            <div>
              Evidence :
              <Button
                type="button"
                onClick={handleUploadFile}
                variant={"outline"}
                className="ml-2 h-8 px-3"
              >
                <Upload size={16} />
                {selectedFileName ?? "Upload PDFs or pictures"}
              </Button>
            </div>
          </div>
          <Input
            type="file"
            accept=".pdf,.jpg,.png"
            onChange={handleFileChange}
            className="hidden"
            ref={fileRef}
          />
          <Button onClick={handleUploadFile} variant={"secondary"}>
            Submit for Approval
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
