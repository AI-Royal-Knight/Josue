"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { RotateCcw, Loader2 } from "lucide-react"

export type ReQuoteTarget = {
    id: string
    no: number
    quotesRef: string
    supplierName: string
    quoteTotal: string
}

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    target: ReQuoteTarget | null
    onSubmit: (comments: string) => Promise<void>
}

export default function ReQuoteDialog({
    open,
    onOpenChange,
    target,
    onSubmit,
}: Props) {
    const [comments, setComments] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async () => {
        if (!target) return
        setIsLoading(true)
        try {
            await onSubmit(comments)
            setComments("")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setComments("")
        onOpenChange(false)
    }

    if (!target) return null

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RotateCcw className="size-5 text-amber-400" />
                        Request Re-quote
                    </DialogTitle>
                    <DialogDescription>
                        Request a revised quotation from{" "}
                        <span className="font-medium text-slate-200">
                            {target.supplierName}
                        </span>{" "}
                        for quote <span className="font-medium text-slate-200">{target.quotesRef}</span>
                        {" "}({target.quoteTotal}).
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="requote-comments"
                            className="mb-1.5 block text-xs font-medium text-slate-400"
                        >
                            Comments / reason for re-quote
                        </label>
                        <Textarea
                            id="requote-comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Explain why a re-quote is needed (e.g. pricing mismatch, revised scope, alternative materials...)"
                            className="min-h-[120px] resize-y border-white/10 bg-slate-800 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20"
                            autoFocus
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="border-white/10 text-xs text-slate-300 hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!comments.trim() || isLoading}
                        className="bg-amber-600 text-xs text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isLoading ? (
                            <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                            <RotateCcw className="size-3.5" />
                        )}
                        {isLoading ? "Requesting..." : "Request Re-quote"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
