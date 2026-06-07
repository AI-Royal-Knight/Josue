"use client"

import { useRef, useState } from "react"
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
import { Save, Upload, User } from "lucide-react"
import FileUpload from "@/components/ui/file-uploader"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: ToDoFormData) => void
}

export type ToDoFormData = {
  title: string
  date: string
  completionDate: string
  project: string
  assignUser: string
}

const PROJECTS = ["Project A", "Project B", "Project C"]

export default function CreateToDoDialog({
  open,
  onOpenChange,
  onSave,
}: Props) {
  const [form, setForm] = useState<ToDoFormData>({
    title: "",
    date: "",
    completionDate: "",
    project: "",
    assignUser: "",
  })

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave(form)
    setForm({
      title: "",
      date: "",
      completionDate: "",
      project: "",
      assignUser: "",
    })
    onOpenChange(false)
  }

    const fileRef = useRef<HTMLInputElement>(null)

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file && file.type === "application/pdf") {
        setForm((p) => ({ ...p, attachment: file }))
      }
    }

   //  const handleSave = () => {
   //    if (!form.title.trim()) return
   //    onSave(form)
   //    setForm({ title: "", date: "", assignToProject: "", attachment: null })
   //    onOpenChange(false)
   //  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create To Do List</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="todo-title">Title</Label>
            <Input
              id="todo-title"
              placeholder="e.g. Corridor Maintenance"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              className="border-white/10 bg-white/5"
            />
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
                  <p className="text-xs text-slate-500">Max 5oz {25}MB</p>
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

          {/* Date + Completion Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="todo-date">Date</Label>
              <Input
                id="todo-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="border-white/10 bg-white/5"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="todo-completion">Completion Date</Label>
              <Input
                id="todo-completion"
                type="date"
                value={form.completionDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, completionDate: e.target.value }))
                }
                className="border-white/10 bg-white/5"
              />
            </div>
          </div>

          {/* Project */}
          <div className="space-y-1.5">
            <Label>Project</Label>
            <Select
              value={form.project}
              onValueChange={(v) => setForm((p) => ({ ...p, project: v }))}
            >
              <SelectTrigger className="border-white/10 bg-white/5">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {PROJECTS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assign User */}
          <div className="space-y-1.5">
            <Label htmlFor="todo-user">Assign User</Label>
            <div className="relative">
              <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="todo-user"
                placeholder="Enter username or email"
                value={form.assignUser}
                onChange={(e) =>
                  setForm((p) => ({ ...p, assignUser: e.target.value }))
                }
                className="border-white/10 bg-white/5 pl-9"
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
            <Save className="mr-2 size-4" /> Save Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
