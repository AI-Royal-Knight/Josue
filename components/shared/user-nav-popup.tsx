"use client"
import React from "react"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../ui/popover"
import { Button } from "../ui/button"
import { LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UserAccountNav() {
   const router = useRouter()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex cursor-pointer items-center rounded-md border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm transition hover:bg-slate-800/70">
          <User className="h-5 w-5" />
          <Button variant="ghost">USER NAME</Button>
        </div>
      </PopoverTrigger>
      <PopoverContent align="start">
        <PopoverHeader>
          <Button variant={"destructive"} className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm transition hover:bg-slate-100/10" onClick={() => router.push("/sign-in")}>
            <LogOut className="mr-2 h-4 w-4" />
            <PopoverTitle>Logout</PopoverTitle>
          </Button>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}
