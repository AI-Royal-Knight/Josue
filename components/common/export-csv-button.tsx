import * as React from "react"
import ExcelJS from "exceljs"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type CsvColumn<TData extends object> = {
  header: string
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

export function ExportCsvButton<TData extends object>({
  rows,
  columns,
  fileName,
  fileNamePrefix = "table-export",
  label = "Export",
  disabled,
  variant = "outline",
  size = "sm",
  className,
  ...buttonProps
}: ExportCsvButtonProps<TData>) {
  const [isExporting, setIsExporting] = React.useState(false)
  const resolvedDisabled = disabled ?? rows.length === 0

  const handleDownload = React.useCallback(async () => {
    if (!rows.length) return
    setIsExporting(true)

    try {
      const resolvedColumns: CsvColumn<TData>[] = (() => {
        if (columns?.length) return columns
        const firstRow = rows[0]
        const keys = firstRow ? Object.keys(firstRow) : []
        return keys.map((key) => ({
          header: key,
          field: key as keyof TData & string,
        }))
      })()

      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet("Export")

      // Add Headers
      const headerRow = sheet.addRow(resolvedColumns.map(col => col.header))
      
      // Style Headers
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 }
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF059669" }, // Emerald 600
      }
      headerRow.alignment = { vertical: "middle", horizontal: "center" }
      headerRow.height = 25

      // Add Data
      rows.forEach(row => {
        const rowValues = resolvedColumns.map(col => {
          if (col.value) return col.value(row)
          if (col.field) return (row as any)[col.field]
          return ""
        })
        const dataRow = sheet.addRow(rowValues)
        dataRow.height = 20
      })

      // Auto-fit columns & style cells
      sheet.columns.forEach((col, i) => {
        let maxLength = resolvedColumns[i].header.length
        rows.forEach(row => {
          const val = resolvedColumns[i].value ? resolvedColumns[i].value!(row) : (row as any)[resolvedColumns[i].field!]
          const strVal = val ? String(val) : ""
          if (strVal.length > maxLength) {
            maxLength = strVal.length
          }
        })
        col.width = Math.min(Math.max(maxLength + 4, 15), 60)
        col.alignment = { vertical: "middle", horizontal: "left" }
      })

      // Add borders to all cells
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFCCCCCC" } },
            left: { style: "thin", color: { argb: "FFCCCCCC" } },
            bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
            right: { style: "thin", color: { argb: "FFCCCCCC" } }
          }
        })
      })

      // Generate blob
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      const timestamp = new Date().toISOString().slice(0, 10)

      anchor.href = url
      anchor.download = fileName ?? `${fileNamePrefix}-${timestamp}.xlsx`
      anchor.click()

      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setIsExporting(false)
    }
  }, [columns, fileName, fileNamePrefix, rows])

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={handleDownload}
      disabled={resolvedDisabled || isExporting}
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]",
        "flex items-center gap-2 px-4 text-emerald-400",
        className
      )}
      {...buttonProps}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {isExporting ? (
        <Loader2 className="relative z-10 h-4 w-4 animate-spin text-emerald-400" />
      ) : (
        <Download className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" />
      )}
      <span className="relative z-10 font-semibold tracking-wide transition-colors duration-300 group-hover:text-emerald-300">
        {isExporting ? "Exporting..." : label}
      </span>
    </Button>
  )
}
