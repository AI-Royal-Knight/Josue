"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { ALL_USERS } from "../utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialSelected: string[]
  onAssign: (selectedIds: string[]) => void
}

export default function AssignUsersDialog({ open, onOpenChange, initialSelected, onAssign }: Props) {
  const [userSearch, setUserSearch] = useState("")
  const [assignSelected, setAssignSelected] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setAssignSelected(initialSelected)
      setUserSearch("")
    }
  }, [open, initialSelected])

  const filteredUsers = ALL_USERS.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase())
  )

  const confirmAssign = () => {
    onAssign(assignSelected)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Assign Users</DialogTitle></DialogHeader>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <Input
            placeholder="Search users…"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="border-white/10 bg-slate-900 pl-9"
          />
        </div>
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {filteredUsers.map((u) => (
            <label key={u.id} className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-white/5">
              <Checkbox
                checked={assignSelected.includes(u.id)}
                onCheckedChange={(checked) =>
                  setAssignSelected((prev) =>
                    checked ? [...prev, u.id] : prev.filter((id) => id !== u.id)
                  )
                }
              />
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${u.color}`}>
                {u.initials}
              </div>
              <span className="text-sm text-slate-200">{u.name}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={confirmAssign}>Assign</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
