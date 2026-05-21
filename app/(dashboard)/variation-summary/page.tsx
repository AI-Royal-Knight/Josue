"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import type { ColDef } from "ag-grid-community"

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

const columns: ColDef<VariationSummaryRow>[] = [
  {
     headerName: "No.",
    field: "no",
    minWidth: 80,
  },
  {
    headerName: "Site Instruction Number",
    field: "siteInstructionNumber",
    minWidth: 160,
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
    headerName: "Work Area",
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
    headerName: "Claim QS Comment",
    field: "claimGQComment",
  },
  {
    headerName: "Comments",
    field: "comments",
  },
]

const totalRow: VariationSummaryRow = {
  no: "",
  siteInstructionNumber: "TOTAL",
  evidence: "",
  date: "",
  variationSheetNumber: "",
  workArea: "",
  workSection: "",
  descriptionOfWorks: "",

  labourCost: `£${data
    .reduce(
      (sum, row) =>
        sum + Number(row.labourCost.replace(/[^\d.-]/g, "") || 0),
      0
    )
    .toFixed(2)}`,

  materialCost: "",

  variationAmount: `£${data
    .reduce(
      (sum, row) =>
        sum + Number(row.variationAmount.replace(/[^\d.-]/g, "") || 0),
      0
    )
    .toFixed(2)}`,

  percentClaimed: "",

  amountClaimed: `£${data
    .reduce(
      (sum, row) =>
        sum + Number(row.amountClaimed.replace(/[^\d.-]/g, "") || 0),
      0
    )
    .toFixed(2)}`,

  clientCertifiedAmount: `£${data
    .reduce(
      (sum, row) =>
        sum +
        Number(row.clientCertifiedAmount.replace(/[^\d.-]/g, "") || 0),
      0
    )
    .toFixed(2)}`,

  diffrenceAmount: `£${data
    .reduce(
      (sum, row) =>
        sum + Number(row.diffrenceAmount.replace(/[^\d.-]/g, "") || 0),
      0
    )
    .toFixed(2)}`,

  paymentStatusNr: "",
  claimGQComment: "",
  comments: "",
}

export default function Page() {
  const [selectedProject, setSelectedProject] = useState("project-a")

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

      <TableStat summaryRows={summaryMetrics} />

      <AgTable
        rowData={data}
        columnDefs={columns}
        height="auto"
        gridOptions={{
          headerHeight: 40,
          suppressCellFocus: true,
          domLayout: "autoHeight",
         //  grandTotalRow: "bottom"
         pinnedBottomRowData: [totalRow],
         getRowStyle: (params: any) => {
           if (params.node.isRowPinned()) {
             return { fontWeight: "bold", backgroundColor: "#1E3A8A80"}
           }
           return {}
         },
         getRowClass: (params) =>
           params.node.isRowPinned() ? "pinned-row" : "",
        }}
        noRowsText="No variation data available"
        defaultColDef={{
         flex: 1,
         minWidth: 120
        }}
      />
    </div>
  )
}
