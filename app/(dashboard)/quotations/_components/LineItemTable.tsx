import { useRef, useCallback, KeyboardEvent, ClipboardEvent } from "react"
import * as XLSX from "xlsx"
import { LineItem, makeRow } from "./create-quotation-form"
import { Plus, Trash2, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"

const COL_KEYS: (keyof Omit<LineItem, "id">)[] = [
  "description",
  "qty",
  "discount",
  "per",
  "each",
  "comments",
]

const COL_HEADERS: Record<keyof Omit<LineItem, "id">, string> = {
  description: "Description",
  qty: "QTY",
  discount: "Discount",
  per: "Per",
  each: "Each",
  comments: "Comments",
}

const COL_PLACEHOLDERS: Record<keyof Omit<LineItem, "id">, string> = {
  description: "Paste from Excel sheet",
  qty: "QTY",
  discount: "0.00",
  per: "Unit",
  each: "0.00",
  comments: "Supplier comments",
}

const NUMERIC_COLS = new Set<keyof Omit<LineItem, "id">>([
  "qty",
  "discount",
  "each",
])

// Fallback positional column mapping for Excel files without headers
const POSITIONAL_COL_MAP: (keyof Omit<LineItem, "id">)[] = [
  "description",
  "qty",
  "discount",
  "per",
  "each",
  "comments",
]

function focusCell(
  tableRef: React.RefObject<HTMLTableElement | null>,
  row: number,
  col: number
) {
  const input = tableRef.current?.querySelector<HTMLInputElement>(
    `input[data-row="${row}"][data-col="${col}"]`
  )
  input?.focus()
  input?.select()
}

function calcTotal(items: LineItem[]): number {
  return items.reduce((acc, row) => {
    const qty = parseFloat(row.qty) || 0
    const each = parseFloat(row.each) || 0
    const discount = parseFloat(row.discount) || 0
    const lineTotal = qty * each * (1 - discount / 100)
    return acc + lineTotal
  }, 0)
}

export function LineItemTable({
  items,
  onChange,
}: {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
}) {
  const tableRef = useRef<HTMLTableElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Import from Excel ─────────────────────────────────────────────────
  const handleImportExcel = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (evt) => {
        try {
          const data = evt.target?.result
          if (!data) return

          const workbook = XLSX.read(data, { type: "array" })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
            defval: "",
          })

          if (json.length === 0) return

          // Build a column-mapping from the first row's keys
          const headerKeys = Object.keys(json[0])

          // Try to match Excel column headers to our field keys
          const headerMap = new Map<number, keyof Omit<LineItem, "id">>()

          // Check if the first row has meaningful headers by trying to match
          const headerMatched = headerKeys.some(
            (hk) =>
              COL_HEADERS.description.toLowerCase().startsWith(hk.toLowerCase().slice(0, 6)) ||
              hk.toLowerCase().includes("descript") ||
              hk.toLowerCase().includes("qty") ||
              hk.toLowerCase().includes("quant") ||
              hk.toLowerCase().includes("disc") ||
              hk.toLowerCase().includes("unit") ||
              hk.toLowerCase().includes("price") ||
              hk.toLowerCase().includes("each") ||
              hk.toLowerCase().includes("comment")
          )

          if (headerMatched) {
            // Map by header name
            headerKeys.forEach((hk, idx) => {
              const lower = hk.toLowerCase()
              if (lower.includes("descript") || lower.includes("item")) {
                headerMap.set(idx, "description")
              } else if (lower.includes("qty") || lower.includes("quant")) {
                headerMap.set(idx, "qty")
              } else if (lower.includes("disc")) {
                headerMap.set(idx, "discount")
              } else if (lower.includes("unit") || lower.includes("per")) {
                headerMap.set(idx, "per")
              } else if (lower.includes("price") || lower.includes("each") || lower.includes("rate")) {
                headerMap.set(idx, "each")
              } else if (lower.includes("comment")) {
                headerMap.set(idx, "comments")
              }
            })
          }

          // `sheet_to_json` already uses the first row as column headers,
          // so the JSON array starts at the first data row (index 0).
          const imported: LineItem[] = []

          for (let ri = 0; ri < json.length; ri++) {
            const row = json[ri]
            if (!row) continue
            const cellKeys = Object.keys(row)

            const newItem = makeRow()

            if (headerMap.size > 0) {
              // Use header-based mapping
              cellKeys.forEach((ck, idx) => {
                const field = headerMap.get(idx)
                if (field) {
                  newItem[field] = String(row[ck] ?? "").trim()
                }
              })
            } else {
              // Fall back to positional mapping
              cellKeys.forEach((ck, idx) => {
                if (idx < POSITIONAL_COL_MAP.length) {
                  newItem[POSITIONAL_COL_MAP[idx]] = String(row[ck] ?? "").trim()
                }
              })
            }

            // Only add if at least the description is filled
            if (newItem.description || newItem.qty || newItem.each) {
              imported.push(newItem)
            }
          }

          if (imported.length > 0) {
            onChange(imported)
          }
        } catch (err) {
          console.error("Excel import failed:", err)
        }
      }
      reader.readAsArrayBuffer(file)

      // Reset input so the same file can be re-imported
      e.target.value = ""
    },
    [onChange]
  )

  const updateCell = useCallback(
    (id: string, key: keyof Omit<LineItem, "id">, value: string) => {
      onChange(items.map((r) => (r.id === id ? { ...r, [key]: value } : r)))
    },
    [items, onChange]
  )

  const addRow = useCallback(() => {
    onChange([...items, makeRow()])
  }, [items, onChange])

  const deleteRow = useCallback(
    (id: string) => {
      const next = items.filter((r) => r.id !== id)
      onChange(next.length ? next : [makeRow()])
    },
    [items, onChange]
  )

  // Move focus with arrow keys / Tab within the table
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, rowIdx: number, colIdx: number) => {
      const totalRows = items.length
      const totalCols = COL_KEYS.length

      let nextRow = rowIdx
      let nextCol = colIdx

      if (e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey)) {
        if (colIdx < totalCols - 1) {
          nextCol = colIdx + 1
        } else if (rowIdx < totalRows - 1) {
          nextRow = rowIdx + 1
          nextCol = 0
        } else {
          // At last cell — add a new row then focus its first cell
          if (e.key === "Tab") {
            e.preventDefault()
            const newItems = [...items, makeRow()]
            onChange(newItems)
            setTimeout(() => focusCell(tableRef, rowIdx + 1, 0), 0)
          }
          return
        }
        if (e.key === "Tab") e.preventDefault()
        focusCell(tableRef, nextRow, nextCol)
      } else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) {
        if (colIdx > 0) {
          nextCol = colIdx - 1
        } else if (rowIdx > 0) {
          nextRow = rowIdx - 1
          nextCol = totalCols - 1
        }
        if (e.key === "Tab") e.preventDefault()
        focusCell(tableRef, nextRow, nextCol)
      } else if (e.key === "ArrowDown") {
        if (rowIdx < totalRows - 1) focusCell(tableRef, rowIdx + 1, colIdx)
      } else if (e.key === "ArrowUp") {
        if (rowIdx > 0) focusCell(tableRef, rowIdx - 1, colIdx)
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (rowIdx < totalRows - 1) {
          focusCell(tableRef, rowIdx + 1, colIdx)
        } else {
          // Last row — add new row
          const newItems = [...items, makeRow()]
          onChange(newItems)
          setTimeout(() => focusCell(tableRef, rowIdx + 1, colIdx), 0)
        }
      }
    },
    [items, onChange]
  )

  // Handle paste — supports multi-cell Excel / Google Sheets paste
  const handlePaste = useCallback(
    (
      e: ClipboardEvent<HTMLInputElement>,
      startRowIdx: number,
      startColIdx: number
    ) => {
      const text = e.clipboardData.getData("text/plain")
      if (!text.includes("\t") && !text.includes("\n")) return // single cell, let browser handle

      e.preventDefault()

      const pastedRows = text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trimEnd()
        .split("\n")
        .map((row) => row.split("\t"))

      const updated = [...items]

      // Extend rows if needed
      const rowsNeeded = startRowIdx + pastedRows.length
      while (updated.length < rowsNeeded) updated.push(makeRow())

      pastedRows.forEach((pastedCols, ri) => {
        const rowIdx = startRowIdx + ri
        pastedCols.forEach((cellVal, ci) => {
          const colIdx = startColIdx + ci
          if (colIdx < COL_KEYS.length) {
            const key = COL_KEYS[colIdx]
            updated[rowIdx] = { ...updated[rowIdx], [key]: cellVal.trim() }
          }
        })
      })

      onChange(updated)
    },
    [items, onChange]
  )

  const total = calcTotal(items)

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-md border border-white/10">
        <table ref={tableRef} className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {COL_KEYS.map((key) => (
                <th
                  key={key}
                  className="px-3 text-left text-xs font-medium tracking-wide text-slate-400 uppercase"
                >
                  {COL_HEADERS[key]}
                </th>
              ))}
              {/* Total Value col */}
              <th className="px-3 text-right text-xs font-medium tracking-wide text-slate-400 uppercase">
                Total Value
              </th>
              {/* Delete col */}
              <th className="w-8 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((row, rowIdx) => {
              const qty = parseFloat(row.qty) || 0
              const each = parseFloat(row.each) || 0
              const discount = parseFloat(row.discount) || 0
              const lineTotal = qty * each * (1 - discount / 100)
              const hasValue = lineTotal !== 0

              return (
                <tr
                  key={row.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                >
                  {COL_KEYS.map((key, colIdx) => (
                    <td key={key} className="p-0">
                      <input
                        data-row={rowIdx}
                        data-col={colIdx}
                        type={NUMERIC_COLS.has(key) ? "number" : "text"}
                        step={NUMERIC_COLS.has(key) ? "0.01" : undefined}
                        min={NUMERIC_COLS.has(key) ? "0" : undefined}
                        value={row[key]}
                        placeholder={COL_PLACEHOLDERS[key]}
                        onChange={(e) =>
                          updateCell(row.id, key, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                        onPaste={(e) => handlePaste(e, rowIdx, colIdx)}
                        className="h-10 w-full bg-transparent px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:bg-white/5 focus:ring-1 focus:ring-blue-500/60 focus:outline-none focus:ring-inset"
                      />
                    </td>
                  ))}
                  {/* Computed total value */}
                  <td className="px-3 py-2 text-right text-sm text-slate-300 tabular-nums">
                    {hasValue ? (
                      <span className="text-emerald-400">
                        £{lineTotal.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-600">£</span>
                    )}
                  </td>
                  {/* Delete button */}
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => deleteRow(row.id)}
                      className="rounded p-1 text-slate-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      aria-label="Delete row"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          {/* Total row */}
          <tfoot>
            <tr className="border-t border-white/10 bg-white/5">
              <td
                colSpan={COL_KEYS.length}
                className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-slate-400 uppercase"
              >
                TOTAL
              </td>
              <td className="px-3 py-2 text-right text-sm font-semibold text-emerald-400 tabular-nums">
                £{total.toFixed(2)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          className="border-white/10 bg-transparent text-xs text-slate-300 hover:bg-white/5"
        >
          <Plus className="size-3.5" />
          Add Row
        </Button>

        {/* Import from Excel */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="sr-only"
          onChange={handleImportExcel}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="border-emerald-700/40 bg-emerald-950/20 text-xs text-emerald-300 hover:bg-emerald-950/40 hover:text-emerald-200"
        >
          <FileSpreadsheet className="size-3.5" />
          Import from Excel
        </Button>
      </div>
    </div>
  )
}
