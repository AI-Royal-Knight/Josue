"use client"

import { useState, useRef } from "react"
import { FolderOpen, X, FileSpreadsheet, Plus, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Row, Subfolder } from "./types"
import { defaultRows, uid } from "./utils"
import { SpreadsheetTable } from "./spreadsheet-table"

type SubfolderModalProps = {
  subfolder: Subfolder
  folderName: string
  copiedValue: string
  onCopy: (value: string) => void
  onSave: (rows: Row[]) => void
  onClose: () => void
}

type Tab = "name" | "electrical"

export function SubfolderModal({
  subfolder,
  folderName,
  copiedValue,
  onCopy,
  onSave,
  onClose,
}: SubfolderModalProps) {
  const [rows, setRows] = useState<Row[]>(() =>
    subfolder.rows.map((r) => ({ ...r }))
  )
  const [activeTab, setActiveTab] = useState<Tab>("name")
  const fileRef = useRef<HTMLInputElement>(null)

  // ── CSV import ───────────────────────────────────────────────────────────

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split("\n").filter((l) => l.trim())

      // Skip header row when the first cell looks like a column label
      const start = lines[0]?.toLowerCase().includes("work") ? 1 : 0

      const parsed: Row[] = lines.slice(start).map((line) => {
        const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
        return {
          id: uid(),
          workSection: cols[0] ?? "",
          workArea: cols[1] ?? "",
          projectValue: cols[2] ?? "0.00",
          labourTarget: cols[3] ?? "0",
        }
      })

      if (parsed.length) setRows(parsed)
    }

    reader.readAsText(file)
    e.target.value = ""
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden border-[#1f2937] bg-[#111827] p-0 text-[#e2e8f0] sm:max-w-[860px]"
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
        <DialogHeader className="border-b border-[#1f2937] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <FolderOpen className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-[#6b7280] uppercase">
                  Subfolder
                </div>
                <div className="font-medium">
                  {folderName}: {subfolder.name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Import
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCSV}
              />
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-[#1f2937] px-6 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setRows((prev) => [
                ...prev,
                {
                  id: uid(),
                  workSection: "",
                  workArea: "",
                  projectValue: "0.00",
                  labourTarget: "0",
                },
              ])
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Add Row
          </Button>

          <div className="flex items-center gap-4">
            <Button onClick={() => setRows(defaultRows())} variant="outline">
              Clear All
            </Button>
            {/* <div className="h-4 w-px bg-[#374151]" />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-[13px] text-blue-400 hover:text-blue-300"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Import Spreadsheet
            </button> */}
          </div>
        </div>

        {/* ── Spreadsheet ──────────────────────────────────────────────── */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
          <SpreadsheetTable
            rows={rows}
            onChange={setRows}
            copiedValue={copiedValue}
            onCopy={onCopy}
          />

          {/* Copy/Paste Hint */}
          {/* <div className="mt-4 rounded border border-[#1f2937] bg-[#0d1525] p-2 text-[12px] text-[#6b7280]">
            <p className="mb-1 font-semibold text-[#9ca3af]">
              💡 Copy & Paste Guide:
            </p>
            <ul className="space-y-1 text-[#9ca3af]">
              <li>
                • Single cell: Click a cell and press{" "}
                <kbd className="rounded bg-[#1f2937] px-1.5 py-0.5 text-[11px]">
                  Cmd/Ctrl + C
                </kbd>{" "}
                to copy
              </li>
              <li>
                • Multiple cells: Click and drag to select cells, then{" "}
                <kbd className="rounded bg-[#1f2937] px-1.5 py-0.5 text-[11px]">
                  Cmd/Ctrl + C
                </kbd>{" "}
                to copy
              </li>
              <li>
                • Paste: Click a cell and press{" "}
                <kbd className="rounded bg-[#1f2937] px-1.5 py-0.5 text-[11px]">
                  Cmd/Ctrl + V
                </kbd>{" "}
                to paste
              </li>
              <li>• Works with Excel/Sheets data - just copy and paste!</li>
            </ul>
          </div> */}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-[#1f2937] px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(rows)}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
