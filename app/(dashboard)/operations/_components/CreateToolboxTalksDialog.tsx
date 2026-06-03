"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileUp, Upload } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: ToolboxTalksFormData) => void
}

export type ToolboxTalksFormData = {
  title: string
  date: string
  assignToProject: string
  attachment: File | null
}

const PROJECTS = ["Project A", "Project B", "Project C"]
const MAX_SIZE_MB = 25

export default function CreateToolboxTalksDialog({ open, onOpenChange, onSave }: Props) {
  const [form, setForm] = useState<ToolboxTalksFormData>({
    title: "",
    date: "",
    assignToProject: "",
    attachment: null,
  })
  const fileRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === "application/pdf") {
      setForm((p) => ({ ...p, attachment: file }))
    }
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave(form)
    setForm({ title: "", date: "", assignToProject: "", attachment: null })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Toolbox Talks</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="toolbox-title">Title</Label>
            <div className="relative">
              <Input
                id="toolbox-title"
                placeholder="Enter briefing subject..."
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="border-white/10 bg-white/5 pr-9"
              />
              <FileUp className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          {/* Date + Assign to Project */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="toolbox-date">Date</Label>
              <Input
                id="toolbox-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="border-white/10 bg-white/5"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Assign to Project</Label>
              <Select
                value={form.assignToProject}
                onValueChange={(v) => setForm((p) => ({ ...p, assignToProject: v }))}
              >
                <SelectTrigger className="border-white/10 bg-white/5">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECTS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-1.5">
            <Label>Attachments</Label>
            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-white/20 bg-white/[0.02] px-4 py-8 text-center transition hover:border-white/30 hover:bg-white/[0.04]"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-8 text-slate-500" />
              {form.attachment ? (
                <p className="text-sm text-slate-300">{form.attachment.name}</p>
              ) : (
                <>
                  <p className="text-sm text-slate-400">Click to upload PDF document</p>
                  <p className="text-xs text-slate-500">Max 5oz {MAX_SIZE_MB}MB</p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) =>
                  setForm((p) => ({ ...p, attachment: e.target.files?.[0] ?? null }))
                }
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.title.trim()}>
            <Upload className="mr-2 size-4" /> Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
