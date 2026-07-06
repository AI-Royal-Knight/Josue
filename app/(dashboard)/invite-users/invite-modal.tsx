"use client"

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import React, { useState } from 'react'

export default function InviteUserDialog() {
  const [open, setOpen] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInvite = async () => {
    if (!firstName || !lastName || !email) {
      toast.error("Please fill in all fields.")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("tresta:accessToken")
      const res = await fetch("http://localhost:8000/api/v1/document-controller/invite-employee/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message || "Invitation sent successfully!")
        setOpen(false)
        setFirstName('')
        setLastName('')
        setEmail('')
      } else {
        toast.error(data.error || "Failed to send invitation.")
      }
    } catch (e) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Send Invite</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-6">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>First Name</Label>
              <div className="relative">
                <Input 
                  placeholder="John" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Last Name</Label>
              <div className="relative">
                <Input 
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <div className="relative">
              <Input 
                placeholder="john.doe@construction.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* <div className="space-y-2">
            <Label>Profession</Label>
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900">
                  <SelectItem value="site-manager">Site Manager</SelectItem>
                  <SelectItem value="electrician">Electrician</SelectItem>
                  <SelectItem value="groundworker">Groundworker</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input placeholder="BuildRight Corp." />
          </div> */}

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
