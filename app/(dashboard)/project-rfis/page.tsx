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
import {
  Send,
  Paperclip,
  X,
  CheckCircle2,
  Lock,
  Eye,
  Download,
  FileText,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  CornerDownRight,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

import {
  getRFIs,
  closeRFI,
  sendRFIMessage,
  assignRFIToTechnical,
  createRFI,
} from "@/lib/api/rfis"
import { getMyProjects } from "@/lib/api/project-admin"
import type { RFI, ChatMessage } from "@/lib/api/rfis"
import type { ProjectItem } from "@/constants/projects"
import { useAuthStore } from "@/lib/auth-store"
import { useRoleStore } from "@/lib/role-store"
import { format } from "date-fns"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRoleName(role?: string | null): string {
  if (!role) return "User"
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getFilenameFromUrl(url?: string | null): string {
  if (!url) return "Attachment"
  try {
    const raw = url.split("/").pop()?.split("?")[0] || "attachment"
    return decodeURIComponent(raw)
  } catch {
    return "Attachment"
  }
}

function AttachmentCard({
  url,
  filename,
  onPreview,
}: {
  url: string
  filename?: string
  onPreview?: (url: string) => void
}) {
  const cleanName = filename || getFilenameFromUrl(url)
  const isImageOrPdf = Boolean(
    url.match(/\.(jpg|jpeg|png|webp|gif|svg|pdf)(\?.*)?$/i)
  )

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    const link = document.createElement("a")
    link.href = url
    link.download = cleanName
    link.target = "_blank"
    link.rel = "noreferrer"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="group flex items-center justify-between gap-3 rounded-lg border border-[#233550] bg-[#0c192d] p-2.5 transition-colors hover:border-blue-500/50">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-200" title={cleanName}>
            {cleanName}
          </p>
          <span className="text-[11px] text-slate-500">Attachment file</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {onPreview && isImageOrPdf && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPreview(url)}
            className="h-7 px-2 text-[11px] font-medium text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
          >
            <Eye className="mr-1 h-3 w-3" />
            Preview
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="h-7 px-2 text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <Download className="mr-1 h-3 w-3" />
          Download
        </Button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          title="Open in new tab"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}

// ─── RFI Detail Dialog ────────────────────────────────────────────────────────

function RFIDetailDialog({
  rfi,
  onClose,
  onCloseRFI,
  onSendMessage,
  onAssignTechnical,
  onViewDocument,
}: {
  rfi: RFI
  onClose: () => void
  onCloseRFI: (id: string) => Promise<void>
  onSendMessage: (
    rfiId: string,
    text: string,
    files: File[],
    role?: string
  ) => Promise<void>
  onAssignTechnical: (rfiId: string, assigned: boolean) => Promise<void>
  onViewDocument: (url: string) => void
}) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { user } = useAuthStore()
  const activeRole = useRoleStore((s) => s.role) || user?.role || "project_director"
  const isClosed = rfi.status === "CLOSED"

  // Check creator identity against multiple possible formats
  const currentUserId = user?.id ? String(user.id) : null
  const rfiCreatorId = rfi.created_by ? String(rfi.created_by) : null
  const userFullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim().toLowerCase()
  const userEmail = (user?.email || "").toLowerCase()
  const rfiCreatorName = (rfi.created_by_name || "").toLowerCase()

  const isCreator = Boolean(
    (currentUserId && rfiCreatorId && currentUserId === rfiCreatorId) ||
    (rfiCreatorName && (rfiCreatorName === userFullName || rfiCreatorName === userEmail))
  )

  const isProjectDirector =
    activeRole === "project_director" ||
    user?.role === "project_director" ||
    user?.role === "managing_director" ||
    user?.role === "admin" ||
    user?.role === "super_admin"

  // Bug 7: RFI can be closed by the person who opened it or by the project director for that project
  const canClose = !isClosed && (isCreator || isProjectDirector)

  const canAssignTech = [
    "contracts_manager",
    "manager",
    "managers",
    "supervisor",
    "admin",
    "project_admin",
    "super_admin",
    "managing_director",
    "project_director",
  ].includes(activeRole || user?.role || "")

  const handleSend = async () => {
    const trimmed = message.trim()
    if (!trimmed && attachments.length === 0) return
    setIsSending(true)
    try {
      await onSendMessage(rfi.id, trimmed, attachments, activeRole)
      setMessage("")
      setAttachments([])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    } finally {
      setIsSending(false)
    }
  }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files ?? [])
    const MAX_SIZE = 25 * 1024 * 1024 // 25 MB
    const validFiles: File[] = []
    for (const f of rawFiles) {
      if (f.size > MAX_SIZE) {
        toast.error(
          `"${f.name}" is too large (${(f.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed upload size is 25MB.`
        )
      } else {
        validFiles.push(f)
      }
    }
    setAttachments((prev) => [...prev, ...validFiles])
    e.target.value = ""
  }

  const handleCloseClick = async () => {
    if (!window.confirm("Are you sure you want to close this RFI?")) return
    setIsClosing(true)
    try {
      await onCloseRFI(rfi.id)
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="flex max-h-[92vh] w-[780px] max-w-none flex-col gap-0 overflow-hidden border-[#1e3a5f] bg-[#0a1428] p-0 shadow-2xl"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="shrink-0 border-b border-[#1e3a5f] bg-[#070f1e] px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <DialogTitle className="text-lg font-bold text-slate-100">
                  {rfi.rfi_number}
                </DialogTitle>
                <Badge
                  className={cn(
                    "rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                    rfi.status === "OPEN"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                  )}
                >
                  {rfi.status}
                </Badge>
                {isClosed && (
                  <span className="flex items-center gap-1 text-[12px] text-slate-400 font-medium">
                    <Lock className="h-3.5 w-3.5 text-slate-500" />
                    Closed {rfi.closed_at ? format(new Date(rfi.closed_at), "yyyy-MM-dd") : ""}
                  </span>
                )}
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span>
                  <span className="text-slate-500">Project:</span>{" "}
                  <strong className="text-slate-300 font-medium">{rfi.project_name}</strong>
                </span>
                <span>
                  <span className="text-slate-500">Trade:</span>{" "}
                  <span className="text-slate-300">{rfi.trade}</span>
                </span>
                <span>
                  <span className="text-slate-500">Created by:</span>{" "}
                  <span className="text-slate-300">{rfi.created_by_name}</span>
                </span>
                <span>
                  <span className="text-slate-500">Date:</span>{" "}
                  <span className="text-slate-300">
                    {rfi.created_at ? format(new Date(rfi.created_at), "yyyy-MM-dd") : "—"}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {/* Technical Department Assign Switch */}
              {canAssignTech && (
                <div
                  className="flex items-center gap-2 rounded-md border border-[#1e3a5f] bg-[#0d1b32] px-3 py-1.5"
                  title="Assign this RFI to the Technical Department"
                >
                  <Label htmlFor="tech-assign-switch" className="cursor-pointer text-xs font-medium text-slate-300">
                    Assign to Tech
                  </Label>
                  <Switch
                    id="tech-assign-switch"
                    checked={Boolean(rfi.assigned_to_technical_department)}
                    onCheckedChange={(checked) => onAssignTechnical(rfi.id, checked)}
                  />
                </div>
              )}

              {canClose && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-600/60 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 h-8 font-medium text-xs"
                  onClick={handleCloseClick}
                  disabled={isClosing}
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  {isClosing ? "Closing..." : "Close RFI"}
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Section: Original RFI Details */}
          <div className="rounded-xl border border-[#1e3a5f] bg-[#0c182e] p-4 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-[#192b45] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                RFI Description & Scope
              </span>
              <span className="text-[11px] text-slate-500">
                Opened by {rfi.created_by_name}
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-slate-200 whitespace-pre-wrap">
              {rfi.description}
            </p>

            {/* Original RFI Attachment */}
            {rfi.document_url && (
              <div className="mt-4 pt-3 border-t border-[#192b45]">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Original Attachment
                </p>
                <AttachmentCard
                  url={rfi.document_url}
                  onPreview={onViewDocument}
                />
              </div>
            )}
          </div>

          {/* Section: Responses Thread */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Responses & Activity ({rfi.messages.length})
              </h3>
            </div>

            {rfi.messages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#1e3a5f] p-6 text-center text-xs text-slate-500">
                No responses have been posted yet. Use the form below to respond.
              </div>
            ) : (
              <div className="space-y-4">
                {rfi.messages.map((msg: ChatMessage) => {
                  const allAttachments: { name: string; url: string }[] = []
                  if (msg.attachments && msg.attachments.length > 0) {
                    allAttachments.push(...msg.attachments)
                  }
                  if (
                    msg.document_url &&
                    !allAttachments.some((a) => a.url === msg.document_url)
                  ) {
                    allAttachments.push({
                      name: getFilenameFromUrl(msg.document_url),
                      url: msg.document_url,
                    })
                  }

                  const roleDisplay = formatRoleName(msg.author_role)

                  return (
                    <div
                      key={msg.id}
                      className="rounded-lg border border-[#1b2f4d] bg-[#0c182e]/80 p-3.5 space-y-2.5 transition-all hover:border-[#284470]"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-[#162740] pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-semibold text-slate-200">
                            {msg.author_name}
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-medium py-0 px-2"
                          >
                            {roleDisplay}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {msg.created_at
                            ? format(new Date(msg.created_at), "yyyy-MM-dd HH:mm")
                            : ""}
                        </span>
                      </div>

                      {msg.text && (
                        <p className="text-[13px] leading-relaxed text-slate-300 whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      )}

                      {allAttachments.length > 0 && (
                        <div className="pt-1 space-y-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                            <Paperclip className="h-3 w-3 text-blue-400" />
                            <span>Attached files ({allAttachments.length}):</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {allAttachments.map((att, idx) => (
                              <AttachmentCard
                                key={`${att.url}-${idx}`}
                                url={att.url}
                                filename={att.name}
                                onPreview={onViewDocument}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Reply Box Footer */}
        {!isClosed ? (
          <div className="shrink-0 border-t border-[#1e3a5f] bg-[#070f1e] px-6 py-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CornerDownRight className="h-3.5 w-3.5 text-indigo-400" />
                <span>Replying as:</span>
                <span className="font-semibold text-indigo-300">
                  {formatRoleName(activeRole)}
                </span>
                <span className="text-slate-500">
                  ({user?.first_name || user?.email})
                </span>
              </span>
              <span className="text-[11px] text-slate-500">Ctrl+Enter to send</span>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((f, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 rounded border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300"
                  >
                    <Paperclip className="h-3 w-3" />
                    <span className="max-w-[180px] truncate">{f.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) => prev.filter((_, j) => j !== i))
                      }
                      className="ml-1 text-blue-400 hover:text-white"
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
                placeholder="Type your response to this RFI..."
                rows={2}
                className="flex-1 resize-none border-[#2d4060] bg-[#0c182e] text-[13px] text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="border-[#2d4060] bg-[#0c182e] text-slate-300 hover:bg-[#152744] hover:text-white"
                  onClick={() => fileRef.current?.click()}
                  title="Attach file to response"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  onClick={handleSend}
                  disabled={
                    isSending || (!message.trim() && attachments.length === 0)
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  title="Send response"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFiles}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="shrink-0 border-t border-[#1e3a5f] bg-[#070f1e] px-6 py-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Lock className="h-4 w-4 text-slate-500" />
            <span>This RFI is closed. Responses can no longer be posted.</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function ProjectRFIsPage() {
  const [rfis, setRfis] = useState<RFI[]>([])
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all")
  const [selectedRFI, setSelectedRFI] = useState<RFI | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewDocumentUrl, setViewDocumentUrl] = useState<string | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createData, setCreateData] = useState({
    project_id: "",
    description: "",
    trade: "General",
  })
  const [createFile, setCreateFile] = useState<File | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const { user } = useAuthStore()
  const activeRole = useRoleStore((s) => s.role) || user?.role || "project_director"

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rfiData, projectData] = await Promise.all([
        getRFIs(),
        getMyProjects(),
      ])
      setRfis(rfiData)
      setProjects(projectData.projects)
    } catch (e: any) {
      console.error("Failed to load RFIs", e)
      toast.error(e?.message || "Failed to load RFIs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredRfis =
    selectedProjectId === "all"
      ? rfis
      : rfis.filter((rfi) => rfi.project === selectedProjectId)

  const totalCount = filteredRfis.length
  const openCount = filteredRfis.filter((r) => r.status === "OPEN").length
  const closedCount = filteredRfis.filter((r) => r.status === "CLOSED").length

  const handleCloseRFI = async (id: string) => {
    try {
      const updatedRfi = await closeRFI(id)
      setRfis((prev) => prev.map((r) => (r.id === id ? updatedRfi : r)))
      setSelectedRFI((prev) => (prev?.id === id ? updatedRfi : prev))
      toast.success("RFI closed successfully")
    } catch (e: any) {
      console.error("Failed to close RFI", e)
      toast.error(e?.message || "Failed to close RFI")
      throw e
    }
  }

  const handleSendMessage = async (
    rfiId: string,
    text: string,
    files: File[],
    role?: string
  ) => {
    try {
      const sendRole = role || activeRole
      const newMsg = await sendRFIMessage(rfiId, text, files, sendRole)
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
      toast.success("Response sent")
    } catch (e: any) {
      console.error("Failed to send message", e)
      toast.error(e?.message || "Failed to send response")
      throw e
    }
  }

  const handleAssignTechnical = async (rfiId: string, assigned: boolean) => {
    try {
      const updatedRfi = await assignRFIToTechnical(rfiId, assigned)
      setRfis((prev) =>
        prev.map((r) =>
          r.id === rfiId
            ? { ...r, assigned_to_technical_department: assigned }
            : r
        )
      )
      setSelectedRFI((prev) =>
        prev?.id === rfiId
          ? { ...prev, assigned_to_technical_department: assigned }
          : prev
      )
      toast.success(
        assigned
          ? "Assigned to Technical Department"
          : "Unassigned from Technical Department"
      )
    } catch (e: any) {
      console.error("Failed to assign technical", e)
      toast.error(e?.message || "Failed to update Technical assignment")
      throw e
    }
  }

  const handleCreateRFI = async () => {
    if (!createData.project_id) {
      toast.error("Please select a project")
      return
    }
    if (!createData.description.trim()) {
      toast.error("Please enter an RFI description")
      return
    }

    setIsCreating(true)
    try {
      const formData = new FormData()
      formData.append("project_id", createData.project_id)
      formData.append("description", createData.description.trim())
      formData.append("trade", createData.trade || "General")
      if (createFile) {
        formData.append("document", createFile)
        formData.append("attachment", createFile)
      }

      const newRfi = await createRFI(formData)
      setRfis((prev) => [newRfi, ...prev])
      setIsCreateOpen(false)
      setCreateData({ project_id: "", description: "", trade: "General" })
      setCreateFile(null)
      toast.success("RFI created successfully")
    } catch (e: any) {
      console.error("Failed to create RFI", e)
      toast.error(e?.message || "Failed to create RFI")
    } finally {
      setIsCreating(false)
    }
  }

  const showAssignColumn = [
    "contracts_manager",
    "manager",
    "managers",
    "supervisor",
    "admin",
    "project_admin",
    "super_admin",
    "managing_director",
    "project_director",
  ].includes(activeRole || user?.role || "")

  // Bug 4: Remove attachment column from table; attachments are shown in the respond modal
  const baseColumnDefs: ColDef<RFI>[] = [
    {
      field: "rfi_number",
      headerName: "RFI ref",
      width: 110,
      minWidth: 90,
      cellRenderer: (params: ICellRendererParams<RFI>) => (
        <span className="font-semibold text-slate-100">{params.value}</span>
      ),
    },
    {
      field: "created_at",
      headerName: "Date",
      width: 110,
      minWidth: 95,
      valueFormatter: (params) =>
        params.value ? format(new Date(params.value), "yyyy-MM-dd") : "",
    },
    {
      field: "project_name",
      headerName: "Project",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      minWidth: 200,
      cellRenderer: (params: ICellRendererParams<RFI>) => (
        <span className="truncate text-slate-300" title={params.value}>
          {params.value}
        </span>
      ),
    },
    {
      field: "created_by_name",
      headerName: "Created by",
      minWidth: 130,
    },
    {
      field: "trade",
      headerName: "Trade",
      minWidth: 100,
    },
    {
      field: "closed_at",
      headerName: "Date RFI closed",
      minWidth: 130,
      cellRenderer: (params: ICellRendererParams<RFI>) =>
        params.value ? (
          <span className="text-slate-400">
            {format(new Date(params.value), "yyyy-MM-dd")}
          </span>
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
            "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
            params.value === "OPEN"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
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
        <div className="flex h-full w-full items-center justify-center p-1.5">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              if (params.data) setSelectedRFI(params.data)
            }}
            className="h-7 whitespace-nowrap bg-indigo-600 px-3 text-[11px] font-semibold tracking-wider text-white hover:bg-indigo-700 shadow-sm"
          >
            RESPOND
          </Button>
        </div>
      ),
    },
  ]

  // Bug 5: Assign to Tech Switch working cleanly without event swallowing
  const columnDefs: ColDef<RFI>[] = showAssignColumn
    ? [
        ...baseColumnDefs,
        {
          field: "assigned_to_technical_department",
          headerName: "Assign to Tech",
          width: 130,
          minWidth: 110,
          cellRenderer: (params: ICellRendererParams<RFI>) => (
            <div className="flex items-center justify-center h-full">
              <Switch
                checked={Boolean(params.value)}
                onCheckedChange={(checked) => {
                  if (params.data) {
                    handleAssignTechnical(params.data.id, checked)
                  }
                }}
              />
            </div>
          ),
        },
      ]
    : baseColumnDefs

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            Project RFIs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage, respond to, and review Requests for Information across your projects
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
          >
            <SelectTrigger className="w-[240px] bg-[#0c182e] border-[#1e3a5f] text-slate-200 h-9 text-xs">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="bg-[#0c182e] border-[#1e3a5f] text-slate-200 text-xs"
            >
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4 text-xs font-semibold tracking-wide shadow-sm"
          >
            Create RFI
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <TableStat
        summaryRows={[
          { label: "Total RFIs", qty: totalCount },
          { label: "Open RFIs", qty: openCount },
          { label: "Closed RFIs", qty: closedCount },
        ]}
      />

      {/* Table */}
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
            if (
              event.colDef.field === "assigned_to_technical_department" ||
              event.colDef.headerName === "Action"
            ) {
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

      {/* RFI Detail / Respond Modal */}
      {selectedRFI && (
        <RFIDetailDialog
          rfi={selectedRFI}
          onClose={() => setSelectedRFI(null)}
          onCloseRFI={handleCloseRFI}
          onSendMessage={handleSendMessage}
          onAssignTechnical={handleAssignTechnical}
          onViewDocument={(url) => setViewDocumentUrl(url)}
        />
      )}

      {/* Document Preview Viewer */}
      {viewDocumentUrl && (
        <Dialog
          open={!!viewDocumentUrl}
          onOpenChange={() => setViewDocumentUrl(null)}
        >
          <DialogContent
            className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden bg-[#0a1428] border-[#1e3a5f]"
            showCloseButton
          >
            <DialogHeader className="px-5 py-3 border-b border-[#1e3a5f] flex flex-row items-center justify-between shrink-0 bg-[#070f1e]">
              <DialogTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                <span>Document Preview</span>
              </DialogTitle>
              <div className="flex items-center gap-2 mr-6">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-slate-300 hover:text-white"
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = viewDocumentUrl
                    link.download = getFilenameFromUrl(viewDocumentUrl)
                    link.target = "_blank"
                    link.rel = "noreferrer"
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                >
                  <Download className="mr-1 h-3.5 w-3.5" />
                  Download
                </Button>
                <a
                  href={viewDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  New Tab
                </a>
              </div>
            </DialogHeader>
            <div className="flex-1 w-full h-full p-2 bg-[#050b14] overflow-hidden">
              <iframe
                src={viewDocumentUrl}
                className="w-full h-full rounded border border-[#1e3a5f]/60 bg-white"
                title="Document Viewer"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create RFI Modal */}
      {isCreateOpen && (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[520px] bg-[#0a1428] border-[#1e3a5f] p-6 text-slate-100 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-100">
                Create New RFI
              </DialogTitle>
              <p className="text-xs text-slate-400">
                Submit a new Request for Information with details and attachments
              </p>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-300">
                  Project <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={createData.project_id}
                  onValueChange={(val) =>
                    setCreateData((prev) => ({ ...prev, project_id: val }))
                  }
                >
                  <SelectTrigger className="bg-[#0c182e] border-[#1e3a5f] text-slate-200 text-xs h-9">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="bg-[#0c182e] border-[#1e3a5f] text-slate-200 text-xs"
                  >
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.projectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-300">
                  Trade / Discipline
                </Label>
                <Input
                  className="bg-[#0c182e] border-[#1e3a5f] text-slate-200 text-xs h-9"
                  value={createData.trade}
                  onChange={(e) =>
                    setCreateData((prev) => ({ ...prev, trade: e.target.value }))
                  }
                  placeholder="e.g. Architectural, Electrical, Plumbing..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-300">
                  Description <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  className="bg-[#0c182e] border-[#1e3a5f] text-slate-200 text-xs min-h-[90px] resize-none"
                  value={createData.description}
                  onChange={(e) =>
                    setCreateData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the clarification or information needed..."
                />
              </div>

              {/* Bug 1: Allow file attachments when creating an RFI */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-300">
                  Attachment (Optional)
                </Label>
                {!createFile ? (
                  <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#233550] bg-[#0c182e] p-4 cursor-pointer hover:border-indigo-500/60 transition-colors">
                    <Paperclip className="h-5 w-5 text-indigo-400" />
                    <span className="text-xs text-slate-300">
                      Click to browse or drop file (PDF, Images, Docs)
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        if (file && file.size > 25 * 1024 * 1024) {
                          toast.error(
                            `"${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed upload size is 25MB.`
                          )
                          e.target.value = ""
                          return
                        }
                        setCreateFile(file)
                      }}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between rounded-lg border border-blue-500/40 bg-blue-500/10 p-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                      <span className="truncate text-xs font-medium text-blue-200">
                        {createFile.name}
                      </span>
                      <span className="text-[10px] text-blue-300/70 shrink-0">
                        ({(createFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setCreateFile(null)}
                      className="h-6 w-6 text-blue-300 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 mt-3 pt-3 border-t border-[#1e3a5f]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setCreateFile(null)
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRFI}
                  disabled={
                    !createData.project_id ||
                    !createData.description.trim() ||
                    isCreating
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 h-9"
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
