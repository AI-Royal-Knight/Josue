"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Folder,
  FolderOpen,
  Plus,
  X,
  Upload,
  FileSpreadsheet,
  Trash2,
  Save,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Row = {
  id: string;
  workSection: string;
  workArea: string;
  projectValue: string;
  labourTarget: string;
};

type Subfolder = {
  id: string;
  name: string;
  rows: Row[];
};

type Folder = {
  id: string;
  name: string;
  subfolders: Subfolder[];
};

type ModalState = {
  folderId: string;
  subfolderId: string;
} | null;

type FocusedCell = {
  rowIndex: number;
  field: keyof Omit<Row, "id">;
} | null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const emptyRow = (): Row => ({
  id: uid(),
  workSection: "",
  workArea: "",
  projectValue: "0.00",
  labourTarget: "0",
});

const defaultRows = (n = 7): Row[] => Array.from({ length: n }, emptyRow);

const FIELD_HEADERS: { field: keyof Omit<Row, "id">; label: string; placeholder: string }[] = [
  { field: "workSection",  label: "Work Section",         placeholder: "e.g. Electrical Rough-in"  },
  { field: "workArea",     label: "Work Area",            placeholder: "e.g. Level 1 – Unit 101"   },
  { field: "projectValue", label: "Project Value ($)",    placeholder: "0.00"                       },
  { field: "labourTarget", label: "Labour Target (hrs)",  placeholder: "0"                          },
];

// ─── Initial seed data ────────────────────────────────────────────────────────

const INITIAL_FOLDERS: Folder[] = [
  {
    id: "f1",
    name: "APARTMENTS",
    subfolders: [
      { id: "sf1", name: "electrical",          rows: defaultRows() },
      { id: "sf2", name: "Electrical First Fix", rows: defaultRows() },
      { id: "sf3", name: "Plumbing",             rows: defaultRows() },
    ],
  },
  {
    id: "f2",
    name: "CORRIDORS",
    subfolders: [
      { id: "sf4", name: "electrical",          rows: defaultRows() },
      { id: "sf5", name: "Electrical First Fix", rows: defaultRows() },
    ],
  },
];

// ─── Mini read-only table shown on the main canvas ───────────────────────────

function SubfolderCard({
  subfolder,
  onClick,
}: {
  subfolder: Subfolder;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer overflow-hidden rounded-none border border-[#1e3a5f] transition-colors hover:border-[#2d5a8f]"
    >
      <div className="bg-[#2ecc71] px-3 py-1.5 text-[13px] font-semibold text-[#0a1a0a]">
        {subfolder.name}
      </div>
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="bg-[#0e1f38]">
            {["Work section", "Work area", "Project Value", "Labour Target"].map(
              (h) => (
                <th
                  key={h}
                  className="border-b border-[#1e3a5f] px-2 py-1.5 text-left font-medium text-[#8a9ab5]"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {subfolder.rows.slice(0, 7).map((row, i) => (
            <tr
              key={row.id}
              className={cn(
                "border-b border-[#1a2d45]",
                i % 2 === 0 ? "bg-[#0d1526]" : "bg-[#0f1a2e]"
              )}
            >
              {(
                ["workSection", "workArea", "projectValue", "labourTarget"] as const
              ).map((field) => (
                <td
                  key={field}
                  className="max-w-[90px] truncate px-2 py-1.5 text-[#c8d8e8]"
                >
                  {row[field] || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Editable spreadsheet inside the modal ───────────────────────────────────

function SpreadsheetTable({
  rows,
  onChange,
  copiedValue,
  onCopy,
}: {
  rows: Row[];
  onChange: (rows: Row[]) => void;
  copiedValue: string;
  onCopy: (v: string) => void;
}) {
  const [focused, setFocused] = useState<FocusedCell>(null);

  const update = useCallback(
    (rowIndex: number, field: keyof Omit<Row, "id">, value: string) => {
      onChange(
        rows.map((r, i) => (i === rowIndex ? { ...r, [field]: value } : r))
      );
    },
    [rows, onChange]
  );

  // Global copy/paste while a cell is focused
  useEffect(() => {
    if (!focused) return;

    const onKey = (e: KeyboardEvent) => {
      const { rowIndex, field } = focused;
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        const val = rows[rowIndex]?.[field] ?? "";
        navigator.clipboard?.writeText(val).catch(() => {});
        onCopy(val);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        navigator.clipboard
          ?.readText()
          .then((text) => update(rowIndex, field, text))
          .catch(() => {
            if (copiedValue) update(rowIndex, field, copiedValue);
          });
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [focused, rows, copiedValue, onCopy, update]);

  const totals = {
    projectValue: rows.reduce((s, r) => s + (parseFloat(r.projectValue) || 0), 0),
    labourTarget: rows.reduce((s, r) => s + (parseFloat(r.labourTarget) || 0), 0),
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead className="sticky top-0 z-10 bg-[#111827]">
          <tr>
            <th className="w-10 border-b border-[#1f2937] px-2 py-3 text-left text-[12px] font-semibold text-[#6b7280]">
              #
            </th>
            {FIELD_HEADERS.map(({ label }) => (
              <th
                key={label}
                className="border-b border-[#1f2937] px-3 py-3 text-left text-[12px] font-semibold text-[#6b7280]"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id} className="border-b border-[#1a2535]">
              <td className="px-2 py-1.5 text-center text-[12px] text-[#4b5563]">
                {rowIndex + 1}
              </td>
              {FIELD_HEADERS.map(({ field, placeholder }) => {
                const isFocused =
                  focused?.rowIndex === rowIndex && focused?.field === field;
                return (
                  <td key={field} className="px-1 py-1">
                    <input
                      value={row[field]}
                      placeholder={placeholder}
                      onFocus={() => setFocused({ rowIndex, field })}
                      onBlur={() => setFocused(null)}
                      onChange={(e) => update(rowIndex, field, e.target.value)}
                      className={cn(
                        "w-full rounded px-2.5 py-1.5 text-[13px] text-[#e2e8f0] outline-none transition-colors placeholder:text-[#374151]",
                        isFocused
                          ? "border border-blue-500 bg-[#1a2a45]"
                          : "border border-[#1f2937] bg-[#0f1929] hover:border-[#2d4060]"
                      )}
                    />
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Totals row */}
          <tr className="border-t-2 border-[#1f2937] bg-[#0d1525]">
            <td
              colSpan={3}
              className="px-3 py-3 text-right text-[13px] font-medium text-[#6b7280]"
            >
              Totals:
            </td>
            <td className="px-3 py-3 text-[13px] font-semibold text-[#e2e8f0]">
              ${totals.projectValue.toFixed(2)}
            </td>
            <td className="px-3 py-3 text-[13px] font-semibold text-[#e2e8f0]">
              {totals.labourTarget}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Subfolder modal ──────────────────────────────────────────────────────────

function SubfolderModal({
  subfolder,
  folderName,
  copiedValue,
  onCopy,
  onSave,
  onClose,
}: {
  subfolder: Subfolder;
  folderName: string;
  copiedValue: string;
  onCopy: (v: string) => void;
  onSave: (rows: Row[]) => void;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    subfolder.rows.map((r) => ({ ...r }))
  );
  const [activeTab, setActiveTab] = useState<"name" | "electrical">("name");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      const start = lines[0]?.toLowerCase().includes("work") ? 1 : 0;
      const parsed: Row[] = lines.slice(start).map((line) => {
        const cols = line.split(",").map((c) =>
          c.trim().replace(/^"|"$/g, "")
        );
        return {
          id: uid(),
          workSection:  cols[0] ?? "",
          workArea:     cols[1] ?? "",
          projectValue: cols[2] ?? "0.00",
          labourTarget: cols[3] ?? "0",
        };
      });
      if (parsed.length) setRows(parsed);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden border-[#1f2937] bg-[#111827] p-0 text-[#e2e8f0] sm:max-w-[860px]"
      >
        {/* Header */}
        <DialogHeader className="border-b border-[#1f2937] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#1e3a5f]">
                <FolderOpen className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-[17px] font-semibold text-[#f1f5f9]">
                  Subfolder: {subfolder.name}
                </DialogTitle>
                <p className="mt-0.5 text-[12px] text-[#8a9ab5]">
                  Inside {folderName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                className="h-9 gap-2 rounded-lg border-[#374151] bg-[#1f2937] text-[#d1d5db] hover:bg-[#2d3748]"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Import
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCSV}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-lg border border-[#374151] text-[#9ca3af] hover:bg-[#1f2937]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-[#1f2937] px-6">
          {(["name", "electrical"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "border-b-2 px-4 py-3 text-[13px] transition-colors",
                activeTab === tab
                  ? "border-violet-600 font-semibold text-[#f1f5f9]"
                  : "border-transparent font-normal text-[#6b7280] hover:text-[#9ca3af]"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-[#1f2937] px-6 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRows((r) => [...r, emptyRow()])}
            className="h-8 gap-2 rounded-lg border-[#374151] bg-transparent text-[#d1d5db] hover:bg-[#1f2937]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Row
          </Button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setRows(defaultRows())}
              className="text-[13px] text-[#9ca3af] hover:text-[#d1d5db]"
            >
              Clear All
            </button>
            <div className="h-4 w-px bg-[#374151]" />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-[13px] text-blue-400 hover:text-blue-300"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Import Spreadsheet
            </button>
          </div>
        </div>

        {/* Spreadsheet */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
          <SpreadsheetTable
            rows={rows}
            onChange={setRows}
            copiedValue={copiedValue}
            onCopy={onCopy}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#1f2937] px-6 py-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-lg border-[#374151] bg-transparent text-[#9ca3af] hover:bg-[#1f2937] hover:text-[#d1d5db]"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave(rows)}
            className="rounded-lg bg-violet-600 text-white hover:bg-violet-500"
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Inline name input used for creating folders / subfolders ─────────────────

function InlineCreate({
  placeholder,
  onConfirm,
  onCancel,
  confirmLabel = "Create",
  confirmClass = "",
}: {
  placeholder: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmClass?: string;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="flex items-center gap-2">
      <Input
        autoFocus
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onConfirm(value.trim());
          if (e.key === "Escape") onCancel();
        }}
        className="h-8 w-44 rounded border-[#2d4060] bg-[#111d33] text-[13px] text-[#e2e8f0] placeholder:text-[#374151]"
      />
      <Button
        size="sm"
        onClick={() => onConfirm(value.trim())}
        className={cn("h-8 rounded text-[12px] font-semibold", confirmClass)}
      >
        {confirmLabel}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onCancel}
        className="h-8 rounded border border-[#1e3a5f] text-[12px] text-[#8a9ab5] hover:bg-[#1a2d45]"
      >
        Cancel
      </Button>
    </div>
  );
}

// ─── Root page component ──────────────────────────────────────────────────────

export default function LabourTargetPage() {
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [modal, setModal] = useState<ModalState>(null);
  const [copiedValue, setCopiedValue] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [creatingSubfolder, setCreatingSubfolder] = useState<string | null>(null);

  // ── Folder mutations ──────────────────────────────────────────────────────

  const addFolder = (name: string) => {
    if (!name) return;
    setFolders((prev) => [
      ...prev,
      { id: uid(), name: name.toUpperCase(), subfolders: [] },
    ]);
    setCreatingFolder(false);
  };

  const addSubfolder = (folderId: string, name: string) => {
    if (!name) return;
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? {
              ...f,
              subfolders: [
                ...f.subfolders,
                { id: uid(), name, rows: defaultRows() },
              ],
            }
          : f
      )
    );
    setCreatingSubfolder(null);
  };

  const saveSubfolder = (
    folderId: string,
    subfolderId: string,
    rows: Row[]
  ) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? {
              ...f,
              subfolders: f.subfolders.map((sf) =>
                sf.id === subfolderId ? { ...sf, rows } : sf
              ),
            }
          : f
      )
    );
    setModal(null);
  };

  // ── Derive modal data ─────────────────────────────────────────────────────

  const activeFolder = modal
    ? folders.find((f) => f.id === modal.folderId)
    : null;
  const activeSubfolder = activeFolder?.subfolders.find(
    (sf) => sf.id === modal?.subfolderId
  );

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0d1526] p-6 font-sans text-[#e2e8f0]">
      {/* Page header */}
      <h1 className="mb-5 text-[22px] font-semibold text-white">
        Labour Target
      </h1>

      {/* Create Folder */}
      <div className="mb-8">
        {creatingFolder ? (
          <InlineCreate
            placeholder="Folder name…"
            onConfirm={addFolder}
            onCancel={() => setCreatingFolder(false)}
            confirmClass="bg-amber-400 text-[#111] hover:bg-amber-300"
          />
        ) : (
          <Button
            onClick={() => setCreatingFolder(true)}
            className="rounded bg-amber-400 font-bold text-[#111] hover:bg-amber-300"
          >
            Create Folder
          </Button>
        )}
      </div>

      {/* Folders */}
      <div className="space-y-10">
        {folders.map((folder) => (
          <section key={folder.id}>
            {/* Folder label row */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-[2px] bg-amber-400 px-3 py-1 text-[12px] font-bold text-[#111]">
                {folder.name}
              </span>

              {creatingSubfolder === folder.id ? (
                <InlineCreate
                  placeholder="Subfolder name…"
                  onConfirm={(name) => addSubfolder(folder.id, name)}
                  onCancel={() => setCreatingSubfolder(null)}
                  confirmClass="bg-[#2ecc71] text-[#0a1a0a] hover:bg-[#27ae60]"
                />
              ) : (
                <Button
                  size="sm"
                  onClick={() => setCreatingSubfolder(folder.id)}
                  className="h-7 rounded bg-[#2ecc71] px-3 text-[12px] font-semibold text-[#0a1a0a] hover:bg-[#27ae60]"
                >
                  Create Sub Folder
                </Button>
              )}
            </div>

            {/* Subfolders grid */}
            {folder.subfolders.length === 0 ? (
              <p className="text-[13px] italic text-[#4b5563]">
                No subfolders yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {folder.subfolders.map((sf) => (
                  <SubfolderCard
                    key={sf.id}
                    subfolder={sf}
                    onClick={() =>
                      setModal({ folderId: folder.id, subfolderId: sf.id })
                    }
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Modal */}
      {modal && activeSubfolder && activeFolder && (
        <SubfolderModal
          subfolder={activeSubfolder}
          folderName={activeFolder.name}
          copiedValue={copiedValue}
          onCopy={setCopiedValue}
          onSave={(rows) => saveSubfolder(modal.folderId, modal.subfolderId, rows)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
