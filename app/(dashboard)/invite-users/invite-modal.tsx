"use client"

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import React, { useState, useEffect } from 'react'
import { sendInvitation, getAllowedInviteRoles, AllowedRole } from '@/lib/api/invitations'
import { Loader2, UserPlus } from 'lucide-react'

import { useRoleStore } from '@/lib/role-store'

const KNOWN_INVITE_ROLES = new Set([
  "admin",
  "super_admin",
  "project_admin",
  "project_director",
  "contracts_manager",
  "managers",
  "manager",
  "supervisor",
  "document_controller",
  "procurement_department",
])

export default function InviteUserDialog({ defaultOpen }: { defaultOpen?: boolean }) {
  const currentRole = useRoleStore((s) => s.role)
  const [open, setOpen] = useState(defaultOpen ?? false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [allowedRoles, setAllowedRoles] = useState<AllowedRole[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)

  // Start with true if the user's role is known to have invite permission
  const [canInvite, setCanInvite] = useState<boolean | null>(
    currentRole ? KNOWN_INVITE_ROLES.has(currentRole) : null
  )

  // Pre-fetch on mount to decide if we should show the button at all
  useEffect(() => {
    getAllowedInviteRoles()
      .then((res) => {
        const roles = res.allowed_roles.filter(
          (r) => !(currentRole === "project_admin" && r.value === "employee")
        )
        setCanInvite(roles.length > 0)
        setAllowedRoles(roles)
        if (roles.length === 1) {
          setRole(roles[0].value)
        }
      })
      .catch(() => {
        if (currentRole && KNOWN_INVITE_ROLES.has(currentRole)) {
          setCanInvite(true)
        } else {
          setCanInvite(false)
        }
      })
  }, [currentRole])

  // Also re-fetch when dialog opens (in case role changes mid-session)
  useEffect(() => {
    if (!open) return
    setLoadingRoles(true)
    getAllowedInviteRoles()
      .then((res) => {
        const roles = res.allowed_roles.filter(
          (r) => !(currentRole === "project_admin" && r.value === "employee")
        )
        setAllowedRoles(roles)
        setCanInvite(roles.length > 0)
        if (roles.length === 1) {
          setRole(roles[0].value)
        }
      })
      .catch(() => setAllowedRoles([]))
      .finally(() => setLoadingRoles(false))
  }, [open, currentRole])

  const handleInvite = async () => {
    if (!email || !role) {
      toast.error("Email and Role are required.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.")
      return
    }

    setLoading(true)
    try {
      const response = await sendInvitation({ email, role })
      toast.success(response.message || "Invitation sent successfully!")
      setOpen(false)
      setEmail('')
      if (allowedRoles.length !== 1) {
        setRole('')
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to send invitation.")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setEmail('')
      if (allowedRoles.length !== 1) {
        setRole('')
      }
    }
  }

  // Don't render anything if user definitely cannot invite
  if (canInvite === false) return null

  const isOnlyEmployeeInvite =
    allowedRoles.length === 1 && allowedRoles[0].value === "employee"

  const buttonLabel = isOnlyEmployeeInvite ? "Invite App User" : "Invite User"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>
            {isOnlyEmployeeInvite ? "Invite App User" : "Invite New User"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            {loadingRoles ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading available roles...
              </div>
            ) : allowedRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Your role does not have permission to invite users.
              </p>
            ) : (
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role to invite..." />
                </SelectTrigger>
                <SelectContent>
                  {allowedRoles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {allowedRoles.length > 0 && role === 'employee' && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
              ⚠️ This user will be invited as a mobile app user. Their account will only become active after the <strong>Document Controller</strong> reviews and approves their documents.
            </p>
          )}

          <div className="flex justify-end gap-4 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={loading || !role || allowedRoles.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invite"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
