"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import type { Row, FocusedCell } from "./types"
import { FIELD_HEADERS } from "./utils"
import { Input } from "@/components/ui/input"

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
  isManagement?: boolean
}

const COLUMN_WIDTHS: Record<string, string> = {
  projectValue: "140px",
  labourTarget: "140px",
}

// Totals row height so the body scroll area accounts for it
const TOTALS_HEIGHT = 48

export function SpreadsheetTable({
  rows,
  onChange,
  copiedValue,
  onCopy,
  isManagement,
}: SpreadsheetTableProps) {
  const [focused, setFocused] = useState<FocusedCell>(null)
  const [selection, setSelection] = useState<CellSelection | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [copiedSelection, setCopiedSelection] = useState<CellSelection | null>(
    null
  )
  const tableRef = useRef<HTMLTableElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [bodyHeight, setBodyHeight] = useState<number | null>(null)

  const headers = FIELD_HEADERS

  // Measure the wrapper so the scroll body fills exactly the right height
  useEffect(() => {
    if (!wrapperRef.current) return
    const observer = new ResizeObserver(() => {
      if (!wrapperRef.current) return
      const total = wrapperRef.current.clientHeight
      const thead = wrapperRef.current.querySelector<HTMLElement>("thead")
      const theadH = thead?.offsetHeight ?? 44
      setBodyHeight(total - theadH - TOTALS_HEIGHT)
    })
    observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [])

  const getFieldFromIndex = (index: number) =>
    headers[index]?.field as keyof Omit<Row, "id">

  const updateCell = useCallback(
    (rowIndex: number, field: keyof Omit<Row, "id">, value: string) =>
      onChange(
        rows.map((r, i) => (i === rowIndex ? { ...r, [field]: value } : r))
      ),
    [rows, onChange]
  )

  const getNorm = (sel: CellSelection) => ({
    startRow: Math.min(sel.startRow, sel.endRow),
    endRow: Math.max(sel.startRow, sel.endRow),
    startField: Math.min(sel.startField, sel.endField),
    endField: Math.max(sel.startField, sel.endField),
  })

  const isCellSelected = (ri: number, fi: number) => {
    if (!selection) return false
    const n = getNorm(selection)
    return (
      ri >= n.startRow &&
      ri <= n.endRow &&
      fi >= n.startField &&
      fi <= n.endField
    )
  }

  const handleCellMouseDown = (ri: number, fi: number) => {
    setIsSelecting(true)
    setSelection({ startRow: ri, startField: fi, endRow: ri, endField: fi })
    setFocused({ rowIndex: ri, field: getFieldFromIndex(fi) })
  }

  const handleCellMouseEnter = (ri: number, fi: number) => {
    if (!isSelecting) return
    setSelection((prev) =>
      prev ? { ...prev, endRow: ri, endField: fi } : null
    )
  }

  useEffect(() => {
    const up = () => setIsSelecting(false)
    document.addEventListener("mouseup", up)
    return () => document.removeEventListener("mouseup", up)
  }, [])

  useEffect(() => {
    if (!focused && !selection) return
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault()
        if (selection) {
          const n = getNorm(selection)
          const text = Array.from(
            { length: n.endRow - n.startRow + 1 },
            (_, ri) =>
              Array.from(
                { length: n.endField - n.startField + 1 },
                (_, fi) =>
                  rows[n.startRow + ri]?.[
                    getFieldFromIndex(n.startField + fi)
                  ] ?? ""
              ).join("\t")
          ).join("\n")
          navigator.clipboard?.writeText(text).catch(() => {})
          onCopy(text)
          setCopiedSelection(selection)
        } else if (focused) {
          const val = rows[focused.rowIndex]?.[focused.field] ?? ""
          navigator.clipboard?.writeText(val).catch(() => {})
          onCopy(val)
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault()
        const applyPaste = (text: string) => {
          if (selection) {
            const n = getNorm(selection)
            const newRows = rows.map((r) => ({ ...r }))
            text
              .split("\n")
              .filter((l) => l.trim())
              .forEach((line, li) => {
                const rowIdx = n.startRow + li
                if (rowIdx < newRows.length)
                  line.split("\t").forEach((cell, ci) => {
                    const fi = n.startField + ci
                    if (fi < headers.length)
                      newRows[rowIdx][getFieldFromIndex(fi)] = cell.trim()
                  })
              })
            onChange(newRows)
          } else if (focused) {
            updateCell(focused.rowIndex, focused.field, text)
          }
        }
        navigator.clipboard
          ?.readText()
          .then(applyPaste)
          .catch(() => {
            if (copiedValue) applyPaste(copiedValue)
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

  const colGroup = (
    <colgroup>
      <col style={{ width: "36px" }} />
      {headers.map(({ field }) => (
        <col key={field} style={{ width: COLUMN_WIDTHS[field] ?? undefined }} />
      ))}
    </colgroup>
  )

  return (
    /*
      h-full fills the calc() height the modal gives us.
      We use a ResizeObserver to measure available height and set the
      scroll body height explicitly — no flex magic needed.
    */
    <div
      ref={wrapperRef}
      className="flex h-full flex-col overflow-hidden rounded"
    >
      {/* Fixed header */}
      <table
        className="w-full shrink-0 border-collapse text-[13px]"
        style={{ tableLayout: "fixed" }}
      >
        {colGroup}
        <thead>
          <tr>
            <th className="px-2 py-3 text-left text-[12px] font-semibold text-[#6b7280]">
              #
            </th>
            {headers.map(({ label, field }) => (
              <th
                key={label}
                className={cn(
                  "px-3 py-3 text-[12px] font-semibold text-[#6b7280]",
                  COLUMN_WIDTHS[field] ? "text-right" : "text-left"
                )}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
      </table>

      {/*
        Scrollable body — explicit pixel height measured by ResizeObserver.
        Falls back to a sensible max-height until measurement is ready.
      */}
      <div
        className="overflow-x-auto overflow-y-auto"
        style={
          bodyHeight !== null
            ? { height: bodyHeight }
            : { flex: 1, minHeight: 0 }
        }
      >
        <table
          ref={tableRef}
          className="w-full border-collapse text-[13px]"
          style={{ tableLayout: "fixed" }}
        >
          {colGroup}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id}>
                <td className="px-2 py-1.5 text-center text-[12px] text-[#4b5563]">
                  {rowIndex + 1}
                </td>
                {headers.map(({ field, placeholder }, fieldIndex) => {
                  const isNumber = !!COLUMN_WIDTHS[field]
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
                      <Input
                        value={row[field]}
                        placeholder={placeholder}
                        inputMode={isNumber ? "decimal" : "text"}
                        onFocus={() => setFocused({ rowIndex, field })}
                        onBlur={() => setFocused(null)}
                        onChange={(e) =>
                          updateCell(rowIndex, field, e.target.value)
                        }
                        //   isNumber && "text-right tabular-nums",
                        //   isFocused
                        //     ? "border border-blue-500"
                        //     : isSelected
                        //       ? "border border-blue-400"
                        //       : "border border-[#1f2937] bg-[#0f1929] hover:border-[#2d4060]"
                        // )}
                        style={{ userSelect: "none" }}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pinned totals row */}
      {!isManagement && (
        <table
          className="w-full shrink-0 border-collapse border-t border-[#1f2937] bg-[#0d1525] text-[13px]"
          style={{ tableLayout: "fixed", height: TOTALS_HEIGHT }}
        >
          {colGroup}
          <tbody>
            <tr>
              <td
                colSpan={3}
                className="px-3 py-3 text-right text-[13px] font-medium text-[#6b7280]"
              >
                Totals:
              </td>
              <td className="px-3 py-3 text-right text-[13px] font-semibold text-[#e2e8f0] tabular-nums">
                ${totals.projectValue}
              </td>
              <td className="px-3 py-3 text-right text-[13px] font-semibold text-[#e2e8f0] tabular-nums">
                {totals.labourTarget}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  )
}
