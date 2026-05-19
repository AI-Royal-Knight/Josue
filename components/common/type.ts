import {
  CellValueChangedEvent,
  ColDef,
  Components,
  GridApi,
  GridOptions,
  themeQuartz,
} from "ag-grid-community"

export type AgTableProps<TData extends object> = {
  /** Row data */
  rowData: TData[]

  /** Column definitions — typed against your row shape */
  columnDefs: ColDef<TData>[]

  /** Override any default column def */
  defaultColDef?: ColDef<TData>

  /**
   * Custom cell / header / tooltip components.
   * Pass as `{ MyRenderer: MyRendererComponent }` then reference
   * with `cellRenderer: "MyRenderer"` inside columnDefs.
   */
  components?: Components

  /** Grid height. Defaults to "70vh". Pass "auto" for domLayout=autoHeight */
  height?: string | number

  /** Minimum height fallback */
  minHeight?: string | number

  /** Show built-in pagination bar */
  pagination?: boolean

  /** Rows per page when pagination is enabled */
  pageSize?: number

  /** Enable single / multiple row selection */
  rowSelection?: "single" | "multiple"

  /** Fired when selected rows change */
  onSelectionChanged?: (rows: TData[]) => void

  /** Fired when a row is clicked */
  onRowClicked?: (row: TData) => void

  /** Disable the built-in cell click action for display-only grids */
  suppressCellClickAction?: boolean

  /** Fired when an editable cell value changes */
  onCellValueChanged?: (params: CellValueChangedEvent<TData>) => void

  /** Fired once the grid is ready — exposes the GridApi */
  onGridReady?: (api: GridApi<TData>) => void

  /** Any extra AG Grid grid options not covered above */
  gridOptions?: GridOptions<TData>

  /** Show loading overlay */
  loading?: boolean

  /** Custom no-rows overlay text */
  noRowsText?: string

  /** Custom theme — overrides the default dark theme */
  theme?: ReturnType<typeof themeQuartz.withParams>
}
