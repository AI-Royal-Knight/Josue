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
  clientCertifiedAmount: string
  diffrenceAmount: string
  paymentStatusNr: string
  claimGQComment: string
  comments: string
}

const summaryMetrics = [
  { label: "Variations QTY", value: "0000" },
  { label: "Variations Value", value: "000" },
  { label: "Changed Value", value: "000" },
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
    clientCertifiedAmount: "",
    diffrenceAmount: "",
    paymentStatusNr: "",
    claimGQComment: "",
    comments: "",
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
    clientCertifiedAmount: "",
    diffrenceAmount: "",
    paymentStatusNr: "",
    claimGQComment: "",
    comments: "",
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
    clientCertifiedAmount: "",
    diffrenceAmount: "",
    paymentStatusNr: "",
    claimGQComment: "",
    comments: "",
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
    clientCertifiedAmount: "",
    diffrenceAmount: "",
    paymentStatusNr: "",
    claimGQComment: "",
    comments: "",
  },
]

const columns: ColDef<VariationRow>[] = [
  {
    headerName: "No.",
    field: "no",
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
    headerName: "Client Certified Amount",
    field: "clientCertifiedAmount",
  },
  {
    headerName: "Diffrence",
    field: "diffrenceAmount",
  },
  {
    headerName: "Payment Status nr",
    field: "paymentStatusNr",
  },
  {
    headerName: "Claim GQ Comment",
    field: "claimGQComment",
  },
  {
    headerName: "Comments",
    field: "comments",
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
        <AgTable rowData={data} columnDefs={columns} height="auto" />
      </div>
    </div>
  )
}
