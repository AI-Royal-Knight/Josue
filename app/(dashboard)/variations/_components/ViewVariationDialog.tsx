"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { VariationRow } from "../types"
import { formatGBP } from "../utils"
import { useRoleStore } from "@/lib/role-store"
import { Paperclip, ExternalLink, CheckCircle2 } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  variation: VariationRow | null
  onDownload: (row: VariationRow) => void
  onSubmitToClient: (name: string, email: string) => void
  isSubmitting: boolean
}

export default function ViewVariationDialog({
  open, onOpenChange, variation, onDownload, onSubmitToClient, isSubmitting
}: Props) {
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")

  const role = useRoleStore((s) => s.role)
  const isCommercial = role === "commercial_department"

  useEffect(() => {
    if (variation) {
      setClientName(variation.clientName || variation.attentionOf || "")
      setClientEmail(variation.clientEmail || "")
    }
  }, [variation, open])

  if (!variation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] sm:max-w-[760px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Variation Details - {variation.voNo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="border border-white/10 bg-slate-900 p-6 text-sm text-slate-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">VARIATION ORDER</h2>
                <p className="text-slate-400">{variation.project}</p>
              </div>
              <div className="text-right">
                <div className="font-medium text-white">{variation.voNo}</div>
                <div className="text-slate-400">{variation.date}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-xs">Site Instruction No:</span>
                <p className="font-medium text-slate-200">{variation.siteInstructionNo || "—"}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Status:</span>
                <p className="font-medium text-amber-300">{variation.approvalStatus}</p>
              </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <span className="text-slate-400 text-xs">Description of Works:</span>
              <p className="mt-1 text-slate-200 break-words whitespace-pre-wrap leading-relaxed text-sm">
                {variation.descriptionOfWorks || "—"}
              </p>
            </div>

            {/* Attached Evidence View */}
            {variation.evidence_url && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Attached Evidence</span>
                <div className="mt-2 flex items-center justify-between rounded border border-white/10 bg-slate-950/60 p-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Paperclip className="size-4 shrink-0 text-emerald-400" />
                    <span className="truncate text-xs text-slate-200">
                      {variation.evidence_url.split("/").pop() || "Evidence Document"}
                    </span>
                  </div>
                  <a
                    href={variation.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/20 transition-colors"
                  >
                    <ExternalLink className="size-3" /> View / Download
                  </a>
                </div>
              </div>
            )}

            {/* Line Items Table with text wrapping */}
            <div className="mt-6">
              <table className="w-full text-left text-xs table-fixed">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2 w-[44%]">Item / Description</th>
                    <th className="py-2 text-right w-[14%]">Labour</th>
                    <th className="py-2 text-right w-[14%]">Material</th>
                    <th className="py-2 text-right w-[12%]">Qty</th>
                    <th className="py-2 text-right w-[16%]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {variation.lines.map((l, i) => {
                    const lineTot = (l.labour + l.material) * l.qty
                    return (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-2 break-words whitespace-pre-wrap leading-relaxed align-top pr-2 text-slate-200">
                          {l.siteInstruction || `Item ${i + 1}`}
                        </td>
                        <td className="py-2 text-right align-top whitespace-nowrap">{formatGBP(l.labour)}</td>
                        <td className="py-2 text-right align-top whitespace-nowrap">{formatGBP(l.material)}</td>
                        <td className="py-2 text-right align-top whitespace-nowrap">{l.qty}</td>
                        <td className="py-2 text-right font-medium text-slate-200 align-top whitespace-nowrap">
                          {formatGBP(lineTot)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="py-3 text-right font-medium text-slate-400 border-t border-white/10">Total Amount</td>
                    <td className="py-3 text-right font-bold text-white border-t border-white/10 whitespace-nowrap">
                      {formatGBP(variation.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-8 flex justify-end">
              <Button variant="secondary" onClick={() => onDownload(variation)}>
                Download Document
              </Button>
            </div>
          </div>

          {/* Submit to Client Section - Only accessible to Commercial Department */}
          <div className="rounded-lg border border-white/10 bg-slate-900/50 p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Issue to Client for Signature</h3>
            
            {variation.submittedToClient ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="size-5" />
                <span className="text-sm font-medium">Already issued to client</span>
                {variation.clientEmail && (
                  <span className="text-xs text-slate-400">({variation.clientEmail})</span>
                )}
              </div>
            ) : isCommercial ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Client Name</label>
                    <Input 
                      placeholder="e.g. John Doe"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Client Email Address</label>
                    <Input 
                      type="email"
                      placeholder="e.g. john@client.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="bg-slate-900"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => onSubmitToClient(clientName, clientEmail)}
                    disabled={!clientName || !clientEmail || isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit to Client"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">
                This variation has not been issued to the client yet. Issuing variations to clients must be performed by the Commercial Department.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
