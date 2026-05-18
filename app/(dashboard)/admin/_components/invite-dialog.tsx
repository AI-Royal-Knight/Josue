"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import InviteProjectAdminForm from "./invite-project-admin-form"
import { useState } from "react"

interface InviteDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function InviteDialog({
  open,
  onOpenChange,
}: InviteDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default">Invite User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Project Admin</DialogTitle>
          <DialogDescription>
            Send an invitation to a new project admin.
          </DialogDescription>
        </DialogHeader>
        <InviteProjectAdminForm />
      </DialogContent>
    </Dialog>
  )
}
