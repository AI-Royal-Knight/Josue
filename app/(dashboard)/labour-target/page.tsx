"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FolderType, ModalState, Row } from "./types";
import { defaultRows, INITIAL_FOLDERS, uid } from "./utils";
import { InlineCreate } from "./inline-create";
import { FolderSection } from "./folder-section";
import { SubfolderModal } from "./subfolder-modal";

export default function LabourTargetPage() {
  const [folders, setFolders] = useState<FolderType[]>(INITIAL_FOLDERS);
  const [modal, setModal] = useState<ModalState>(null);
  const [copiedValue, setCopiedValue] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // ── Folder mutations ───────────────────────────────────────────────────

  const addFolder = (name: string) => {
    setFolders((prev) => [
      ...prev,
      { id: uid(), name: name.toUpperCase(), subfolders: [] },
    ]);
    setCreatingFolder(false);
  };

  const addSubfolder = (folderId: string, name: string) => {
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

  // ── Derive modal subjects ──────────────────────────────────────────────

  const activeFolder = modal
    ? folders.find((f) => f.id === modal.folderId)
    : null;

  const activeSubfolder = activeFolder?.subfolders.find(
    (sf) => sf.id === modal?.subfolderId
  );

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0d1526] px-6 py-8 font-sans text-[#e2e8f0]">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <h1 className="mb-6 text-[22px] font-semibold text-white">
        Labour Target
      </h1>

      {/* ── Create Folder ────────────────────────────────────────────────── */}
      <div className="mb-10">
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

      {/* ── Folder sections ──────────────────────────────────────────────── */}
      <div className="space-y-14">
        {folders.map((folder) => (
          <FolderSection
            key={folder.id}
            folder={folder}
            onAddSubfolder={addSubfolder}
            onClickSubfolder={(folderId, subfolderId) =>
              setModal({ folderId, subfolderId })
            }
          />
        ))}
      </div>

      {/* ── Subfolder modal ───────────────────────────────────────────────── */}
      {modal && activeSubfolder && activeFolder && (
        <SubfolderModal
          subfolder={activeSubfolder}
          folderName={activeFolder.name}
          copiedValue={copiedValue}
          onCopy={setCopiedValue}
          onSave={(rows) =>
            saveSubfolder(modal.folderId, modal.subfolderId, rows)
          }
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
