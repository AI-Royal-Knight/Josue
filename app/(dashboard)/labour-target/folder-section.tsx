"use client";

import {
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "react";
import { Button } from "@/components/ui/button";
import type { FolderType } from "./types";
import { InlineCreate } from "./inline-create";
import { SubfolderCard } from "./subfolder-card";

type TreePath = { d: string };

type FolderSectionProps = {
  folder: FolderType;
  onAddSubfolder: (folderId: string, name: string) => void;
  onClickSubfolder: (folderId: string, subfolderId: string) => void;
};

export function FolderSection({
  folder,
  onAddSubfolder,
  onClickSubfolder,
}: FolderSectionProps) {
  const [creatingSubfolder, setCreatingSubfolder] = useState(false);

  // ── Refs for SVG line drawing ──────────────────────────────────────────

  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const cardRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const [paths, setPaths] = useState<TreePath[]>([]);
  const [svgHeight, setSvgHeight] = useState(0);

  const computePaths = useCallback(() => {
    const container = containerRef.current;
    const label = labelRef.current;
    if (!container || !label || folder.subfolders.length === 0) {
      setPaths([]);
      return;
    }

    const cr = container.getBoundingClientRect();
    const lr = label.getBoundingClientRect();

    // Source anchor: bottom-center of the amber folder label
    const sx = lr.left + lr.width / 2 - cr.left;
    const sy = lr.bottom - cr.top;

    const newPaths: TreePath[] = [];

    folder.subfolders.forEach((sf) => {
      const card = cardRefsMap.current.get(sf.id);
      if (!card) return;

      const cardRect = card.getBoundingClientRect();

      // Target anchor: top-center of the subfolder card
      const tx = cardRect.left + cardRect.width / 2 - cr.left;
      const ty = cardRect.top - cr.top;

      // Elbow: go down 60 % of vertical gap, then horizontal, then down
      const midY = sy + (ty - sy) * 0.6;

      const d =
        sx === tx
          ? // Card is directly below label — straight vertical line
            `M ${sx},${sy} L ${tx},${ty}`
          : // L-shaped elbow connector
            `M ${sx},${sy} L ${sx},${midY} L ${tx},${midY} L ${tx},${ty}`;

      newPaths.push({ d });
    });

    setPaths(newPaths);
    setSvgHeight(container.scrollHeight);
  }, [folder.subfolders]);

  // Recompute whenever subfolders change or layout shifts
  useLayoutEffect(() => {
    computePaths();
  }, [computePaths]);

  useEffect(() => {
    const observer = new ResizeObserver(computePaths);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [computePaths]);

  // ─────────────────────────────────────────────────────────────────────────

  const markerId = `arrow-${folder.id}`;
  const dotId = `dot-${folder.id}`;

  return (
    <div ref={containerRef} className="relative pb-2">
      {/* ── SVG connector lines (behind all content) ─────────────────── */}
      <svg
        className="pointer-events-none absolute left-0 top-0 w-full"
        height={svgHeight}
        style={{ overflow: "visible", zIndex: 0 }}
        aria-hidden="true"
      >
        <defs>
          {/* Arrowhead pointing down */}
          <marker
            id={markerId}
            markerWidth="8"
            markerHeight="8"
            refX="4"
            refY="7"
            orient="auto"
          >
            <polygon points="1,1 7,1 4,7" fill="#3d7abf" />
          </marker>
          {/* Source dot at folder label */}
          <marker
            id={dotId}
            markerWidth="8"
            markerHeight="8"
            refX="4"
            refY="4"
            orient="auto"
          >
            <circle cx="4" cy="4" r="3" fill="#3d7abf" />
          </marker>
        </defs>

        {paths.map((path, i) => (
          <path
            key={i}
            d={path.d}
            fill="none"
            stroke="#2d5a8f"
            strokeWidth="1.5"
            strokeDasharray="5 3"
            markerStart={i === 0 ? `url(#${dotId})` : undefined}
            markerEnd={`url(#${markerId})`}
            opacity={0.8}
          />
        ))}
      </svg>

      {/* ── Folder header row (z-10 sits above SVG lines) ───────────── */}
      <div className="relative z-10 mb-10 flex flex-wrap items-center gap-3">
        <span
          ref={labelRef}
          className="rounded-[2px] bg-amber-400 px-3 py-1.5 text-[12px] font-bold tracking-wide text-[#111]"
        >
          {folder.name}
        </span>

        {creatingSubfolder ? (
          <InlineCreate
            placeholder="Subfolder name…"
            onConfirm={(name) => {
              onAddSubfolder(folder.id, name);
              setCreatingSubfolder(false);
            }}
            onCancel={() => setCreatingSubfolder(false)}
            confirmClass="bg-[#2ecc71] text-[#0a1a0a] hover:bg-[#27ae60]"
          />
        ) : (
          <Button
            size="sm"
            onClick={() => setCreatingSubfolder(true)}
            className="h-7 rounded bg-[#2ecc71] px-3 text-[12px] font-semibold text-[#0a1a0a] hover:bg-[#27ae60]"
          >
            Create Sub Folder
          </Button>
        )}
      </div>

      {/* ── Subfolder cards grid (z-10 sits above SVG lines) ─────────── */}
      {folder.subfolders.length === 0 ? (
        <p className="relative z-10 text-[13px] italic text-[#4b5563]">
          No subfolders yet. Click &ldquo;Create Sub Folder&rdquo; to add one.
        </p>
      ) : (
        <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {folder.subfolders.map((sf) => (
            <SubfolderCard
              key={sf.id}
              ref={(el) => {
                if (el) {
                  cardRefsMap.current.set(sf.id, el);
                } else {
                  cardRefsMap.current.delete(sf.id);
                }
              }}
              subfolder={sf}
              onClick={() => onClickSubfolder(folder.id, sf.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
