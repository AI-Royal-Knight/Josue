"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { sendInvitation, getAllowedInviteRoles, type AllowedRole } from "@/lib/api/invitations"
import { useRoleStore } from "@/lib/role-store"
import { Loader2, UserPlus, Users, ArrowRight, ShieldCheck } from "lucide-react"

export default function InviteUsersPage() {
  const currentRole = useRoleStore((s) => s.role)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [allowedRoles, setAllowedRoles] = useState<AllowedRole[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)

  useEffect(() => {
    setLoadingRoles(true)
    getAllowedInviteRoles()
      .then((res) => {
        setAllowedRoles(res.allowed_roles)
        if (res.allowed_roles.length === 1) {
          setRole(res.allowed_roles[0].value)
        }
      })
      .catch(() => {
        setAllowedRoles([])
      })
      .finally(() => {
        setLoadingRoles(false)
      })
  }, [currentRole])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
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
      setEmail("")
      if (allowedRoles.length !== 1) {
        setRole("")
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to send invitation.")
    } finally {
      setLoading(false)
    }
  }

  const isOnlyEmployee =
    allowedRoles.length === 1 && allowedRoles[0].value === "employee"

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isOnlyEmployee ? "Invite App Users" : "Invite Users"}
          </h1>
          <p className="text-sm text-slate-400">
            {isOnlyEmployee
              ? "Send invitations to mobile app users (employees) to join your company."
              : "Send invitations to new team members or partners to join your company."}
          </p>
        </div>
        <Link href="/users">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            View Users
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Card className="border-white/10 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <UserPlus className="h-5 w-5 text-primary" />
            {isOnlyEmployee ? "New App User Invitation" : "New User Invitation"}
          </CardTitle>
          <CardDescription>
            An email with an activation link will be sent to the recipient.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              {loadingRoles ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading available roles...
                </div>
              ) : allowedRoles.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Your current role does not have permission to invite users.
                </p>
              ) : allowedRoles.length === 1 ? (
                <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
                  <span>{allowedRoles[0].label}</span>
                  <span className="text-xs text-slate-400">(App User)</span>
                </div>
              ) : (
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
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

            {role === "employee" && (
              <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Invited employees will receive a link to create their mobile app credentials.
                  Their account will become active once approved by a <strong>Document Controller</strong>.
                </span>
              </div>
            )}

            {role === "supplier" && (
              <div className="rounded-md border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-300">
                The supplier will receive an invitation email. Once registered, they will be linked to your company to submit invoices.
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={loading || !role || !email || allowedRoles.length === 0}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    {isOnlyEmployee ? "Send App User Invite" : "Send Invitation"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
