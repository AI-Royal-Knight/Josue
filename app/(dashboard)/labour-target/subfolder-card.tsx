"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import type { Subfolder } from "./types"

type SubfolderCardProps = {
  subfolder: Subfolder
  onClick: () => void
}

const COLUMNS = ["Work section", "Work area", "Project Value", "Labour Target"]
const FIELDS = [
  "workSection",
  "workArea",
  "projectValue",
  "labourTarget",
] as const

export const SubfolderCard = forwardRef<HTMLDivElement, SubfolderCardProps>(
  ({ subfolder, onClick }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className="cursor-pointer overflow-hidden rounded-none border border-[#1e3a5f] transition-all duration-150 hover:border-[#3d7abf] hover:shadow-[0_0_0_1px_#3d7abf22] bg-primary"
      >
        {/* Subfolder header */}
        <div className="px-3 py-2 text-[13px] text-center font-semibold text-primary-foreground">
          {subfolder.name}
        </div>

        {/* Mini table */}
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-[#0e1f38]">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="border-b border-[#1e3a5f] px-2 py-1.5 text-left font-medium text-[#8a9ab5]"
                >
                  {col}
                </th>
              ))}
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
                {FIELDS.map((field) => (
                  <td
                    key={field}
                    className="max-w-[90px] truncate px-2 py-1.5 text-[#c8d8e8]"
                  >
                    {row[field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
)

SubfolderCard.displayName = "SubfolderCard"
