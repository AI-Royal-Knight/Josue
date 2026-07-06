"use client"

import { useState, useEffect } from "react"
import { Users, Plus, X, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { getCompanyUsers, type SubfolderAssignment, type ProjectUser } from "@/lib/api/project-admin"
import { uid } from "./utils"

type SubfolderAssignmentsProps = {
  assignments: SubfolderAssignment[]
  onChange: (assignments: SubfolderAssignment[]) => void
}

export function SubfolderAssignments({ assignments, onChange }: SubfolderAssignmentsProps) {
  const [users, setUsers] = useState<ProjectUser[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open && users.length === 0) {
      setLoading(true)
      getCompanyUsers()
        .then((res) => setUsers(res.users))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [open, users.length])

  const addAssignment = (userId: string) => {
    if (!userId) return
    const user = users.find(u => u.id === userId)
    if (!user) return
    
    onChange([
      ...assignments,
      {
        id: uid(),
        user,
        hide_labour_target: false,
        is_management_assignment: false,
      }
    ])
  }

  const removeAssignment = (userId: string) => {
    onChange(assignments.filter(a => a.user.id !== userId))
  }

  const updateAssignment = (userId: string, updates: Partial<SubfolderAssignment>) => {
    onChange(assignments.map(a => 
      a.user.id === userId ? { ...a, ...updates } : a
    ))
  }

  const availableUsers = users.filter(u => !assignments.some(a => a.user.id === u.id))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Assign Work
          {assignments.length > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-medium text-primary">
              {assignments.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 border-white/10 bg-slate-900 p-4 shadow-xl" align="end">
        <div className="mb-4">
          <h4 className="font-semibold text-slate-100">Work Assignments</h4>
          <p className="text-xs text-slate-400">Assign users to this subfolder and configure their permissions.</p>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-auto mb-4">
          {assignments.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-500">
              No users assigned yet.
            </div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment.id || assignment.user.id} className="rounded-md border border-white/10 bg-white/5 p-3 relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1 h-6 w-6 text-slate-500 hover:text-red-400"
                  onClick={() => removeAssignment(assignment.user.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="font-medium text-sm text-slate-200 mb-3 pr-6">
                  {assignment.user.name}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`hide-lt-${assignment.user.id}`} 
                      checked={assignment.hide_labour_target}
                      onCheckedChange={(checked) => updateAssignment(assignment.user.id, { hide_labour_target: !!checked })}
                    />
                    <Label htmlFor={`hide-lt-${assignment.user.id}`} className="text-xs text-slate-300">
                      Hide Labour Target
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`mgmt-${assignment.user.id}`} 
                      checked={assignment.is_management_assignment}
                      onCheckedChange={(checked) => updateAssignment(assignment.user.id, { is_management_assignment: !!checked })}
                    />
                    <Label htmlFor={`mgmt-${assignment.user.id}`} className="text-xs text-slate-300">
                      Management Assignment
                    </Label>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Select onValueChange={addAssignment} disabled={loading || availableUsers.length === 0}>
            <SelectTrigger className="w-full text-xs">
              <SelectValue placeholder={loading ? "Loading..." : availableUsers.length === 0 ? "No more users" : "Select user to assign..."} />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map(u => (
                <SelectItem key={u.id} value={u.id} className="text-xs">
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}
