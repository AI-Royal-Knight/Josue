"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { VariationRow } from "../types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  variation: VariationRow | null
  onSendReminder: () => void
  isSending: boolean
}

export default function ReminderDialog({
  open, onOpenChange, variation, onSendReminder, isSending
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Reminder</DialogTitle>
          <DialogDescription>
            This will send an email reminder to the client to sign variation {variation?.voNo}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {variation?.submittedToClient ? (
            <p className="text-sm text-slate-300">
              The variation was already submitted to the client. Would you like to send a follow-up reminder?
            </p>
          ) : (
            <p className="text-sm text-amber-400">
              Warning: This variation hasn't been submitted to the client yet. You may want to submit it first before sending a reminder.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={onSendReminder}
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send Reminder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
