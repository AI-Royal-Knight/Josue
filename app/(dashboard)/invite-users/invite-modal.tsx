"use client"

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import React, { useState } from 'react'
import { sendInvitation } from '@/lib/api/invitations'

const ALL_ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "project_admin", label: "Project Admin" },
  { value: "managing_director", label: "Managing Director" },
  { value: "project_director", label: "Project Director" },
  { value: "contracts_manager", label: "Contracts Manager" },
  { value: "managers", label: "Manager" },
  { value: "supervisor", label: "Supervisor" },
  { value: "document_controller", label: "Document Controller" },
  { value: "supplier", label: "Supplier" },
  { value: "employee", label: "Employee" },
]

export default function InviteUserDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [secondaryRole, setSecondaryRole] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInvite = async () => {
    if (!email || !role) {
      toast.error("Email and Primary Role are required.")
      return
    }

    setLoading(true)
    try {
      const response = await sendInvitation({
        email,
        role,
        secondary_role: secondaryRole || undefined
      })
      
      toast.success(response.message || "Invitation sent successfully!")
      setOpen(false)
      setEmail('')
      setRole('')
      setSecondaryRole('')
    } catch (e: any) {
      toast.error(e.message || "Failed to send invitation.")
    } finally {
      setLoading(false)
    }
  }

  const isExclusiveRole = ["super_admin", "admin", "project_admin"].includes(role)
  if (isExclusiveRole && secondaryRole) {
    setSecondaryRole("") // Clear secondary role if they switch primary to an exclusive one
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Send Invite</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input 
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Primary Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select primary role..." />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Secondary Role (Optional)</Label>
            <Select 
              value={secondaryRole} 
              onValueChange={setSecondaryRole}
              disabled={!role || isExclusiveRole}
            >
              <SelectTrigger>
                <SelectValue placeholder={isExclusiveRole ? "Not allowed for this primary role" : "Select secondary role..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">None</SelectItem>
                {ALL_ROLES.filter(r => !["super_admin", "admin", "project_admin"].includes(r.value) && r.value !== role).map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isExclusiveRole && (
              <p className="text-xs text-slate-500">
                Super Admins, Admins, and Project Admins cannot have a secondary role.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleInvite} disabled={loading}>
              {loading ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
