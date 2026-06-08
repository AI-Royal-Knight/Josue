import * as React from "react"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

type CsvColumn<TData extends object> = {
  /** CSV column header text. Use this or `headerName` (AG Grid compat). */
  header?: string
  /** Alias for `header`, accepts AG Grid's `headerName` field. */
  headerName?: string
  field?: keyof TData & string
  value?: (row: TData) => unknown
}

export type ExportCsvButtonProps<TData extends object> = Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "children"
> & {
  rows: TData[]
  columns?: CsvColumn<TData>[]
  fileName?: string
  fileNamePrefix?: string
  label?: string
}

const csvEscape = (value: unknown) => {
  const text = value === null || value === undefined ? "" : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

const buildCsv = <TData extends object>({
  rows,
  columns,
}: {
  rows: TData[]
  columns: CsvColumn<TData>[]
}) => {
  const headers = columns
    .map((col) => csvEscape(col.header ?? col.headerName ?? ""))
    .join(",")

  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const value = col.value
            ? col.value(row)
            : col.field
              ? (row as Record<string, unknown>)[col.field]
              : ""
          return csvEscape(value)
        })
        .join(",")
    )
    .join("\n")

  return [headers, body].filter(Boolean).join("\n")
}

export function ExportCsvButton<TData extends object>({
  rows,
  columns,
  fileName,
  fileNamePrefix = "table-export",
  label = "Export",
  disabled,
  variant = "outline",
  size = "sm",
  ...buttonProps
}: ExportCsvButtonProps<TData>) {
  const resolvedDisabled = disabled ?? rows.length === 0

  const handleDownload = React.useCallback(() => {
    if (!rows.length) return

    const resolvedColumns: CsvColumn<TData>[] = (() => {
      if (columns?.length) return columns
      const firstRow = rows[0]
      const keys = firstRow ? Object.keys(firstRow) : []
      return keys.map((key) => ({
        header: key,
        field: key as keyof TData & string,
      }))
    })()

    const csv = buildCsv({ rows, columns: resolvedColumns })
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    const timestamp = new Date().toISOString().slice(0, 10)

    anchor.href = url
    anchor.download = fileName ?? `${fileNamePrefix}-${timestamp}.csv`
    anchor.click()

    URL.revokeObjectURL(url)
  }, [columns, fileName, fileNamePrefix, rows])

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={resolvedDisabled}
      className="flex items-center gap-2"
      {...buttonProps}
    >
      <Download className="h-4 w-4" />
      {label}
    </Button>
  )
}
