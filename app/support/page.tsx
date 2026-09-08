"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type FAQItem = {
  question: string
  answer: string
  category: "account" | "procurement" | "supplier" | "projects"
}

const faqs: FAQItem[] = [
  {
    category: "procurement",
    question: "How do Procurement users invite suppliers?",
    answer:
      "Navigate to 'Supplier Directory' (/supplier-lists) from your dashboard. Click the '+ Invite Supplier' button at the top right, provide the supplier's company name and email address, and submit. The supplier will immediately receive an invitation email containing a secure single-use link.",
  },
  {
    category: "supplier",
    question: "Can one supplier work with multiple companies on Tresta?",
    answer:
      "Yes! Tresta supports multi-company supplier relationships. You can accept invitations from multiple contractors using the same login email and password. Upon logging in to the Supplier Portal (/supplier/login), you can seamlessly switch between all your connected companies.",
  },
  {
    category: "supplier",
    question: "How do suppliers submit invoices for approved purchase orders?",
    answer:
      "Log in to the Supplier Portal (/supplier) and select the hiring company. Click '+ Upload Invoice', enter your invoice reference, date, total amount, and attach your PDF document. The procurement department will be notified immediately to review, approve, or process payment.",
  },
  {
    category: "account",
    question: "How do role permissions work in Tresta?",
    answer:
      "Tresta implements granular role-based access control. Permissions are configured per company or per project. If you need access to additional features (e.g. Procurement, Commercial sign-offs, or Project Admin), ask your Company Admin to update your assigned roles under User Management.",
  },
  {
    category: "projects",
    question: "Where can I view approved quotations and call-off orders?",
    answer:
      "Approved quotations and active project call-offs are located under the 'Quotations' and 'Call Off List' modules in your dashboard. You can track line item quantities, call-off dates, delivery statuses, and associated purchase orders in real time.",
  },
  {
    category: "account",
    question: "I didn't receive my password reset or invitation email. What should I do?",
    answer:
      "First check your spam or junk email folder. If it hasn't arrived after 5 minutes, verify that your email was entered correctly, or contact your project administrator to resend the invitation link. You can also reach our support team directly at support@tresta.co.uk.",
  },
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)

  // Form State
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("procurement")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.")
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      const ticketId = `TRE-${Math.floor(100000 + Math.random() * 900000)}`
      setSubmittedTicket(ticketId)
      setSubmitting(false)
      toast.success(`Support ticket ${ticketId} created successfully!`)
    }, 600)
  }

  const handleResetForm = () => {
    setSubmittedTicket(null)
    setFullName("")
    setEmail("")
    setSubject("")
    setMessage("")
  }

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = selectedCategory === "all" || faq.category === selectedCategory
    const matchesSearch =
      !searchQuery.trim() ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <main className="min-h-screen bg-[oklch(19.76%_0.037_264.19)] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/[0.03] backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-white hover:text-emerald-300 transition-colors flex items-center gap-2"
          >
            <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
              T
            </div>
            Tresta
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/privacy-policy"
              className="text-slate-400 hover:text-slate-200 transition-colors hidden sm:block"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-slate-400 hover:text-slate-200 transition-colors hidden sm:block"
            >
              Terms of Service
            </Link>
            <Link
              href="/sign-in"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 font-medium text-slate-200 hover:bg-white/10 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-300 mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Help & Support Center · All Systems Operational
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            How can our team help you today?
          </h1>
          <p className="mt-4 text-sm md:text-base leading-relaxed text-slate-300 max-w-2xl mx-auto">
            Get fast assistance with construction projects, commercial procurement,
            supplier invoicing, and account management.
          </p>

          {/* Quick Search */}
          <div className="mt-8 relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search help topics, FAQs, or workflows (e.g. suppliers, invoices)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 pl-11 pr-4 py-3 text-xs md:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 backdrop-blur transition-all"
            />
          </div>
        </div>
      </section>

      {/* Direct Contact Cards */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur hover:border-emerald-500/30 transition-all group">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-white">Technical Support</h2>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Assistance with bugs, platform performance, integrations, and permissions.
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs">
              <a
                href="mailto:support@tresta.co.uk"
                className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1.5"
              >
                support@tresta.co.uk →
              </a>
              <p className="text-[11px] text-slate-400 mt-1">Average response time: &lt; 2 hours</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur hover:border-blue-500/30 transition-all group">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-white">Procurement & Suppliers</h2>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Help with supplier invitations, quotation reviews, call-off orders, and invoice submissions.
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs">
              <a
                href="mailto:procurement@tresta.co.uk"
                className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1.5"
              >
                procurement@tresta.co.uk →
              </a>
              <p className="text-[11px] text-slate-400 mt-1">Dedicated team for suppliers & buyers</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur hover:border-amber-500/30 transition-all group">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
              <Phone className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-white">Help Desk Hotline</h2>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Need to talk to a member of our operations team directly regarding urgent site matters?
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs">
              <p className="text-amber-300 font-mono font-medium">+44 (0) 20 7946 0192</p>
              <p className="text-[11px] text-slate-400 mt-1">Mon – Fri: 8:00 AM – 6:00 PM GMT</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ Combined Section */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Support Ticket Form */}
          <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Submit a Support Request</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Our support team will review your inquiry and get back to you promptly.
            </p>

            {submittedTicket ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-white">Ticket Submitted Successfully</h3>
                <p className="text-xs text-slate-300">
                  Your support request reference is:
                </p>
                <div className="inline-block rounded-lg bg-black/40 px-4 py-2 font-mono text-sm text-emerald-300 font-semibold border border-emerald-500/20">
                  {submittedTicket}
                </div>
                <p className="text-xs text-slate-400 pt-1">
                  A confirmation email has been dispatched to <strong>{email}</strong>. Our team typically responds within 2 hours during operational hours.
                </p>
                <div className="pt-3">
                  <Button
                    onClick={handleResetForm}
                    variant="outline"
                    className="border-white/15 text-xs text-slate-200 hover:bg-white/10"
                  >
                    Submit Another Request
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Full Name *</Label>
                    <Input
                      required
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="border-white/10 bg-white/5 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Work Email *</Label>
                    <Input
                      required
                      type="email"
                      placeholder="john@company.co.uk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-white/10 bg-white/5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Your Role / Portal</Label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-md border border-white/10 bg-[#0d1726] px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="procurement">Procurement Department</option>
                      <option value="supplier">Supplier / Subcontractor</option>
                      <option value="project_admin">Project Admin / Manager</option>
                      <option value="commercial">Commercial Department</option>
                      <option value="site_supervisor">Site Supervisor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Subject *</Label>
                    <Input
                      required
                      placeholder="e.g. Question regarding invoice #1042"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="border-white/10 bg-white/5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Message / Details *</Label>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Describe your question or issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="border-white/10 bg-white/5 text-xs text-white min-h-[100px]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-10 shadow-lg shadow-emerald-950/40"
                >
                  {submitting ? (
                    "Submitting Request..."
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-3.5 w-3.5" />
                      Send Message
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* FAQs Section */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Frequently Asked Questions</h2>
                <p className="text-xs text-slate-400 mt-0.5">Quick answers to common inquiries.</p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "All Topics" },
                { id: "procurement", label: "Procurement" },
                { id: "supplier", label: "Suppliers" },
                { id: "account", label: "Account & Access" },
                { id: "projects", label: "Projects" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-xs text-slate-400">
                  No questions matched your search. Contact our support team directly using the form.
                </div>
              ) : (
                filteredFaqs.map((faq, idx) => {
                  const isOpen = expandedFaq === idx
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-colors"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-emerald-400" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs leading-relaxed text-slate-300 border-t border-white/5">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Helpful link box */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Need to review our compliance policies?</span>
              </div>
              <Link
                href="/privacy-policy"
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Read Privacy Policy →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 py-8 px-6 text-xs text-slate-400">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>&copy; {new Date().getFullYear()} Tresta Platform. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-slate-200 transition-colors">
              Home
            </Link>
            <Link href="/privacy-policy" className="hover:text-slate-200 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-slate-200 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
