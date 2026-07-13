"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { getProjectRoles, type ProjectUser, type SubfolderAssignment } from "@/lib/api/project-admin"
import { ApiError } from "@/lib/api/client"

type AssignFolderModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  targetName: string // Folder or subfolder name for display
  assignments: SubfolderAssignment[]
  onAssign: (assignments: SubfolderAssignment[]) => void
}

export function AssignFolderModal({
  open,
  onOpenChange,
  projectId,
  targetName,
  assignments,
  onAssign,
}: AssignFolderModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [localUsers, setLocalUsers] = useState<(ProjectUser & { checked: boolean, hide_labour_target: boolean })[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        setLoading(true)
        setError(null)
        try {
          // Fetch employees from the project's role assignments (Assign Management page)
          const roles = await getProjectRoles(projectId)
          // Find the "employee" role users
          const employeeRole = roles.find(r => r.role_key === 'employee')
          const allEmployees: ProjectUser[] = employeeRole?.users ?? []
          
          // Pre-check employees who are already assigned
          const mapped = allEmployees.map(u => {
            const assignment = assignments.find(a => a.user.id === u.id)
            return {
              ...u,
              checked: !!assignment,
              hide_labour_target: assignment ? Boolean(assignment.hide_labour_target) : false
            }
          })
          setLocalUsers(mapped)
        } catch (err) {
          setError(err instanceof ApiError ? err.message : "Failed to load users.")
        } finally {
          setLoading(false)
        }
      }
      fetchUsers()
    } else {
      setSearchTerm("")
    }
  }, [open, projectId, assignments])

  const filteredUsers = localUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleToggleUser = (userId: string) => {
    setLocalUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, checked: !user.checked } : user
      )
    )
  }

  const handleToggleHideLabour = (userId: string, hide: boolean) => {
    setLocalUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, hide_labour_target: hide } : user
      )
    )
  }

  const handleAssign = () => {
    const newAssignments: SubfolderAssignment[] = localUsers
      .filter(u => u.checked)
      .map(u => {
        const existing = assignments.find(a => a.user.id === u.id)
        return {
          user: u,
          hide_labour_target: u.hide_labour_target,
          is_management_assignment: existing ? existing.is_management_assignment : false
        }
      })
    
    onAssign(newAssignments)
    onOpenChange(false)
  }

  const checkedCount = localUsers.filter(u => u.checked).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">
            Assign Employees
          </DialogTitle>
          <p className="text-[15px] text-slate-400 mt-1">
            Folder: <span className="text-amber-400 font-medium">{targetName}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute top-2 left-3 size-4 text-slate-400" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-white/10 pl-10"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          {!error && !loading && localUsers.length === 0 && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
              No employees assigned to this project yet. Add employees via the Assign Management page first.
            </div>
          )}

          <div className="max-h-60 space-y-1 overflow-y-auto">
            {loading ? (
               <div className="flex items-center justify-center py-6 text-sm text-slate-400">
                 <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
               </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-1 rounded-md px-3 py-2.5 hover:bg-white/5 transition-colors border border-transparent"
                >
                  <div
                    className="flex cursor-pointer items-center gap-3"
                    onClick={() => handleToggleUser(user.id)}
                  >
                    <Checkbox
                      checked={user.checked}
                      onCheckedChange={() => handleToggleUser(user.id)}
                      className="h-4 w-4 rounded-[2px] border-slate-600 data-[state=checked]:bg-transparent data-[state=checked]:text-white"
                    />
                    <span className="text-[15px] text-slate-100">{user.name || "Unknown Name"}</span>
                  </div>
                  
                  {user.checked && (
                    <label className="flex cursor-pointer items-center gap-3 pl-8 mt-2">
                      <Checkbox
                        checked={user.hide_labour_target}
                        onCheckedChange={(checked) => handleToggleHideLabour(user.id, checked === true)}
                        className="h-4 w-4 rounded-[2px] border-slate-600 data-[state=checked]:bg-transparent data-[state=checked]:text-white"
                      />
                      <span className="text-[14px] text-slate-400">Hide Labour Value</span>
                    </label>
                  )}
                </div>
              ))
            ) : (
              !loading && localUsers.length > 0 && (
                <div className="text-center text-sm text-slate-500 py-4">No results found.</div>
              )
            )}
          </div>
        </div>

        <div className="flex gap-3 border-t border-white/10 pt-4 justify-between items-center">
          <span className="text-xs text-slate-500">
            {checkedCount > 0 ? `${checkedCount} employee${checkedCount > 1 ? 's' : ''} selected` : 'No employees selected'}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={loading}>
              Assign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
