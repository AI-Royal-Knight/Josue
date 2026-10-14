"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { apiRequest } from "@/lib/api/client"

type UserItem = {
  id: string
  name: string
  surname?: string
  email: string
  profession?: string
  role?: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialSelected: string[]
  onAssign: (selectedIds: string[]) => void
}

const colors = [
  "bg-emerald-600 text-white",
  "bg-indigo-600 text-white",
  "bg-rose-600 text-white",
  "bg-amber-600 text-white",
  "bg-blue-600 text-white",
  "bg-violet-600 text-white",
  "bg-teal-600 text-white",
  "bg-orange-600 text-white",
]

const getColor = (id: string) => {
  let sum = 0
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i)
  }
  return colors[sum % colors.length]
}

export default function AssignUsersDialog({ open, onOpenChange, initialSelected, onAssign }: Props) {
  const [userSearch, setUserSearch] = useState("")
  const [assignSelected, setAssignSelected] = useState<string[]>([])
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setUserSearch("")
      setLoading(true)
      apiRequest<UserItem[]>("/account/users/?role=employee")
        .then((data) => {
          // Strictly allow only mobile app users (employees)
          const appUsers = data.filter((u) => u.role === "employee")
          setUsers(appUsers)
          const appUserIds = new Set(appUsers.map((u) => u.id))
          // Filter initial selection to only valid app users
          setAssignSelected(initialSelected.filter((id) => appUserIds.has(id)))
        })
        .catch((err) => {
          console.error("Failed to load app users:", err)
        })
        .finally(() => setLoading(false))
    }
  }, [open, initialSelected])

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.name} ${u.surname || ""}`.trim().toLowerCase()
    return fullName.includes(userSearch.toLowerCase())
  })

  const confirmAssign = () => {
    onAssign(assignSelected)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-white/10 bg-slate-950 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <Smartphone className="size-4 text-emerald-400" />
            Assign App Users
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Only mobile app users (employees) can be assigned to variations.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <Input
            placeholder="Search app users…"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="border-white/10 bg-slate-900 pl-9 text-slate-100 placeholder:text-slate-500"
          />
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            <span className="ml-2 text-sm text-slate-400">Loading app users…</span>
          </div>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">No app users found.</div>
            ) : (
              filteredUsers.map((u) => {
                const fullName = `${u.name} ${u.surname || ""}`.trim()
                const initials = `${u.name?.charAt(0) || ""}${u.surname?.charAt(0) || ""}`.toUpperCase()
                const colorClass = getColor(u.id)

                return (
                  <label key={u.id} className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-white/5">
                    <Checkbox
                      checked={assignSelected.includes(u.id)}
                      onCheckedChange={(checked) =>
                        setAssignSelected((prev) =>
                          checked ? [...prev, u.id] : prev.filter((id) => id !== u.id)
                        )
                      }
                      className="border-white/20 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white"
                    />
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${colorClass}`}>
                      {initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-200">{fullName}</span>
                      {u.profession && (
                        <span className="text-[10px] text-slate-400">{u.profession}</span>
                      )}
                    </div>
                  </label>
                )
              })
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
          <Button variant="outline" className="border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={confirmAssign}>Assign</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
