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

export default function InviteUserDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [allowedRoles, setAllowedRoles] = useState<AllowedRole[]>([])
  const [loadingRoles, setLoadingRoles] = useState(false)

  const [canInvite, setCanInvite] = useState<boolean | null>(null) // null = loading

  // Pre-fetch on mount to decide if we should show the button at all
  useEffect(() => {
    getAllowedInviteRoles()
      .then((res) => {
        setCanInvite(res.allowed_roles.length > 0)
      })
      .catch(() => setCanInvite(false))
  }, [])

  // Also re-fetch when dialog opens (in case role changes mid-session)
  useEffect(() => {
    if (!open) return
    setLoadingRoles(true)
    getAllowedInviteRoles()
      .then((res) => {
        setAllowedRoles(res.allowed_roles)
        setCanInvite(res.allowed_roles.length > 0)
      })
      .catch(() => setAllowedRoles([]))
      .finally(() => setLoadingRoles(false))
  }, [open])

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
      setRole('')
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
      setRole('')
    }
  }

  // Don't render anything while checking permissions, and hide button if user can't invite
  if (canInvite === null) return null
  if (!canInvite) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Send Invite
        </Button>
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

          {allowedRoles.length > 0 && role === 'supplier' && (
            <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded p-2">
              ℹ️ The supplier will receive an invitation email. Once they register, they can submit invoices linked to POs for your company.
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
