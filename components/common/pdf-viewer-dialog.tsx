"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, AlertCircle } from "lucide-react"

export type PdfViewerDialogProps = {
    /** Whether the dialog is open */
    open: boolean
    /** Callback to close the dialog */
    onOpenChange: (open: boolean) => void
    /** Title shown in the dialog header */
    title: string
    /**
     * Function that returns a Blob of the PDF to display.
     * Called each time the dialog opens.
     */
    getPdf: () => Blob | Promise<Blob>
}

/**
 * A reusable dialog that renders a PDF inside an iframe.
 *
 * Usage:
 * ```tsx
 * <PdfViewerDialog
 *   open={showPdf}
 *   onOpenChange={setShowPdf}
 *   title="Invoice INV-001"
 *   getPdf={() => generateSimplePdf({ ... })}
 * />
 * ```
 */
export default function PdfViewerDialog({
    open,
    onOpenChange,
    title,
    getPdf,
}: PdfViewerDialogProps) {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const urlRef = useRef<string | null>(null)

    // Cleanup object URL
    const revokeUrl = useCallback(() => {
        if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current)
            urlRef.current = null
        }
    }, [])

    // Generate PDF when dialog opens
    useEffect(() => {
        if (!open) {
            revokeUrl()
            setPdfUrl(null)
            setError(null)
            return
        }

        let cancelled = false
        setLoading(true)
        setError(null)

        const generate = async () => {
            try {
                const blob = await Promise.resolve(getPdf())
                if (cancelled) return
                revokeUrl()
                const url = URL.createObjectURL(blob)
                urlRef.current = url
                if (!cancelled) {
                    setPdfUrl(url)
                    setLoading(false)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to generate PDF")
                    setLoading(false)
                }
            }
        }

        generate()

        return () => {
            cancelled = true
        }
    }, [open, getPdf, revokeUrl])

    // Cleanup on unmount
    useEffect(() => {
        return () => revokeUrl()
    }, [revokeUrl])

    // Handle close
    const handleClose = useCallback(
        (val: boolean) => {
            if (!val) {
                revokeUrl()
                setPdfUrl(null)
                setError(null)
            }
            onOpenChange(val)
        },
        [onOpenChange, revokeUrl]
    )

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="flex h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] flex-col">
                <DialogHeader>
                    <DialogTitle>PDF Preview — {title}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Loader2 className="size-4 animate-spin" />
                            Generating PDF…
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-400">
                            <AlertCircle className="size-4" />
                            {error}
                        </div>
                    )}

                    {pdfUrl && !loading && (
                        <iframe
                            src={pdfUrl}
                            className="h-full w-full rounded border border-white/10 bg-white"
                            title={title}
                        />
                    )}
                </div>

                <p className="mt-2 text-center text-[11px] text-slate-500">
                    Dummy PDF preview — generated inline (no PDF library required).
                </p>
            </DialogContent>
        </Dialog>
    )
}
