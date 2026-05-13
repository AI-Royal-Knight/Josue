"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import type { Row, FocusedCell } from "./types"
import { FIELD_HEADERS } from "./utils"

type CellSelection = {
  startRow: number
  startField: number
  endRow: number
  endField: number
}

type SpreadsheetTableProps = {
  rows: Row[]
  onChange: (rows: Row[]) => void
  copiedValue: string
  onCopy: (value: string) => void
}

export function SpreadsheetTable({
  rows,
  onChange,
  copiedValue,
  onCopy,
}: SpreadsheetTableProps) {
  const [focused, setFocused] = useState<FocusedCell>(null)
  const [selection, setSelection] = useState<CellSelection | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [copiedSelection, setCopiedSelection] = useState<CellSelection | null>(
    null
  )
  const tableRef = useRef<HTMLTableElement>(null)

  const getFieldIndex = (field: keyof Omit<Row, "id">) => {
    return FIELD_HEADERS.findIndex((h) => h.field === field)
  }

  const getFieldFromIndex = (index: number) => {
    return FIELD_HEADERS[index]?.field as keyof Omit<Row, "id">
  }

  const updateCell = useCallback(
    (rowIndex: number, field: keyof Omit<Row, "id">, value: string) => {
      onChange(
        rows.map((r, i) => (i === rowIndex ? { ...r, [field]: value } : r))
      )
    },
    [rows, onChange]
  )

  // Get normalized selection (min/max indices)
  const getNormalizedSelection = (sel: CellSelection) => {
    const startRow = Math.min(sel.startRow, sel.endRow)
    const endRow = Math.max(sel.startRow, sel.endRow)
    const startField = Math.min(sel.startField, sel.endField)
    const endField = Math.max(sel.startField, sel.endField)
    return { startRow, endRow, startField, endField }
  }

  // Check if a cell is selected
  const isCellSelected = (rowIndex: number, fieldIndex: number) => {
    if (!selection) return false
    const norm = getNormalizedSelection(selection)
    return (
      rowIndex >= norm.startRow &&
      rowIndex <= norm.endRow &&
      fieldIndex >= norm.startField &&
      fieldIndex <= norm.endField
    )
  }

  // Handle cell mouse down (start selection)
  const handleCellMouseDown = (rowIndex: number, fieldIndex: number) => {
    setIsSelecting(true)
    setSelection({
      startRow: rowIndex,
      startField: fieldIndex,
      endRow: rowIndex,
      endField: fieldIndex,
    })
    setFocused({ rowIndex, field: getFieldFromIndex(fieldIndex) })
  }

  // Handle cell mouse enter (extend selection)
  const handleCellMouseEnter = (rowIndex: number, fieldIndex: number) => {
    if (!isSelecting) return
    setSelection((prev) =>
      prev
        ? {
            ...prev,
            endRow: rowIndex,
            endField: fieldIndex,
          }
        : null
    )
  }

  // Handle mouse up (end selection)
  useEffect(() => {
    const handleMouseUp = () => {
      setIsSelecting(false)
    }

    document.addEventListener("mouseup", handleMouseUp)
    return () => document.removeEventListener("mouseup", handleMouseUp)
  }, [])

  // Keyboard copy / paste for selected range or single cell
  useEffect(() => {
    if (!focused && !selection) return

    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault()

        if (selection) {
          // Copy multiple cells as tab-separated and newline-separated
          const norm = getNormalizedSelection(selection)
          const lines: string[] = []

          for (let r = norm.startRow; r <= norm.endRow; r++) {
            const cells: string[] = []
            for (let f = norm.startField; f <= norm.endField; f++) {
              const field = getFieldFromIndex(f)
              cells.push(rows[r]?.[field] ?? "")
            }
            lines.push(cells.join("\t"))
          }

          const text = lines.join("\n")
          navigator.clipboard?.writeText(text).catch(() => {})
          onCopy(text)
          setCopiedSelection(selection)
        } else if (focused) {
          // Single cell copy
          const val = rows[focused.rowIndex]?.[focused.field] ?? ""
          navigator.clipboard?.writeText(val).catch(() => {})
          onCopy(val)
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault()

        navigator.clipboard
          ?.readText()
          .then((text) => {
            if (selection) {
              // Paste multiple cells
              const norm = getNormalizedSelection(selection)
              const lines = text.split("\n").filter((l) => l.trim())
              const newRows = rows.map((r) => ({ ...r }))

              lines.forEach((line, lineIdx) => {
                const rowIdx = norm.startRow + lineIdx
                if (rowIdx < newRows.length) {
                  const cells = line.split("\t")
                  cells.forEach((cell, cellIdx) => {
                    const fieldIdx = norm.startField + cellIdx
                    if (fieldIdx < FIELD_HEADERS.length) {
                      const field = getFieldFromIndex(fieldIdx)
                      newRows[rowIdx][field] = cell.trim()
                    }
                  })
                }
              })

              onChange(newRows)
            } else if (focused) {
              // Single cell paste
              updateCell(focused.rowIndex, focused.field, text)
            }
          })
          .catch(() => {
            if (copiedValue) {
              if (selection) {
                const norm = getNormalizedSelection(selection)
                const newRows = rows.map((r) => ({ ...r }))
                const lines = copiedValue.split("\n").filter((l) => l.trim())

                lines.forEach((line, lineIdx) => {
                  const rowIdx = norm.startRow + lineIdx
                  if (rowIdx < newRows.length) {
                    const cells = line.split("\t")
                    cells.forEach((cell, cellIdx) => {
                      const fieldIdx = norm.startField + cellIdx
                      if (fieldIdx < FIELD_HEADERS.length) {
                        const field = getFieldFromIndex(fieldIdx)
                        newRows[rowIdx][field] = cell.trim()
                      }
                    })
                  }
                })
                onChange(newRows)
              } else if (focused) {
                updateCell(focused.rowIndex, focused.field, copiedValue)
              }
            }
          })
      }
    }

    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [focused, selection, rows, copiedValue, onCopy, updateCell, onChange])

  const totals = {
    projectValue: rows
      .reduce((s, r) => s + (parseFloat(r.projectValue) || 0), 0)
      .toFixed(2),
    labourTarget: rows.reduce(
      (s, r) => s + (parseFloat(r.labourTarget) || 0),
      0
    ),
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead className="sticky top-0 z-10 bg-[#111827]">
          <tr>
            <th className="w-10 border-b border-[#1f2937] px-2 py-3 text-left text-[12px] font-semibold text-[#6b7280]">
              #
            </th>
            {FIELD_HEADERS.map(({ label }) => (
              <th
                key={label}
                className="border-b border-[#1f2937] px-3 py-3 text-left text-[12px] font-semibold text-[#6b7280]"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id} className="border-b border-[#1a2535]">
              <td className="px-2 py-1.5 text-center text-[12px] text-[#4b5563]">
                {rowIndex + 1}
              </td>

              {FIELD_HEADERS.map(({ field, placeholder }, fieldIndex) => {
                const isFocused =
                  focused?.rowIndex === rowIndex && focused?.field === field
                const isSelected = isCellSelected(rowIndex, fieldIndex)

                return (
                  <td
                    key={field}
                    className="px-1 py-1"
                    onMouseDown={() =>
                      handleCellMouseDown(rowIndex, fieldIndex)
                    }
                    onMouseEnter={() =>
                      handleCellMouseEnter(rowIndex, fieldIndex)
                    }
                  >
                    <input
                      value={row[field]}
                      placeholder={placeholder}
                      onFocus={() => setFocused({ rowIndex, field })}
                      onBlur={() => setFocused(null)}
                      onChange={(e) =>
                        updateCell(rowIndex, field, e.target.value)
                      }
                      className={cn(
                        "w-full rounded px-2.5 py-1.5 text-[13px] text-[#e2e8f0] transition-colors outline-none placeholder:text-[#374151]",
                        isFocused
                          ? "border border-blue-500 bg-[#1a2a45]"
                          : isSelected
                            ? "border border-blue-400 bg-[#1a3a5a]"
                            : "border border-[#1f2937] bg-[#0f1929] hover:border-[#2d4060]"
                      )}
                      style={{ userSelect: "none" }}
                    />
                  </td>
                )
              })}
            </tr>
          ))}

          {/* Totals row */}
          <tr className="border-t-2 border-[#1f2937] bg-[#0d1525]">
            <td
              colSpan={3}
              className="px-3 py-3 text-right text-[13px] font-medium text-[#6b7280]"
            >
              Totals:
            </td>
            <td className="px-3 py-3 text-[13px] font-semibold text-[#e2e8f0]">
              ${totals.projectValue}
            </td>
            <td className="px-3 py-3 text-[13px] font-semibold text-[#e2e8f0]">
              {totals.labourTarget}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
