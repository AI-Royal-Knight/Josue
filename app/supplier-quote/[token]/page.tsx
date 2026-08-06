"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getSupplierQuotation, submitSupplierQuotation, Quotation, QuotationLineItem } from "@/lib/api/quotations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Upload, CheckCircle2 } from "lucide-react"

export default function SupplierQuotePage() {
  const { token } = useParams() as { token: string }
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  // State for tracking the updated prices and the uploaded PDF
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (!token) return
    
    getSupplierQuotation(token)
      .then((data) => {
        setQuotation(data)
        // Initialize prices from backend if any exist (e.g. if supplier revisits)
        if (data.line_items) {
          const initialPrices: Record<string, string> = {}
          data.line_items.forEach((item) => {
            if (item.id) {
              // @ts-ignore: supplier_price may not be typed yet in QuotationLineItem
              initialPrices[item.id] = item.supplier_price || ""
            }
          })
          setPrices(initialPrices)
        }
      })
      .catch((error) => {
        console.error(error)
        toast.error("Failed to load quotation details. The link may be invalid or expired.")
      })
      .finally(() => setLoading(false))
  }, [token])

  const handlePriceChange = (id: string, value: string) => {
    // Basic validation to only allow numbers and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPrices(prev => ({ ...prev, [id]: value }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type !== "application/pdf") {
        toast.error("Please select a PDF file.")
        e.target.value = "" // clear input
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async () => {
    if (!token) return

    setSubmitting(true)
    const formData = new FormData()

    if (file) {
      formData.append("supplier_quote_pdf", file)
    }

    // Format line items to array of objects
    const itemsData = Object.entries(prices)
      .filter(([_, price]) => price !== "") // only send items with prices
      .map(([id, price]) => ({
        id: id,
        supplier_price: parseFloat(price)
      }))

    if (itemsData.length > 0) {
      formData.append("line_items", JSON.stringify(itemsData))
    }
    
    if (itemsData.length === 0 && !file) {
      toast.error("Please enter at least one price or upload a quote PDF.")
      setSubmitting(false)
      return
    }

    try {
      await submitSupplierQuotation(token, formData)
      setIsSubmitted(true)
      toast.success("Quotation submitted successfully!")
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while submitting. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Quotation not found or invalid link.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-muted/20">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Submission Successful</CardTitle>
            <CardDescription className="text-base mt-2">
              Thank you! Your quotation has been successfully submitted and received by our team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You may now safely close this window or tab.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-10 mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Submit Quotation Pricing</h1>
        <p className="text-muted-foreground">
          Please review the requested items below. You can submit your pricing per item or upload your official quotation PDF.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quotation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Reference:</span>
              <span>{quotation.quote_ref}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Project:</span>
              <span>{quotation.project_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date Issued:</span>
              <span>{new Date(quotation.date_of_quote).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span>{quotation.status}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Quotation PDF</CardTitle>
            <CardDescription>Upload your official quotation document (PDF only).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input 
                id="quote_pdf" 
                type="file" 
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>
            {file && (
              <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                <Upload className="w-4 h-4" /> Selected: {file.name}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <CardDescription>Enter your unit price for the requested items.</CardDescription>
        </CardHeader>
        <CardContent>
          {quotation.line_items && quotation.line_items.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No.</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Per</TableHead>
                    <TableHead className="w-[200px]">Your Price (Unit)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotation.line_items.map((item, index) => (
                    <TableRow key={item.id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.qty}</TableCell>
                      <TableCell>{item.per || "Each"}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>$</span>
                          <Input
                            type="text"
                            placeholder="0.00"
                            value={item.id ? prices[item.id] : ""}
                            onChange={(e) => item.id && handlePriceChange(item.id, e.target.value)}
                            disabled={!item.id}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">No line items found for this quotation.</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t pt-6 mt-6">
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || quotation.status !== "Pending"}
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {quotation.status !== "Pending" ? "Quotation is already processed" : "Submit Quote"}
          </Button>
        </CardFooter>
      </Card>

      {quotation.history && quotation.history.length > 0 && (
        <div className="mt-12 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Re-quote History</h2>
          <p className="text-sm text-muted-foreground">Previous feedback and submissions for this quotation.</p>
          
          <div className="relative border-l-2 border-white/10 ml-3 pl-6 space-y-8 mt-6">
            {quotation.history.map((h: any, i: number) => (
              <div key={h.id || i} className="relative">
                <div className="absolute w-3 h-3 bg-amber-500 rounded-full -left-[31px] top-1.5 ring-4 ring-background" />
                <Card className="shadow-sm border-white/10 overflow-hidden bg-card">
                  <div className="bg-slate-800/30 px-5 py-3 border-b border-white/10 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400">
                      {new Date(h.date_recorded).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      Previous Total: £{Number(h.previous_total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <CardContent className="p-5">
                    {h.message && (
                      <div className="mb-4">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 block mb-2">Procurement Feedback</span>
                        <div className="p-3.5 bg-white/5 border border-white/10 rounded-md text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {h.message}
                        </div>
                      </div>
                    )}
                    {h.previous_pdf && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <a 
                          href={h.previous_pdf.startsWith('http') ? h.previous_pdf : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '')}${h.previous_pdf}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 px-3 py-1.5 rounded-md"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          View Previous PDF Submission
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
