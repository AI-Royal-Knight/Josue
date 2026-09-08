"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  AlertCircle,
  ArrowLeftRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Loader2,
  LogOut,
  Plus,
  Receipt,
  RotateCcw,
  RotateCw,
  Search,
  UploadCloud,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getSupplierCompanies,
  getSupplierInvoices,
  submitSupplierInvoice,
  getSupplierQuotations,
  submitSupplierQuotationById,
  type SupplierCompanyRelationship,
  type SupplierInvoice,
  type Quotation,
  type QuotationLineItem,
} from "@/lib/api/suppliers"
import { getApiBaseUrl } from "@/lib/api/client"
import { useAuthStore } from "@/lib/auth-store"
import { useSupplierStore } from "@/lib/supplier-store"

export default function SupplierPortalPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { activeCompanyId, activeCompanyName, setActiveCompany } = useSupplierStore()

  // Navigation tab: "quotations" | "invoices"
  const [activeTab, setActiveTab] = useState<"quotations" | "invoices">("quotations")

  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<SupplierCompanyRelationship[]>([])

  // Quotations State
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [quotationsLoading, setQuotationsLoading] = useState(false)
  const [quotationSearch, setQuotationSearch] = useState("")
  const [quotationStatusFilter, setQuotationStatusFilter] = useState<string>("all")

  // Invoices State
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [invoiceSearch, setInvoiceSearch] = useState("")

  // Quote Review & Pricing Modal State
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [quotePrices, setQuotePrices] = useState<Record<string, string>>({})
  const [quotePdfFile, setQuotePdfFile] = useState<File | null>(null)
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false)
  const [copiedRef, setCopiedRef] = useState<string | null>(null)

  // Invoice Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [selectedInvoiceFile, setSelectedInvoiceFile] = useState<File | null>(null)

  // 1. Validate auth & resolve active company
  useEffect(() => {
    const token = localStorage.getItem("tresta:accessToken")
    if (!token) {
      router.push("/supplier/login")
      return
    }

    async function initPortal() {
      try {
        const companyList = await getSupplierCompanies()
        setCompanies(companyList)

        const activeList = companyList.filter((c) => c.relationship_status === "active")

        if (activeList.length === 0) {
          setLoading(false)
          return
        }

        // If no active company is set, or current set company is not active:
        if (!activeCompanyId || !activeList.some((c) => c.company_id === activeCompanyId)) {
          if (activeList.length === 1) {
            setActiveCompany(activeList[0].company_id, activeList[0].company_name)
          } else {
            // Multiple active companies -> redirect to selector
            router.push("/supplier/companies")
            return
          }
        }
      } catch (err) {
        console.error("Failed to initialize supplier portal:", err)
      } finally {
        setLoading(false)
      }
    }

    initPortal()
  }, [activeCompanyId, setActiveCompany, router])

  // 2. Fetch quotations
  const loadQuotations = useCallback(async () => {
    if (!activeCompanyId) return
    setQuotationsLoading(true)
    try {
      const data = await getSupplierQuotations(activeCompanyId)
      setQuotations(data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load quotations.")
    } finally {
      setQuotationsLoading(false)
    }
  }, [activeCompanyId])

  // 3. Fetch invoices
  const loadInvoices = useCallback(async () => {
    if (!activeCompanyId) return
    setInvoicesLoading(true)
    try {
      const data = await getSupplierInvoices(activeCompanyId)
      setInvoices(data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load invoices.")
    } finally {
      setInvoicesLoading(false)
    }
  }, [activeCompanyId])

  useEffect(() => {
    if (activeCompanyId) {
      loadQuotations()
      loadInvoices()
    }
  }, [activeCompanyId, loadQuotations, loadInvoices])

  // Handle open quote modal
  const handleOpenQuoteModal = (quote: Quotation) => {
    setSelectedQuote(quote)
    const initialPrices: Record<string, string> = {}
    if (quote.line_items) {
      quote.line_items.forEach((item) => {
        if (item.id) {
          initialPrices[String(item.id)] = item.supplier_price != null ? String(item.supplier_price) : ""
        }
      })
    }
    setQuotePrices(initialPrices)
    setQuotePdfFile(null)
    setIsQuoteModalOpen(true)
  }

  // Calculate live total in modal
  const calculateModalTotal = () => {
    if (!selectedQuote || !selectedQuote.line_items) return 0
    return selectedQuote.line_items.reduce((acc, item) => {
      const enteredPrice = quotePrices[String(item.id)]
      const price = enteredPrice !== undefined && enteredPrice !== ""
        ? parseFloat(enteredPrice) || 0
        : (item.each || 0)
      const qty = Number(item.qty) || 1
      const discount = Number(item.discount) || 0
      return acc + (qty * price * (1 - discount / 100))
    }, 0)
  }

  // Submit quote pricing
  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeCompanyId || !selectedQuote) return

    const itemsData = Object.entries(quotePrices)
      .filter(([_, price]) => price !== "")
      .map(([id, price]) => ({
        id,
        supplier_price: parseFloat(price)
      }))

    if (itemsData.length === 0 && !quotePdfFile) {
      toast.error("Please enter at least one unit price or attach your quote PDF.")
      return
    }

    setIsSubmittingQuote(true)
    try {
      const formData = new FormData()
      if (quotePdfFile) {
        formData.append("supplier_quote_pdf", quotePdfFile)
      }
      if (itemsData.length > 0) {
        formData.append("line_items", JSON.stringify(itemsData))
      }

      await submitSupplierQuotationById(activeCompanyId, selectedQuote.id, formData)
      toast.success(`Pricing submitted for quote ${selectedQuote.quote_ref}!`)
      setIsQuoteModalOpen(false)
      loadQuotations()
    } catch (err: any) {
      toast.error(err.message || "Failed to submit quote.")
    } finally {
      setIsSubmittingQuote(false)
    }
  }

  // Handle invoice submission
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!activeCompanyId) {
      toast.error("No company selected.")
      return
    }

    if (!invoiceNumber.trim()) {
      toast.error("Invoice number is required.")
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0.")
      return
    }

    const formData = new FormData()
    formData.append("invoice_number", invoiceNumber.trim())
    formData.append("invoice_date", invoiceDate)
    formData.append("amount", amount.trim())
    if (description.trim()) {
      formData.append("description", description.trim())
    }
    if (selectedInvoiceFile) {
      formData.append("file", selectedInvoiceFile)
    }

    setIsSubmittingInvoice(true)
    try {
      await submitSupplierInvoice(activeCompanyId, formData)
      toast.success("Invoice submitted successfully!")
      setIsUploadOpen(false)

      // Reset form
      setInvoiceNumber("")
      setAmount("")
      setDescription("")
      setSelectedInvoiceFile(null)

      // Reload list
      loadInvoices()
    } catch (err: any) {
      toast.error(err.message || "Failed to submit invoice.")
    } finally {
      setIsSubmittingInvoice(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/supplier/login")
  }

  const copyQuoteRef = (ref: string) => {
    navigator.clipboard.writeText(ref)
    setCopiedRef(ref)
    toast.success(`Copied ${ref} to clipboard`)
    setTimeout(() => setCopiedRef(null), 2000)
  }

  // Quotation Filtering & Metrics
  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quote_ref.toLowerCase().includes(quotationSearch.toLowerCase()) ||
      (q.project_name && q.project_name.toLowerCase().includes(quotationSearch.toLowerCase())) ||
      (q.variation_ref && q.variation_ref.toLowerCase().includes(quotationSearch.toLowerCase()))

    if (!matchesSearch) return false

    const hasPricing = Boolean(q.supplier_quote_pdf || q.line_items?.some((i) => i.supplier_price != null))
    const isApproved = q.status === "Approved"
    const isRejected = q.status === "Rejected"
    const isRequote = Boolean(q.requote_comments && q.status === "Pending")

    if (quotationStatusFilter === "action_required") {
      return (q.status === "Pending" && !hasPricing) || isRequote
    }
    if (quotationStatusFilter === "submitted") {
      return hasPricing && !isApproved && !isRejected && !isRequote
    }
    if (quotationStatusFilter === "approved") {
      return isApproved
    }
    if (quotationStatusFilter === "rejected") {
      return isRejected
    }
    return true
  })

  const totalRfqCount = quotations.length
  const actionRequiredCount = quotations.filter(
    (q) =>
      (q.status === "Pending" &&
        !q.supplier_quote_pdf &&
        !q.line_items?.some((i) => i.supplier_price != null)) ||
      Boolean(q.requote_comments && q.status === "Pending")
  ).length
  const submittedCount = quotations.filter(
    (q) =>
      (q.supplier_quote_pdf || q.line_items?.some((i) => i.supplier_price != null)) &&
      q.status !== "Approved" &&
      q.status !== "Rejected" &&
      !q.requote_comments
  ).length
  const approvedRfqCount = quotations.filter((q) => q.status === "Approved").length

  // Invoice Filtering & Metrics
  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoice_number.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.description.toLowerCase().includes(invoiceSearch.toLowerCase())
  )

  const totalInvoiceAmount = invoices.reduce(
    (sum, inv) => sum + parseFloat(inv.amount || "0"),
    0
  )
  const approvedInvoiceCount = invoices.filter(
    (i) => i.status === "approved" || i.status === "paid"
  ).length
  const processingInvoiceCount = invoices.filter(
    (i) => i.status === "submitted" || i.status === "processing"
  ).length

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070d18] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const activeCount = companies.filter((c) => c.relationship_status === "active").length

  return (
    <div className="min-h-screen bg-[#070d18] text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d1527]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white">Trust.Cloud</span>
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
                  Supplier Portal
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Company Switcher Pill */}
            {activeCompanyName && (
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                <span className="text-slate-400">Client:</span>
                <span className="font-semibold text-white">{activeCompanyName}</span>
                {activeCount > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-6 px-2 text-[11px] text-blue-400 hover:text-blue-300"
                  >
                    <Link href="/supplier/companies">
                      <ArrowLeftRight className="mr-1 h-3 w-3" />
                      Switch
                    </Link>
                  </Button>
                )}
              </div>
            )}

            <div className="hidden sm:block text-right text-xs">
              <div className="font-medium text-slate-200">{user?.email}</div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-rose-500/10 hover:text-rose-400"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {!activeCompanyId ? (
          /* Empty State: No active company */
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-slate-600" />
            <h2 className="mt-4 text-xl font-bold text-white">
              No Active Company Relationship
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              You don&apos;t currently have an active client company selected. If you were recently
              invited, please accept the invitation link from your email.
            </p>
            <div className="mt-6">
              <Button asChild className="bg-blue-600 hover:bg-blue-500">
                <Link href="/supplier/companies">View Company Status</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <button
                type="button"
                onClick={() => setActiveTab("quotations")}
                className={`group flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === "quotations"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-1 ring-blue-400/30"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Quotations (RFQs)</span>
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                    activeTab === "quotations"
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  {quotations.length}
                </span>
                {actionRequiredCount > 0 && (
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("invoices")}
                className={`group flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === "invoices"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-1 ring-blue-400/30"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Receipt className="h-4 w-4" />
                <span>Invoices</span>
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                    activeTab === "invoices"
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  {invoices.length}
                </span>
              </button>
            </div>

            {/* TAB 1: QUOTATIONS / RFQs */}
            {activeTab === "quotations" && (
              <div className="space-y-6">
                {/* Header with Title and Refresh */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                      Requests for Quotation (RFQs)
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                      Review quotation requests from{" "}
                      <span className="text-white font-medium">{activeCompanyName}</span>, enter
                      line item pricing, and submit your quotes.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadQuotations()}
                      disabled={quotationsLoading}
                      className="border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10"
                    >
                      <RotateCw
                        className={`mr-1.5 h-3.5 w-3.5 ${
                          quotationsLoading ? "animate-spin text-blue-400" : ""
                        }`}
                      />
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* Quotation Metrics */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-xl border border-white/10 bg-[#0d1527]/80 p-4">
                    <div className="text-xs text-slate-400">Total RFQs</div>
                    <div className="mt-1 text-2xl font-bold text-white">{totalRfqCount}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0d1527]/80 p-4">
                    <div className="text-xs text-slate-400">Action Required</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-2xl font-bold text-amber-400">
                        {actionRequiredCount}
                      </span>
                      {actionRequiredCount > 0 && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 ring-1 ring-amber-500/30">
                          Pending Quote
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0d1527]/80 p-4">
                    <div className="text-xs text-slate-400">Pricing Submitted</div>
                    <div className="mt-1 text-2xl font-bold text-blue-400">{submittedCount}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0d1527]/80 p-4">
                    <div className="text-xs text-slate-400">Approved Quotes</div>
                    <div className="mt-1 text-2xl font-bold text-emerald-400">
                      {approvedRfqCount}
                    </div>
                  </div>
                </div>

                {/* Quotations List Table */}
                <div className="rounded-2xl border border-white/10 bg-[#0d1527]/90 p-6 shadow-xl backdrop-blur-xl">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { id: "all", label: "All RFQs" },
                        { id: "action_required", label: `Action Required (${actionRequiredCount})` },
                        { id: "submitted", label: `Submitted (${submittedCount})` },
                        { id: "approved", label: "Approved" },
                        { id: "rejected", label: "Rejected" },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setQuotationStatusFilter(filter.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            quotationStatusFilter === filter.id
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Search quote ref, project..."
                        value={quotationSearch}
                        onChange={(e) => setQuotationSearch(e.target.value)}
                        className="border-white/10 bg-white/5 pl-9 text-xs text-white"
                      />
                    </div>
                  </div>

                  {quotationsLoading ? (
                    <div className="flex h-48 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                  ) : filteredQuotations.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
                      <FileSpreadsheet className="mx-auto h-10 w-10 text-slate-600" />
                      <h3 className="mt-3 text-sm font-semibold text-white">
                        No Quotations Found
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {quotationSearch
                          ? "No quotations match your search query."
                          : `There are currently no quotation requests from ${activeCompanyName}.`}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/10 text-xs text-slate-400">
                            <th className="pb-3 font-semibold">Quote Ref</th>
                            <th className="pb-3 font-semibold">Project</th>
                            <th className="pb-3 font-semibold">Date of RFQ</th>
                            <th className="pb-3 font-semibold">Line Items</th>
                            <th className="pb-3 font-semibold">Quote Total</th>
                            <th className="pb-3 font-semibold">Status</th>
                            <th className="pb-3 font-semibold">Quote PDF</th>
                            <th className="pb-3 text-right font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredQuotations.map((quote) => {
                            const hasPricing = Boolean(
                              quote.supplier_quote_pdf ||
                                quote.line_items?.some((i) => i.supplier_price != null)
                            )
                            const isRequote = Boolean(
                              quote.requote_comments && quote.status === "Pending"
                            )
                            const isApproved = quote.status === "Approved"
                            const isRejected = quote.status === "Rejected"
                            const itemCount = quote.line_items?.length || 0

                            const pdfUrl = quote.supplier_quote_pdf
                              ? quote.supplier_quote_pdf.startsWith("http")
                                ? quote.supplier_quote_pdf
                                : `${getApiBaseUrl()}${quote.supplier_quote_pdf}`
                              : null

                            return (
                              <tr
                                key={quote.id}
                                className="transition-colors hover:bg-white/[0.02]"
                              >
                                <td className="py-3.5">
                                  <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-white">
                                    <span>{quote.quote_ref}</span>
                                    <button
                                      type="button"
                                      onClick={() => copyQuoteRef(quote.quote_ref)}
                                      className="text-slate-500 transition-colors hover:text-slate-300"
                                      title="Copy Quote Ref"
                                    >
                                      {copiedRef === quote.quote_ref ? (
                                        <Check className="h-3 w-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </button>
                                  </div>
                                  {quote.variation_ref && (
                                    <div className="text-[11px] text-slate-400">
                                      Var: {quote.variation_ref}
                                    </div>
                                  )}
                                </td>

                                <td className="py-3.5 text-xs">
                                  <div className="font-medium text-slate-200">
                                    {quote.project_name || "Project"}
                                  </div>
                                  {(quote.main_folder_name || quote.sub_folder_name) && (
                                    <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                                      {[quote.main_folder_name, quote.sub_folder_name]
                                        .filter(Boolean)
                                        .join(" / ")}
                                    </div>
                                  )}
                                </td>

                                <td className="py-3.5 text-xs text-slate-300">
                                  {quote.date_of_quote
                                    ? new Date(quote.date_of_quote).toLocaleDateString()
                                    : "—"}
                                </td>

                                <td className="py-3.5 text-xs text-slate-300">
                                  <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[11px]">
                                    {itemCount} {itemCount === 1 ? "item" : "items"}
                                  </span>
                                </td>

                                <td className="py-3.5 text-xs font-semibold text-white">
                                  {Number(quote.quote_total) > 0 ? (
                                    `£${Number(quote.quote_total).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}`
                                  ) : (
                                    <span className="text-slate-500 italic text-[11px]">
                                      Pending Pricing
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5">
                                  {isApproved ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/30">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Approved
                                    </span>
                                  ) : isRejected ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-medium text-rose-400 ring-1 ring-rose-500/30">
                                      Rejected
                                    </span>
                                  ) : isRequote ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400 ring-1 ring-amber-500/30">
                                      <RotateCcw className="h-3 w-3" />
                                      Re-quote Requested
                                    </span>
                                  ) : hasPricing ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-400 ring-1 ring-blue-500/30">
                                      <Check className="h-3 w-3" />
                                      Pricing Submitted
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400 ring-1 ring-amber-500/30">
                                      <Clock className="h-3 w-3" />
                                      Action Required
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 text-xs">
                                  {pdfUrl ? (
                                    <a
                                      href={pdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      <span>Quote PDF</span>
                                    </a>
                                  ) : (
                                    <span className="text-slate-600">—</span>
                                  )}
                                </td>

                                <td className="py-3.5 text-right">
                                  <div className="inline-flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleOpenQuoteModal(quote)}
                                      className={`text-xs font-semibold ${
                                        !hasPricing || isRequote
                                          ? "bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20"
                                          : "bg-white/5 text-slate-300 hover:bg-white/10"
                                      }`}
                                    >
                                      <FileText className="mr-1.5 h-3.5 w-3.5" />
                                      {!hasPricing || isRequote ? "Submit Pricing" : "View / Edit"}
                                    </Button>

                                    {quote.supplier_token && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className="h-7 w-7 p-0 text-slate-400 hover:text-white"
                                        title="Open Standalone Quotation Link"
                                      >
                                        <Link
                                          href={`/supplier-quote/${quote.supplier_token}`}
                                          target="_blank"
                                        >
                                          <ExternalLink className="h-3.5 w-3.5" />
                                        </Link>
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: INVOICES */}
            {activeTab === "invoices" && (
              <div className="space-y-6">
                {/* Header with Title and Submit Invoice CTA */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                      Supplier Invoices
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                      Managing invoices for{" "}
                      <span className="text-white font-medium">{activeCompanyName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setIsUploadOpen(true)}
                      className="bg-blue-600 font-semibold text-white shadow-lg transition-all hover:bg-blue-500 hover:shadow-blue-500/20"
                    >
                      <Plus className="mr-1.5 h-4 w-4" />
                      Upload Invoice
                    </Button>
                  </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-xl border border-white/10 bg-[#0d1527]/80 p-4">
                    <div className="text-xs text-slate-400">Total Invoices</div>
                    <div className="mt-1 text-2xl font-bold text-white">{invoices.length}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0d1527]/80 p-4">
                    <div className="text-xs text-slate-400">Total Billed</div>
                    <div className="mt-1 text-2xl font-bold text-emerald-400">
                      £{totalInvoiceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0d1527]/80 p-4">
                    <div className="text-xs text-slate-400">In Review</div>
                    <div className="mt-1 text-2xl font-bold text-amber-400">
                      {processingInvoiceCount}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0d1527]/80 p-4">
                    <div className="text-xs text-slate-400">Approved / Paid</div>
                    <div className="mt-1 text-2xl font-bold text-blue-400">
                      {approvedInvoiceCount}
                    </div>
                  </div>
                </div>

                {/* Invoices List Table */}
                <div className="rounded-2xl border border-white/10 bg-[#0d1527]/90 p-6 shadow-xl backdrop-blur-xl">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                      Submitted Invoices
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Search invoice #..."
                        value={invoiceSearch}
                        onChange={(e) => setInvoiceSearch(e.target.value)}
                        className="border-white/10 bg-white/5 pl-9 text-xs text-white"
                      />
                    </div>
                  </div>

                  {invoicesLoading ? (
                    <div className="flex h-48 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                  ) : filteredInvoices.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
                      <Receipt className="mx-auto h-10 w-10 text-slate-600" />
                      <h3 className="mt-3 text-sm font-semibold text-white">No Invoices Found</h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {invoiceSearch
                          ? "No invoices match your search query."
                          : `You have not submitted any invoices for ${activeCompanyName} yet.`}
                      </p>
                      {!invoiceSearch && (
                        <Button
                          size="sm"
                          onClick={() => setIsUploadOpen(true)}
                          className="mt-4 bg-blue-600 hover:bg-blue-500 text-xs"
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" />
                          Submit Your First Invoice
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/10 text-xs text-slate-400">
                            <th className="pb-3 font-semibold">Invoice #</th>
                            <th className="pb-3 font-semibold">Invoice Date</th>
                            <th className="pb-3 font-semibold">Description</th>
                            <th className="pb-3 font-semibold">Amount</th>
                            <th className="pb-3 font-semibold">Status</th>
                            <th className="pb-3 font-semibold">Attachment</th>
                            <th className="pb-3 font-semibold">Submitted On</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredInvoices.map((inv) => (
                            <tr key={inv.id} className="transition-colors hover:bg-white/[0.02]">
                              <td className="py-3.5 font-mono text-xs font-semibold text-white">
                                {inv.invoice_number}
                              </td>
                              <td className="py-3.5 text-xs text-slate-300">
                                {new Date(inv.invoice_date).toLocaleDateString()}
                              </td>
                              <td className="py-3.5 text-xs text-slate-300 max-w-xs truncate">
                                {inv.description || "—"}
                              </td>
                              <td className="py-3.5 text-xs font-semibold text-white">
                                £{parseFloat(inv.amount).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="py-3.5">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${
                                    inv.status === "approved" || inv.status === "paid"
                                      ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                                      : inv.status === "processing"
                                      ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30"
                                      : inv.status === "rejected"
                                      ? "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30"
                                      : "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30"
                                  }`}
                                >
                                  {inv.status}
                                </span>
                              </td>
                              <td className="py-3.5 text-xs">
                                {inv.file_url ? (
                                  <a
                                    href={inv.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>PDF</span>
                                  </a>
                                ) : (
                                  <span className="text-slate-600">—</span>
                                )}
                              </td>
                              <td className="py-3.5 text-xs text-slate-400">
                                {new Date(inv.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Review & Submit Quote Modal */}
      <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
        <DialogContent className="max-w-3xl border-white/10 bg-[#0d1527] text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <span>RFQ Pricing — {selectedQuote?.quote_ref}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-1">
                  Project: <span className="text-white font-medium">{selectedQuote?.project_name}</span>
                  {selectedQuote?.variation_ref && ` | Variation: ${selectedQuote.variation_ref}`}
                </DialogDescription>
              </div>
              {selectedQuote?.supplier_token && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-white/10 bg-white/5 text-xs text-slate-300 hover:text-white"
                >
                  <Link
                    href={`/supplier-quote/${selectedQuote.supplier_token}`}
                    target="_blank"
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Open Standalone Page
                  </Link>
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* Requote Feedback Alert if applicable */}
          {selectedQuote?.requote_comments && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-300">
                    Procurement Re-quote Feedback
                  </div>
                  <div className="mt-1 text-slate-300 whitespace-pre-wrap">
                    {selectedQuote.requote_comments}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitQuote} className="space-y-4 pt-1">
            {/* Line Items Pricing Table */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-300">
                Quotation Line Items & Unit Pricing
              </Label>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02]">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#121c33] border-b border-white/10 text-slate-400">
                    <tr>
                      <th className="p-2.5 font-semibold">Description</th>
                      <th className="p-2.5 font-semibold text-center">Qty</th>
                      <th className="p-2.5 font-semibold text-center">Per</th>
                      <th className="p-2.5 font-semibold text-right">Target Rate</th>
                      <th className="p-2.5 font-semibold text-right">Your Unit Price (£)</th>
                      <th className="p-2.5 font-semibold text-right">Line Total (£)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedQuote?.line_items?.map((item) => {
                      const enteredVal = quotePrices[String(item.id)] ?? ""
                      const unitPrice = enteredVal !== "" ? parseFloat(enteredVal) || 0 : (item.each || 0)
                      const qty = Number(item.qty) || 1
                      const discount = Number(item.discount) || 0
                      const lineTotal = qty * unitPrice * (1 - discount / 100)

                      return (
                        <tr key={item.id} className="hover:bg-white/[0.02]">
                          <td className="p-2.5 font-medium text-white max-w-xs">
                            <div>{item.description}</div>
                            {item.comments && (
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {item.comments}
                              </div>
                            )}
                          </td>
                          <td className="p-2.5 text-center text-slate-300">{item.qty}</td>
                          <td className="p-2.5 text-center text-slate-400">{item.per || "item"}</td>
                          <td className="p-2.5 text-right text-slate-400">
                            {Number(item.each) > 0 ? `£${Number(item.each).toFixed(2)}` : "—"}
                          </td>
                          <td className="p-2.5 text-right">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={enteredVal}
                              onChange={(e) => {
                                const val = e.target.value
                                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                  setQuotePrices((prev) => ({
                                    ...prev,
                                    [String(item.id)]: val,
                                  }))
                                }
                              }}
                              className="h-8 w-28 text-right border-white/10 bg-white/5 font-mono text-xs text-white inline-block"
                            />
                          </td>
                          <td className="p-2.5 text-right font-mono font-semibold text-white">
                            £{lineTotal.toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Calculation Bar */}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5">
              <span className="text-xs text-slate-400">Total Quoted Value (estimated):</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                £{calculateModalTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* PDF Quote Attachment */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">
                Attach Supplier Quotation Proposal (PDF)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const f = e.target.files[0]
                      if (f.type !== "application/pdf") {
                        toast.error("Please upload a PDF file.")
                        e.target.value = ""
                        return
                      }
                      setQuotePdfFile(f)
                    }
                  }}
                  className="border-white/10 bg-white/5 text-xs text-slate-400 file:bg-blue-600 file:text-white file:border-0 file:rounded-md file:mr-3 file:px-2.5 file:py-1 file:text-xs hover:file:bg-blue-500"
                />
                {quotePdfFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuotePdfFile(null)}
                    className="h-8 px-2 text-xs text-slate-400 hover:text-rose-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              {selectedQuote?.supplier_quote_pdf && !quotePdfFile && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3 text-blue-400" />
                  <span>A quote document has previously been uploaded. Uploading a new file will replace it.</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsQuoteModalOpen(false)}
                disabled={isSubmittingQuote}
                className="border-white/10 text-xs text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingQuote}
                className="bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-600/20"
              >
                {isSubmittingQuote ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Submitting Quote...
                  </>
                ) : (
                  <>
                    <UploadCloud className="mr-1.5 h-3.5 w-3.5" />
                    Submit Quotation Pricing
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice Upload Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-md border-white/10 bg-[#0d1527] text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Upload Invoice</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Submit invoice details and attachments for {activeCompanyName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Invoice Number *</Label>
              <Input
                required
                placeholder="e.g. INV-2026-001"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Invoice Date *</Label>
                <Input
                  required
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Amount (£) *</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  placeholder="1500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Description</Label>
              <Textarea
                placeholder="Details of materials, delivery reference, or services..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="border-white/10 bg-white/5 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Invoice File (PDF or Document)</Label>
              <Input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedInvoiceFile(e.target.files[0])
                  }
                }}
                className="border-white/10 bg-white/5 text-xs text-slate-400 file:bg-blue-600 file:text-white file:border-0 file:rounded-md file:mr-3 file:px-2 file:py-1 file:text-xs hover:file:bg-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadOpen(false)}
                disabled={isSubmittingInvoice}
                className="border-white/10 text-xs text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingInvoice}
                className="bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
              >
                {isSubmittingInvoice ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Invoice"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
