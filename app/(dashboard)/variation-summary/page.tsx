"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DynamicTable } from "@/components/dynamic-table"
import { Card } from "@/components/ui/card"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"

type VariationSummaryRow = {
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
  { label: "Variation QTY", value: "0000" },
  { label: "Variation Value", value: "000" },
  { label: "Changed Value", value: "000" },
]

const data: VariationSummaryRow[] = [
  {
    no: "1",
    siteInstructionNumber: "SI21654321012",
    evidence: "📄",
    date: "£",
    variationSheetNumber: "£",
    workArea: "£",
    workSection: "£",
    descriptionOfWorks: "£",
    labourCost: "£850.00",
    materialCost: "%",
    variationAmount: "£750.00",
    percentClaimed: "£",
    amountClaimed: "£0.00",
    clientCertifiedAmount: "£0.00",
    diffrenceAmount: "£0.00",
    paymentStatusNr: "",
    claimGQComment: "",
    comments: "",
  },
  {
    no: "2",
    siteInstructionNumber: "SI24654321019",
    evidence: "📄",
    date: "£",
    variationSheetNumber: "£",
    workArea: "£",
    workSection: "£",
    descriptionOfWorks: "£",
    labourCost: "£850.00",
    materialCost: "%",
    variationAmount: "£750.00",
    percentClaimed: "£",
    amountClaimed: "£0.00",
    clientCertifiedAmount: "£0.00",
    diffrenceAmount: "£0.00",
    paymentStatusNr: "",
    claimGQComment: "",
    comments: "",
  },
  {
    no: "3",
    siteInstructionNumber: "SI24654321070",
    evidence: "📄",
    date: "£",
    variationSheetNumber: "£",
    workArea: "£",
    workSection: "£",
    descriptionOfWorks: "£",
    labourCost: "£850.00",
    materialCost: "%",
    variationAmount: "£750.00",
    percentClaimed: "£",
    amountClaimed: "£0.00",
    clientCertifiedAmount: "£0.00",
    diffrenceAmount: "£0.00",
    paymentStatusNr: "",
    claimGQComment: "",
    comments: "",
  },
  {
    no: "4",
    siteInstructionNumber: "SI24659091030",
    evidence: "📄",
    date: "£",
    variationSheetNumber: "£",
    workArea: "£",
    workSection: "£",
    descriptionOfWorks: "£",
    labourCost: "£850.00",
    materialCost: "%",
    variationAmount: "£750.00",
    percentClaimed: "£",
    amountClaimed: "£0.00",
    clientCertifiedAmount: "£0.00",
    diffrenceAmount: "£0.00",
    paymentStatusNr: "",
    claimGQComment: "",
    comments: "",
  },
  {
    no: "5",
    siteInstructionNumber: "",
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
    no: "6",
    siteInstructionNumber: "",
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
    no: "7",
    siteInstructionNumber: "",
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
    no: "8",
    siteInstructionNumber: "",
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

const columns: ColumnDef<VariationSummaryRow>[] = [
  {
    accessorKey: "no",
    header: "No.",
    size: 50,
  },
  {
    accessorKey: "siteInstructionNumber",
    header: "Site Instruction Number",
    size: 160,
  },
  {
    accessorKey: "evidence",
    header: "Evidence",
    size: 100,
  },
  {
    accessorKey: "date",
    header: "Date",
    size: 100,
  },
  {
    accessorKey: "variationSheetNumber",
    header: "Variation Sheet Number",
    size: 160,
  },
  {
    accessorKey: "workArea",
    header: "Work Area",
    size: 120,
  },
  {
    accessorKey: "workSection",
    header: "Work section",
    size: 120,
  },
  {
    accessorKey: "descriptionOfWorks",
    header: "Description of Works",
    size: 180,
  },
  {
    accessorKey: "labourCost",
    header: "Labour cost",
    size: 120,
  },
  {
    accessorKey: "materialCost",
    header: "Material Cost",
    size: 130,
  },
  {
    accessorKey: "variationAmount",
    header: "Variation Amount",
    size: 140,
  },
  {
    accessorKey: "percentClaimed",
    header: "% Claimed",
    size: 110,
  },
  {
    accessorKey: "amountClaimed",
    header: "Amount Claimed",
    size: 130,
  },
  {
    accessorKey: "clientCertifiedAmount",
    header: "Client Certified Amount",
    size: 160,
  },
  {
    accessorKey: "diffrenceAmount",
    header: "Diffrence",
    size: 110,
  },
  {
    accessorKey: "paymentStatusNr",
    header: "Payment Status nr",
    size: 140,
  },
  {
    accessorKey: "claimGQComment",
    header: "Claim GQ Comment",
    size: 140,
  },
  {
    accessorKey: "comments",
    header: "Comments",
    size: 120,
  },
]

export default function Page() {
  const [selectedProject, setSelectedProject] = useState("project-a")

  const columnDefs = columns.map((col) => ({
    headerName: col.header,
    field: col.accessorKey,
    width: col.size,
    sortable: false,
    filter: false,
    resizable: false,
  }))

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h2 className="mb-4 text-2xl font-semibold">Variation Summary</h2>
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

      {/* <div className="grid grid-cols-3 gap-4">
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
      </div> */}

      <TableStat summaryRows={summaryMetrics} />

        <AgTable
            rowData={data}
            columnDefs={columnDefs}
            height="auto"
            defaultColDef={{ sortable: false, filter: false, resizable: false }}
            gridOptions={{
              headerHeight: 40,
              suppressCellFocus: true,
              domLayout: "autoHeight",
            }}
            noRowsText="No variation data available"
          />

      {/* <DynamicTable columns={columns} data={data} /> */}
    </div>
  )
}
