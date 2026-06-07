import { useMemo } from "react"
import { Label } from "@/components/ui/label"
import MultipleSelector, { type Option } from "@/components/ui/multiselect"

export type MultiSelectInputOption = {
  label: string
  value: string
}

type MultiSelectInputProps = {
  options: MultiSelectInputOption[]
  value: string[]
  onChange: (value: string[]) => void
  label?: string
  placeholder?: string
  creatable?: boolean
  disabled?: boolean
  className?: string
}

export default function MultiSelectInput({
  options,
  value,
  onChange,
  label,
  placeholder = "Select options",
  creatable = false,
  disabled = false,
  className,
}: MultiSelectInputProps) {
  const optionsByValue = useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options]
  )

  const selectedOptions = useMemo<Option[]>(
    () =>
      value.map((item) => {
        const matchedOption = optionsByValue.get(item)
        if (matchedOption) return matchedOption
        return { label: item, value: item }
      }),
    [optionsByValue, value]
  )

  const handleChange = (selected: Option[]) => {
    onChange(selected.map((option) => option.value))
  }

  return (
    <div className={className}>
      {label ? <Label>{label}</Label> : null}
      <div className={label ? "mt-2" : undefined}>
        <MultipleSelector
          commandProps={{
            label: label ?? "Select options",
          }}
          defaultOptions={options}
          options={options}
          value={selectedOptions}
          onChange={handleChange}
          creatable={creatable}
          disabled={disabled}
          emptyIndicator={
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              No options found
            </p>
          }
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
