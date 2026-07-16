"use client"

import { useState, useEffect, useMemo } from "react"
import SelectProject from "@/components/shared/select-project"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import type { ColDef } from "ag-grid-community"
import { Switch } from "@/components/ui/switch"
import { getVariations } from "@/lib/api/variations"
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
  variationAmount: string
  percentClaimed: string
  amountClaimed: string
  addToApplication: boolean
  signByClient?: string
  clientCertifiedAmount: string
  diffrenceAmount: string
  paymentStatusNr: string
  claimGQComment: string
  comments: string
}

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
    cellRenderer: (params: { data: { evidence_url?: string }; value: string }) => {
      if (params.data?.evidence_url) {
        return (
          <a href={params.data.evidence_url} target="_blank" rel="noopener noreferrer" className="p-2 inline-block text-blue-400 hover:text-blue-300">
            <File size={18} />
          </a>
        )
      }
      return (
        <div className="p-2 text-slate-500">
          <File size={18} />
        </div>
      )
    },
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
    headerName: "Description of Works",
    field: "descriptionOfWorks",
  },
  {
    headerName: "Variation value",
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
    headerName: "Add to Application",
    field: "addToApplication",
    cellRenderer: (params: { value: any }) => (
      <Switch
        checked={Boolean(params.value)}
        onCheckedChange={(checked) => {
          // Handle toggle logic here, e.g., update the value in your data source
          console.log(
            `Toggle for row changed to ${checked}`
          )
        }}
      />
    ),
  },
  { headerName: "Signed by Client", field: "signByClient" },
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

export default function Page() {
  const [selectedProject, setSelectedProject] = useState("")
  const [variations, setVariations] = useState<VariationSummaryRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedProject || selectedProject === "none") {
      setVariations([])
      return
    }

    async function fetchVariations() {
      setLoading(true)
      try {
        const result = await getVariations(selectedProject)
        // @ts-ignore
        setVariations(result.variations || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchVariations()
  }, [selectedProject])

  const totalRow = useMemo<VariationSummaryRow>(() => ({
    no: "",
    siteInstructionNumber: "TOTAL",
    evidence: "",
    date: "",
    variationSheetNumber: "",
    workArea: "",
    workSection: "",
    descriptionOfWorks: "",
    labourCost: `£${variations
      .reduce(
        (sum, row) => sum + Number(String(row.labourCost || "0").replace(/[^\d.-]/g, "") || 0),
        0
      )
      .toFixed(2)}`,
    materialCost: `£${variations
      .reduce(
        (sum, row) => sum + Number(String(row.materialCost || "0").replace(/[^\d.-]/g, "") || 0),
        0
      )
      .toFixed(2)}`,
    variationAmount: `£${variations
      .reduce(
        (sum, row) => sum + Number(String(row.variationAmount || "0").replace(/[^\d.-]/g, "") || 0),
        0
      )
      .toFixed(2)}`,
    percentClaimed: "",
    amountClaimed: `£${variations
      .reduce(
        (sum, row) => sum + Number(String(row.amountClaimed || "0").replace(/[^\d.-]/g, "") || 0),
        0
      )
      .toFixed(2)}`,
    addToApplication: false,
    signByClient: "",
    clientCertifiedAmount: `£${variations
      .reduce(
        (sum, row) => sum + Number(String(row.clientCertifiedAmount || "0").replace(/[^\d.-]/g, "") || 0),
        0
      )
      .toFixed(2)}`,
    diffrenceAmount: `£${variations
      .reduce(
        (sum, row) => sum + Number(String(row.diffrenceAmount || "0").replace(/[^\d.-]/g, "") || 0),
        0
      )
      .toFixed(2)}`,
    paymentStatusNr: "",
    claimGQComment: "",
    comments: "",
  }), [variations])

  const summaryMetrics = useMemo(() => {
    const totalVariations = variations.length;
    const totalVariationValue = variations.reduce((sum, row) => sum + Number(String(row.variationAmount || "0").replace(/[^\d.-]/g, "") || 0), 0);

    const addedVariations = variations.filter(v => v.addToApplication).length;
    const addedValue = variations.filter(v => v.addToApplication).reduce((sum, row) => sum + Number(String(row.variationAmount || "0").replace(/[^\d.-]/g, "") || 0), 0);

    return [
      { label: "Variation", qty: String(totalVariations).padStart(4, "0"), value: `£${totalVariationValue.toFixed(2)}` },
      { label: "Added to monthly application", qty: String(addedVariations).padStart(3, "0"), value: `£${addedValue.toFixed(2)}` },
    ]
  }, [variations])

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h2 className="mb-4 text-2xl font-semibold">Variation Summary</h2>
        <SelectProject value={selectedProject} onChange={setSelectedProject} />
      </div>

      <TableStat summaryRows={summaryMetrics} />

      <AgTable
        rowData={variations}
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
              return { fontWeight: "bold", backgroundColor: "#1E3A8A80" } as any
            }
            return {}
          },
          getRowClass: (params) =>
            params.node.isRowPinned() ? "pinned-row" : "",
        }}
        noRowsText="No variation data available"
        defaultColDef={{
          flex: 1,
          minWidth: 160,
        }}
      />
    </div>
  )
}
