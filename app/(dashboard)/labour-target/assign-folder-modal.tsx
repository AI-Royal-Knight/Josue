"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Check, Eye, EyeOff, Settings2, UserCheck, UserX } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { getProjectRoles, getCompanyUsers, type ProjectUser, type SubfolderAssignment } from "@/lib/api/project-admin"
import { ApiError } from "@/lib/api/client"

type AssignFolderModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  targetName: string // Folder or subfolder name for display
  assignments: SubfolderAssignment[]
  onAssign: (assignments: SubfolderAssignment[]) => void
}

type LocalEmployee = ProjectUser & {
  checked: boolean
  hide_labour_target: boolean
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
  const [localUsers, setLocalUsers] = useState<LocalEmployee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Secondary visibility selection window state (Requirement 5)
  const [visibilityTargetUser, setVisibilityTargetUser] = useState<LocalEmployee | null>(null)
  const [tempHideTarget, setTempHideTarget] = useState<boolean>(false)

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        setLoading(true)
        setError(null)
        try {
          // Strictly fetch employees (app users) only — management roles are strictly excluded (Requirements 2 & 3)
          let allEmployees: ProjectUser[] = []
          try {
            const companyRes = await getCompanyUsers("employee")
            if (companyRes.users && companyRes.users.length > 0) {
              allEmployees = companyRes.users
            }
          } catch {
            // fallback
          }

          if (allEmployees.length === 0 && projectId) {
            try {
              const roles = await getProjectRoles(projectId)
              const employeeRole = roles.find((r) => r.role_key === "employee")
              allEmployees = employeeRole?.users ?? []
            } catch {
              // fallback
            }
          }

          // Pre-check employees who are already assigned
          const mapped = allEmployees.map((u) => {
            const assignment = assignments.find((a) => a.user?.id === u.id)
            return {
              ...u,
              checked: !!assignment,
              hide_labour_target: assignment ? Boolean(assignment.hide_labour_target) : false,
            }
          })
          setLocalUsers(mapped)
        } catch (err) {
          setError(err instanceof ApiError ? err.message : "Failed to load employees.")
        } finally {
          setLoading(false)
        }
      }
      fetchUsers()
    } else {
      setSearchTerm("")
      setVisibilityTargetUser(null)
    }
  }, [open, projectId, assignments])

  const filteredUsers = localUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Opens visibility configuration window when clicking a user (Requirement 5)
  const handleOpenVisibilityWindow = (user: LocalEmployee) => {
    setVisibilityTargetUser(user)
    setTempHideTarget(user.hide_labour_target)
  }

  // Confirm visibility in the secondary window
  const handleConfirmVisibility = () => {
    if (!visibilityTargetUser) return
    setLocalUsers((prev) =>
      prev.map((user) =>
        user.id === visibilityTargetUser.id
          ? { ...user, checked: true, hide_labour_target: tempHideTarget }
          : user
      )
    )
    setVisibilityTargetUser(null)
  }

  // Unassign user
  const handleUnassignUser = (userId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setLocalUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, checked: false } : user
      )
    )
  }

  const handleAssign = () => {
    const newAssignments: SubfolderAssignment[] = localUsers
      .filter((u) => u.checked)
      .map((u) => {
        const existing = assignments.find((a) => a.user?.id === u.id)
        return {
          user: u,
          hide_labour_target: u.hide_labour_target,
          is_management_assignment: existing ? existing.is_management_assignment : false,
        }
      })

    onAssign(newAssignments)
    onOpenChange(false)
  }

  const checkedCount = localUsers.filter((u) => u.checked).length

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px] bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              Assign App Users
            </DialogTitle>
            <p className="text-sm text-slate-400 mt-1">
              Target: <span className="text-amber-400 font-medium">{targetName}</span>
            </p>
            <p className="text-xs text-slate-500">
              Only mobile app users (operatives) can be assigned. Management users are assigned via Assign Management.
            </p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute top-2.5 left-3 size-4 text-slate-400" />
              <Input
                placeholder="Search app users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-white/10 pl-10 bg-slate-800/60 text-white text-sm"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}

            {!error && !loading && localUsers.length === 0 && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
                No app users assigned to this project yet. Please assign employees to this project on the Assign Management page first.
              </div>
            )}

            <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-sm text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading app users...
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleOpenVisibilityWindow(user)}
                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all border ${
                      user.checked
                        ? "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15"
                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                          user.checked
                            ? "bg-emerald-600 border-emerald-500 text-white"
                            : "border-slate-600 bg-transparent text-transparent"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-100 truncate">
                          {user.name || "Unknown Operative"}
                        </div>
                        {user.email && (
                          <div className="text-xs text-slate-400 truncate">{user.email}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {user.checked ? (
                        <>
                          {user.hide_labour_target ? (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-300 border border-amber-500/30">
                              <EyeOff className="h-3 w-3" /> Target Hidden
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-300 border border-emerald-500/30">
                              <Eye className="h-3 w-3" /> Target Visible
                            </span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-slate-400 hover:text-white hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenVisibilityWindow(user)
                            }}
                            title="Configure Labour Target Visibility"
                          >
                            <Settings2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={(e) => handleUnassignUser(user.id, e)}
                            title="Unassign user"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 hover:text-amber-400 font-medium">
                          Click to Assign
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                !loading && localUsers.length > 0 && (
                  <div className="text-center text-sm text-slate-500 py-6">No matching app users found.</div>
                )
              )}
            </div>
          </div>

          <div className="flex gap-3 border-t border-white/10 pt-4 justify-between items-center">
            <span className="text-xs text-slate-400">
              {checkedCount > 0
                ? `${checkedCount} app user${checkedCount > 1 ? "s" : ""} selected`
                : "No app users selected"}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-white/10 text-slate-300 hover:bg-white/5"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4"
                onClick={handleAssign}
                disabled={loading}
              >
                Save Assignments
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Secondary Window: Labour Target Visibility for App User (Requirement 5) ── */}
      <Dialog
        open={!!visibilityTargetUser}
        onOpenChange={(open) => !open && setVisibilityTargetUser(null)}
      >
        <DialogContent className="sm:max-w-[440px] bg-slate-900 border-white/10 text-white z-50">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              Labour Target Visibility
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Configure whether <span className="text-amber-400 font-medium">{visibilityTargetUser?.name}</span> can see the labour target value on the mobile app:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            {/* Option 1: Show Labour Target Value */}
            <div
              onClick={() => setTempHideTarget(false)}
              className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                !tempHideTarget
                  ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/40"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="visibilityOption"
                  checked={!tempHideTarget}
                  onChange={() => setTempHideTarget(false)}
                  className="mt-1 h-4 w-4 text-emerald-500 accent-emerald-500 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <Eye className="h-4 w-4 text-emerald-400" />
                    Show Labour Target Value
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    The app user can see the set labour target value for this folder/subfolder on their mobile app.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Hide Labour Target Value */}
            <div
              onClick={() => setTempHideTarget(true)}
              className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                tempHideTarget
                  ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="visibilityOption"
                  checked={tempHideTarget}
                  onChange={() => setTempHideTarget(true)}
                  className="mt-1 h-4 w-4 text-amber-500 accent-amber-500 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <EyeOff className="h-4 w-4 text-amber-400" />
                    Hide Labour Target Value
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    The app user can see the description only, and will manually enter their own values when submitting timesheets/invoices. Discrepancies are tracked in Project Overview (e.g. Overspend / Unclaimed).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
            <Button
              variant="outline"
              className="border-white/10 text-slate-300 hover:bg-white/5"
              onClick={() => setVisibilityTargetUser(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              onClick={handleConfirmVisibility}
            >
              Confirm Selection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
