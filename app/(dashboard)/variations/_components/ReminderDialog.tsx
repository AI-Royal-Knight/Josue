"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { VariationRow } from "../types"
import { Mail, Loader2 } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  variation: VariationRow | null
  onSendReminder: (email: string) => void
  isSending: boolean
}

export default function ReminderDialog({
  open, onOpenChange, variation, onSendReminder, isSending
}: Props) {
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (variation) {
      setEmail(variation.clientEmail || "")
    }
  }, [variation, open])

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <Mail className="size-4 text-amber-400" /> Send Client Reminder
          </DialogTitle>
          <DialogDescription>
            Send an email reminder to the client to sign variation <span className="font-semibold text-white">{variation?.voNo}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Client Email Address <span className="text-red-400">*</span>
            </label>
            <Input
              type="email"
              placeholder="e.g. client@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/10 bg-slate-900 text-slate-100 placeholder:text-slate-500"
            />
            {!email.trim() ? (
              <p className="text-[11px] text-amber-400">
                Please provide the client&apos;s email address to send the reminder.
              </p>
            ) : !isValidEmail(email) ? (
              <p className="text-[11px] text-red-400">
                Please enter a valid email address.
              </p>
            ) : null}
          </div>

          {variation?.submittedToClient ? (
            <p className="text-xs text-slate-400">
              This variation has already been issued to the client. Sending a reminder will notify them again.
            </p>
          ) : (
            <div className="rounded border border-amber-500/20 bg-amber-500/10 p-2 text-xs text-amber-300">
              Note: This variation has not been marked as issued to the client yet.
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSendReminder(email.trim())}
            disabled={!isValidEmail(email) || isSending}
            className="bg-amber-600 hover:bg-amber-500 text-white"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Sending...
              </>
            ) : (
              "Send Reminder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
