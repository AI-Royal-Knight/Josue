"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AgTable } from "@/components/common/AgTable"
import type { ColDef } from "ag-grid-community"
import { getMyProjects } from "@/lib/api/project-admin"
import type { ProjectItem } from "@/constants/projects"
import {
  getOperations,
  createRAMS,
  createDailyBriefing,
  createToolboxTalk,
  createToDo,
  type RAMS,
  type DailyBriefing,
  type ToolboxTalk,
  type ToDoList
} from "@/lib/api/operations"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

import CreateRAMSDialog, { type RAMSFormData } from "./_components/CreateRAMSDialog"
import CreateDailyBriefingDialog, { type DailyBriefingFormData } from "./_components/CreateDailyBriefingDialog"
import CreateToolboxTalksDialog, { type ToolboxTalksFormData } from "./_components/CreateToolboxTalksDialog"
import CreateToDoDialog, { type ToDoFormData } from "./_components/CreateToDoDialog"
import RowDetailDialog, { type DetailField } from "./_components/RowDetailDialog"

type DetailState = {
  title: string
  fields: DetailField[]
  filename: string
  document_url?: string | null
}

const SHARED_DEFAULT_COL: ColDef = {
  sortable: false,
  filter: false,
  resizable: true,
  suppressMovable: true,
}

const SHARED_GRID_OPTIONS = {
  suppressCellFocus: true,
  rowHeight: 36,
  getRowClass: () => "cursor-pointer",
}

function formatDate(iso: string | null): string {
  if (!iso) return "–"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  })
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

function Section({
  title,
  onCreateClick,
  children,
  disabled = false
}: {
  title: string
  onCreateClick: () => void
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <section>
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <Button
          size="sm"
          variant="outline"
          className="border-white/20 text-xs"
          onClick={onCreateClick}
          disabled={disabled}
        >
          + Create
        </Button>
      </div>
      <div className="overflow-hidden rounded-b-md border border-t-0 border-white/10">
        {children}
      </div>
    </section>
  )
}

export default function Page() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const [rams, setRAMS] = useState<RAMS[]>([])
  const [briefings, setBriefings] = useState<DailyBriefing[]>([])
  const [toolbox, setToolbox] = useState<ToolboxTalk[]>([])
  const [todos, setTodos] = useState<ToDoList[]>([])

  const [ramsOpen, setRamsOpen] = useState(false)
  const [briefingOpen, setBriefingOpen] = useState(false)
  const [toolboxOpen, setToolboxOpen] = useState(false)
  const [todoOpen, setTodoOpen] = useState(false)

  // detail dialog
  const [detail, setDetail] = useState<DetailState | null>(null)

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await getMyProjects()
        const projs = response.projects
        setProjects(projs)
        if (projs.length > 0) {
          setSelectedProjectId(projs[0].id)
        }
      } catch (err) {
        console.error("Failed to fetch projects", err)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  useEffect(() => {
    if (!selectedProjectId) return
    async function loadOperations() {
      try {
        const data = await getOperations(selectedProjectId)
        setRAMS(data.rams)
        setBriefings(data.briefings)
        setToolbox(data.toolbox_talks)
        setTodos(data.todos)
      } catch (err) {
        console.error("Failed to fetch operations", err)
      }
    }
    loadOperations()
  }, [selectedProjectId])

  const onRAMSRowClick = useCallback((row: RAMS) => {
    setDetail({
      title: row.title,
      fields: [
        { label: "RAMS", value: row.title },
        { label: "Project", value: row.project_name },
        { label: "Date", value: formatDate(row.date) },
        { label: "Revised Date", value: formatDate(row.review_date) },
      ],
      filename: `rams-${slugify(row.title)}`,
      document_url: row.document_url
    })
  }, [])

  const onBriefingRowClick = useCallback((row: DailyBriefing) => {
    setDetail({
      title: row.title,
      fields: [
        { label: "Briefing", value: row.title },
        { label: "Project", value: row.project_name },
        { label: "Date", value: formatDate(row.date) },
      ],
      filename: `briefing-${slugify(row.title)}`,
      document_url: row.document_url
    })
  }, [])

  const onToolboxRowClick = useCallback((row: ToolboxTalk) => {
    setDetail({
      title: row.title,
      fields: [
        { label: "Toolbox Talk", value: row.title },
        { label: "Project", value: row.project_name },
        { label: "Date", value: formatDate(row.date) },
      ],
      filename: `toolbox-${slugify(row.title)}`,
      document_url: row.document_url
    })
  }, [])

  const onToDoRowClick = useCallback((row: ToDoList) => {
    setDetail({
      title: row.title,
      fields: [
        { label: "Task", value: row.title },
        { label: "Project", value: row.project_name },
        { label: "Date", value: formatDate(row.date) },
        { label: "Completion Date", value: formatDate(row.completion_date) },
        { label: "User", value: row.assign_user || "–" },
      ],
      filename: `todo-${slugify(row.title)}`,
    })
  }, [])

  const ramsCols = useMemo<ColDef<RAMS>[]>(
    () => [
      { headerName: "RAMS", field: "title", flex: 3 },
      { headerName: "Project", field: "project_name", flex: 2 },
      { headerName: "Date", field: "date", flex: 1, valueFormatter: (p) => formatDate(p.value) },
      { headerName: "Revised Date", field: "review_date", flex: 1, valueFormatter: (p) => formatDate(p.value) },
      { 
        headerName: "Attachment", 
        field: "document_url", 
        flex: 1, 
        cellRenderer: (p: any) => p.value ? <a href={p.value} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-400 hover:underline">View</a> : "–"
      },
    ],
    []
  )

  const briefingCols = useMemo<ColDef<DailyBriefing>[]>(
    () => [
      { headerName: "Briefings", field: "title", flex: 3 },
      { headerName: "Project", field: "project_name", flex: 2 },
      { headerName: "Date", field: "date", flex: 1, valueFormatter: (p) => formatDate(p.value) },
      { 
        headerName: "Attachment", 
        field: "document_url", 
        flex: 1, 
        cellRenderer: (p: any) => p.value ? <a href={p.value} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-400 hover:underline">View</a> : "–"
      },
    ],
    []
  )

  const toolboxCols = useMemo<ColDef<ToolboxTalk>[]>(
    () => [
      { headerName: "Toolbox Talks", field: "title", flex: 3 },
      { headerName: "Project", field: "project_name", flex: 2 },
      { headerName: "Date", field: "date", flex: 1, valueFormatter: (p) => formatDate(p.value) },
      { 
        headerName: "Attachment", 
        field: "document_url", 
        flex: 1, 
        cellRenderer: (p: any) => p.value ? <a href={p.value} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-400 hover:underline">View</a> : "–"
      },
    ],
    []
  )

  const todoCols = useMemo<ColDef<ToDoList>[]>(
    () => [
      { headerName: "To Do List", field: "title", flex: 3 },
      { headerName: "Project", field: "project_name", flex: 2 },
      { headerName: "Date", field: "date", flex: 1, valueFormatter: (p) => formatDate(p.value) },
      { headerName: "Completion Date", field: "completion_date", flex: 1, valueFormatter: (p) => formatDate(p.value) },
      { headerName: "User", field: "assign_user", flex: 1 },
    ],
    []
  )

  const handleSaveRAMS = async (data: RAMSFormData) => {
    const fd = new FormData()
    fd.append('project_id', data.assignToProject)
    fd.append('title', data.title)
    fd.append('date', data.date)
    if (data.reviewDate) fd.append('review_date', data.reviewDate)
    if (data.attachment) fd.append('attachment', data.attachment)
    try {
      const created = await createRAMS(fd)
      if (created.project === selectedProjectId) {
        setRAMS(prev => [created, ...prev])
      }
      return true
    } catch (e) {
      toast.error((e as Error).message || "Failed to create RAMS")
      return false
    }
  }

  const handleSaveBriefing = async (data: DailyBriefingFormData) => {
    const fd = new FormData()
    fd.append('project_id', data.assignToProject)
    fd.append('title', data.title)
    fd.append('date', data.date)
    if (data.attachment) fd.append('attachment', data.attachment)
    try {
      const created = await createDailyBriefing(fd)
      if (created.project === selectedProjectId) {
        setBriefings(prev => [created, ...prev])
      }
      return true
    } catch (e) {
      toast.error((e as Error).message || "Failed to create Daily Briefing")
      return false
    }
  }

  const handleSaveToolbox = async (data: ToolboxTalksFormData) => {
    const fd = new FormData()
    fd.append('project_id', data.assignToProject)
    fd.append('title', data.title)
    fd.append('date', data.date)
    if (data.attachment) fd.append('attachment', data.attachment)
    try {
      const created = await createToolboxTalk(fd)
      if (created.project === selectedProjectId) {
        setToolbox(prev => [created, ...prev])
      }
      return true
    } catch (e) {
      toast.error((e as Error).message || "Failed to create Toolbox Talk")
      return false
    }
  }

  const handleSaveToDo = async (data: ToDoFormData) => {
    try {
      const created = await createToDo({
        project_id: data.project,
        title: data.title,
        date: data.date,
        completion_date: data.completionDate,
        assign_user: data.assignUser
      })
      if (created.project === selectedProjectId) {
        setTodos(prev => [created, ...prev])
      }
      return true
    } catch (e) {
      toast.error((e as Error).message || "Failed to create To Do")
      return false
    }
  }

  const projectOptions = projects.map(p => ({ id: p.id, name: p.projectName }))

  if (loading) {
    return <div className="p-6">Loading Operations...</div>
  }

  return (
    <div className="w-full space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Operations</h1>

      <div className="w-1/3">
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Select Project
        </label>
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="border-white/10 bg-slate-900">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-slate-900">
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* RAMS */}
      <Section title="RAMS" onCreateClick={() => setRamsOpen(true)} disabled={!selectedProjectId}>
        <AgTable
          rowData={rams}
          columnDefs={ramsCols}
          defaultColDef={SHARED_DEFAULT_COL}
          gridOptions={SHARED_GRID_OPTIONS}
          showRowNumberColumn={false}
          suppressCellClickAction
          height="auto"
          onRowClicked={onRAMSRowClick}
        />
      </Section>

      {/* Daily Briefings */}
      <Section
        title="Daily Briefings"
        onCreateClick={() => setBriefingOpen(true)}
        disabled={!selectedProjectId}
      >
        <AgTable
          rowData={briefings}
          columnDefs={briefingCols}
          defaultColDef={SHARED_DEFAULT_COL}
          gridOptions={SHARED_GRID_OPTIONS}
          showRowNumberColumn={false}
          suppressCellClickAction
          height="auto"
          onRowClicked={onBriefingRowClick}
        />
      </Section>

      {/* Toolbox Talks */}
      <Section title="Toolbox Talks" onCreateClick={() => setToolboxOpen(true)} disabled={!selectedProjectId}>
        <AgTable
          rowData={toolbox}
          columnDefs={toolboxCols}
          defaultColDef={SHARED_DEFAULT_COL}
          gridOptions={SHARED_GRID_OPTIONS}
          showRowNumberColumn={false}
          suppressCellClickAction
          height="auto"
          onRowClicked={onToolboxRowClick}
        />
      </Section>

      {/* To Do List */}
      <Section title="To Do List" onCreateClick={() => setTodoOpen(true)} disabled={!selectedProjectId}>
        <AgTable
          rowData={todos}
          columnDefs={todoCols}
          defaultColDef={SHARED_DEFAULT_COL}
          gridOptions={SHARED_GRID_OPTIONS}
          showRowNumberColumn={false}
          suppressCellClickAction
          height="auto"
          onRowClicked={onToDoRowClick}
        />
      </Section>

      {/* ── Create dialogs ── */}
      <CreateRAMSDialog
        open={ramsOpen}
        onOpenChange={setRamsOpen}
        onSave={handleSaveRAMS}
        projects={projectOptions}
        defaultProjectId={selectedProjectId}
      />
      <CreateDailyBriefingDialog
        open={briefingOpen}
        onOpenChange={setBriefingOpen}
        onSave={handleSaveBriefing}
        title="Create Daily Briefing"
        projects={projectOptions}
        defaultProjectId={selectedProjectId}
      />
      <CreateToolboxTalksDialog
        open={toolboxOpen}
        onOpenChange={setToolboxOpen}
        onSave={handleSaveToolbox}
        projects={projectOptions}
        defaultProjectId={selectedProjectId}
      />
      <CreateToDoDialog
        open={todoOpen}
        onOpenChange={setTodoOpen}
        onSave={handleSaveToDo}
        projects={projectOptions}
        defaultProjectId={selectedProjectId}
      />

      {/* ── Row detail dialog ── */}
      <RowDetailDialog
        open={!!detail}
        onOpenChange={(open) => !open && setDetail(null)}
        title={detail?.title ?? ""}
        fields={detail?.fields ?? []}
        downloadFilename={detail?.filename ?? "export"}
      />
    </div>
  )
}
