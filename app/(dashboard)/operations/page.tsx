"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import SelectProject from "@/components/shared/select-project"
import { AgTable } from "@/components/common/AgTable"
import type { ColDef } from "ag-grid-community"

import CreateRAMSDialog, {
  type RAMSFormData,
} from "./_components/CreateRAMSDialog"
import CreateDailyBriefingDialog, {
  type DailyBriefingFormData,
} from "./_components/CreateDailyBriefingDialog"
import CreateToolboxTalksDialog, {
  type ToolboxTalksFormData,
} from "./_components/CreateToolboxTalksDialog"
import CreateToDoDialog, {
  type ToDoFormData,
} from "./_components/CreateToDoDialog"
import RowDetailDialog, {
  type DetailField,
} from "./_components/RowDetailDialog"

type ProjectTag = "PROJECT A" | "PROJECT B" | "PROJECT C"

type RAMSRow = {
  rams: string
  project: ProjectTag
  date: string
  revisedDate: string
}

type BriefingRow = {
  briefing: string
  project: ProjectTag
  date: string
}

type ToolboxRow = {
  briefing: string
  project: ProjectTag
  date: string
}

type ToDoRow = {
  task: string
  project: ProjectTag
  date: string
  completionDate: string
  user: string
}

type DetailState = {
  title: string
  fields: DetailField[]
  filename: string
}

const initialRAMS: RAMSRow[] = [
  {
    rams: "Excavation Plan v2",
    project: "PROJECT A",
    date: "12 Oct 23",
    revisedDate: "20 Oct 23",
  },
  {
    rams: "Site Logistics Phase 1",
    project: "PROJECT B",
    date: "15 Oct 23",
    revisedDate: "–",
  },
]

const initialBriefings: BriefingRow[] = [
  { briefing: "AM Shift Handoff", project: "PROJECT A", date: "24 Oct 23" },
  { briefing: "Safety Inductions", project: "PROJECT B", date: "24 Oct 23" },
]

const initialToolbox: ToolboxRow[] = [
  { briefing: "Work at Height", project: "PROJECT A", date: "22 Oct 23" },
]

const initialToDo: ToDoRow[] = [
  {
    task: "Review Steel Certs",
    project: "PROJECT B",
    date: "24 Oct 2026",
    completionDate: "–",
    user: "J. Smith",
  },
  {
    task: "Sign Daily Register",
    project: "PROJECT A",
    date: "25 Oct 2026",
    completionDate: "–",
    user: "M. Ross",
  },
]

const PROJECT_COLORS: Record<ProjectTag, string> = {
  "PROJECT A": "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
  "PROJECT B": "bg-blue-500/20 text-blue-300 border border-blue-500/40",
  "PROJECT C": "bg-purple-500/20 text-purple-300 border border-purple-500/40",
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

function formatDate(iso: string): string {
  if (!iso) return "–"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  })
}

function toProjectTag(project: string): ProjectTag {
  const upper = project.toUpperCase() as ProjectTag
  return upper in PROJECT_COLORS ? upper : "PROJECT A"
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
}: {
  title: string
  onCreateClick: () => void
  children: React.ReactNode
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
  const [rams, setRAMS] = useState<RAMSRow[]>(initialRAMS)
  const [briefings, setBriefings] = useState<BriefingRow[]>(initialBriefings)
  const [toolbox, setToolbox] = useState<ToolboxRow[]>(initialToolbox)
  const [todos, setTodos] = useState<ToDoRow[]>(initialToDo)

  const [ramsOpen, setRamsOpen] = useState(false)
  const [briefingOpen, setBriefingOpen] = useState(false)
  const [toolboxOpen, setToolboxOpen] = useState(false)
  const [todoOpen, setTodoOpen] = useState(false)

  // detail dialog
  const [detail, setDetail] = useState<DetailState | null>(null)

  const onRAMSRowClick = useCallback((row: RAMSRow) => {
    setDetail({
      title: row.rams,
      fields: [
        { label: "RAMS", value: row.rams },
        { label: "Project", value: row.project },
        { label: "Date", value: row.date },
        { label: "Revised Date", value: row.revisedDate },
      ],
      filename: `rams-${slugify(row.rams)}`,
    })
  }, [])

  const onBriefingRowClick = useCallback((row: BriefingRow) => {
    setDetail({
      title: row.briefing,
      fields: [
        { label: "Briefing", value: row.briefing },
        { label: "Project", value: row.project },
        { label: "Date", value: row.date },
      ],
      filename: `briefing-${slugify(row.briefing)}`,
    })
  }, [])

  const onToolboxRowClick = useCallback((row: ToolboxRow) => {
    setDetail({
      title: row.briefing,
      fields: [
        { label: "Toolbox Talk", value: row.briefing },
        { label: "Project", value: row.project },
        { label: "Date", value: row.date },
      ],
      filename: `toolbox-${slugify(row.briefing)}`,
    })
  }, [])

  const onToDoRowClick = useCallback((row: ToDoRow) => {
    setDetail({
      title: row.task,
      fields: [
        { label: "Task", value: row.task },
        { label: "Project", value: row.project },
        { label: "Date", value: row.date },
        { label: "Completion Date", value: row.completionDate },
        { label: "User", value: row.user },
      ],
      filename: `todo-${slugify(row.task)}`,
    })
  }, [])

  const ramsCols = useMemo<ColDef<RAMSRow>[]>(
    () => [
      { headerName: "RAMS", field: "rams", flex: 3 },
      {
        headerName: "Project",
        field: "project",
        flex: 2,
      },
      { headerName: "Date", field: "date", flex: 1 },
      { headerName: "Revised Date", field: "revisedDate", flex: 1 },
    ],
    []
  )

  const briefingCols = useMemo<ColDef<BriefingRow>[]>(
    () => [
      { headerName: "Briefings", field: "briefing", flex: 3 },
      {
        headerName: "Project",
        field: "project",
        flex: 2,
      },
      { headerName: "Date", field: "date", flex: 1 },
    ],
    []
  )

  const toolboxCols = useMemo<ColDef<ToolboxRow>[]>(
    () => [
      { headerName: "Briefings", field: "briefing", flex: 3 },
      {
        headerName: "Project",
        field: "project",
        flex: 2,
      },
      { headerName: "Date", field: "date", flex: 1 },
    ],
    []
  )

  const todoCols = useMemo<ColDef<ToDoRow>[]>(
    () => [
      { headerName: "To Do List", field: "task", flex: 3 },
      {
        headerName: "Project",
        field: "project",
        flex: 2,
      },
      { headerName: "Date", field: "date", flex: 1 },
      { headerName: "Completion Date", field: "completionDate", flex: 1 },
      { headerName: "User", field: "user", flex: 1 },
    ],
    []
  )

  const handleSaveRAMS = (data: RAMSFormData) => {
    setRAMS((prev) => [
      ...prev,
      {
        rams: data.title,
        project: toProjectTag(data.assignToProject),
        date: formatDate(data.date),
        revisedDate: data.reviewDate ? formatDate(data.reviewDate) : "–",
      },
    ])
  }

  const handleSaveBriefing = (data: DailyBriefingFormData) => {
    setBriefings((prev) => [
      ...prev,
      {
        briefing: data.title,
        project: toProjectTag(data.assignToProject || "Project A"),
        date: formatDate(data.date),
      },
    ])
  }

  const handleSaveToolbox = (data: ToolboxTalksFormData) => {
    setToolbox((prev) => [
      ...prev,
      {
        briefing: data.title,
        project: toProjectTag(data.assignToProject || "Project A"),
        date: formatDate(data.date),
      },
    ])
  }

  const handleSaveToDo = (data: ToDoFormData) => {
    setTodos((prev) => [
      ...prev,
      {
        task: data.title,
        project: toProjectTag(data.project || "Project A"),
        date: formatDate(data.date),
        completionDate: data.completionDate
          ? formatDate(data.completionDate)
          : "–",
        user: data.assignUser,
      },
    ])
  }

  return (
    <div className="w-full space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Operations</h1>

      <SelectProject />

      {/* RAMS */}
      <Section title="RAMS" onCreateClick={() => setRamsOpen(true)}>
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
      <Section title="Toolbox Talks" onCreateClick={() => setToolboxOpen(true)}>
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
      <Section title="To Do List" onCreateClick={() => setTodoOpen(true)}>
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
      />
      <CreateDailyBriefingDialog
        open={briefingOpen}
        onOpenChange={setBriefingOpen}
        onSave={handleSaveBriefing}
        title="Create Daily Briefing"
      />
      <CreateToolboxTalksDialog
        open={toolboxOpen}
        onOpenChange={setToolboxOpen}
        onSave={handleSaveToolbox}
      />
      <CreateToDoDialog
        open={todoOpen}
        onOpenChange={setTodoOpen}
        onSave={handleSaveToDo}
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
