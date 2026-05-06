"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import CreateProjectForm from "./create-project-form"
import { Button } from "@/components/ui/button"

export default function CreateProjectDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 text-white">+ Create New Project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <CreateProjectForm />
      </DialogContent>
    </Dialog>
  )
}
