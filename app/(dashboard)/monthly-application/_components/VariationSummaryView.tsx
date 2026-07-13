"use client"

import { useEffect, useState, useMemo } from "react"
import type { ColDef } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import { File } from "lucide-react"
import { getVariations } from "@/lib/api/variations"
import { formatGBP } from "../../variations/utils"

export default function VariationSummaryView({ projectId }: { projectId: string }) {
  const [variationRows, setVariationRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!projectId || projectId === "none") {
      setVariationRows([])
      return
    }

    async function load() {
      setLoading(true)
      try {
        const data = await getVariations(projectId)
        setVariationRows(data.variations)
      } catch (e) {
        console.error("Failed to load variations", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId])

  const totalRow = useMemo(() => {
    if (!variationRows.length) return null

    let totalValuation = 0
    let totalClaimed = 0
    let totalCertified = 0
    let totalDifference = 0

    variationRows.forEach((row) => {
      totalValuation += parseFloat(row.valuation_amount || "0")
      totalClaimed += parseFloat(row.amount_claimed || "0")
      totalCertified += parseFloat(row.client_certified_amount || "0")
      totalDifference += parseFloat(row.difference || "0")
    })

    return {
      no: "1",
      siteInstructionNumber: "",
      evidence: "",
      date: "",
      variationSheetNumber: "",
      descriptionOfWorks: "Total",
      valuationAmount: formatGBP(totalValuation),
      percentClaimed: "",
      amountClaimed: formatGBP(totalClaimed),
      clientCertifiedAmount: formatGBP(totalCertified),
      difference: formatGBP(totalDifference),
      correspondingNoticeNo: "",
      clientQsComment: "",
      comments: "",
    }
  }, [variationRows])
  const columns = useMemo<ColDef<any>[]>(
    () => [
      { headerName: "No.", field: "no", minWidth: 70, filter: false },
      {
        headerName: "Variation Number",
        field: "variationSheetNumber",
        minWidth: 160,
      },
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
        headerName: "Description of Works",
        field: "descriptionOfWorks",
        minWidth: 260,
      },
      {
        headerName: "Valuation Amount",
        field: "valuation_amount",
        minWidth: 140,
        valueFormatter: (params) => params.value && params.value !== "Total" && !params.value.includes("£") ? formatGBP(parseFloat(params.value)) : params.value
      },
      { headerName: "% Claimed", field: "percentClaimed", minWidth: 100 },
      { headerName: "Amount Claimed", field: "amountClaimed", minWidth: 140 },
      {
        headerName: "Client Certified Amount",
        field: "clientCertifiedAmount",
        minWidth: 160,
      },
      { headerName: "Difference", field: "diffrenceAmount", minWidth: 120 },
      {
        headerName: "Corresponding Client Payment Notice No",
        field: "paymentStatusNr",
        minWidth: 220,
      },
      {
        headerName: "Client QS Comment",
        field: "claimGQComment",
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
            pinnedBottomRowData: totalRow ? [totalRow] : [],
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
