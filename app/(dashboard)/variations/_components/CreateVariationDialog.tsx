"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Plus, Trash2, Loader2, UploadCloud, FileText, Image as ImageIcon, X } from "lucide-react"

import { VariationFormData, VariationLine, VariationRow } from "../types"
import { emptyLine, defaultForm, lineTotal, formatGBP } from "../utils"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (form: VariationFormData, formTotal: number) => Promise<boolean> | boolean
  projects: { id: string; name: string }[]
  defaultProjectId?: string
  existingVariations?: VariationRow[]
}

const COLUMNS = [
  { key: "no",           label: "No.",               width: "w-10" },
  { key: "description",  label: "Description",       width: "min-w-[180px]" },
  { key: "labour",       label: "Labour (£)",        width: "w-24" },
  { key: "labourTarget", label: "Labour Target (£)", width: "w-28" },
  { key: "material",     label: "Material (£)",      width: "w-24" },
  { key: "qty",          label: "QTY",               width: "w-20" },
  { key: "total",        label: "Total",             width: "w-24" },
  { key: "actions",      label: "",                  width: "w-8"  },
]

export default function CreateVariationDialog({
  open,
  onOpenChange,
  onSubmit,
  projects,
  defaultProjectId,
  existingVariations = [],
}: Props) {
  const [form, setForm] = useState<VariationFormData>(defaultForm())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      const initialProject = defaultProjectId || (projects.length === 1 ? projects[0].id : "")
      setForm({
        ...defaultForm(),
        project: initialProject,
      })
      setPreviewUrl(null)
      setIsDragging(false)
    }
  }, [open, defaultProjectId, projects])

  const nextVoReference = useMemo(() => {
    if (!form.project) return ""
    const projectVars = (existingVariations || []).filter((v) => v.projectId === form.project)
    let maxNum = 0
    for (const v of projectVars) {
      const match = v.voNo?.match(/(\d+)/)
      if (match) {
        maxNum = Math.max(maxNum, parseInt(match[1], 10))
      }
    }
    return `VO${String(maxNum + 1).padStart(3, "0")}`
  }, [form.project, existingVariations])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const formTotal = useMemo(
    () => form.lines.reduce((s, l) => s + lineTotal(l), 0),
    [form.lines]
  )

  const vat = useMemo(() => formTotal * 0.2, [formTotal])

  const updateLine = (i: number, patch: Partial<VariationLine>) =>
    setForm((f) => ({
      ...f,
      lines: f.lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    }))

  const addLine = () =>
    setForm((f) => ({ ...f, lines: [...f.lines, emptyLine()] }))

  const removeLine = (i: number) =>
    setForm((f) => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }))

  const handleFileChange = (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (file) {
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file))
      }
      setForm((f) => ({ ...f, evidence: file }))
    } else {
      setForm((f) => ({ ...f, evidence: null }))
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      const isImg = file.type.startsWith("image/")
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
      if (isImg || isPdf) {
        handleFileChange(file)
      }
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const success = await onSubmit(form, formTotal)
    setIsSubmitting(false)
    if (success) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-h-[92vh] max-w-5xl overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Create Variation</DialogTitle>
          <DialogDescription>
            Fill in the variation details. Once submitted it will be sent to the Commercial Manager for approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Top meta */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Project</label>
              <Select
                value={form.project}
                onValueChange={(v) => setForm((f) => ({ ...f, project: v }))}
              >
                <SelectTrigger className="border-white/10 bg-slate-900">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900">
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">VO Reference</label>
              <div className="flex h-9 w-full items-center rounded-md border border-white/10 bg-slate-900/60 px-3 text-sm font-semibold font-mono text-emerald-400">
                {nextVoReference || (
                  <span className="text-xs font-normal text-slate-500 font-sans">
                    Select a project to generate VO reference
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Site Instruction No.</label>
              <Input
                placeholder="e.g. SI24654321019"
                value={form.siteInstructionNo}
                onChange={(e) => setForm((f) => ({ ...f, siteInstructionNo: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Attention of</label>
              <Input
                placeholder="Name"
                value={form.attentionOf}
                onChange={(e) => setForm((f) => ({ ...f, attentionOf: e.target.value }))}
              />
            </div>

            {/* Evidence Attachment (Pictures and PDFs) */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-slate-400">Evidence (Picture or PDF)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  handleFileChange(file)
                }}
              />
              
              {!form.evidence ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.value = ""
                    fileInputRef.current?.click()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (fileInputRef.current) fileInputRef.current.value = ""
                      fileInputRef.current?.click()
                    }
                  }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex h-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-2 text-center transition-colors ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-white/10 bg-white/5 hover:border-emerald-500/50 hover:bg-white/[0.07]"
                  }`}
                >
                  <UploadCloud className="size-5 text-slate-400 mb-1" />
                  <span className="text-xs font-medium text-slate-200">
                    Click to attach PDF or Picture
                  </span>
                  <span className="text-[10px] text-slate-500">
                    PDF, PNG, JPG, WEBP (max 10MB)
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-900/80 p-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-10 w-10 shrink-0 rounded object-cover border border-white/10"
                      />
                    ) : form.evidence.type === "application/pdf" || form.evidence.name.toLowerCase().endsWith(".pdf") ? (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        <FileText className="size-5" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ImageIcon className="size-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-100">
                        {form.evidence.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {(form.evidence.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFileChange(null)}
                    className="h-7 w-7 text-slate-400 hover:text-red-400"
                    title="Remove attachment"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Reason for Variation / Description of Works</label>
            <Textarea
              rows={3}
              value={form.descriptionOfWorks}
              onChange={(e) => setForm((f) => ({ ...f, descriptionOfWorks: e.target.value }))}
              placeholder="Describe the variation works…"
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          {/* Line items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Line Items
              </label>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="mr-1 size-3" /> Add Line
              </Button>
            </div>

            <div className="rounded-md border border-white/10 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {COLUMNS.map((col) => (
                      <TableHead
                        key={col.key}
                        className={`${col.width} border-r border-white/10 last:border-r-0 text-slate-400 text-xs py-2`}
                      >
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {form.lines.map((line, i) => (
                    <TableRow key={i} className="border-white/10 hover:bg-white/[0.03]">
                      {/* Row number */}
                      <TableCell className="border-r border-white/10 py-1 px-2 text-slate-400 text-xs align-top">
                        {i + 1}
                      </TableCell>

                      {/* Description - takes up lines below when long */}
                      <TableCell className="border-r border-white/10 px-1 py-1 align-top">
                        <Textarea
                          value={line.siteInstruction}
                          onChange={(e) => updateLine(i, { siteInstruction: e.target.value })}
                          placeholder="Description of row works…"
                          rows={1}
                          className="min-h-[30px] border-white/10 bg-transparent text-xs py-1 px-2 resize-y leading-snug"
                        />
                      </TableCell>

                      {/* Labour */}
                      <TableCell className="border-r border-white/10 px-1 py-1 align-top">
                        <Input
                          type="number"
                          min={0}
                          value={line.labour === 0 ? "" : line.labour}
                          onChange={(e) => updateLine(i, { labour: parseFloat(e.target.value) || 0 })}
                          className="h-7 w-full border-white/10 bg-transparent text-right text-xs"
                        />
                      </TableCell>

                      {/* Labour Target */}
                      <TableCell className="border-r border-white/10 px-1 py-1 align-top">
                        <Input
                          type="number"
                          min={0}
                          value={line.labourTarget === 0 ? "" : line.labourTarget}
                          onChange={(e) => updateLine(i, { labourTarget: parseFloat(e.target.value) || 0 })}
                          title="Labour target shown to users when invoicing this variation"
                          className="h-7 w-full border-amber-500/30 bg-amber-500/5 text-right text-xs text-amber-300 placeholder:text-amber-700"
                          placeholder="0"
                        />
                      </TableCell>

                      {/* Material */}
                      <TableCell className="border-r border-white/10 px-1 py-1 align-top">
                        <Input
                          type="number"
                          min={0}
                          value={line.material === 0 ? "" : line.material}
                          onChange={(e) => updateLine(i, { material: parseFloat(e.target.value) || 0 })}
                          className="h-7 w-full border-white/10 bg-transparent text-right text-xs"
                        />
                      </TableCell>

                      {/* QTY */}
                      <TableCell className="border-r border-white/10 px-1 py-1 align-top">
                        <Input
                          type="number"
                          min={0}
                          value={line.qty === 0 ? "" : line.qty}
                          onChange={(e) => updateLine(i, { qty: parseFloat(e.target.value) || 0 })}
                          className="h-7 w-full border-white/10 bg-transparent text-right text-xs"
                        />
                      </TableCell>

                      {/* Row Total */}
                      <TableCell className="border-r border-white/10 px-2 py-1 text-right font-medium text-slate-100 text-xs tabular-nums align-top pt-2">
                        {formatGBP(lineTotal(line))}
                      </TableCell>

                      {/* Remove */}
                      <TableCell className="px-2 py-1 text-center align-top pt-2">
                        <button
                          onClick={() => removeLine(i)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                          aria-label="Remove line"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {form.lines.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={COLUMNS.length}
                        className="py-6 text-center text-xs text-slate-500"
                      >
                        No line items yet — click &ldquo;Add Line&rdquo; to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>

                <TableFooter className="border-white/10 bg-white/5">
                  <TableRow>
                    <TableCell
                      colSpan={COLUMNS.length - 2}
                      className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-400"
                    >
                      Sub Total
                    </TableCell>
                    <TableCell className="px-2 py-2 text-right text-sm font-bold text-slate-100 tabular-nums">
                      {formatGBP(formTotal)}
                    </TableCell>
                    <TableCell />
                  </TableRow>

                  <TableRow>
                    <TableCell
                      colSpan={COLUMNS.length - 2}
                      className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-400"
                    >
                      VAT
                    </TableCell>
                    <TableCell className="px-2 py-2 text-right text-sm font-bold text-slate-100 tabular-nums">
                      {formatGBP(vat)}
                    </TableCell>
                    <TableCell />
                  </TableRow>

                  <TableRow>
                    <TableCell
                      colSpan={COLUMNS.length - 2}
                      className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-400"
                    >
                      Total (inc. VAT)
                    </TableCell>
                    <TableCell className="px-2 py-2 text-right text-sm font-bold text-slate-100 tabular-nums">
                      {formatGBP(formTotal + vat)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Qualifications &amp; Comments</label>
            <Textarea
              rows={2}
              value={form.comments}
              onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
              placeholder="Any additional notes…"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              disabled={!form.project || !form.descriptionOfWorks || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {isSubmitting ? "Saving..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
