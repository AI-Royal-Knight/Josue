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
import { Search, Loader2, UserPlus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { getCompanyUsers, assignProjectRole, type ProjectUser } from "@/lib/api/project-admin"
import { sendInvitation } from "@/lib/api/invitations"
import { ApiError } from "@/lib/api/client"

type AssignUserModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  roleKey: string
  users: ProjectUser[]
  onUsersChange: (users: ProjectUser[]) => void
  onSuccess: () => void
  allAssignedUserIds?: string[]
}

export function AssignUserModal({
  open,
  onOpenChange,
  projectId,
  roleKey,
  users: currentUsers,
  allAssignedUserIds = [],
  onUsersChange,
  onSuccess,
}: AssignUserModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [localUsers, setLocalUsers] = useState<ProjectUser[]>([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [isInviteMode, setIsInviteMode] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getCompanyUsers()
      const availableUsers = res.users.filter(u => {
        if (allAssignedUserIds.includes(u.id)) return false;
        return !currentUsers.some(cu => cu.id === u.id);
      })
      
      availableUsers.sort((a, b) => {
        const aMatch = a.role === roleKey ? 1 : 0;
        const bMatch = b.role === roleKey ? 1 : 0;
        return bMatch - aMatch;
      });

      const mapped = availableUsers.map(u => ({
        ...u,
        checked: false
      }))
      setLocalUsers(mapped)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load users.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setIsInviteMode(false)
      setInviteEmail("")
      fetchUsers()
    } else {
      setSearchTerm("")
    }
  }, [open, currentUsers])

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

  const handleAssign = async () => {
    if (isInviteMode) {
      if (!inviteEmail) {
        setError("Please enter an email address.")
        return
      }
      setIsSubmitting(true)
      setError(null)
      try {
        await sendInvitation({
          email: inviteEmail,
          role: roleKey,
        })
        // Switch back to selection mode and reload users (though invitee won't be in list until they accept, we just notify success)
        setIsInviteMode(false)
        setInviteEmail("")
        setError(null)
        alert(`Invitation sent to ${inviteEmail}`)
        onOpenChange(false)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to invite user.")
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    const existingIds = currentUsers.map(u => u.id)
    const newSelectedIds = localUsers.filter(u => u.checked).map(u => u.id)
    const combinedUserIds = [...existingIds, ...newSelectedIds]
    
    setIsSubmitting(true)
    setError(null)
    try {
      await assignProjectRole(projectId, {
        role_key: roleKey,
        user_ids: combinedUserIds
      })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to assign users.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const prettyRoleName = roleKey.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">
            {isInviteMode ? "Invite" : "Assign"} Users to <span className="text-amber-400">{prettyRoleName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          {isInviteMode ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-300">Invite a new user to join the company as {prettyRoleName}.</p>
              <Input
                placeholder="Email address"
                value={inviteEmail}
                type="email"
                onChange={(e) => setInviteEmail(e.target.value)}
                className="border-white/10"
              />
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute top-2 left-3 size-4 text-slate-400" />
                <Input
                  placeholder="Search users"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-white/10 pl-10"
                />
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto">
                {loading ? (
                   <div className="flex items-center justify-center py-4 text-sm text-slate-400">
                     <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
                   </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-white/5"
                    >
                     <Checkbox
                        checked={user.checked}
                        onCheckedChange={() => handleToggleUser(user.id)}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-100 flex items-center gap-2">
                          {user.name || "Unknown Name"}
                          {user.role && (
                            <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${user.role === roleKey ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-slate-400"}`}>
                              {user.role.replace(/_/g, ' ')}
                            </span>
                          )}
                        </span>
                        {user.email && <span className="text-xs text-slate-400">{user.email}</span>}
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="text-center text-sm text-slate-500 py-4">No users found.</div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex justify-between border-t border-white/10 pt-4">
          <Button
            variant="ghost"
            className="text-amber-400 hover:text-amber-300"
            onClick={() => {
              setIsInviteMode(!isInviteMode)
              setError(null)
            }}
          >
            {isInviteMode ? "Back to Search" : <><UserPlus className="mr-2 h-4 w-4" /> Invite New</>}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={isSubmitting || (loading && !isInviteMode)}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (isInviteMode ? "Send Invite" : "Assign User")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

