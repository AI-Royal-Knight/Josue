"use client"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnSizingState,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type DynamicTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  initialSortId?: string
}

export function DynamicTable<TData>({
  columns,
  data,
  initialSortId,
}: DynamicTableProps<TData>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sorting, setSorting] = useState<SortingState>(
    initialSortId
      ? [
          {
            desc: false,
            id: initialSortId,
          },
        ]
      : []
  )
  const [containerWidth, setContainerWidth] = useState(0)
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      setContainerWidth(container.clientWidth)
    })

    setContainerWidth(container.clientWidth)
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    if (containerWidth <= 0 || columns.length === 0) {
      return
    }

    const equalWidth = Math.max(containerWidth / columns.length, 120)
    const nextSizing = columns.reduce<ColumnSizingState>(
      (acc, column, index) => {
        const columnId =
          "id" in column && typeof column.id === "string"
            ? column.id
            : "accessorKey" in column && typeof column.accessorKey === "string"
              ? column.accessorKey
              : `col-${index}`

        acc[columnId] = equalWidth
        return acc
      },
      {}
    )

    setColumnSizing(nextSizing)
  }, [columns, containerWidth])

  const table = useReactTable({
    columnResizeMode: "onChange",
    columns,
    data,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnSizingChange: setColumnSizing,
    onSortingChange: setSorting,
    state: {
      columnSizing,
      sorting,
    },
  })

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <Table
        className="table-fixed"
        style={{
          width: Math.max(table.getCenterTotalSize(), containerWidth),
        }}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="bg-muted/50" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none"
                    }
                    className="relative h-10 border-t select-none last:[&>.cursor-col-resize]:opacity-0"
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          header.column.getCanSort() &&
                            "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(event) => {
                          if (
                            header.column.getCanSort() &&
                            (event.key === "Enter" || event.key === " ")
                          ) {
                            event.preventDefault()
                            header.column.getToggleSortingHandler()?.(event)
                          }
                        }}
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                      >
                        <span className="truncate">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {{
                          asc: (
                            <ChevronUpIcon
                              aria-hidden="true"
                              className="shrink-0 opacity-60"
                              size={16}
                            />
                          ),
                          desc: (
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="shrink-0 opacity-60"
                              size={16}
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                    {header.column.getCanResize() && (
                      <div
                        className="user-select-none absolute top-0 -right-2 z-10 flex h-full w-4 cursor-col-resize touch-none justify-center before:absolute before:inset-y-0 before:w-px before:translate-x-px before:bg-border"
                        onDoubleClick={() => header.column.resetSize()}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                      />
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                data-state={row.getIsSelected() && "selected"}
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell className="truncate" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
