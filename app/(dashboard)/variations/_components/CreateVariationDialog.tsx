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
import { Plus } from "lucide-react"

import { VariationFormData, VariationLine } from "../types"
import { PROJECTS, emptyLine, defaultForm, lineTotal, formatGBP } from "../utils"
import FileUpload from "@/components/ui/file-uploader"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (form: VariationFormData, formTotal: number) => void
}

export default function CreateVariationDialog({ open, onOpenChange, onSubmit }: Props) {
  const [form, setForm] = useState<VariationFormData>(defaultForm())

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setForm(defaultForm())
    }
  }, [open])

  const formTotal = useMemo(
    () => form.lines.reduce((s, l) => s + lineTotal(l), 0),
    [form.lines]
  )

  const updateLine = (i: number, patch: Partial<VariationLine>) =>
    setForm((f) => ({
      ...f,
      lines: f.lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    }))

  const addLine = () =>
    setForm((f) => ({ ...f, lines: [...f.lines, emptyLine()] }))

  const removeLine = (i: number) =>
    setForm((f) => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }))

  const handleSubmit = () => {
    onSubmit(form, formTotal)
  }

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
              <Select value={form.project} onValueChange={(v) => setForm((f) => ({ ...f, project: v }))}>
                <SelectTrigger className="border-white/10 bg-slate-900"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900">
                  {PROJECTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Line Items</label>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="size-3" /> Add Line
              </Button>
            </div>
            <div className="overflow-x-auto rounded border border-white/10">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-slate-400">
                    {["No.", "Description", "Work Area", "Work Section", "Labour (£)", "Labour Target (£)", "Material (£)", "QTY", "Total", ""].map((h) => (
                      <th key={h} className="border-r border-white/10 px-2 py-2 text-left last:border-r-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {form.lines.map((line, i) => (
                    <tr key={i} className="border-b border-white/10 last:border-b-0">
                      <td className="border-r border-white/10 px-2 py-1 text-slate-400">{i + 1}</td>
                      {(["siteInstruction", "workArea", "workSection"] as const).map((f) => (
                        <td key={f} className="border-r border-white/10 px-1 py-1">
                          <Input
                            value={line[f]}
                            onChange={(e) => updateLine(i, { [f]: e.target.value })}
                            className="h-7 border-white/10 bg-transparent text-xs"
                          />
                        </td>
                      ))}
                      {/* Labour */}
                      <td className="border-r border-white/10 px-1 py-1">
                        <Input
                          type="number" min={0}
                          value={line.labour === 0 ? "" : line.labour}
                          onChange={(e) => updateLine(i, { labour: parseFloat(e.target.value) || 0 })}
                          className="h-7 w-20 border-white/10 bg-transparent text-right text-xs"
                        />
                      </td>
                      {/* Labour Target */}
                      <td className="border-r border-white/10 px-1 py-1">
                        <Input
                          type="number" min={0}
                          value={line.labourTarget === 0 ? "" : line.labourTarget}
                          onChange={(e) => updateLine(i, { labourTarget: parseFloat(e.target.value) || 0 })}
                          className="h-7 w-20 border-amber-500/30 bg-amber-500/5 text-right text-xs text-amber-300 placeholder:text-amber-700"
                          placeholder="0"
                          title="Labour target shown to users when invoicing this variation"
                        />
                      </td>
                      {/* Material */}
                      <td className="border-r border-white/10 px-1 py-1">
                        <Input
                          type="number" min={0}
                          value={line.material === 0 ? "" : line.material}
                          onChange={(e) => updateLine(i, { material: parseFloat(e.target.value) || 0 })}
                          className="h-7 w-20 border-white/10 bg-transparent text-right text-xs"
                        />
                      </td>
                      {/* QTY */}
                      <td className="border-r border-white/10 px-1 py-1">
                        <Input
                          type="number" min={0}
                          value={line.qty === 0 ? "" : line.qty}
                          onChange={(e) => updateLine(i, { qty: parseFloat(e.target.value) || 0 })}
                          className="h-7 w-20 border-white/10 bg-transparent text-right text-xs"
                        />
                      </td>
                      <td className="border-r border-white/10 px-2 py-1 text-right font-medium text-slate-100">
                        {formatGBP(lineTotal(line))}
                      </td>
                      <td className="px-2 py-1">
                        <button onClick={() => removeLine(i)} className="text-slate-500 hover:text-red-400">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/20 bg-white/5">
                    <td colSpan={8} className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Total</td>
                    <td className="px-2 py-2 text-right text-sm font-bold text-slate-100">{formatGBP(formTotal)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Qualifications &amp; Comments</label>
            <textarea
              rows={2}
              value={form.comments}
              onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
              placeholder="Any additional notes…"
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
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
