"use client"

import { useState, useEffect, useMemo } from "react"
import type { ColDef } from "ag-grid-community"
import { toast } from "sonner"
import { Building2, Check, Copy, ExternalLink, Loader2, Mail, Plus, UserPlus } from "lucide-react"

import { getSuppliers, inviteSupplier, type CompanySupplier } from "@/lib/api/suppliers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"

type SupplierRow = {
  id: string
  no: string
  supplierName: string
  email: string
  status: "pending" | "active" | "declined" | "revoked"
  creditLimit: string
  eomPaymentTerms: string
  invitedAt: string
  invitationLink: string | null
}

function InviteSupplierDialog({ onInvited }: { onInvited: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [invitedLink, setInvitedLink] = useState<string | null>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    setLoading(true)
    try {
      const res = await inviteSupplier({
        email: email.trim(),
        company_name: name.trim(),
      })
      toast.success("Supplier invited successfully! Invitation email has been sent.")

      if (res.invitation_link) {
        setInvitedLink(res.invitation_link)
      } else {
        setOpen(false)
        setName("")
        setEmail("")
      }
      onInvited()
    } catch (err: any) {
      toast.error(err.message || "Failed to invite supplier.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (invitedLink) {
      navigator.clipboard.writeText(invitedLink)
      toast.success("Invitation link copied to clipboard!")
    }
  }

  const handleClose = () => {
    setOpen(false)
    setName("")
    setEmail("")
    setInvitedLink(null)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (!isOpen ? handleClose() : setOpen(true))}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white shadow hover:bg-primary/90">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[440px] w-full bg-[#0d1527] text-white border-white/10 sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Invite Supplier
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Send an invitation to a supplier. They will receive a link to connect and submit invoices.
          </DialogDescription>
        </DialogHeader>

        {invitedLink ? (
          <div className="w-full min-w-0 space-y-4 pt-2">
            <div className="w-full min-w-0 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-300">
              <p className="font-semibold text-emerald-400">Invitation Link Generated</p>
              <p className="mt-1 text-slate-300 break-words">
                An invitation email was sent to <strong className="break-all">{email}</strong>. You can also copy the link directly below:
              </p>
              <div className="mt-2 flex w-full min-w-0 items-center justify-between gap-2 rounded bg-black/40 p-2 font-mono text-[11px] text-slate-300">
                <span className="min-w-0 flex-1 truncate select-all">{invitedLink}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyLink}
                  className="h-7 w-7 p-0 shrink-0 text-emerald-400 hover:text-white"
                  title="Copy Link"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full bg-blue-600 hover:bg-blue-500">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Supplier / Company Name *</Label>
              <Input
                required
                placeholder="e.g. BuildCo Supplies Ltd"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Supplier Email *</Label>
              <Input
                required
                type="email"
                placeholder="sales@buildco.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Invitation...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function SupplierListsPage() {
  const [data, setData] = useState<CompanySupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "declined">("all")

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const res = await getSuppliers()
      setData(res)
    } catch (err: any) {
      toast.error(err.message || "Failed to load suppliers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const rows: SupplierRow[] = useMemo(() => {
    const filtered =
      statusFilter === "all" ? data : data.filter((cs) => cs.status === statusFilter)

    return filtered.map((cs, i) => {
      const credit = parseFloat(cs.credit_limit) || 0
      return {
        id: cs.id,
        no: String(i + 1).padStart(2, "0"),
        supplierName: cs.supplier?.company_name || "Supplier",
        email: cs.supplier?.email || "—",
        status: cs.status,
        creditLimit: `£${credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        eomPaymentTerms: `${cs.eom_payment_terms} days`,
        invitedAt: cs.invited_at ? new Date(cs.invited_at).toLocaleDateString() : "—",
        invitationLink: cs.invitation_link,
      }
    })
  }, [data, statusFilter])

  const stats = useMemo(() => {
    const totalSuppliers = data.length
    const active = data.filter((s) => s.status === "active").length
    const pending = data.filter((s) => s.status === "pending").length
    const totalCredit = data.reduce(
      (sum, s) => sum + (parseFloat(s.credit_limit) || 0),
      0
    )

    return {
      totalSuppliers,
      active,
      pending,
      totalCredit,
    }
  }, [data])

  const columnDefs: ColDef<SupplierRow>[] = [
    { headerName: "No", field: "no", maxWidth: 80, filter: false },
    { headerName: "Supplier Name", field: "supplierName", minWidth: 180 },
    { headerName: "Supplier Email", field: "email", minWidth: 200 },
    {
      headerName: "Status",
      field: "status",
      width: 130,
      cellRenderer: (params: any) => {
        const val = params.value as string
        const colorClass =
          val === "active"
            ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30"
            : val === "pending"
            ? "bg-amber-500/10 text-amber-400 ring-amber-500/30"
            : "bg-rose-500/10 text-rose-400 ring-rose-500/30"

        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ${colorClass}`}
          >
            {val}
          </span>
        )
      },
    },
    { headerName: "Credit Limit", field: "creditLimit", width: 140 },
    { headerName: "Payment Terms", field: "eomPaymentTerms", width: 140 },
    { headerName: "Invited Date", field: "invitedAt", width: 130 },
    {
      headerName: "Actions",
      field: "invitationLink",
      width: 140,
      cellRenderer: (params: any) => {
        const link = params.value
        if (!link) return null

        return (
          <button
            onClick={() => {
              navigator.clipboard.writeText(link)
              toast.success("Invitation link copied to clipboard!")
            }}
            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Link</span>
          </button>
        )
      },
    },
  ]

  return (
    <div className="w-full min-w-0 space-y-6 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Supplier Directory</h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage your company&apos;s supplier relationships, invitations, and terms.
          </p>
        </div>

        <InviteSupplierDialog onInvited={fetchSuppliers} />
      </div>

      <TableStat
        summaryRows={[
          { label: "Total Suppliers", value: String(stats.totalSuppliers) },
          { label: "Active Suppliers", value: String(stats.active) },
          { label: "Pending Invitations", value: String(stats.pending) },
          {
            label: "Total Credit Assigned",
            value: `£${stats.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          },
        ]}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            statusFilter === "all"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All ({data.length})
        </button>
        <button
          onClick={() => setStatusFilter("active")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            statusFilter === "active"
              ? "bg-emerald-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Active ({stats.active})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            statusFilter === "pending"
              ? "bg-amber-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setStatusFilter("declined")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            statusFilter === "declined"
              ? "bg-rose-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Declined ({data.filter((s) => s.status === "declined").length})
        </button>
      </div>

      <AgTable
        columnDefs={columnDefs}
        rowData={rows}
        defaultColDef={{
          flex: 1,
          minWidth: 120,
          resizable: true,
        }}
      />
    </div>
  )
}
