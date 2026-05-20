"use client"

import { useState, useRef } from "react"
import { X, Plus, Save, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

// Header ~65px + footer ~57px + some breathing room = 140px
const CHROME_HEIGHT = 140

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
  const fileRef = useRef<HTMLInputElement>(null)

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split("\n").filter((l) => l.trim())
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogTitle className="sr-only">Subfolder Details</DialogTitle>

      {/*
        DialogContent from shadcn has internal styles that fight flex-based
        height containment. We cap the dialog with max-h + overflow-hidden,
        then use an explicit calc() height on the scroll area so it never
        depends on flex shrinking working correctly through the dialog wrapper.
      */}
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-[60%] max-w-none flex-col gap-0 overflow-hidden p-0"
      >
        {/* ── Fixed header ── */}
        <DialogHeader className="shrink-0 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase text-[#6b7280]">Subfolder</div>
              <div className="font-medium">
                {folderName}: {subfolder.name}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" />
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

        {/*
          ✅ Explicit calc() height: 90vh minus the fixed header+footer chrome.
             This works regardless of how DialogContent handles its own overflow,
             because the scroll container has a concrete pixel height to work with.
        */}
        <div
          className="overflow-hidden px-6 py-3"
          style={{ height: `calc(90vh - ${CHROME_HEIGHT}px)` }}
        >
          <SpreadsheetTable
            rows={rows}
            onChange={setRows}
            copiedValue={copiedValue}
            onCopy={onCopy}
          />
        </div>

        {/* ── Fixed footer ── */}
        <div className="flex shrink-0 items-center justify-between px-6 py-3">
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
          <div className="flex gap-2">
            <Button onClick={() => setRows(defaultRows())} variant="outline">
              Clear All
            </Button>
            <Button onClick={() => onSave(rows)}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
