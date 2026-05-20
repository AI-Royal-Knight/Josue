"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type InlineCreateProps = {
  placeholder: string
  onConfirm: (name: string) => void
  onCancel: () => void
  confirmLabel?: string
  confirmClass?: string
}

export function InlineCreate({
  placeholder,
  onConfirm,
  onCancel,
  confirmLabel = "Create",
  confirmClass = "",
}: InlineCreateProps) {
  const [value, setValue] = useState("")

  const confirm = () => {
    const trimmed = value.trim()
    if (trimmed) onConfirm(trimmed)
  }

  return (
    <div className="nopan nodrag grid grid-cols-[1fr_auto] items-center gap-2">
      <Input
        autoFocus
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") confirm()
          if (e.key === "Escape") onCancel()
        }}
        className="h-8 w-44 rounded border-[#2d4060] bg-[#111d33] text-[13px] text-[#e2e8f0] placeholder:text-[#374151] focus-visible:ring-blue-500"
      />
      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          type="button"
          onClick={confirm}
          className={cn(
            "nopan nodrag h-8 rounded text-[12px] font-semibold",
            confirmClass
          )}
        >
          {confirmLabel}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          type="button"
          onClick={onCancel}
          className="nopan nodrag h-8 rounded border border-[#1e3a5f] text-[12px] text-[#8a9ab5] hover:bg-[#1a2d45] hover:text-[#e2e8f0]"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
