"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import InviteProjectAdminForm from "./invite-project-admin-form"
import { useState } from "react"

export default function InviteDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSuccess = () => {
    setIsOpen(false)
    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
        <InviteProjectAdminForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
