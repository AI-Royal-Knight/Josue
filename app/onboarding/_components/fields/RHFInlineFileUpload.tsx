"use client"

import { useRef } from "react"
import {
  useController,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
import { PaperclipIcon, UploadIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import ErrorMessage from "@/components/shared/form-error-message"

export default function RHFInlineFileUpload<TFieldValues extends FieldValues>({
  name,
  accept,
  helper,
}: {
  name: FieldPath<TFieldValues>
  accept?: string
  helper?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    field,
    fieldState: { error },
  } = useController<TFieldValues>({ name })

  const file = field.value as File | null | undefined

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const next = e.target.files?.[0] ?? null
          field.onChange(next)
        }}
      />

      {!file ? (
        <div
          role="button"
          tabIndex={0}
          className="flex items-center justify-between gap-3 rounded-none border border-input bg-transparent px-3 py-2 text-xs"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <UploadIcon className="size-4" />
            <div>
              <div className="text-xs text-foreground">Upload Document</div>
              {helper && (
                <div className="text-xs text-muted-foreground">{helper}</div>
              )}
            </div>
          </div>

          <Button type="button" variant="outline" size="sm">
            Browse
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 rounded-none border border-input bg-transparent px-3 py-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <PaperclipIcon className="size-4 shrink-0 opacity-60" />
            <div className="min-w-0">
              <div className="truncate text-xs text-foreground">
                {file.name}
              </div>
              <div className="text-xs text-muted-foreground">Uploaded</div>
            </div>
          </div>

          <Button
            type="button"
            aria-label="Remove file"
            variant="ghost"
            size="icon"
            className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
            onClick={() => {
              field.onChange(null)
              if (inputRef.current) inputRef.current.value = ""
            }}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      )}

      {error?.message && <ErrorMessage message={error.message} />}
    </div>
  )
}
