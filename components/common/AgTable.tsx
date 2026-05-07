"use client"

import { useMemo, useRef, useCallback } from "react"
import { AgGridProvider, AgGridReact } from "ag-grid-react"
import {
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type GridReadyEvent,
  type SelectionChangedEvent,
  type RowClickedEvent,
  type GridApi,
} from "ag-grid-community"
import { colors } from "@/constants/colors"
import { AgTableProps } from "./type"

const baseTheme = themeQuartz.withParams({
  backgroundColor: colors.background,
  foregroundColor: colors.foreground,
  headerTextColor: colors.headerText,
  headerBackgroundColor: colors.headerBackground,
  oddRowBackgroundColor: colors.oddRowBackground,
  borderColor: colors.border,
  headerColumnResizeHandleColor: colors.headerColumnResizeHandle,

  borderRadius: 0,
  headerHeight: 36,
  rowHeight: 36,
  wrapperBorderRadius: 0,
  borderWidth: 0
})

const modules = [AllCommunityModule]

export function AgTable<TData extends object>({
  rowData,
  columnDefs,
  defaultColDef,
  components,
  height = "70vh",
  minHeight = 520,
  pagination = false,
  pageSize = 20,
  rowSelection,
  onSelectionChanged,
  onRowClicked,
  onCellValueChanged,
  onGridReady,
  gridOptions,
  loading = false,
  noRowsText = "No records found",
  theme,
}: AgTableProps<TData>) {
  const gridApiRef = useRef<GridApi<TData> | null>(null)

  // Stable theme reference
  const resolvedTheme = useMemo(() => theme ?? baseTheme, [theme])

  // Merged default col def
  const mergedDefaultColDef = useMemo<ColDef<TData>>(
    () => ({
      flex: 1,
      minWidth: 120,
      resizable: true,
      filter: true,
      sortable: true,
      ...defaultColDef,
    }),
    [defaultColDef]
  )

  const handleGridReady = useCallback(
    (event: GridReadyEvent<TData>) => {
      gridApiRef.current = event.api
      if (loading) event.api.showLoadingOverlay()
      onGridReady?.(event.api)
    },
    [loading, onGridReady]
  )

  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent<TData>) => {
      if (!onSelectionChanged) return
      const selected = event.api.getSelectedRows()
      onSelectionChanged(selected)
    },
    [onSelectionChanged]
  )

  const handleRowClicked = useCallback(
    (event: RowClickedEvent<TData>) => {
      if (event.data) onRowClicked?.(event.data)
    },
    [onRowClicked]
  )

  const isAutoHeight = height === "auto"
  const containerStyle = isAutoHeight
    ? { width: "100%" }
    : {
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
      }

  return (
    <AgGridProvider modules={modules}>
      <div style={containerStyle}>
        <AgGridReact<TData>
          // Data
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={mergedDefaultColDef}
          // Appearance
          theme={resolvedTheme}
          domLayout={isAutoHeight ? "autoHeight" : "normal"}
          // Custom components (cell renderers, header renderers, etc.)
          components={components}
          // Selection
          rowSelection={rowSelection}
          onSelectionChanged={handleSelectionChanged}
          // Events
          onGridReady={handleGridReady}
          onRowClicked={handleRowClicked}
          onCellValueChanged={onCellValueChanged}
          // Pagination
          pagination={pagination}
          paginationPageSize={pageSize}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          // UX
          animateRows
          suppressMovableColumns={false}
          enableCellTextSelection
          noRowsOverlayComponent={() => (
            <span className="text-sm text-slate-400">{noRowsText}</span>
          )}
          // Spread any extra grid options last so they can override above
          {...gridOptions}
        />
      </div>
    </AgGridProvider>
  )
}
