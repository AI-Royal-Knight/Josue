"use client"

import { useMemo } from "react"
import type { ColDef, RowSpanParams, ColSpanParams } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"

type WhiteRow = {
  id: string
  section?: string
  r0?: string
  r1?: string
  r2?: string
  r3?: string
  r4?: string
  r5?: string
  r6?: string
}

// Build rows to closely mirror the original table structure.
const whiteCardRows: WhiteRow[] = [
  // Header row with grouped headings
  {
    id: "h1",
    section: "APARTMENTS",
    r0: "electrical",
    r1: "",
    r2: "Project Value",
    r3: "Electrical First Fix",
    r4: "",
    r5: "Project Value",
    r6: "Project Value",
  },
  // Subheader row
  {
    id: "h2",
    r0: "Work section",
    r1: "Work area",
    r3: "Work section",
    r4: "Work area",
    r5: "Work section",
    r6: "Work area",
  },
  // Data rows (7 rows)
  ...Array.from({ length: 7 }).map((_, i) => ({
    id: `d${i}`,
    r0: "",
    r1: "",
    r2: "",
    r3: "",
    r4: "",
    r5: "",
    r6: "",
  })),
  // Next group header for CORRIDORS
  {
    id: "h3",
    section: "CORRIDORS",
    r0: "electrical",
    r1: "",
    r2: "Project Value",
    r3: "Electrical First Fix",
    r4: "",
    r5: "Project Value",
    r6: "",
  },
  {
    id: "h4",
    r0: "Work section",
    r1: "Work area",
    r3: "Work section",
    r4: "Work area",
  },
  ...Array.from({ length: 7 }).map((_, i) => ({
    id: `c${i}`,
    r0: "",
    r1: "",
    r2: "",
    r3: "",
    r4: "",
    r5: "",
    r6: "",
  })),
]

export default function WhiteCardView() {
  const columns = useMemo<ColDef<WhiteRow>[]>(
    () => [
      {
        headerName: "Section",
        field: "section",
        minWidth: 130,
        rowSpan: (params: RowSpanParams<WhiteRow>) => {
          // Span the section cell for the block header (APARTMENTS and CORRIDORS)
          const idx = params.node?.rowIndex ?? (params as any).rowIndex ?? 0
          if (idx === 0) return 9 // APARTMENTS block (header + subheader + 7 rows)
          if (idx === 9) return 9 // CORRIDORS block
          return 1
        },
        cellClass: "bg-yellow-400 font-bold text-black text-center",
      },
      {
        headerName: "C1",
        field: "r0",
        minWidth: 140,
        colSpan: (params: ColSpanParams<WhiteRow>) => {
          // On first header row, span this cell across two columns to match original
          if (params.data?.id === "h1" || params.data?.id === "h3") return 2
          return 1
        },
      },
      { headerName: "C2", field: "r1", minWidth: 140 },
      {
        headerName: "C3",
        field: "r2",
        minWidth: 140,
        rowSpan: (params: RowSpanParams<WhiteRow>) => {
          // Project Value cells in header span two rows
          const idx = params.node?.rowIndex ?? (params as any).rowIndex ?? 0
          if (
            params.data?.id === "h1" ||
            params.data?.id === "h3" ||
            idx === 0 ||
            idx === 9
          )
            return 2
          return 1
        },
      },
      {
        headerName: "C4",
        field: "r3",
        minWidth: 140,
        colSpan: (params: ColSpanParams<WhiteRow>) => {
          if (params.data?.id === "h1" || params.data?.id === "h3") return 2
          return 1
        },
      },
      { headerName: "C5", field: "r4", minWidth: 140 },
      { headerName: "C6", field: "r5", minWidth: 140 },
      { headerName: "C7", field: "r6", minWidth: 140 },
    ],
    []
  )

  return (
    <div className="overflow-x-auto border border-white/10">
      <div className="min-w-[1200px]">
        <AgTable rowData={whiteCardRows} columnDefs={columns} height="auto" />
      </div>
    </div>
  )
}
