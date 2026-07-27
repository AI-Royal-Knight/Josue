"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { History, Download } from "lucide-react"
import { HistoryDialogState } from "../types"
import { formatGBP, downloadCSV } from "../utils"

type Props = {
  dialogState: HistoryDialogState | null
  onOpenChange: (open: boolean) => void
}

export default function HistoryDialog({ dialogState, onOpenChange }: Props) {
  return (
    <Dialog open={!!dialogState} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5" /> Call-Off History
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-slate-400">PO Ref: </span>
                <span className="font-medium text-slate-200">{dialogState?.poRef}</span>
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-slate-400">Call Off Ref: </span>
                <span className="font-medium text-slate-200">{dialogState?.callOffRef}</span>
              </div>
              <div>
                <span className="text-slate-400">Product: </span>
                <span className="font-medium text-slate-200">{dialogState?.productDescription}</span>
              </div>
              <div>
                <span className="text-slate-400">Supplier: </span>
                <span className="font-medium text-slate-200">{dialogState?.supplierName}</span>
                {dialogState?.supplierEmail && (
                  <>
                    <span className="mx-2 text-slate-600">·</span>
                    <span className="text-slate-400">Email: </span>
                    <span className="font-medium text-slate-200">{dialogState?.supplierEmail}</span>
                  </>
                )}
              </div>
              <div className="flex gap-4">
                <span><span className="text-slate-400">Total QTY: </span><span className="text-slate-200">{dialogState?.totalQty} {dialogState?.unit}</span></span>
                <span><span className="text-slate-400">Unit Price: </span><span className="text-slate-200">{dialogState?.unitPrice}</span></span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 overflow-x-auto">
          {dialogState && dialogState.history.length > 0 ? (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                  {["Call Off Ref", "Date", "QTY", "Price", "Called Off By", "Approved By", "Expected Delivery"].map((h) => (
                    <th key={h} className="border-r border-white/10 px-3 py-2 text-left last:border-r-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dialogState.history.map((entry, i) => (
                  <tr key={i} className="border-b border-white/10 last:border-b-0 odd:bg-white/[0.02]">
                    <td className="border-r border-white/10 px-3 py-2 font-medium text-blue-300">{entry.callOffRef}</td>
                    <td className="border-r border-white/10 px-3 py-2 text-slate-300">{entry.callOffDate}</td>
                    <td className="border-r border-white/10 px-3 py-2 text-right text-slate-200">{entry.callOffQty}</td>
                    <td className="border-r border-white/10 px-3 py-2 text-right text-slate-200">{entry.callOffPrice}</td>
                    <td className="border-r border-white/10 px-3 py-2 text-slate-300">{entry.callOffBy}</td>
                    <td className="border-r border-white/10 px-3 py-2 text-slate-300">{entry.approveBy}</td>
                    <td className="px-3 py-2 text-slate-300">{entry.expectedDeliveryDate}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/20 bg-white/5">
                  <td colSpan={2} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Total Called Off</td>
                  <td className="px-3 py-2 text-right text-sm font-bold text-slate-100">
                    {dialogState.history.reduce((s, e) => s + e.callOffQty, 0)} {dialogState.unit}
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-bold text-slate-100">
                    {formatGBP(dialogState.history.reduce((s, e) => s + (parseFloat(e.callOffPrice.replace(/[^0-9.]/g, "")) || 0), 0))}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="py-6 text-center text-sm text-slate-500">No call-offs made against this line yet.</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {dialogState && dialogState.history.length > 0 && (
            <Button onClick={() => downloadCSV(`call-off-history-${dialogState.callOffRef}.csv`, dialogState.history, dialogState)}>
              <Download className="mr-2 size-4" /> Download CSV
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
