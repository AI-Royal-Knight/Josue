"use client"

import { useCallback, useMemo, useState } from "react"
import { type ColDef } from "ag-grid-community"
import { Save } from "lucide-react"
import { AgTable } from "@/components/common/AgTable"
import MultiSelectInput, {
  type MultiSelectInputOption,
} from "@/components/multi-select-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ACTION_TYPES = [
  "User Invoices",
  "Proforma Nr Invoices",
  "User Variations Invoices",
  "Supplier Invoices",
  "Purchase orders",
  "Variations",
] as const

type ActionType = (typeof ACTION_TYPES)[number]

const CAUSE_OPTIONS = [
  ">£2000",
  ">£5000",
  ">£10,000.00",
  ">£50,000.00",
  "ALL",
] as const

type CauseOption = (typeof CAUSE_OPTIONS)[number]

const SIGNATURE_OPTIONS = [
  "Supervisor",
  "Contracts Manager",
  "Project Director",
  "Managing Director",
  "Procurement",
  "Commercial Manager",
] as const

type ApprovalRule = {
  cause: CauseOption
  signatures: string[]
  toggles: number
}

type ActionsConfig = Record<ActionType, ApprovalRule>

type StoredApprovalRule = {
  cause?: unknown
  signatures?: unknown
  toggles?: unknown
}

type StoredActionsConfig = Partial<Record<ActionType, StoredApprovalRule>>

type ActionRow = {
  actionType: ActionType
  cause: CauseOption
  signatures: string[]
  toggles: number
}

const STORAGE_KEY = "tresta:project-actions"

const DEFAULT_ACTIONS_CONFIG: ActionsConfig = {
  "User Invoices": {
    cause: ">£2000",
    signatures: ["Supervisor", "Contracts Manager"],
    toggles: 2,
  },
  "Proforma Nr Invoices": {
    cause: "ALL",
    signatures: [
      "Supervisor",
      "Contracts Manager",
      "Project Director",
      "Managing Director",
    ],
    toggles: 4,
  },
  "User Variations Invoices": {
    cause: "ALL",
    signatures: [
      "Supervisor",
      "Contracts Manager",
      "Project Director",
      "Managing Director",
    ],
    toggles: 2,
  },
  "Supplier Invoices": {
    cause: ">£50,000.00",
    signatures: ["Procurement", "Managing Director"],
    toggles: 2,
  },
  "Purchase orders": {
    cause: ">£50,000.00",
    signatures: ["Procurement", "Managing Director"],
    toggles: 2,
  },
  Variations: {
    cause: ">£2000",
    signatures: ["Commercial Manager", "Project Director"],
    toggles: 2,
  },
}

function cloneConfig(config: ActionsConfig): ActionsConfig {
  return ACTION_TYPES.reduce((next, actionType) => {
    next[actionType] = {
      cause: config[actionType].cause,
      signatures: [...config[actionType].signatures],
      toggles: config[actionType].toggles,
    }
    return next
  }, {} as ActionsConfig)
}

function isCauseOption(value: string): value is CauseOption {
  return CAUSE_OPTIONS.includes(value as CauseOption)
}

function normalizeSignatures(signatures: unknown): string[] {
  if (Array.isArray(signatures)) {
    return signatures
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean)
  }

  if (typeof signatures === "string") {
    return signatures
      .split("/")
      .map((value) => value.trim())
      .filter(Boolean)
  }

  return []
}

function parseStoredConfig(rawValue: string | null): ActionsConfig {
  const base = cloneConfig(DEFAULT_ACTIONS_CONFIG)
  if (!rawValue) return base

  try {
    const parsed = JSON.parse(rawValue) as StoredActionsConfig

    ACTION_TYPES.forEach((actionType) => {
      const storedRule = parsed[actionType]
      if (!storedRule) return

      const cause = storedRule.cause
      if (typeof cause === "string" && isCauseOption(cause)) {
        base[actionType].cause = cause
      }

      const signatures = normalizeSignatures(storedRule.signatures)
      if (signatures.length > 0) {
        base[actionType].signatures = signatures
      }

      const toggles = Number(storedRule.toggles)
      if (Number.isFinite(toggles) && toggles >= 0) {
        base[actionType].toggles = Math.floor(toggles)
      }
    })

    return base
  } catch {
    return base
  }
}

export default function ActionsPage() {
  const [config, setConfig] = useState<ActionsConfig>(() => {
    if (typeof window === "undefined") return cloneConfig(DEFAULT_ACTIONS_CONFIG)
    return parseStoredConfig(window.localStorage.getItem(STORAGE_KEY))
  })
  const [saved, setSaved] = useState(false)

  const signatureOptions = useMemo<MultiSelectInputOption[]>(
    () =>
      SIGNATURE_OPTIONS.map((signature) => ({
        label: signature,
        value: signature,
      })),
    []
  )

  const updateRule = useCallback(
    (actionType: ActionType, update: (current: ApprovalRule) => ApprovalRule) => {
      setSaved(false)
      setConfig((previous) => ({
        ...previous,
        [actionType]: update(previous[actionType]),
      }))
    },
    []
  )

  const rowData = useMemo<ActionRow[]>(
    () =>
      ACTION_TYPES.map((actionType) => ({
        actionType,
        cause: config[actionType].cause,
        signatures: config[actionType].signatures,
        toggles: config[actionType].toggles,
      })),
    [config]
  )

  const columnDefs = useMemo<ColDef<ActionRow>[]>(
    () => [
      {
        headerName: "Actions",
        field: "actionType",
        minWidth: 220,
        flex: 1.2,
        cellClass: "font-medium text-slate-100",
      },
      {
        headerName: "Cause",
        field: "cause",
        minWidth: 190,
        flex: 1,
        cellRenderer: (params: { data?: ActionRow }) => {
          const row = params.data
          if (!row) return null

          return (
            <div className="min-w-[170px]" data-cell-click-ignore>
              <Select
                value={row.cause}
                onValueChange={(value) =>
                  updateRule(row.actionType, (current) => ({
                    ...current,
                    cause: value as CauseOption,
                  }))
                }
              >
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Select cause" />
                </SelectTrigger>
                <SelectContent>
                  {CAUSE_OPTIONS.map((cause) => (
                    <SelectItem key={cause} value={cause}>
                      {cause}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        },
      },
      {
        headerName: "Signatures",
        field: "signatures",
        minWidth: 360,
        flex: 2.3,
        cellRenderer: (params: { data?: ActionRow }) => {
          const row = params.data
          if (!row) return null

          return (
            <div className="relative z-30 min-w-[320px]" data-cell-click-ignore>
              <MultiSelectInput
                options={signatureOptions}
                value={row.signatures}
                onChange={(nextSignatures) =>
                  updateRule(row.actionType, (current) => ({
                    ...current,
                    signatures: nextSignatures,
                  }))
                }
                placeholder="Select signatures or type to add"
                creatable
              />
            </div>
          )
        },
      },
      {
        headerName: "Toggles",
        field: "toggles",
        minWidth: 120,
        maxWidth: 140,
        cellRenderer: (params: { data?: ActionRow }) => {
          const row = params.data
          if (!row) return null

          return (
            <div className="flex justify-center" data-cell-click-ignore>
              <Input
                type="number"
                min={0}
                className="h-7 w-20 text-center"
                value={row.toggles}
                onChange={(event) => {
                  const parsed = Number.parseInt(event.target.value, 10)
                  updateRule(row.actionType, (current) => ({
                    ...current,
                    toggles: Number.isNaN(parsed) ? 0 : Math.max(parsed, 0),
                  }))
                }}
              />
            </div>
          )
        },
      },
    ],
    [signatureOptions, updateRule]
  )

  const handleSave = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // ignore write failures
    }
  }

  return (
    <div className="w-full space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            Approval Actions
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Edit directly in the table using the selectors and inputs in each
            row.
          </p>
        </div>

        <Button
          variant={saved ? "default" : "outline"}
          onClick={handleSave}
          className={saved ? "bg-emerald-600 hover:bg-emerald-700" : undefined}
        >
          <Save className="mr-1 size-4" />
          {saved ? "Saved" : "Save"}
        </Button>
      </div>

      <AgTable
        rowData={rowData}
        columnDefs={columnDefs}
        showRowNumberColumn={false}
        suppressCellClickAction
        height="auto"
        defaultColDef={{
          sortable: false,
          filter: false,
          resizable: false,
        }}
        gridOptions={{
          rowHeight: 88,
        }}
      />
    </div>
  )
}
