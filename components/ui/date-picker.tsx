"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickrProps {
  value?: Date | string | null
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
}

export default function DatePickr({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  id,
}: DatePickrProps) {
  const [open, setOpen] = React.useState(false)

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value
    try {
      const parsed = parseISO(value)
      return isNaN(parsed.getTime()) ? undefined : parsed
    } catch {
      return undefined
    }
  }, [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between text-left font-normal border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-9 px-3",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <span>
            {selectedDate ? format(selectedDate, "PPP") : placeholder}
          </span>
          <CalendarIcon className="size-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50 bg-slate-900 border border-white/10 text-slate-100" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => {
            onChange?.(d)
            setOpen(false)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
