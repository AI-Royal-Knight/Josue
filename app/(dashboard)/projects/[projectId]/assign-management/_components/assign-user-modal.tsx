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
import { Search, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { getCompanyUsers, assignProjectRole, type ProjectUser } from "@/lib/api/project-admin"
import { ApiError } from "@/lib/api/client"

type AssignUserModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  roleKey: string
  users: ProjectUser[]
  onUsersChange: (users: ProjectUser[]) => void
  onSuccess: () => void
}

export function AssignUserModal({
  open,
  onOpenChange,
  projectId,
  roleKey,
  users: currentUsers,
  onUsersChange,
  onSuccess,
}: AssignUserModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [localUsers, setLocalUsers] = useState<ProjectUser[]>([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        setLoading(true)
        setError(null)
        try {
          const res = await getCompanyUsers()
          // Mark users as checked if they are already in currentUsers
          const mapped = res.users.map(u => ({
            ...u,
            checked: currentUsers.some(cu => cu.id === u.id)
          }))
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
  }, [open, currentUsers])

  const filteredUsers = localUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleUser = (userId: string) => {
    // Currently only supporting selecting one user to assign at a time per backend API design,
    // but checkbox allows toggling
    setLocalUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, checked: !user.checked } : user
      )
    )
  }

  const handleAssign = async () => {
    // For now, we take the checked users and assign them.
    // The backend API expects a single user_id right now.
    // Let's just assign the first newly checked user that wasn't already in currentUsers.
    const selectedUsers = localUsers.filter(u => u.checked)
    const newUsers = selectedUsers.filter(u => !currentUsers.some(cu => cu.id === u.id))
    
    if (newUsers.length === 0) {
      onOpenChange(false)
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      // Assign the first one
      await assignProjectRole(projectId, {
        role_key: roleKey,
        user_id: newUsers[0].id
      })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to assign user.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // To display a pretty role name, we can format roleKey
  const prettyRoleName = roleKey.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">
            Assign Users to <span className="text-amber-400">{prettyRoleName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute top-2 left-3 size-4 text-slate-400" />
            <Input
              placeholder="Search users"
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
                  <span className="text-sm text-slate-100">{user.name}</span>
                </label>
              ))
            ) : (
              <div className="text-center text-sm text-slate-500 py-4">No users found.</div>
            )}
          </div>
        </div>
        <div className="flex gap-3 border-t border-white/10 pt-4 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
