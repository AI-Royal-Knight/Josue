"use client"

import { useState, useRef } from "react"
import { type ColDef, type ICellRendererParams } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Send, Paperclip, X, CheckCircle2, Lock } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

// ─── Types ────────────────────────────────────────────────────────────────────

type RFIStatus = "open" | "closed"

type ChatMessage = {
  id: string
  author: string
  role: string
  text: string
  attachments: { name: string; url: string }[]
  timestamp: string
}

type RFI = {
  id: string
  rfiRef: string
  date: string
  project: string
  description: string
  createdBy: string
  trade: string
  open: string
  closed: string
  dateRfiClosed: string
  status: RFIStatus
  messages: ChatMessage[]
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_RFIS: RFI[] = [
  {
    id: "rfi-001",
    rfiRef: "RFI-001",
    date: "2024-11-04",
    project: "Tresta Phase 1",
    description: "Clarification on electrical conduit routing through Level 3 slab",
    createdBy: "James Hartley",
    trade: "Electrical",
    open: "2024-11-04",
    closed: "",
    dateRfiClosed: "",
    status: "open",
    messages: [
      {
        id: "m1",
        author: "James Hartley",
        role: "Supervisor",
        text: "Please clarify the conduit routing through the Level 3 slab — current drawings conflict with structural details on grid C4.",
        attachments: [],
        timestamp: "2024-11-04 09:12",
      },
    ],
  },
  {
    id: "rfi-002",
    rfiRef: "RFI-002",
    date: "2024-11-06",
    project: "Tresta Phase 1",
    description: "Plumbing waste pipe fall confirmation for Block B",
    createdBy: "Sara Mitchell",
    trade: "Plumbing",
    open: "2024-11-06",
    closed: "2024-11-10",
    dateRfiClosed: "2024-11-10",
    status: "closed",
    messages: [
      {
        id: "m2",
        author: "Sara Mitchell",
        role: "Supervisor",
        text: "Can you confirm the required fall ratio for the waste pipes in Block B corridor?",
        attachments: [],
        timestamp: "2024-11-06 10:45",
      },
      {
        id: "m3",
        author: "Alex Johnson",
        role: "Contracts Manager",
        text: "Confirmed 1:80 fall. Updated drawing attached.",
        attachments: [{ name: "blockB-waste-revised.pdf", url: "#" }],
        timestamp: "2024-11-08 14:20",
      },
    ],
  },
  {
    id: "rfi-003",
    rfiRef: "RFI-003",
    date: "2024-11-12",
    project: "Tresta Phase 1",
    description: "Fire stopping specification at service penetrations",
    createdBy: "Tom Reeves",
    trade: "General",
    open: "2024-11-12",
    closed: "",
    dateRfiClosed: "",
    status: "open",
    messages: [
      {
        id: "m4",
        author: "Tom Reeves",
        role: "Supervisor",
        text: "Which fire stopping product is specified for the 150mm service penetrations on the 2hr fire-rated walls?",
        attachments: [],
        timestamp: "2024-11-12 08:30",
      },
    ],
  },
]

// ─── RFI Detail Dialog ────────────────────────────────────────────────────────

const CURRENT_USER = { name: "Alex Johnson", role: "Contracts Manager" }
// In a real app this would come from auth context.
// Set role to "Project Director" to enable override close.

function RFIDetailDialog({
  rfi,
  onClose,
  onCloseRFI,
  onSendMessage,
}: {
  rfi: RFI
  onClose: () => void
  onCloseRFI: (id: string) => void
  onSendMessage: (rfiId: string, text: string, files: File[]) => void
}) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const isClosed = rfi.status === "closed"
  const canClose =
    !isClosed &&
    (CURRENT_USER.role === "Project Director" || CURRENT_USER.role === "Contracts Manager")

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed && attachments.length === 0) return
    onSendMessage(rfi.id, trimmed, attachments)
    setMessage("")
    setAttachments([])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setAttachments((prev) => [...prev, ...files])
    e.target.value = ""
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="flex max-h-[90vh] w-[700px] max-w-none flex-col gap-0 overflow-hidden p-0"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="shrink-0 border-b border-[#1e3a5f] px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-semibold text-slate-100">
                  {rfi.rfiRef}
                </DialogTitle>
                <Badge
                  className={cn(
                    "rounded-sm text-[11px] font-semibold uppercase",
                    rfi.status === "open"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-slate-500/20 text-slate-400"
                  )}
                >
                  {rfi.status}
                </Badge>
              </div>
              <p className="mt-1 text-[13px] text-slate-400">{rfi.description}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-slate-500">
                <span><span className="text-slate-400">Date:</span> {rfi.date}</span>
                <span><span className="text-slate-400">Project:</span> {rfi.project}</span>
                <span><span className="text-slate-400">Trade:</span> {rfi.trade}</span>
                <span><span className="text-slate-400">Created by:</span> {rfi.createdBy}</span>
                {rfi.dateRfiClosed && (
                  <span><span className="text-slate-400">Closed:</span> {rfi.dateRfiClosed}</span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {canClose && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-700 text-emerald-400 hover:bg-emerald-900/30 hover:text-emerald-300"
                  onClick={() => onCloseRFI(rfi.id)}
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Close RFI
                </Button>
              )}
              {isClosed && (
                <span className="flex items-center gap-1 text-[12px] text-slate-500">
                  <Lock className="h-3 w-3" /> Closed
                </span>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {rfi.messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-semibold text-slate-200">{msg.author}</span>
                <span className="text-[11px] text-slate-500">{msg.role}</span>
                <span className="ml-auto text-[11px] text-slate-600">{msg.timestamp}</span>
              </div>
              {msg.text && (
                <p className="rounded bg-[#0e1a30] px-3 py-2 text-[13px] text-slate-300 leading-relaxed border border-[#1e3a5f]">
                  {msg.text}
                </p>
              )}
              {msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {msg.attachments.map((att) => (
                    <a
                      key={att.name}
                      href={att.url}
                      className="flex items-center gap-1 rounded border border-[#2d4060] bg-[#0a1428] px-2 py-1 text-[12px] text-blue-400 hover:text-blue-300"
                    >
                      <Paperclip className="h-3 w-3" />
                      {att.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Reply box */}
        {!isClosed && (
          <div className="shrink-0 border-t border-[#1e3a5f] px-6 py-4">
            {attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachments.map((f, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 rounded border border-[#2d4060] bg-[#0a1428] px-2 py-1 text-[12px] text-slate-400"
                  >
                    <Paperclip className="h-3 w-3" />
                    {f.name}
                    <button
                      onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                      className="ml-1 text-slate-500 hover:text-slate-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Reply to this RFI…"
                rows={2}
                className="flex-1 resize-none border-[#2d4060] bg-[#0e1929] text-[13px] text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-600"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSend()
                }}
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="border border-[#2d4060] text-slate-400 hover:text-slate-200"
                  onClick={() => fileRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  onClick={handleSend}
                  disabled={!message.trim() && attachments.length === 0}
                >
                  <Send className="h-4 w-4" />
                </Button>
                <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFiles} />
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-600">Ctrl+Enter to send</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectRFIsPage() {
  const [rfis, setRfis] = useState<RFI[]>(SEED_RFIS)
  const [selectedRFI, setSelectedRFI] = useState<RFI | null>(null)

  const totalCount = rfis.length
  const openCount = rfis.filter((r) => r.status === "open").length
  const closedCount = rfis.filter((r) => r.status === "closed").length

  const handleCloseRFI = (id: string) => {
    const now = new Date().toISOString().slice(0, 10)
    setRfis((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "closed", closed: now, dateRfiClosed: now }
          : r
      )
    )
    setSelectedRFI((prev) =>
      prev?.id === id
        ? { ...prev, status: "closed", closed: now, dateRfiClosed: now }
        : prev
    )
  }

  const handleSendMessage = (rfiId: string, text: string, files: File[]) => {
    const now = new Date()
    const timestamp = now.toISOString().slice(0, 16).replace("T", " ")
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      author: CURRENT_USER.name,
      role: CURRENT_USER.role,
      text,
      attachments: files.map((f) => ({ name: f.name, url: "#" })),
      timestamp,
    }
    setRfis((prev) =>
      prev.map((r) =>
        r.id === rfiId ? { ...r, messages: [...r.messages, newMsg] } : r
      )
    )
    setSelectedRFI((prev) =>
      prev?.id === rfiId
        ? { ...prev, messages: [...prev.messages, newMsg] }
        : prev
    )
  }

  const columnDefs: ColDef<RFI>[] = [
    { field: "rfiRef", headerName: "RFI ref", width: 110, minWidth: 90 },
    { field: "date", headerName: "Date", width: 120, minWidth: 100 },
    { field: "project", headerName: "Project", flex: 1, minWidth: 140 },
    { field: "description", headerName: "Description", flex: 2, minWidth: 200 },
    { field: "createdBy", headerName: "Created by", minWidth: 130 },
    { field: "trade", headerName: "Trade", minWidth: 110 },
    {
      field: "open",
      headerName: "Open",
      minWidth: 110,
      cellRenderer: (params: ICellRendererParams<RFI>) =>
        params.value ? (
          <span className="text-emerald-400">{params.value}</span>
        ) : null,
    },
    {
      field: "closed",
      headerName: "Closed",
      minWidth: 110,
      cellRenderer: (params: ICellRendererParams<RFI>) =>
        params.value ? (
          <span className="text-slate-400">{params.value}</span>
        ) : (
          <span className="text-slate-600">—</span>
        ),
    },
    {
      field: "dateRfiClosed",
      headerName: "Date RFI closed",
      minWidth: 140,
      cellRenderer: (params: ICellRendererParams<RFI>) =>
        params.value ? (
          <span className="text-slate-400">{params.value}</span>
        ) : (
          <span className="text-slate-600">—</span>
        ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      minWidth: 90,
      cellRenderer: (params: ICellRendererParams<RFI>) => (
        <span
          className={cn(
            "inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase",
            params.value === "open"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-slate-500/20 text-slate-400"
          )}
        >
          {params.value}
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-100">Project RFIs</h2>
        <p className="text-[12px] text-slate-500">
          Click any row to open the RFI chat thread
        </p>
      </div>

      <TableStat
        summaryRows={[
          { label: "Total RFIs", qty: totalCount },
          { label: "Open RFIs", qty: openCount },
          { label: "Closed RFIs", qty: closedCount },
        ]}
      />

      <AgTable
        rowData={rfis}
        columnDefs={columnDefs}
        height="60vh"
        pagination
        pageSize={20}
        suppressCellClickAction
        onRowClicked={(row) => setSelectedRFI(row)}
        gridOptions={{
          rowClass: "cursor-pointer",
          getRowStyle: (params) => {
            const data = params.data as RFI | undefined
            if (data?.status === "closed") return { opacity: "0.65" }
            return undefined
          },
        }}
      />

      {selectedRFI && (
        <RFIDetailDialog
          rfi={selectedRFI}
          onClose={() => setSelectedRFI(null)}
          onCloseRFI={handleCloseRFI}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  )
}
