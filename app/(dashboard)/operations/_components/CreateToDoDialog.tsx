"use client"

import React, { useState, useEffect } from "react"
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
import { Save, User, Loader2 } from "lucide-react"
import { getCompanyEmployees, type EmployeeOption } from "@/lib/api/operations"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: ToDoFormData) => Promise<boolean> | boolean
  projects: { id: string; name: string }[]
  defaultProjectId: string
}

export type ToDoFormData = {
  title: string
  date: string
  completionDate: string
  project: string
  assignUser: string
}

export default function CreateToDoDialog({ open, onOpenChange, onSave, projects, defaultProjectId }: Props) {
  const [form, setForm] = useState<ToDoFormData>({
    title: "",
    date: "",
    completionDate: "",
    project: defaultProjectId || "",
    assignUser: "",
  })

  useEffect(() => {
    if (open) {
      setForm((p) => ({ ...p, project: defaultProjectId || "" }))
    }
  }, [open, defaultProjectId])

  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  useEffect(() => {
    if (open) {
      getCompanyEmployees().then((res) => {
        setEmployees(res.users || [])
      }).catch(err => console.error(err))
    }
  }, [open])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSave = async () => {
    setIsSubmitting(true)
    const success = await onSave(form)
    setIsSubmitting(false)
    if (success) {
      setForm({ title: "", date: "", completionDate: "", project: defaultProjectId || "", assignUser: "" })
      onOpenChange(false)
    }
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
              <SelectContent className="border-white/10 bg-slate-900">
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
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
                autoComplete="off"
                placeholder="Enter username or email"
                value={form.assignUser}
                onChange={(e) => {
                  setForm((p) => ({ ...p, assignUser: e.target.value }))
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                className="border-white/10 bg-white/5 pl-9"
              />
              {showDropdown && employees.filter(e => e.name.toLowerCase().includes(form.assignUser.toLowerCase())).length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-white/10 bg-slate-900 shadow-md">
                  {employees
                    .filter(e => e.name.toLowerCase().includes(form.assignUser.toLowerCase()))
                    .map(emp => (
                      <li
                        key={emp.id}
                        className="cursor-pointer px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
                        onMouseDown={(e) => {
                          e.preventDefault() // prevent onBlur
                          setForm(p => ({ ...p, assignUser: emp.name }))
                          setShowDropdown(false)
                        }}
                      >
                        {emp.name}
                      </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.title.trim() || isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            {isSubmitting ? "Saving..." : "Save To Do"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
