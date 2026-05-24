"use client"

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React, { useState } from 'react'

export default function InviteUserDialog() {
  const [open, setOpen] = useState(false)

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
                <Input placeholder="John" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Last Name</Label>
              <div className="relative">
                <Input placeholder="Doe" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <div className="relative">
              <Input placeholder="john.doe@construction.com" />
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
            <Button variant="outline">Cancel</Button>
            <Button>Send Invite</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
