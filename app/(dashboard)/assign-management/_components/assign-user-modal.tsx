"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

type User = {
    id: string
    name: string
    checked: boolean
}

type AssignUserModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    role: string
    users: User[]
    onUsersChange: (users: User[]) => void
}

const allUsers: User[] = [
    { id: "1", name: "Alison Taylor", checked: true },
    { id: "2", name: "Alex Wanchis", checked: false },
    { id: "3", name: "Chanu Clap", checked: false },
    { id: "4", name: "Chailau", checked: false },
    { id: "5", name: "Provin Kumar", checked: false },
    { id: "6", name: "Yoshi Kub", checked: false },
]

export function AssignUserModal({
    open,
    onOpenChange,
    role,
    users,
    onUsersChange,
}: AssignUserModalProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [localUsers, setLocalUsers] = useState(users)

    const filteredUsers = localUsers.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleToggleUser = (userId: string) => {
        setLocalUsers((prev) =>
            prev.map((user) =>
                user.id === userId ? { ...user, checked: !user.checked } : user
            )
        )
    }

    const handleAssign = () => {
        onUsersChange(localUsers)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[380px]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-white">
                        Assign Users to <span className="text-amber-400">{role}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="relative">
                        <Search className="absolute top-2 left-3 size-4 text-slate-400" />
                        <Input
                            placeholder="Search users"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-white/10 pl-10"
                        />
                    </div>

                    <div className="max-h-64 space-y-2 overflow-y-auto">
                        {filteredUsers.map((user) => (
                            <label
                                key={user.id}
                                className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-white/5"
                            >
                                <Checkbox
                                    checked={user.checked}
                                    onCheckedChange={() => handleToggleUser(user.id)}
                                />
                                <span className="text-sm text-slate-100">{user.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex gap-3 border-t border-white/10 pt-4 justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                    >
                        Assign User
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
