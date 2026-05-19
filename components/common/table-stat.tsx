import { AgTable } from "./AgTable"
import type { ColDef } from "ag-grid-community"

type StatRow = {
  label: string
  value: string
  alert?: boolean
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
      cellClass: "px-3 text-xs font-semibold text-slate-100",
      cellStyle: { textAlign: "center" },
    },
  ]

  return (
    <div className="max-w-[500px] overflow-hidden [&_.ag-header]:hidden [&_.ag-header-cell]:hidden [&_.ag-header-row]:hidden [&_.ag-root-wrapper]:border-0">
      <AgTable
        rowData={summaryRows}
        columnDefs={columnDefs}
        height="auto"
        suppressCellClickAction
        defaultColDef={{ sortable: false, filter: false, resizable: false }}
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
