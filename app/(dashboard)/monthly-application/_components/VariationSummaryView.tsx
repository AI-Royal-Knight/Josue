"use client"

import { useMemo } from "react"
import type { ColDef } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"

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
  valuationAmount: string
  percentClaimed: string
  amountClaimed: string
  clientCertifiedAmount: string
  difference: string
  correspondingNoticeNo: string
  clientQsComment: string
  comments: string
}

const variationRows: VariationSummaryRow[] = [
  {
    no: "1",
    siteInstructionNumber: "SI-001",
    evidence: "Yes",
    date: "15/01/2026",
    variationSheetNumber: "VS-001",
    workArea: "Area A",
    workSection: "Section 1",
    descriptionOfWorks: "Sample work",
    labourCost: "£100",
    materialCost: "£200",
    valuationAmount: "£300",
    percentClaimed: "%",
    amountClaimed: "£300",
    clientCertifiedAmount: "£290",
    difference: "£10",
    correspondingNoticeNo: "",
    clientQsComment: "",
    comments: "",
  },
]

export default function VariationSummaryView() {
  const columns = useMemo<ColDef<VariationSummaryRow>[]>(
    () => [
      { headerName: "No.", field: "no", minWidth: 60 },
      {
        headerName: "Site instruction number",
        field: "siteInstructionNumber",
        minWidth: 180,
      },
      { headerName: "Evidence", field: "evidence", minWidth: 80 },
      { headerName: "Date", field: "date", minWidth: 120 },
      {
        headerName: "Variation Sheet Number",
        field: "variationSheetNumber",
        minWidth: 160,
      },
      { headerName: "Work area", field: "workArea", minWidth: 140 },
      { headerName: "Work section", field: "workSection", minWidth: 140 },
      {
        headerName: "Description of Works",
        field: "descriptionOfWorks",
        minWidth: 260,
      },
      { headerName: "Labour cost", field: "labourCost", minWidth: 120 },
      { headerName: "Material Cost", field: "materialCost", minWidth: 120 },
      {
        headerName: "Valuation Amount",
        field: "valuationAmount",
        minWidth: 140,
      },
      { headerName: "% Claimed", field: "percentClaimed", minWidth: 100 },
      { headerName: "Amount Claimed", field: "amountClaimed", minWidth: 140 },
      {
        headerName: "Client Certified Amount",
        field: "clientCertifiedAmount",
        minWidth: 160,
      },
      { headerName: "Difference", field: "difference", minWidth: 120 },
      {
        headerName: "Corresponding Client Payment Notice No",
        field: "correspondingNoticeNo",
        minWidth: 200,
      },
      {
        headerName: "Client QS Comment",
        field: "clientQsComment",
        minWidth: 200,
      },
      { headerName: "Comments", field: "comments", minWidth: 200 },
    ],
    []
  )

  return (
    <div className="overflow-x-auto border border-white/10">
      <div className="min-w-[1200px]">
        <AgTable rowData={variationRows} columnDefs={columns} height="auto" />
      </div>
    </div>
  )
}
