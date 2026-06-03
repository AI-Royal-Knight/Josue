"use client"

import { useState } from "react"
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
import { Save, User } from "lucide-react"

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

export default function CreateToDoDialog({ open, onOpenChange, onSave }: Props) {
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
    setForm({ title: "", date: "", completionDate: "", project: "", assignUser: "" })
    onOpenChange(false)
  }

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
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="border-white/10 bg-white/5"
            />
          </div>

          {/* Date + Completion Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="todo-date">Date</Label>
              <Input
                id="todo-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="border-white/10 bg-white/5"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="todo-completion">Completion Date</Label>
              <Input
                id="todo-completion"
                type="date"
                value={form.completionDate}
                onChange={(e) => setForm((p) => ({ ...p, completionDate: e.target.value }))}
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
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assign User */}
          <div className="space-y-1.5">
            <Label htmlFor="todo-user">Assign User</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="todo-user"
                placeholder="Enter username or email"
                value={form.assignUser}
                onChange={(e) => setForm((p) => ({ ...p, assignUser: e.target.value }))}
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
