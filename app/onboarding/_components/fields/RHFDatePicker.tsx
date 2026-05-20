"use client"

import { useId } from "react"
import {
  useController,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import ErrorMessage from "@/components/shared/form-error-message"

export default function RHFDatePicker<TFieldValues extends FieldValues>({
  name,
  placeholder = "Select date",
  disabled,
}: {
  name: FieldPath<TFieldValues>
  placeholder?: string
  disabled?: boolean
}) {
  const triggerId = useId()

  const {
    field,
    fieldState: { error },
  } = useController<TFieldValues>({ name })

  const value = field.value as Date | undefined

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={triggerId}
            type="button"
            variant="outline"
            className="h-8 w-full justify-between border-input bg-transparent px-2.5 text-xs"
            disabled={disabled}
          >
            <span
              className={value ? "text-foreground" : "text-muted-foreground"}
            >
              {value instanceof Date
                ? format(value, "dd MMM yyyy")
                : placeholder}
            </span>
            <CalendarIcon className="size-4 opacity-60" />
          </Button>
        </PopoverTrigger>

        {!disabled && (
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value}
              onSelect={(date) => {
                field.onChange(date)
              }}
              initialFocus
            />
          </PopoverContent>
        )}
      </Popover>

      {error?.message && <ErrorMessage message={error.message} />}
    </div>
  )
}
