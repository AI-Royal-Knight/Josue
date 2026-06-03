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
import { Save } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: RAMSFormData) => void
}

export type RAMSFormData = {
  title: string
  date: string
  reviewDate: string
  assignToProject: string
  attachment: File | null
}

const PROJECTS = ["Project A", "Project B", "Project C"]

export default function CreateRAMSDialog({ open, onOpenChange, onSave }: Props) {
  const [form, setForm] = useState<RAMSFormData>({
    title: "",
    date: "",
    reviewDate: "",
    assignToProject: "Project A",
    attachment: null,
  })
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave(form)
    setForm({ title: "", date: "", reviewDate: "", assignToProject: "Project A", attachment: null })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create New RAMS</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="rams-title">Title</Label>
            <Input
              id="rams-title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="border-white/10 bg-white/5"
            />
          </div>

          {/* Date + Review Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rams-date">Date</Label>
              <Input
                id="rams-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="border-white/10 bg-white/5"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rams-review">Review Date</Label>
              <Input
                id="rams-review"
                type="date"
                value={form.reviewDate}
                onChange={(e) => setForm((p) => ({ ...p, reviewDate: e.target.value }))}
                className="border-white/10 bg-white/5"
              />
            </div>
          </div>

          {/* Assign to Project */}
          <div className="space-y-1.5">
            <Label>Assign to Project</Label>
            <Select
              value={form.assignToProject}
              onValueChange={(v) => setForm((p) => ({ ...p, assignToProject: v }))}
            >
              <SelectTrigger className="border-white/10 bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECTS.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Attachment */}
          <div className="space-y-1.5">
            <Label>Attach more (PDF)</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-white/10 text-xs"
                onClick={() => fileRef.current?.click()}
              >
                Choose File
              </Button>
              <span className="text-xs text-slate-400">
                {form.attachment ? form.attachment.name : "No file chosen"}
              </span>
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
            <Save className="mr-2 size-4" /> Save RAMS
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
