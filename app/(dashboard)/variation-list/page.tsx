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
    size: 50,
  },
  {
    headerName: "Site Instruction Number",
    field: "siteInstructionNumber",
    size: 160,
  },
  {
    headerName: "Evidence",
    field: "evidence",
    size: 100,
  },
  {
    headerName: "Date",
    field: "date",
    size: 100,
  },
  {
    headerName: "Variation Sheet Number",
    field: "variationSheetNumber",
    size: 160,
  },
  {
    headerName: "Work area",
    field: "workArea",
    size: 120,
  },
  {
    headerName: "Work section",
    field: "workSection",
    size: 120,
  },
  {
    headerName: "Description of Works",
    field: "descriptionOfWorks",
    size: 180,
  },
  {
    headerName: "Labour cost",
    field: "labourCost",
    size: 120,
  },
  {
    headerName: "Material Cost",
    field: "materialCost",
    size: 130,
  },
  {
    headerName: "Variation Amount",
    field: "variationAmount",
    size: 140,
  },
  {
    headerName: "% Claimed",
    field: "percentClaimed",
    size: 110,
  },
  {
    headerName: "Amount Claimed",
    field: "amountClaimed",
    size: 130,
  },
  {
    headerName: "Client Certified Amount",
    field: "clientCertifiedAmount",
    size: 160,
  },
  {
    headerName: "Diffrence",
    field: "diffrenceAmount",
    size: 110,
  },
  {
    headerName: "Payment Status nr",
    field: "paymentStatusNr",
    size: 140,
  },
  {
    headerName: "Claim GQ Comment",
    field: "claimGQComment",
    size: 140,
  },
  {
    headerName: "Comments",
    field: "comments",
    size: 120,
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

      <div className="grid grid-cols-3 gap-4">
        {summaryMetrics.map((metric) => (
          <Card
            key={metric.label}
            className="border-white/10 bg-gradient-to-b from-[#182842] to-[#0e1728] p-4"
          >
            <p className="text-xs text-slate-400">{metric.label}</p>
            <p className="mt-2 text-lg font-semibold text-emerald-400">
              {metric.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto">
        <AgTable rowData={data} columnDefs={columns} height="auto" />
      </div>
    </div>
  )
}
