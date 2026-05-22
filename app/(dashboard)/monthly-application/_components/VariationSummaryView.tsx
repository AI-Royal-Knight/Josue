"use client"

import { useMemo } from "react"
import type { ColDef } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import { File } from "lucide-react"

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
  {
    no: "2",
    siteInstructionNumber: "SI-002",
    evidence: "No",
    date: "20/01/2026",
    variationSheetNumber: "VS-002",
    workArea: "Area B",
    workSection: "Section 2",
    descriptionOfWorks: "Another sample work",
    labourCost: "£150",
    materialCost: "£250",
    valuationAmount: "£400",
    percentClaimed: "%",
    amountClaimed: "£400",
    clientCertifiedAmount: "£380",
    difference: "£20",
    correspondingNoticeNo: "",
    clientQsComment: "",
    comments: "",
  },
  {
    no: "3",
    siteInstructionNumber: "SI-003",
    evidence: "Yes",
    date: "25/01/2026",
    variationSheetNumber: "VS-003",
    workArea: "Area C",
    workSection: "Section 3",
    descriptionOfWorks: "Yet another sample work",
    labourCost: "£200",
    materialCost: "£300",
    valuationAmount: "£500",
    percentClaimed: "%",
    amountClaimed: "£500",
    clientCertifiedAmount: "£450",
    difference: "£50",
    correspondingNoticeNo: "",
    clientQsComment: "",
    comments: "",
  },
]

const totalRow: VariationSummaryRow = {
  no: "",
  siteInstructionNumber: "",
  evidence: "",
  date: "",
  variationSheetNumber: "",
  workArea: "",
  workSection: "",
  descriptionOfWorks: "Total",
  labourCost: "£450",
  materialCost: "£750",
  valuationAmount: "£1,200",
  percentClaimed: "",
  amountClaimed: "£1,200",
  clientCertifiedAmount: "£1,120",
  difference: "£80",
  correspondingNoticeNo: "",
  clientQsComment: "",
  comments: "",
}

export default function VariationSummaryView() {
  const columns = useMemo<ColDef<VariationSummaryRow>[]>(
    () => [
      { headerName: "No.", field: "no", minWidth: 70, filter: false },
      {
        headerName: "Site instruction number",
        field: "siteInstructionNumber",
        minWidth: 180,
      },
      {
        headerName: "Evidence",
        field: "evidence",
        cellRenderer: (params: { value: string }) => (
          <div className="p-2">
            <File size={18} />
          </div>
        ),
      },
      { headerName: "Date", field: "date" },
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
        minWidth: 220,
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
        <AgTable
          rowData={variationRows}
          columnDefs={columns}
          gridOptions={{
            pinnedBottomRowData: [totalRow],
            getRowStyle: (params: any) => {
              if (params.node.isRowPinned()) {
                return {
                  fontWeight: "bold",
                  backgroundColor: "#1E3A8A80",
                } as any
              }
              return {}
            },
            getRowClass: (params) =>
              params.node.isRowPinned() ? "pinned-row" : "",
            defaultColDef: {
              flex: 1,
              minWidth: 120,
            },
          }}
          height="auto"
        />
      </div>
    </div>
  )
}
