"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import CreateProjectForm from "./create-project-form"
import { Button } from "@/components/ui/button"

export default function CreateProjectDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
    if (onSuccess) onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Create New Project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <CreateProjectForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
