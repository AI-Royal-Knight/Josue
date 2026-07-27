"use client"

import { useState, useRef } from "react"
import { X, Plus, Save, Upload, Download, Loader2 } from "lucide-react"
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
  isManagement?: boolean
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
  isManagement,
  onSave,
  onClose,
}: SubfolderModalProps) {
  const [rows, setRows] = useState<Row[]>(() =>
    subfolder.rows.map((r) => ({ ...r }))
  )
  const [isImporting, setIsImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      // Split by any newline character (\r\n, \n, or \r)
      const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim())
      const start = lines[0]?.toLowerCase().includes("work") ? 1 : 0
      const parsed: Row[] = lines.slice(start).map((line) => {
        // Split by comma, but ignore commas inside double quotes
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.trim().replace(/^"|"$/g, ""))
        
        // Helper to strip currency symbols and commas (e.g. " £16,522.11 " -> "16522.11")
        const cleanNumber = (val: string) => {
          if (!val) return "0.00"
          const cleaned = val.replace(/[^0-9.-]+/g, "")
          return cleaned ? cleaned : "0.00"
        }

        return {
          id: uid(),
          workSection: cols[0] ?? "",
          workArea: cols[1] ?? "",
          projectValue: cleanNumber(cols[2]),
          labourTarget: cleanNumber(cols[3]),
        }
      })
      if (parsed.length) setRows(parsed)
      setIsImporting(false)
    }
    reader.onerror = () => setIsImporting(false)
    reader.readAsText(file)
    e.target.value = ""
  }

  const handleDownloadDemo = () => {
    const csvContent = "Work Section,Work Area,Project Value,Labour Target\ne.g. Electrical Rough-in,e.g. Level 1 - Unit 101,0.00,0"
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "subfolder_demo.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
        onOpenAutoFocus={(e) => e.preventDefault()}
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
              <Button
                variant="outline"
                onClick={handleDownloadDemo}
                title="Download demo CSV format"
              >
                <Download className="h-4 w-4 mr-2" />
                Demo CSV
              </Button>
              <Button
                variant="outline"
                disabled={isImporting}
                onClick={() => fileRef.current?.click()}
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isImporting ? "Importing…" : "Import"}
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
          className="relative overflow-hidden px-6 py-3"
          style={{ height: `calc(90vh - ${CHROME_HEIGHT}px)` }}
        >
          {isImporting && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded bg-background/80 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">
                Importing CSV…
              </p>
            </div>
          )}
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
