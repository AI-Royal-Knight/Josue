"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Trash2, UserPlus, Search, Loader2 } from "lucide-react"
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
  DialogFooter,
} from "@/components/ui/dialog"

import {
  getProformaAccess,
  assignProformaAccess,
  updateProformaAccess,
  deleteProformaAccess,
  ProformaAccessData,
  getProjectRoles,
  ProjectUser
} from "@/lib/api/project-admin"
import { toast } from "sonner"

export default function ProformaAccessPage() {
  const [projectId, setProjectId] = useState<string>("")

  const [accessList, setAccessList] = useState<ProformaAccessData[]>([])

  const summaryRows = useMemo(() => {
    const totalActive = accessList.filter(a => a.is_active).length;
    const totalPaused = accessList.filter(a => !a.is_active).length;
    const totalUsers = accessList.length;
    
    return [
      { label: "Proforma NR Invoice", qty: 50, value: "1000", alert: false },
      { label: "Proforma NR Invoice Awaiting approved", qty: 200, value: "200", alert: true },
      { label: "Proforma NR invoices paid", qty: 200, value: "200", alert: false },
      { label: "Total active users", qty: "", value: totalActive.toString(), alert: false },
      { label: "Total paused users count", qty: "", value: totalPaused.toString(), alert: false },
      { label: "Total users count", qty: "", value: totalUsers.toString(), alert: false },
    ]
  }, [accessList])
  const [loading, setLoading] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  
  // Dialog state
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleOpenAssignModal = async () => {
    if (!projectId) {
      toast.error("Please select a project first")
      return
    }
    
    setAssignDialogOpen(true)
    setUsersLoading(true)
    setUserSearch("")
    // Pre-select users already in the list
    setSelectedUserIds(accessList.map(a => a.user.id))

    try {
      const rolesData = await getProjectRoles(projectId)
      // Only get users who have the employee role
      const allUsersMap = new Map<string, ProjectUser>()
      rolesData.forEach(role => {
        if (role.role_key === "employee") {
          role.users.forEach(u => {
            if (!allUsersMap.has(u.id)) {
              allUsersMap.set(u.id, u)
            }
          })
        }
      })
      setProjectUsers(Array.from(allUsersMap.values()))
    } catch {
      toast.error("Failed to load project users")
    } finally {
      setUsersLoading(false)
    }
  }

  const handleAssignSubmit = async () => {
    if (!projectId) return
    try {
      // Find which users are newly added (not in current accessList)
      const newIds = selectedUserIds.filter(id => !accessList.find(a => a.user.id === id))
      if (newIds.length > 0) {
        await assignProformaAccess(projectId, newIds)
        await loadAccessList(projectId)
        toast.success("Users assigned successfully")
      }
      setAssignDialogOpen(false)
    } catch {
      toast.error("Failed to assign users")
    }
  }

  const toggleActive = useCallback(async (accessId: string, isActive: boolean) => {
    if (!projectId) return
    try {
      // Optimistic update
      setAccessList(prev => prev.map(a => a.id === accessId ? { ...a, is_active: isActive } : a))
      await updateProformaAccess(projectId, accessId, isActive)
    } catch {
      toast.error("Failed to update status")
      await loadAccessList(projectId)
    }
  }, [projectId])

  const openDeleteDialog = useCallback((accessId: string) => {
    setUserToDelete(accessId)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = async () => {
    if (!projectId || !userToDelete) return
    try {
      setAccessList(prev => prev.filter(a => a.id !== userToDelete))
      await deleteProformaAccess(projectId, userToDelete)
      toast.success("Access removed")
    } catch {
      toast.error("Failed to remove access")
      await loadAccessList(projectId)
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const filteredModalUsers = useMemo(() => {
    return projectUsers.filter(u => 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
    )
  }, [projectUsers, userSearch])

  const columns: ColDef<ProformaAccessData>[] = useMemo(() => [
    {
      headerName: "Name",
      valueGetter: (params) => params.data?.user?.first_name || "-",
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
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: "Status (Active)",
      field: "is_active",
      width: 150,
      cellRenderer: (params: { data?: ProformaAccessData }) => {
        if (!params.data) return null
        const rowData = params.data
        return (
          <div className="flex h-full items-center">
            <Switch
              checked={rowData.is_active}
              onCheckedChange={(checked) => toggleActive(rowData.id, checked)}
            />
          </div>
        )
      }
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
              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              onClick={() => openDeleteDialog(rowData.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )
      }
    }
  ], [toggleActive, openDeleteDialog])

  return (
    <div className="w-full min-w-0 space-y-6 p-6 flex flex-col h-[calc(100vh-64px)]">
      <h1 className="text-2xl font-semibold shrink-0">Proforma NR List</h1>

      <div className="flex items-center gap-4 shrink-0">
        <div className="w-[300px]">
          <SelectProject value={projectId} onChange={setProjectId} />
        </div>
      </div>

      <TableStat summaryRows={summaryRows} />

      <div className="shrink-0">
        <Button 
          onClick={handleOpenAssignModal}
          disabled={!projectId}
        >
          <UserPlus className="mr-2" size={16} />
          Assign User
        </Button>
      </div>

      <div className="flex-1 min-h-0 bg-slate-900 border border-white/10 rounded-md overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin text-slate-400" size={24} />
          </div>
        ) : (
          <AgTable 
            rowData={accessList} 
            columnDefs={columns} 
            height="100%" 
          />
        )}
      </div>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md border-white/10 bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Assign Users to Proforma</DialogTitle>
          </DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              placeholder="Search project users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="border-white/10 bg-slate-900 pl-9 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {usersLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : filteredModalUsers.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-slate-500">
              No users found assigned to this project.
            </div>
          ) : (
            <div className="max-h-[300px] space-y-2 overflow-y-auto pr-2">
              {filteredModalUsers.map((u) => {
                const isSelected = selectedUserIds.includes(u.id)
                // If they are already in the list (before this modal opened), we disable unchecking them here. 
                // They must use the trash icon to delete.
                const isExisting = accessList.some(a => a.user.id === u.id)
                
                return (
                  <label
                    key={u.id}
                    className="flex cursor-pointer items-center justify-between rounded border border-white/5 bg-white/5 p-3 hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        disabled={isExisting}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUserIds([...selectedUserIds, u.id])
                          } else {
                            setSelectedUserIds(selectedUserIds.filter(id => id !== u.id))
                          }
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-200">
                          {u.name}
                        </span>
                        {u.email && (
                          <span className="text-xs text-slate-400">
                            {u.email}
                          </span>
                        )}
                      </div>
                    </div>
                    {isExisting && (
                      <span className="text-xs text-slate-500">Already assigned</span>
                    )}
                  </label>
                )
              })}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignSubmit}
              disabled={usersLoading}
            >
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm border-white/10 bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Remove Access</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-300">
            Are you sure you want to remove this user's access?
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setUserToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
