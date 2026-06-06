"use client"

import { useMemo, useState, useEffect } from "react"
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
import { Plus, Trash2 } from "lucide-react"

import { VariationFormData, VariationLine } from "../types"
import { PROJECTS, emptyLine, defaultForm, lineTotal, formatGBP } from "../utils"
import FileUpload from "@/components/ui/file-uploader"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (form: VariationFormData, formTotal: number) => void
}

const COLUMNS = [
  { key: "no",            label: "No.",               width: "w-10" },
  { key: "description",   label: "Description",        width: "min-w-[140px]" },
  { key: "workArea",      label: "Work Area",          width: "min-w-[110px]" },
  { key: "workSection",   label: "Work Section",       width: "min-w-[110px]" },
  { key: "labour",        label: "Labour (£)",         width: "w-24" },
  { key: "labourTarget",  label: "Labour Target (£)",  width: "w-28" },
  { key: "material",      label: "Material (£)",       width: "w-24" },
  { key: "qty",           label: "QTY",                width: "w-20" },
  { key: "total",         label: "Total",              width: "w-24" },
  { key: "actions",       label: "",                   width: "w-8"  },
]

export default function CreateVariationDialog({ open, onOpenChange, onSubmit }: Props) {
  const [form, setForm] = useState<VariationFormData>(defaultForm())

  useEffect(() => {
    if (open) setForm(defaultForm())
  }, [open])

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

  const handleSubmit = () => onSubmit(form, formTotal)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
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
                  {PROJECTS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Evidence</label>
              <FileUpload />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Reason for Variation / Description of Works</label>
            <textarea
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
                  <TableRow >
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
                      <TableCell className="border-r border-white/10 py-1 px-2 text-slate-400 text-xs">
                        {i + 1}
                      </TableCell>

                      {/* Description */}
                      <TableCell className="border-r border-white/10 px-1 py-1">
                        <Input
                          value={line.siteInstruction}
                          onChange={(e) => updateLine(i, { siteInstruction: e.target.value })}
                          className="h-7 border-white/10 bg-transparent text-xs"
                        />
                      </TableCell>

                      {/* Work Area */}
                      <TableCell className="border-r border-white/10 px-1 py-1">
                        <Input
                          value={line.workArea}
                          onChange={(e) => updateLine(i, { workArea: e.target.value })}
                          className="h-7 border-white/10 bg-transparent text-xs"
                        />
                      </TableCell>

                      {/* Work Section */}
                      <TableCell className="border-r border-white/10 px-1 py-1">
                        <Input
                          value={line.workSection}
                          onChange={(e) => updateLine(i, { workSection: e.target.value })}
                          className="h-7 border-white/10 bg-transparent text-xs"
                        />
                      </TableCell>

                      {/* Labour */}
                      <TableCell className="border-r border-white/10 px-1 py-1">
                        <Input
                          type="number"
                          min={0}
                          value={line.labour === 0 ? "" : line.labour}
                          onChange={(e) => updateLine(i, { labour: parseFloat(e.target.value) || 0 })}
                          className="h-7 w-full border-white/10 bg-transparent text-right text-xs"
                        />
                      </TableCell>

                      {/* Labour Target */}
                      <TableCell className="border-r border-white/10 px-1 py-1">
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
                      <TableCell className="border-r border-white/10 px-1 py-1">
                        <Input
                          type="number"
                          min={0}
                          value={line.material === 0 ? "" : line.material}
                          onChange={(e) => updateLine(i, { material: parseFloat(e.target.value) || 0 })}
                          className="h-7 w-full border-white/10 bg-transparent text-right text-xs"
                        />
                      </TableCell>

                      {/* QTY */}
                      <TableCell className="border-r border-white/10 px-1 py-1">
                        <Input
                          type="number"
                          min={0}
                          value={line.qty === 0 ? "" : line.qty}
                          onChange={(e) => updateLine(i, { qty: parseFloat(e.target.value) || 0 })}
                          className="h-7 w-full border-white/10 bg-transparent text-right text-xs"
                        />
                      </TableCell>

                      {/* Row Total */}
                      <TableCell className="border-r border-white/10 px-2 py-1 text-right font-medium text-slate-100 text-xs tabular-nums">
                        {formatGBP(lineTotal(line))}
                      </TableCell>

                      {/* Remove */}
                      <TableCell className="px-2 py-1 text-center">
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
            //   className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={!form.project || !form.descriptionOfWorks}
              onClick={handleSubmit}
            >
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
