"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export type DetailField = {
  label: string
  value: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fields: DetailField[]
  /** filename without extension */
  downloadFilename: string
}

function downloadCSV(filename: string, fields: DetailField[]) {
  const header = fields.map((f) => `"${f.label}"`).join(",")
  const row = fields.map((f) => `"${f.value.replace(/"/g, '""')}"`).join(",")
  const csv = [header, row].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function RowDetailDialog({
  open,
  onOpenChange,
  title,
  fields,
  downloadFilename,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <dl className="mt-1 divide-y divide-white/10">
          {fields.map((f) => (
            <div key={f.label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="min-w-[120px] text-xs font-semibold uppercase tracking-wider text-slate-400">
                {f.label}
              </dt>
              <dd className="text-right text-sm text-slate-100">{f.value || "–"}</dd>
            </div>
          ))}
        </dl>

        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => downloadCSV(downloadFilename, fields)}>
            <Download className="mr-2 size-4" /> Download CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
