"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Controls,
  Handle,
  MarkerType,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeProps,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { Button } from "@/components/ui/button"
import { InlineCreate } from "@/app/(dashboard)/labour-target/inline-create"
import { SubfolderModal } from "@/app/(dashboard)/labour-target/subfolder-modal"
import { SubfolderCard } from "@/app/(dashboard)/labour-target/subfolder-card"
import {
  defaultRows,
  INITIAL_FOLDERS,
  uid,
} from "@/app/(dashboard)/labour-target/utils"
import type {
  FolderType,
  ModalState,
  Row,
  Subfolder,
} from "@/app/(dashboard)/labour-target/types"

type FolderNodeData = {
  folder: FolderType
  onAddSubfolder: (folderId: string, name: string) => void
}

type SubfolderNodeData = {
  folderName: string
  subfolder: Subfolder
  onOpenSubfolder: (folderId: string, subfolderId: string) => void
  folderId: string
}

function FolderNode({
  data,
}: NodeProps<Node<FolderNodeData> & { data: FolderNodeData }>) {
  const [creatingSubfolder, setCreatingSubfolder] = useState(false)

  return (
    <div className="w-[320px] rounded-none border border-[#1e3a5f] bg-[#0f172a] shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <div className="flex items-center justify-between gap-3 border-b border-[#1e3a5f] px-4 py-3">
        <div>
          <div className="text-[11px] tracking-[0.18em] text-[#6b7280] uppercase">
            Folder
          </div>
          <div className="text-[13px] font-semibold text-[#f8fafc]">
            {data.folder.name}
          </div>
        </div>

        {creatingSubfolder ? (
          <InlineCreate
            placeholder="Subfolder name…"
            confirmLabel="Add"
            confirmClass="bg-emerald-400 text-[#06110a] hover:bg-emerald-300"
            onConfirm={(name) => {
              data.onAddSubfolder(data.folder.id, name)
              setCreatingSubfolder(false)
            }}
            onCancel={() => setCreatingSubfolder(false)}
          />
        ) : (
          <Button
            size="sm"
            type="button"
            onClick={() => setCreatingSubfolder(true)}
          >
            Create Sub Folder
          </Button>
        )}
      </div>

      <div className="px-4 py-3 text-[12px] text-[#94a3b8]">
        {data.folder.subfolders.length} subfolder
        {data.folder.subfolders.length === 1 ? "" : "s"}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
}

function SubfolderNode({
  data,
}: NodeProps<Node<SubfolderNodeData> & { data: SubfolderNodeData }>) {
  return (
    <div className="w-[420px]">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <SubfolderCard
        subfolder={data.subfolder}
        onClick={() => data.onOpenSubfolder(data.folderId, data.subfolder.id)}
      />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
}

const nodeTypes = {
  folderNode: FolderNode,
  subfolderNode: SubfolderNode,
}

function ReactFlowComponentInner() {
  const [folders, setFolders] = useState<FolderType[]>(INITIAL_FOLDERS)
  const [modal, setModal] = useState<ModalState>(null)
  const [copiedValue, setCopiedValue] = useState("")
  const [creatingFolder, setCreatingFolder] = useState(false)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges] = useEdgesState<Edge>([])

  const focusFolderIndexRef = useRef<number | null>(null)
  const flowReadyRef = useRef(false)
  const reactFlow = useReactFlow()

  const fitToContent = useCallback(() => {
    if (!flowReadyRef.current) return

    requestAnimationFrame(() => {
      try {
        reactFlow.fitView({ padding: 0.18, duration: 0 })
      } catch {
        // ignore early-init errors
      }
    })
  }, [reactFlow])

  const handleFlowInit = useCallback(() => {
    flowReadyRef.current = true
    fitToContent()
  }, [fitToContent])

  const addFolder = useCallback(
    (name: string) => {
      focusFolderIndexRef.current = folders.length
      setFolders((prev) => [
        ...prev,
        { id: uid(), name: name.toUpperCase(), subfolders: [] },
      ])
      setCreatingFolder(false)
      fitToContent()
    },
    [fitToContent, folders.length]
  )

  const addSubfolder = useCallback(
    (folderId: string, name: string) => {
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? {
                ...folder,
                subfolders: [
                  ...folder.subfolders,
                  { id: uid(), name, rows: defaultRows() },
                ],
              }
            : folder
        )
      )
      fitToContent()
    },
    [fitToContent]
  )

  const openSubfolder = useCallback((folderId: string, subfolderId: string) => {
    setModal({ folderId, subfolderId })
  }, [])

  const saveSubfolder = useCallback(
    (folderId: string, subfolderId: string, rows: Row[]) => {
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? {
                ...folder,
                subfolders: folder.subfolders.map((subfolder) =>
                  subfolder.id === subfolderId
                    ? { ...subfolder, rows }
                    : subfolder
                ),
              }
            : folder
        )
      )
      setModal(null)
    },
    []
  )

  const activeFolder = modal
    ? folders.find((folder) => folder.id === modal.folderId)
    : null
  const activeSubfolder = activeFolder?.subfolders.find(
    (subfolder) => subfolder.id === modal?.subfolderId
  )

  useEffect(() => {
    const folderY = 40
    const subfolderStartY = 260

    const subfolderColumns = 2
    const subfolderWidth = 420
    const subfolderXGap = 460
    const subfolderYGap = 340

    const gridWidth = subfolderWidth + (subfolderColumns - 1) * subfolderXGap
    const columnGap = gridWidth + 140
    const columnLeftStart = 40
    const folderWidth = 320

    setNodes((prev) => {
      const prevPositions = new Map(prev.map((n) => [n.id, n.position]))
      const nextNodes: Node[] = []

      folders.forEach((folder, folderIndex) => {
        const folderNodeId = `folder-${folder.id}`
        const columnLeft = columnLeftStart + folderIndex * columnGap
        const folderX = columnLeft + (gridWidth - folderWidth) / 2

        nextNodes.push({
          id: folderNodeId,
          type: "folderNode",
          position: prevPositions.get(folderNodeId) ?? {
            x: folderX,
            y: folderY,
          },
          data: {
            folder,
            onAddSubfolder: addSubfolder,
          } satisfies FolderNodeData,
        })

        folder.subfolders.forEach((subfolder, subfolderIndex) => {
          const subfolderNodeId = `subfolder-${folder.id}-${subfolder.id}`
          const col = subfolderIndex % subfolderColumns
          const row = Math.floor(subfolderIndex / subfolderColumns)
          const defaultX = columnLeft + col * subfolderXGap
          const defaultY = subfolderStartY + row * subfolderYGap

          nextNodes.push({
            id: subfolderNodeId,
            type: "subfolderNode",
            position: prevPositions.get(subfolderNodeId) ?? {
              x: defaultX,
              y: defaultY,
            },
            data: {
              folderName: folder.name,
              subfolder,
              folderId: folder.id,
              onOpenSubfolder: openSubfolder,
            } satisfies SubfolderNodeData,
          })
        })
      })

      return nextNodes
    })

    setEdges(() => {
      const nextEdges: Edge[] = []
      folders.forEach((folder) => {
        const folderNodeId = `folder-${folder.id}`

        folder.subfolders.forEach((subfolder) => {
          nextEdges.push({
            id: `edge-${folder.id}-${subfolder.id}`,
            source: folderNodeId,
            target: `subfolder-${folder.id}-${subfolder.id}`,
            type: "smoothstep",
            // className: "rf-lt-edge",
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            //   color: "hsl(var(--primary))",
            },
            style: {
            //   stroke: "hsl(var(--primary))",
              strokeWidth: 2.25,
            },
          })
        })
      })
      return nextEdges
    })
  }, [addSubfolder, folders, openSubfolder, setEdges, setNodes])

  useEffect(() => {
    fitToContent()
  }, [fitToContent, nodes.length])

  useEffect(() => {
    const folderIndex = focusFolderIndexRef.current
    if (folderIndex == null) return

    focusFolderIndexRef.current = null

    const folderY = 40

    const subfolderColumns = 2
    const subfolderWidth = 420
    const subfolderXGap = 460
    const gridWidth = subfolderWidth + (subfolderColumns - 1) * subfolderXGap
    const columnGap = gridWidth + 140
    const columnLeftStart = 40

    const columnLeft = columnLeftStart + folderIndex * columnGap
    const x = columnLeft + gridWidth / 2
    const y = folderY + 80

    requestAnimationFrame(() => {
      try {
        reactFlow.setCenter(x, y, { duration: 0 })
      } catch {
        // ignore
      }
    })
  }, [folders.length, reactFlow])

  return (
    <div className="w-full min-w-0 px-6 py-4">
      <div className="relative h-[calc(100vh-4rem-2rem)] w-full overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          onInit={handleFlowInit}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
        >
          <Panel
            position="top-left"
            className="nopan nodrag m-4 max-w-[520px] rounded-none border border-[#1e3a5f] bg-[#0f172a]/90 px-4 py-3 text-white"
          >
            <h2>Labour Target</h2>
            <div className="mt-1 text-[12px] text-[#94a3b8]">
              Create folders as columns. Create sub folders as tables below.
            </div>
          </Panel>

          <Panel position="top-right" className="nopan nodrag m-4">
            {creatingFolder ? (
              <InlineCreate
                placeholder="Folder name…"
                onConfirm={addFolder}
                onCancel={() => setCreatingFolder(false)}
                confirmClass="bg-amber-400 text-[#111] hover:bg-amber-300"
              />
            ) : (
              <Button type="button" onClick={() => setCreatingFolder(true)}>
                Create Folder
              </Button>
            )}
          </Panel>

          <Controls
            className="!border-border !bg-popover !text-popover-foreground [&>button]:!bg-transparent [&>button]:!text-popover-foreground [&>button]:!border-b [&>button]:!border-border [&>button:last-child]:!border-b-0 [&>button:hover]:!bg-muted"
          />
        </ReactFlow>
      </div>

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
  )
}

export default function ReactFlowComponent() {
  return (
    <ReactFlowProvider>
      <ReactFlowComponentInner />
    </ReactFlowProvider>
  )
}
