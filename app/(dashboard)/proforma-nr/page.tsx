"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Trash2, UserPlus, Search, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import type { ColDef } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import SelectProject from "@/components/shared/select-project"
import TableStat from "@/components/common/table-stat"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import {
  getProformaAccess,
  assignProformaAccess,
  updateProformaAccess,
  deleteProformaAccess,
  ProformaAccessData,
  getProjectRoles,
  getCompanyUsers,
  ProjectUser,
} from "@/lib/api/project-admin"
import { apiRequest } from "@/lib/api/client"
import { toast } from "sonner"

export default function ProformaAccessPage() {
  const [projectId, setProjectId] = useState<string>("")
  const [accessList, setAccessList] = useState<ProformaAccessData[]>([])
  const [loading, setLoading] = useState(false)

  // Bug 1 & 2: Remove mock invoices (values & QTYs).
  // Strictly display the 3 user metrics: Active users, Paused users, Total users.
  const summaryRows = useMemo(() => {
    const totalActive = accessList.filter((a) => a.is_active).length
    const totalPaused = accessList.filter((a) => !a.is_active).length
    const totalUsers = accessList.length

    return [
      { label: "Active users", value: totalActive.toString(), valueColor: "green" as const, alert: false },
      { label: "Paused users", value: totalPaused.toString(), valueColor: "yellow" as const, alert: false },
      { label: "Total users", value: totalUsers.toString(), alert: false },
    ]
  }, [accessList])

  // Dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      loadAccessList(projectId)
    } else {
      setAccessList([])
    }
  }, [projectId])

  async function loadAccessList(pid: string) {
    setLoading(true)
    try {
      const data = await getProformaAccess(pid)
      setAccessList(data)
    } catch (error) {
      console.error("Failed to load access list", error)
      toast.error("Failed to load access list")
    } finally {
      setLoading(false)
    }
  }

  // Bug 3: Only app users who are already registered in the system can be assigned
  const handleOpenAssignModal = async () => {
    if (!projectId) {
      toast.error("Please select a project first")
      return
    }

    setAssignDialogOpen(true)
    setUsersLoading(true)
    setUserSearch("")
    // Pre-select users already assigned
    setSelectedUserIds(accessList.map((a) => a.user.id))

    try {
      const userMap = new Map<string, ProjectUser>()

      // 1. Fetch registered mobile app users from company users endpoint
      try {
        const companyUsers = await apiRequest<any[]>("/account/users/?role=employee")
        if (Array.isArray(companyUsers)) {
          companyUsers
            .filter((u) => u.role === "employee")
            .forEach((u) => {
              const fullName = `${u.name || ""} ${u.surname || ""}`.trim()
              userMap.set(u.id, {
                id: u.id,
                name: fullName || u.email?.split("@")[0] || "App User",
                email: u.email,
                role: u.role,
                checked: false,
              })
            })
        }
      } catch (err) {
        console.warn("Could not fetch company employee users:", err)
      }

      // 2. Also check project-admin users endpoint
      try {
        const adminUsersRes = await getCompanyUsers("employee")
        if (adminUsersRes && Array.isArray(adminUsersRes.users)) {
          adminUsersRes.users
            .filter((u) => u.role === "employee")
            .forEach((u) => {
              if (!userMap.has(u.id)) {
                userMap.set(u.id, u)
              }
            })
        }
      } catch (err) {
        console.warn("Could not fetch project-admin employee users:", err)
      }

      // 3. Also check project roles to ensure any project-assigned app users are included
      try {
        const rolesData = await getProjectRoles(projectId)
        rolesData.forEach((role) => {
          if (role.role_key === "employee") {
            role.users.forEach((u) => {
              if (!userMap.has(u.id)) {
                userMap.set(u.id, u)
              }
            })
          }
        })
      } catch (err) {
        console.warn("Could not fetch project roles:", err)
      }

      setProjectUsers(Array.from(userMap.values()))
    } catch {
      toast.error("Failed to load registered app users")
    } finally {
      setUsersLoading(false)
    }
  }

  const handleAssignSubmit = async () => {
    if (!projectId) return
    try {
      // Find which users are newly selected (not currently in accessList)
      const newIds = selectedUserIds.filter((id) => !accessList.some((a) => a.user.id === id))
      if (newIds.length > 0) {
        await assignProformaAccess(projectId, newIds)
        await loadAccessList(projectId)
        toast.success(`Assigned ${newIds.length} app user(s) to Proforma NR`)
      }
      setAssignDialogOpen(false)
    } catch {
      toast.error("Failed to assign users")
    }
  }

  const toggleActive = useCallback(
    async (accessId: string, isActive: boolean) => {
      if (!projectId) return
      try {
        // Optimistic update
        setAccessList((prev) =>
          prev.map((a) => (a.id === accessId ? { ...a, is_active: isActive } : a))
        )
        await updateProformaAccess(projectId, accessId, isActive)
        toast.success(`User set to ${isActive ? "Active" : "Paused"}`)
      } catch {
        toast.error("Failed to update status")
        await loadAccessList(projectId)
      }
    },
    [projectId]
  )

  const openDeleteDialog = useCallback((accessId: string) => {
    setUserToDelete(accessId)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = async () => {
    if (!projectId || !userToDelete) return
    try {
      setAccessList((prev) => prev.filter((a) => a.id !== userToDelete))
      await deleteProformaAccess(projectId, userToDelete)
      toast.success("User access removed")
    } catch {
      toast.error("Failed to remove access")
      await loadAccessList(projectId)
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const filteredModalUsers = useMemo(() => {
    return projectUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
    )
  }, [projectUsers, userSearch])

  // Columns for the assigned app users table
  const columns: ColDef<ProformaAccessData>[] = useMemo(
    () => [
      {
        headerName: "No.",
        valueGetter: "node.rowIndex + 1",
        width: 70,
        maxWidth: 80,
        filter: false,
        sortable: false,
      },
      {
        headerName: "Name",
        valueGetter: (params) => {
          const u = params.data?.user
          if (!u) return "-"
          return u.first_name || u.email?.split("@")[0] || "-"
        },
        flex: 1,
        minWidth: 150,
      },
      {
        headerName: "Surname",
        valueGetter: (params) => params.data?.user?.last_name || "-",
        flex: 1,
        minWidth: 150,
      },
      {
        headerName: "Email",
        valueGetter: (params) => params.data?.user?.email || "-",
        flex: 1.5,
        minWidth: 220,
      },
      {
        headerName: "Status",
        field: "is_active",
        width: 170,
        cellRenderer: (params: { data?: ProformaAccessData }) => {
          if (!params.data) return null
          const rowData = params.data
          return (
            <div className="flex h-full items-center gap-2.5">
              <Switch
                checked={rowData.is_active}
                onCheckedChange={(checked) => toggleActive(rowData.id, checked)}
              />
              {rowData.is_active ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Paused
                </span>
              )}
            </div>
          )
        },
      },
      {
        headerName: "Actions",
        width: 100,
        sortable: false,
        cellRenderer: (params: { data?: ProformaAccessData }) => {
          if (!params.data) return null
          const rowData = params.data
          return (
            <div className="flex h-full items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                onClick={() => openDeleteDialog(rowData.id)}
                title="Remove user access"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          )
        },
      },
    ],
    [toggleActive, openDeleteDialog]
  )

  return (
    <div className="w-full min-w-0 space-y-6 p-6 flex flex-col h-[calc(100vh-64px)]">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Proforma NR List</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage mobile app users assigned to create and submit Proforma NR invoices on the mobile app.
        </p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <SelectProject value={projectId} onChange={setProjectId} />
      </div>

      {/* Bug 1 & 2: Summary Stats displaying strictly Active, Paused, and Total users */}
      <TableStat summaryRows={summaryRows} hideHeaderRow={true} />

      <div className="flex items-center justify-between shrink-0">
        <Button
          onClick={handleOpenAssignModal}
          disabled={!projectId}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
        >
          <UserPlus className="mr-2" size={16} />
          Assign User
        </Button>

        <span className="text-xs text-slate-400">
          {accessList.length} user{accessList.length === 1 ? "" : "s"} assigned
        </span>
      </div>

      {/* Main Table: Users assigned to use the Proforma NR section on the mobile app */}
      <div className="flex-1 min-h-0 bg-slate-900 border border-white/10 rounded-md overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin text-slate-400 mr-2" size={24} />
            <span className="text-sm text-slate-400">Loading assigned users...</span>
          </div>
        ) : (
          <AgTable
            rowData={accessList}
            columnDefs={columns}
            height="100%"
            noRowsText="No mobile app users assigned to Proforma NR for this project yet. Click 'Assign User' to assign registered app users."
          />
        )}
      </div>

      {/* ── Assign Registered App Users Dialog (Bug 3) ── */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md border-white/10 bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-100">
              Assign Registered App Users
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              Select registered mobile app operatives to grant access to the Proforma NR feature on their mobile app:
            </DialogDescription>
          </DialogHeader>

          <div className="relative my-2">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              placeholder="Search registered app users by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="border-white/10 bg-slate-900 pl-9 text-slate-100 placeholder:text-slate-500 text-sm"
            />
          </div>

          {usersLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400 mr-2" />
              <span className="text-sm text-slate-400">Loading registered app users...</span>
            </div>
          ) : filteredModalUsers.length === 0 ? (
            <div className="flex flex-col h-40 items-center justify-center text-center p-4 text-sm text-slate-400">
              <AlertCircle className="h-8 w-8 text-amber-400 mb-2" />
              <span>No registered mobile app users found.</span>
              <span className="text-xs text-slate-500 mt-1">
                Only users registered as mobile operatives (app users) can be assigned to Proforma NR.
              </span>
            </div>
          ) : (
            <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
              {filteredModalUsers.map((u) => {
                const isSelected = selectedUserIds.includes(u.id)
                const isExisting = accessList.some((a) => a.user.id === u.id)

                return (
                  <label
                    key={u.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                      isExisting
                        ? "border-emerald-500/30 bg-emerald-500/10 opacity-80 cursor-default"
                        : isSelected
                        ? "border-emerald-500/50 bg-emerald-500/15"
                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={isSelected}
                        disabled={isExisting}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUserIds([...selectedUserIds, u.id])
                          } else {
                            setSelectedUserIds(selectedUserIds.filter((id) => id !== u.id))
                          }
                        }}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-slate-100 truncate">
                          {u.name}
                        </span>
                        {u.email && (
                          <span className="text-xs text-slate-400 truncate">{u.email}</span>
                        )}
                      </div>
                    </div>
                    {isExisting ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Already assigned
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 shrink-0">
                        {isSelected ? "Selected" : "Click to select"}
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          )}

          <DialogFooter className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center sm:justify-between">
            <span className="text-xs text-slate-400">
              {selectedUserIds.filter((id) => !accessList.some((a) => a.user.id === id)).length} new user(s) selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-white/10 text-slate-300 hover:bg-white/5"
                onClick={() => setAssignDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignSubmit}
                disabled={usersLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                Confirm Assignment
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Remove Access Confirmation Dialog ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm border-white/10 bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Remove Proforma NR Access</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-300">
            Are you sure you want to remove this mobile app user's access to the Proforma NR section?
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/10 text-slate-300 hover:bg-white/5"
              onClick={() => {
                setDeleteDialogOpen(false)
                setUserToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
