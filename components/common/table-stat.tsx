import { AgTable } from "./AgTable"
import type { ColDef } from "ag-grid-community"

type StatRow = {
  label: string
  value: string
  alert?: boolean
  /** Optional colour override for the value cell: "red" | "green" */
  valueColor?: "red" | "green" | undefined
}

type TableStatProps = {
  summaryRows: StatRow[]
}

export default function TableStat({ summaryRows = [] }: TableStatProps) {
  const columnDefs: ColDef<StatRow>[] = [
    {
      field: "label",
      headerName: "",
      flex: 1,
      sortable: false,
      filter: false,
      resizable: false,
      cellClass: "px-3 text-xs font-semibold text-slate-100",
    },
    {
      field: "value",
      headerName: "",
      flex: 0.5,
      sortable: false,
      filter: false,
      resizable: false,
      cellStyle: (params: { data?: StatRow | undefined }) => {
        const color = params.data?.valueColor
        return {
          textAlign: "center",
          ...(color
            ? { backgroundColor: color === "red" ? "#dc2626" : "#15803d" }
            : {}),
        }
      },
      // cellRenderer: (params: { value: string; data: StatRow }) => {
      //   const color = params.data?.valueColor
      //   if (color === "red") {
      //     return (
      //       <span className="text-xs font-semibold text-red-500">
      //         {params.value}
      //       </span>
      //     )
      //   }
      //   if (color === "green") {
      //     return (
      //       <span className="text-xs font-semibold text-green-500">
      //         {params.value}
      //       </span>
      //     )
      //   }
      //   return (
      //     <span className="text-xs font-semibold text-slate-100">
      //       {params.value}
      //     </span>
      //   )
      // },
    },
  ]

  return (
    <div className="w-full max-w-[400px] overflow-hidden [&_.ag-header]:hidden [&_.ag-header-cell]:hidden [&_.ag-header-row]:hidden [&_.ag-root-wrapper]:border-0">
      <AgTable
        rowData={summaryRows}
        columnDefs={columnDefs}
        height="auto"
        suppressCellClickAction
        defaultColDef={{
          sortable: false,
          filter: false,
          resizable: false,
          minWidth: 0,
        }}
        gridOptions={{
          headerHeight: 0,
          suppressCellFocus: true,
          domLayout: "autoHeight",
        }}
        noRowsText="No summary data available"
      />
    </div>
  )
}
