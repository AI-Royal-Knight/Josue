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
import { AgTable } from "@/components/common/AgTable"
import { Card } from "@/components/ui/card"
import TableStat from "@/components/common/table-stat"

type VariationRow = {
  no: string
  siteInstructionNumber: string
  evidence: string
  date: string
  variationSheetNumber: string
  workArea: string
  workSection: string
  descriptionOfWorks: string
  labourCost: string
  materialCost: string
  variationAmount: string
  percentClaimed: string
  amountClaimed: string
  createdBy: string
  approved: string
  openFile: string
  submittedToClient: string
  clientQS: string
  signedByClient: string
  addToVariationSummary: string
  comments: string
  assignedUser: string
}

const summaryMetrics = [
  { label: "Variations QTY", value: "0000" },
  { label: "Added to Variation Summary", value: "400" },
  { label: "Variations Value", value: "000" },
  { label: "Approved Variations", value: "000" },
  { label: "Awaiting Approval", value: "000" },
  { label: "Submitted to Client", value: "000" },
  { label: "Signed by Client", value: "000" },
]

const data: VariationRow[] = [
  {
    no: "1",
    siteInstructionNumber: "SI21654321012",
    evidence: "",
    date: "",
    variationSheetNumber: "",
    workArea: "",
    workSection: "",
    descriptionOfWorks: "",
    labourCost: "",
    materialCost: "",
    variationAmount: "",
    percentClaimed: "",
    amountClaimed: "",
    createdBy: "",
    approved: "",
    openFile: "",
    submittedToClient: "",
    clientQS: "",
    signedByClient: "Yes",
    addToVariationSummary: "Yes",
    comments: "This is a comment",
    assignedUser: "John Smith",
  },
  {
    no: "2",
    siteInstructionNumber: "SI24654321019",
    evidence: "",
    date: "",
    variationSheetNumber: "",
    workArea: "",
    workSection: "",
    descriptionOfWorks: "",
    labourCost: "",
    materialCost: "",
    variationAmount: "",
    percentClaimed: "",
    amountClaimed: "",
    createdBy: "",
    approved: "",
    openFile: "",
    submittedToClient: "",
    clientQS: "",
    signedByClient: "Yes",
    addToVariationSummary: "Yes",
    comments: "This is a comment",
    assignedUser: "John Smith",
  },
  {
    no: "3",
    siteInstructionNumber: "SI24654321070",
    evidence: "",
    date: "",
    variationSheetNumber: "",
    workArea: "",
    workSection: "",
    descriptionOfWorks: "",
    labourCost: "",
    materialCost: "",
    variationAmount: "",
    percentClaimed: "",
    amountClaimed: "",
    createdBy: "",
    approved: "",
    openFile: "",
    submittedToClient: "",
    clientQS: "",
    signedByClient: "Yes",
    addToVariationSummary: "Yes",
    comments: "This is a comment",
    assignedUser: "John Smith",
  },
  {
    no: "4",
    siteInstructionNumber: "SI24659091030",
    evidence: "",
    date: "",
    variationSheetNumber: "",
    workArea: "",
    workSection: "",
    descriptionOfWorks: "",
    labourCost: "",
    materialCost: "",
    variationAmount: "",
    percentClaimed: "",
    amountClaimed: "",
    createdBy: "",
    approved: "",
    openFile: "",
    submittedToClient: "",
    clientQS: "",
    signedByClient: "Yes",
    addToVariationSummary: "Yes",
    comments: "This is a comment",
    assignedUser: "John Smith",
  },
]

const columns: ColDef<VariationRow>[] = [
  {
    headerName: "No.",
    field: "no",
    maxWidth: 70,
    filter: false,
  },
  {
    headerName: "Site Instruction Number",
    field: "siteInstructionNumber",
  },
  {
    headerName: "Evidence",
    field: "evidence",
  },
  {
    headerName: "Date",
    field: "date",
  },
  {
    headerName: "Variation Sheet Number",
    field: "variationSheetNumber",
  },
  {
    headerName: "Work area",
    field: "workArea",
  },
  {
    headerName: "Work section",
    field: "workSection",
  },
  {
    headerName: "Description of Works",
    field: "descriptionOfWorks",
  },
  {
    headerName: "Labour cost",
    field: "labourCost",
  },
  {
    headerName: "Material Cost",
    field: "materialCost",
  },
  {
    headerName: "Variation Amount",
    field: "variationAmount",
  },
  {
    headerName: "% Claimed",
    field: "percentClaimed",
  },
  {
    headerName: "Amount Claimed",
    field: "amountClaimed",
  },
  {
    headerName: "Created by",
    field: "createdBy",
  },
  {
    headerName: "Approved",
    field: "approved",
  },
  {
    headerName: "Open File",
    field: "paymentStatusNr",
  },
  {
    headerName: "Submitted to Client",
    field: "claimGQComment",
  },
  {
    headerName: "Client QS",
    field: "comments",
  },
  {
    headerName: "Signed by Client",
    field: "signedByClient",
    // cellRenderer: (params: { data?: VariationRow }) => {
    //   const signed = params.data?.signedByClient === "Yes"
    //   return (
    //     <span
    //       className={`inline-flex rounded-full px-2 py-1 text-xs ${
    //         signed ? "bg-green-500 text-white" : "bg-red-500 text-white"
    //       }`}
    //     >
    //       {params.data?.signedByClient}
    //     </span>
    //   )
    // },
    // filter: false,
    // maxWidth: 120,
    // cellStyle: { textAlign: "center" },
    // sortable: false,
    // resizable: false,
    // suppressMenu: true,
    // suppressSorting: true,
    // suppressMovable: true,
    // suppressSizeToFit: true,
    // suppressAutoSize: true,
    // suppressCellFlash: true,
    // suppressKeyboardEvent: (params) => {
    //   const key = params.event.key
    //   return key === "Enter" || key === " "
    // },
    // onCellClicked: (params) => {
    //   if (params.data?.signedByClient === "Yes") {
    //     alert(`Viewing signed document for ${params.data.siteInstructionNumber}`)
    //   } else {
    //     alert(`Viewing unsigned document for ${params.data.siteInstructionNumber}`)
    //   }
    // },
    // cellClass: "cursor-pointer",
    // minWidth: 150,
    // filter: false,
    // sortable: false,
    // resizable: false,
    // suppressMenu: true,
    // suppressSorting: true,
    // suppressMovable: true,
    // suppressSizeToFit: true,
    // suppressAutoSize: true,
    // suppressCellFlash: true,
    // suppressKeyboardEvent: (params) => {
    //   const key = params.event.key
    //   return key === "Enter" || key === " "
    // },
    // onCellClicked: (params) => {
    //   if (params.data?.signedByClient === "Yes") {
    //     alert(`Viewing signed document for ${params.data.siteInstructionNumber}`)
    //   } else {
    //     alert(`Viewing unsigned document for ${params.data.siteInstructionNumber}`)
    //   }
    // },
    // cellClass: "cursor-pointer",
  },
  {
    headerName: "Add to Variation Summary",
    field: "addToVariationSummary",
  },
  {
    headerName: "Comments",
    field: "comments",
  },
  {
    headerName: "Assigned User",
    field: "assignedUser",
  },
]

export default function Page() {
  const [selectedProject, setSelectedProject] = useState("project-a")

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h2 className="mb-4 text-2xl font-semibold">Variations List</h2>
        <div className="max-w-xs">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Select Project
          </label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="border-white/10 bg-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900">
              <SelectItem value="project-a">Project A</SelectItem>
              <SelectItem value="project-b">Project B</SelectItem>
              <SelectItem value="project-c">Project C</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <TableStat summaryRows={summaryMetrics} />

      <div className="mt-8 overflow-x-auto">
        <AgTable
          rowData={data}
          columnDefs={columns}
          height="auto"
          defaultColDef={{ minWidth: 180 }}
        />
      </div>
    </div>
  )
}
