"use client"

import { useState, useRef, useEffect } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { getRFIs, closeRFI, sendRFIMessage, assignRFIToTechnical, createRFI } from "@/lib/api/rfis"
import { getMyProjects } from "@/lib/api/project-admin"
import type { RFI, ChatMessage } from "@/lib/api/rfis"
import type { ProjectItem } from "@/constants/projects"
import { useAuthStore } from "@/lib/auth-store"
import { format } from "date-fns"

// ─── RFI Detail Dialog ────────────────────────────────────────────────────────

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

  const { user } = useAuthStore()
  const isClosed = rfi.status === "CLOSED"
  const canClose =
    !isClosed &&
    (user?.role === "project_director" || user?.role === "project_admin" || user?.role === "admin" || user?.role === "contracts_manager")

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
                  {rfi.rfi_number}
                </DialogTitle>
                <Badge
                  className={cn(
                    "rounded-sm text-[11px] font-semibold uppercase",
                    rfi.status === "OPEN"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-slate-500/20 text-slate-400"
                  )}
                >
                  {rfi.status}
                </Badge>
              </div>
              <p className="mt-1 text-[13px] text-slate-400">{rfi.description}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-slate-500">
                <span><span className="text-slate-400">Date:</span> {format(new Date(rfi.created_at), "yyyy-MM-dd")}</span>
                <span><span className="text-slate-400">Project:</span> {rfi.project_name}</span>
                <span><span className="text-slate-400">Trade:</span> {rfi.trade}</span>
                <span><span className="text-slate-400">Created by:</span> {rfi.created_by_name}</span>
                {rfi.closed_at && (
                  <span><span className="text-slate-400">Closed:</span> {format(new Date(rfi.closed_at), "yyyy-MM-dd")}</span>
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
                <span className="text-[13px] font-semibold text-slate-200">{msg.author_name}</span>
                <span className="text-[11px] text-slate-500 capitalize">{msg.author_role.replace(/_/g, ' ')}</span>
                <span className="ml-auto text-[11px] text-slate-600">{format(new Date(msg.created_at), "yyyy-MM-dd HH:mm")}</span>
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
  const [rfis, setRfis] = useState<RFI[]>([])
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all")
  const [selectedRFI, setSelectedRFI] = useState<RFI | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewDocumentUrl, setViewDocumentUrl] = useState<string | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createData, setCreateData] = useState({ project_id: "", description: "", trade: "General" })
  const [createFile, setCreateFile] = useState<File | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rfiData, projectData] = await Promise.all([
        getRFIs(),
        getMyProjects(),
      ])
      setRfis(rfiData)
      setProjects(projectData.projects)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredRfis = selectedProjectId === "all" 
    ? rfis 
    : rfis.filter(rfi => rfi.project === selectedProjectId)

  const totalCount = filteredRfis.length
  const openCount = filteredRfis.filter((r) => r.status === "OPEN").length
  const closedCount = filteredRfis.filter((r) => r.status === "CLOSED").length

  const handleCloseRFI = async (id: string) => {
    try {
      const updatedRfi = await closeRFI(id)
      setRfis((prev) => prev.map((r) => (r.id === id ? updatedRfi : r)))
      setSelectedRFI((prev) => (prev?.id === id ? updatedRfi : prev))
    } catch (e) {
      console.error("Failed to close RFI", e)
    }
  }

  const handleSendMessage = async (rfiId: string, text: string, files: File[]) => {
    try {
      const newMsg = await sendRFIMessage(rfiId, text, files)
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
    } catch (e) {
      console.error("Failed to send message", e)
    }
  }

  const handleAssignTechnical = async (rfiId: string, assigned: boolean) => {
    try {
      const updatedRfi = await assignRFIToTechnical(rfiId, assigned)
      setRfis((prev) => prev.map((r) => (r.id === rfiId ? updatedRfi : r)))
      setSelectedRFI((prev) => (prev?.id === rfiId ? updatedRfi : prev))
    } catch (e) {
      console.error("Failed to assign technical", e)
    }
  }

  const handleCreateRFI = async () => {
    if (!createData.project_id || !createData.description) return
    setIsCreating(true)
    try {
      const formData = new FormData()
      formData.append("project_id", createData.project_id)
      formData.append("description", createData.description)
      formData.append("trade", createData.trade)
      if (createFile) {
        formData.append("document", createFile)
      }
      const newRfi = await createRFI(formData)
      setRfis((prev) => [newRfi, ...prev])
      setIsCreateOpen(false)
      setCreateData({ project_id: "", description: "", trade: "General" })
      setCreateFile(null)
    } catch (e) {
      console.error("Failed to create RFI", e)
    } finally {
      setIsCreating(false)
    }
  }

  const userRole = useAuthStore.getState().user?.role
  const showAssignColumn = [
    "contracts_manager", "manager", "managers", "supervisor",
    "admin", "project_admin", "super_admin", "managing_director", "project_director"
  ].includes(userRole || "")

  const baseColumnDefs: ColDef<RFI>[] = [
    { field: "rfi_number", headerName: "RFI ref", width: 110, minWidth: 90 },
    { field: "created_at", headerName: "Date", width: 120, minWidth: 100, valueFormatter: (params) => params.value ? format(new Date(params.value), "yyyy-MM-dd") : "" },
    { field: "project_name", headerName: "Project", flex: 1, minWidth: 140 },
    { field: "description", headerName: "Description", flex: 2, minWidth: 200 },
    {
      field: "document_url",
      headerName: "Attachment",
      width: 110,
      minWidth: 90,
      cellRenderer: (params: ICellRendererParams<RFI>) =>
        params.value ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
            onClick={(e) => {
              e.stopPropagation()
              setViewDocumentUrl(params.value)
            }}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        ) : (
          <span className="text-slate-600">—</span>
        ),
    },
    { field: "created_by_name", headerName: "Created by", minWidth: 130 },
    { field: "trade", headerName: "Trade", minWidth: 110 },
    {
      field: "created_at",
      headerName: "Open",
      minWidth: 110,
      cellRenderer: (params: ICellRendererParams<RFI>) =>
        params.value ? (
          <span className="text-emerald-400">{format(new Date(params.value), "yyyy-MM-dd")}</span>
        ) : null,
    },
    {
      field: "closed_at",
      headerName: "Closed",
      minWidth: 110,
      cellRenderer: (params: ICellRendererParams<RFI>) =>
        params.value ? (
          <span className="text-slate-400">{format(new Date(params.value), "yyyy-MM-dd")}</span>
        ) : (
          <span className="text-slate-600">—</span>
        ),
    },
    {
      field: "closed_at",
      headerName: "Date RFI closed",
      minWidth: 140,
      cellRenderer: (params: ICellRendererParams<RFI>) =>
        params.value ? (
          <span className="text-slate-400">{format(new Date(params.value), "yyyy-MM-dd")}</span>
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
            params.value === "OPEN"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-slate-500/20 text-slate-400"
          )}
        >
          {params.value}
        </span>
      ),
    },
    {
      headerName: "Action",
      width: 110,
      minWidth: 100,
      cellRenderer: (params: ICellRendererParams<RFI>) => (
        <div className="flex h-full w-full items-center justify-center p-2">
          <Button
            size="sm"
            onClick={() => params.data && setSelectedRFI(params.data)}
            className="h-7 whitespace-nowrap bg-indigo-600 px-3 text-[11px] font-semibold tracking-wider text-white hover:bg-indigo-700"
          >
            RESPOND
          </Button>
        </div>
      ),
    },
  ]

  const columnDefs: ColDef<RFI>[] = showAssignColumn
    ? [
        ...baseColumnDefs,
        {
          field: "assigned_to_technical_department",
          headerName: "Assign to Tech",
          width: 120,
          minWidth: 100,
          cellRenderer: (params: ICellRendererParams<RFI>) => (
            <div className="flex items-center h-full">
              <div
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                <Switch
                  checked={params.value}
                  onCheckedChange={(checked) => {
                    if (params.data) {
                      handleAssignTechnical(params.data.id, checked)
                    }
                  }}
                />
              </div>
            </div>
          ),
        },
      ]
    : baseColumnDefs

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Project RFIs</h2>
          <p className="text-[12px] text-slate-500">
            Click any row to open the RFI chat thread
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[250px] bg-[#0f1b2d] border-[#1e3a5f] text-slate-200 h-9">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent position="popper" className="bg-[#0f1b2d] border-[#1e3a5f] text-slate-200">
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4 text-sm font-medium"
          >
            Create RFI
          </Button>
        </div>
      </div>

      <TableStat
        summaryRows={[
          { label: "Total RFIs", qty: totalCount },
          { label: "Open RFIs", qty: openCount },
          { label: "Closed RFIs", qty: closedCount },
        ]}
      />

      <AgTable
        rowData={filteredRfis}
        columnDefs={columnDefs}
        height="60vh"
        pagination
        pageSize={20}
        suppressCellClickAction
        gridOptions={{
          rowClass: "cursor-pointer",
          onCellClicked: (event) => {
            const ignoreFields = ["assigned_to_technical_department", "document_url"]
            if (ignoreFields.includes(event.colDef.field || "") || event.colDef.headerName === "Action") {
              return
            }
            if (event.data) {
              setSelectedRFI(event.data as RFI)
            }
          },
          getRowStyle: (params) => {
            const data = params.data as RFI | undefined
            if (data?.status === "CLOSED") return { opacity: "0.65" }
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

      {viewDocumentUrl && (
        <Dialog open={!!viewDocumentUrl} onOpenChange={() => setViewDocumentUrl(null)}>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden bg-[#0a1428] border-[#1e3a5f]" showCloseButton>
            <DialogHeader className="px-4 py-3 border-b border-[#1e3a5f] flex flex-row items-center justify-between shrink-0">
              <DialogTitle className="text-sm font-semibold text-slate-200">View Document</DialogTitle>
            </DialogHeader>
            <div className="flex-1 w-full h-full p-4 overflow-auto">
              <iframe src={viewDocumentUrl} className="w-full h-full rounded-md border border-[#1e3a5f]" title="Document Viewer" />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isCreateOpen && (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[500px] bg-[#0a1428] border-[#1e3a5f]">
            <DialogHeader>
              <DialogTitle className="text-slate-100">Create New RFI</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <Label className="text-slate-300">Project</Label>
                <Select
                  value={createData.project_id}
                  onValueChange={(val) => setCreateData((prev) => ({ ...prev, project_id: val }))}
                >
                  <SelectTrigger className="bg-[#0f1b2d] border-[#1e3a5f] text-slate-200">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="bg-[#0f1b2d] border-[#1e3a5f] text-slate-200">
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-slate-300">Trade</Label>
                <Input
                  className="bg-[#0f1b2d] border-[#1e3a5f] text-slate-200"
                  value={createData.trade}
                  onChange={(e) => setCreateData((prev) => ({ ...prev, trade: e.target.value }))}
                  placeholder="e.g. General"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-slate-300">Description</Label>
                <Textarea
                  className="bg-[#0f1b2d] border-[#1e3a5f] text-slate-200 h-24"
                  value={createData.description}
                  onChange={(e) => setCreateData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter RFI details..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-slate-300">Attachment (Optional)</Label>
                <Input
                  type="file"
                  className="bg-[#0f1b2d] border-[#1e3a5f] text-slate-200"
                  onChange={(e) => setCreateFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="text-slate-300">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRFI}
                  disabled={!createData.project_id || !createData.description || isCreating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isCreating ? "Creating..." : "Create RFI"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
