"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { VariationRow } from "../types"
import { formatGBP } from "../utils"

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

  // Sync state if needed, or simply rely on parent to clear it before opening.
  // We can leave it as controlled or manage local state.

  if (!variation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Variation Details - {variation.voNo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="border border-input bg-slate-900 p-6 text-sm text-slate-200">
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
                <span className="text-slate-400">Site Instruction No:</span>
                <p className="font-medium text-slate-200">{variation.siteInstructionNo}</p>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <p className="font-medium text-amber-300">{variation.approvalStatus}</p>
              </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <span className="text-slate-400">Description of Works:</span>
              <p className="mt-1 text-slate-200">{variation.descriptionOfWorks}</p>
            </div>

            <div className="mt-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-right">Labour</th>
                    <th className="py-2 text-right">Material</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {variation.lines.map((l, i) => {
                    const lineTot = (l.labour + l.material) * l.qty
                    return (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-2">{l.siteInstruction || `Line ${i + 1}`}</td>
                        <td className="py-2 text-right">{formatGBP(l.labour)}</td>
                        <td className="py-2 text-right">{formatGBP(l.material)}</td>
                        <td className="py-2 text-right">{l.qty}</td>
                        <td className="py-2 text-right font-medium text-slate-200">
                          {formatGBP(lineTot)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="py-3 text-right font-medium text-slate-400">Total Amount</td>
                    <td className="py-3 text-right font-bold text-white">
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

          {/* Submit to Client Section */}
          <div className="rounded-lg border border-white/10 bg-slate-900/50 p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Submit to Client for Signature</h3>
            
            {variation.submittedToClient ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Already submitted to client</span>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
