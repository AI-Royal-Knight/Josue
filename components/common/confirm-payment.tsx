import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'

export default function ConfirmPaymentDialog({
  open,
  onOpenChange,
  supplierName,
  nextPaid,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierName: string
  nextPaid: boolean
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Confirm payment status</DialogTitle>
          <DialogDescription>
            {nextPaid
              ? `Mark ${supplierName} as paid?`
              : `Mark ${supplierName} as unpaid?`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
