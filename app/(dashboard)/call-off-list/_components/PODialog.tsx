"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Send } from "lucide-react"
import { PODialogState } from "../types"
import { cn } from "@/lib/utils"
import { formatGBP } from "../utils"

type Props = {
  dialogState: PODialogState | null
  onOpenChange: (open: boolean) => void
  onUpdateOrderQty: (callOffRef: string, qty: number) => void
  onSendClick: () => void
  hasOrder: boolean
  orderTotal: number
}

export default function PODialog({
  dialogState,
  onOpenChange,
  onUpdateOrderQty,
  onSendClick,
  hasOrder,
  orderTotal,
}: Props) {
  return (
    <Dialog open={!!dialogState} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogState?.poRef} — Call-Off Order</DialogTitle>
          <DialogDescription>
            Supplier:{" "}
            <span className="font-medium text-slate-200">
              {dialogState?.supplierName}
            </span>{" "}
            &lt;{dialogState?.supplierEmail}&gt;
            <br />
            Enter quantity to order for each line, then send to supplier.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-xs tracking-wide text-slate-400 uppercase">
                {[
                  "Call Off Ref",
                  "Description",
                  "Unit",
                  "Unit Price",
                  "QTY Remaining",
                  "Expected Delivery",
                  "Order QTY",
                  "Line Total",
                ].map((h) => (
                  <th
                    key={h}
                    className="border-r border-white/10 px-3 py-2 text-left last:border-r-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dialogState?.lines.map((line) => {
                const isFocused = line.callOffRef === dialogState.focusRef
                const lineTotal = line.orderQty * line.unitPriceNum
                return (
                  <tr
                    key={line.callOffRef}
                    className={cn(
                      "border-b border-white/10 last:border-b-0",
                      isFocused
                        ? "bg-blue-500/10 ring-1 ring-blue-500/30 ring-inset"
                        : "odd:bg-white/[0.02]"
                    )}
                  >
                    <td className="border-r border-white/10 px-3 py-2 font-medium text-blue-300">
                      {line.callOffRef}
                    </td>
                    <td className="border-r border-white/10 px-3 py-2 text-slate-200">
                      {line.productDescription}
                    </td>
                    <td className="border-r border-white/10 px-3 py-2 text-center text-slate-300">
                      {line.unit}
                    </td>
                    <td className="border-r border-white/10 px-3 py-2 text-right text-slate-300">
                      {line.unitPrice}
                    </td>
                    <td className="border-r border-white/10 px-3 py-2 text-right text-slate-300">
                      {line.qtyRemaining}
                    </td>
                    <td className="border-r border-white/10 px-3 py-2 text-right text-slate-300">
                      {line.expectedDelivery}
                    </td>
                    <td className="border-r border-white/10 px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        max={line.qtyRemaining}
                        value={line.orderQty === 0 ? "" : line.orderQty}
                        placeholder="0"
                        className="h-8 w-24 text-center text-sm"
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10)
                          onUpdateOrderQty(
                            line.callOffRef,
                            isNaN(v) ? 0 : Math.min(v, line.qtyRemaining)
                          )
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-100">
                      {lineTotal > 0 ? formatGBP(lineTotal) : "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/20 bg-white/5">
                <td
                  colSpan={7}
                  className="px-3 py-2 text-right text-xs font-semibold tracking-wide text-slate-400 uppercase"
                >
                  Order Total
                </td>
                <td className="px-3 py-2 text-right text-sm font-bold text-slate-100">
                  {orderTotal > 0 ? formatGBP(orderTotal) : "—"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!hasOrder} onClick={onSendClick}>
            <Send className="mr-2 size-4" /> Submit for Approval
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
