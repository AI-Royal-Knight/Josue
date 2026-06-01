import { AgTable } from "./AgTable"
import type { ColDef } from "ag-grid-community"

type StatRow = {
  label: string
  qty?: number | string
  value?: string
  alert?: boolean
  valueColor?: "red" | "green" | undefined
}

type TableStatProps = {
  summaryRows: StatRow[]
}

export default function TableStat({ summaryRows = [] }: TableStatProps) {
  const hasMeaningfulValue = (value: unknown) => {
    if (value === null || value === undefined) return false
    if (typeof value === "number") return true
    if (typeof value === "string") return value.trim().length > 0
    return true
  }

  const showQty =
    summaryRows.length === 0 ||
    summaryRows.some((row) => hasMeaningfulValue(row.qty))
  const showValue =
    summaryRows.length === 0 ||
    summaryRows.some((row) => hasMeaningfulValue(row.value))

  const metricFlex = showQty && showValue ? 0.5 : 1

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
    ...(showQty
      ? ([
          {
            field: "qty",
            headerName: "",
            flex: metricFlex,
            sortable: false,
            filter: false,
          },
        ] satisfies ColDef<StatRow>[])
      : []),
    ...(showValue
      ? ([
          {
            field: "value",
            headerName: "",
            flex: metricFlex,
            sortable: false,
            filter: false,
            resizable: false,
            cellStyle: (params: { data?: StatRow | undefined }) => {
              const color = params.data?.valueColor
              return {
                textAlign: "center",
                ...(color
                  ? {
                      backgroundColor: color === "red" ? "#dc2626" : "#15803d",
                    }
                  : {}),
              }
            },
          },
        ] satisfies ColDef<StatRow>[])
      : []),
  ]

  const headerRow: StatRow = {
    label: "",
    ...(showQty ? { qty: "QTY" } : {}),
    ...(showValue ? { value: "Value" } : {}),
  }

  const rowData: StatRow[] =
    showQty || showValue ? [headerRow, ...summaryRows] : summaryRows

  return (
    <div className="w-full max-w-[550px] overflow-hidden [&_.ag-header]:hidden [&_.ag-header-cell]:hidden [&_.ag-header-row]:hidden [&_.ag-root-wrapper]:border-0">
      <AgTable
        rowData={rowData}
        columnDefs={columnDefs}
        showRowNumberColumn={false}
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
